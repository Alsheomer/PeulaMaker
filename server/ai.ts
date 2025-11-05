import OpenAI from "openai";
import type {
  QuestionnaireResponse,
  PeulaContent,
  Feedback,
  TrainingExample,
  TrainingInsights,
} from "@shared/schema";
import { getTemplateById } from "@shared/templates";
import { storage } from "./storage";

interface TrainingInsightsCache {
  fingerprint: string;
  generatedAt: string;
  exampleCount: number;
  insights: TrainingInsights;
}

let trainingInsightsCache: TrainingInsightsCache | null = null;

function createExamplesFingerprint(examples: TrainingExample[]): string {
  return examples
    .map((example) => `${example.id}:${example.createdAt}:${example.content.length}:${example.notes ?? ""}`)
    .sort()
    .join("|");
}

function buildExampleDigest(examples: TrainingExample[]): string {
  return examples
    .slice(0, 5)
    .map((example, idx) => {
      const truncatedContent = example.content.length > 1500
        ? `${example.content.slice(0, 1500)}...`
        : example.content;
      const notes = example.notes ? `Notes: ${example.notes}` : "";
      return `Example ${idx + 1}: ${example.title}\n${truncatedContent}\n${notes}`.trim();
    })
    .join("\n\n");
}

export async function getTrainingInsightsSummary(
  preloadedExamples?: TrainingExample[],
): Promise<TrainingInsightsCache | null> {
  const examples = preloadedExamples ?? await storage.getAllTrainingExamples();

  if (examples.length === 0) {
    trainingInsightsCache = null;
    return null;
  }

  const fingerprint = createExamplesFingerprint(examples);
  if (trainingInsightsCache && trainingInsightsCache.fingerprint === fingerprint) {
    return trainingInsightsCache;
  }

  const digest = buildExampleDigest(examples);

  const prompt = `You are studying ${examples.length} Tzofim (Israeli Scouts) peulot written by a madrich. Identify what makes the user's approach distinct and useful for future AI generations.\n\nPeulot Samples:\n${digest}\n\nReturn strict JSON summarizing their style with this shape:\n{\n  "voiceAndTone": "One paragraph capturing voice, energy, and pacing.",\n  "signatureMoves": ["3-5 bullet points highlighting recurring activity patterns or structures."],\n  "facilitationFocus": ["3-5 bullet points describing how they lead or support chanichim."],\n  "reflectionPatterns": ["3-4 bullet points on how they process learning or run sicha/debrief."],\n  "measurementFocus": ["3-4 bullet points explaining how success or impact shows up in their writing."]\n}\nUse direct, actionable language.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert instructional designer. Analyze provided peulot and summarize distinctive style signals. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI while generating training insights");
    }

    const parsed = JSON.parse(content);

    if (
      typeof parsed.voiceAndTone !== "string" ||
      !Array.isArray(parsed.signatureMoves) ||
      !Array.isArray(parsed.facilitationFocus) ||
      !Array.isArray(parsed.reflectionPatterns) ||
      !Array.isArray(parsed.measurementFocus)
    ) {
      throw new Error("Invalid training insights structure from AI");
    }

    const sanitizedList = (items: unknown[]): string[] =>
      items
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0);

    const insights: TrainingInsights = {
      voiceAndTone: parsed.voiceAndTone.trim(),
      signatureMoves: sanitizedList(parsed.signatureMoves),
      facilitationFocus: sanitizedList(parsed.facilitationFocus),
      reflectionPatterns: sanitizedList(parsed.reflectionPatterns),
      measurementFocus: sanitizedList(parsed.measurementFocus),
    };

    trainingInsightsCache = {
      fingerprint,
      generatedAt: new Date().toISOString(),
      exampleCount: examples.length,
      insights,
    };

    return trainingInsightsCache;
  } catch (error) {
    console.error("Error generating training insights:", error);
    if (trainingInsightsCache && trainingInsightsCache.fingerprint === fingerprint) {
      return trainingInsightsCache;
    }
    return trainingInsightsCache;
  }
}

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// Reference: blueprint:javascript_openai_ai_integrations
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export async function generatePeula(responses: QuestionnaireResponse): Promise<{ title: string; content: PeulaContent }> {
  const templateId = responses.templateId || "custom";
  const template = getTemplateById(templateId);
  const templateContext = template && template.id !== "custom" 
    ? `\nTemplate Used: ${template.name} - ${template.description}` 
    : "";

  // Fetch training examples to learn user's writing style
  const trainingExamples = await storage.getAllTrainingExamples();
  const trainingInsightsSummary = await getTrainingInsightsSummary(trainingExamples);
  let trainingContext = "";
  if (trainingExamples.length > 0) {
    trainingContext = "\n\nTraining Examples (Peulot you've written - match this writing style and quality):\n\n";
    trainingExamples.slice(0, 3).forEach((example, idx) => {
      trainingContext += `Example ${idx + 1}: ${example.title}\n`;
      trainingContext += `${example.content.slice(0, 1000)}${example.content.length > 1000 ? '...' : ''}\n`;
      if (example.notes) {
        trainingContext += `Notes: ${example.notes}\n`;
      }
      trainingContext += "\n";
    });
  }

  let insightsContext = "";
  if (trainingInsightsSummary) {
    const joinList = (items: string[]) => items.map((item) => `- ${item}`).join("\n");
    const { insights, exampleCount } = trainingInsightsSummary;
    insightsContext = `\n\nStyle Insights from ${exampleCount} uploaded peulot (preserve these hallmarks):\nVoice & Tone: ${insights.voiceAndTone}\nSignature Moves:\n${joinList(insights.signatureMoves)}\nFacilitation Focus:\n${joinList(insights.facilitationFocus)}\nReflection Patterns:\n${joinList(insights.reflectionPatterns)}\nMeasurement Focus:\n${joinList(insights.measurementFocus)}\nMaintain these qualities while adapting to the new context.`;
  }

  // Fetch all feedback to learn from past peulot
  const allFeedback = await storage.getAllFeedback();
  
  // Group feedback by component index
  const feedbackByComponent: Record<number, Feedback[]> = {};
  for (const fb of allFeedback) {
    if (!feedbackByComponent[fb.componentIndex]) {
      feedbackByComponent[fb.componentIndex] = [];
    }
    feedbackByComponent[fb.componentIndex].push(fb);
  }

  // Build feedback context for the prompt
  let feedbackContext = "";
  if (allFeedback.length > 0) {
    feedbackContext = "\n\nUser Feedback from Previous Peulot (Learn from this to improve quality):\n";
    const componentNames = [
      "Topic & Educational Goal",
      "Know Your Audience", 
      "Choose Methods & Activities",
      "Structure the Peula (Flow)",
      "Time Management",
      "Materials & Logistics",
      "Risk & Safety",
      "Delivery & Facilitation",
      "Reflection & Debrief"
    ];
    
    for (let i = 0; i < 9; i++) {
      const feedback = feedbackByComponent[i];
      if (feedback && feedback.length > 0) {
        feedbackContext += `\n${i + 1}. ${componentNames[i]}:\n`;
        feedback.slice(-5).forEach(fb => {
          feedbackContext += `  - ${fb.comment}\n`;
        });
      }
    }
  }

  const prompt = `You are an expert Tzofim (Israeli Scouts) educational facilitator creating a detailed peula (activity plan).

Input Information:
Topic: ${responses.topic}
Age: ${responses.ageGroup} years
Duration: ${responses.duration} minutes
Group Size: ${responses.groupSize}
Goals: ${responses.goals}${templateContext}
${responses.availableMaterials && responses.availableMaterials.length > 0 ? `Available Materials: ${responses.availableMaterials.map(m => m.replace(/-/g, ' ')).join(', ')}` : ''}
${responses.specialConsiderations ? `Notes: ${responses.specialConsiderations}` : ''}${trainingContext}${insightsContext}${feedbackContext}

Create a professional, actionable peula with these 9 components. Be specific, practical, and aligned with Tzofim educational values.

${trainingExamples.length > 0 ? 'IMPORTANT: Study the training examples above and match the writing style, tone, structure, and level of detail shown in those examples. Create a peula that feels consistent with the user\'s own writing.' : ''}

${allFeedback.length > 0 ? 'Also use the feedback provided above to improve the quality of this peula by addressing common concerns and incorporating successful practices.' : ''}

For each component provide:
- Description: Clear, actionable content
- Best Practices: Tzofim methodology and tips
- Time Structure: Specific time breakdown

Guidelines:
• Write naturally and professionally
• Provide specific activities, not general advice
• Include exact timing that adds up to the total duration
• Use concrete examples and instructions
• Integrate specified materials creatively
• Apply Tzofim principles: experiential learning, active participation, reflection
• Keep language clear and implementation-focused
• Address safety, logistics, and facilitation practically
• Align with the user's style insights described above

Return valid JSON:
{
  "title": "Descriptive peula title",
  "components": [
    {
      "component": "1. Topic & Educational Goal",
      "description": "...",
      "bestPractices": "...",
      "timeStructure": "..."
    },
    {
      "component": "2. Know Your Audience",
      "description": "...",
      "bestPractices": "...",
      "timeStructure": "..."
    },
    {
      "component": "3. Choose Methods & Activities",
      "description": "...",
      "bestPractices": "...",
      "timeStructure": "..."
    },
    {
      "component": "4. Structure the Peula (Flow)",
      "description": "...",
      "bestPractices": "...",
      "timeStructure": "..."
    },
    {
      "component": "5. Time Management",
      "description": "...",
      "bestPractices": "...",
      "timeStructure": "..."
    },
    {
      "component": "6. Materials & Logistics",
      "description": "...",
      "bestPractices": "...",
      "timeStructure": "..."
    },
    {
      "component": "7. Risk & Safety",
      "description": "...",
      "bestPractices": "...",
      "timeStructure": "..."
    },
    {
      "component": "8. Delivery & Facilitation",
      "description": "...",
      "bestPractices": "...",
      "timeStructure": "..."
    },
    {
      "component": "9. Reflection & Debrief",
      "description": "...",
      "bestPractices": "...",
      "timeStructure": "..."
    }
  ]
}`;

  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert Tzofim (Israeli Scouts) activity planner. You create detailed, high-quality peulot based on elite scout methodology. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI");
    }

    const parsed = JSON.parse(content);
    
    // Validate the response structure
    if (!parsed.title || !Array.isArray(parsed.components) || parsed.components.length !== 9) {
      throw new Error("Invalid response structure from AI");
    }

    return {
      title: parsed.title,
      content: {
        components: parsed.components
      }
    };
  } catch (error) {
    console.error("Error generating peula:", error);
    throw new Error("Failed to generate peula. Please try again.");
  }
}

export async function regenerateSection(
  sectionIndex: number,
  sectionName: string,
  context: {
    topic: string;
    ageGroup: string;
    duration: string;
    groupSize: string;
    goals: string;
    availableMaterials?: string[];
    specialConsiderations?: string;
  }
): Promise<{ description: string; bestPractices: string; timeStructure: string }> {
  // Fetch feedback for this specific component
  const allFeedback = await storage.getAllFeedback();
  const componentFeedback = allFeedback.filter(fb => fb.componentIndex === sectionIndex);
  
  let feedbackContext = "";
  if (componentFeedback.length > 0) {
    feedbackContext = "\n\nUser Feedback on this Section (Learn from this to improve quality):\n";
    componentFeedback.slice(-5).forEach(fb => {
      feedbackContext += `  - ${fb.comment}\n`;
    });
  }

  const prompt = `You are regenerating a specific section of a Tzofim peula.

Context:
Topic: ${context.topic}
Age: ${context.ageGroup}
Duration: ${context.duration}
Group Size: ${context.groupSize}
Goals: ${context.goals}
${context.availableMaterials && context.availableMaterials.length > 0 ? `Materials: ${context.availableMaterials.map(m => m.replace(/-/g, ' ')).join(', ')}` : ''}
${context.specialConsiderations ? `Notes: ${context.specialConsiderations}` : ''}${feedbackContext}

Regenerate ONLY this section: ${sectionName}

Provide fresh, creative content for this specific component while staying aligned with the context above. Be specific, actionable, and professional. If feedback is provided above, use it to improve the quality of this section by addressing concerns and incorporating successful practices.

Return valid JSON:
{
  "description": "Clear, actionable content for this section",
  "bestPractices": "Tzofim methodology and tips",
  "timeStructure": "Specific time breakdown"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert Tzofim activity planner. Generate fresh, specific content for the requested section. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI");
    }

    const parsed = JSON.parse(content);
    
    if (!parsed.description || !parsed.bestPractices || !parsed.timeStructure) {
      throw new Error("Invalid response structure from AI");
    }

    return {
      description: parsed.description,
      bestPractices: parsed.bestPractices,
      timeStructure: parsed.timeStructure
    };
  } catch (error) {
    console.error("Error regenerating section:", error);
    throw new Error("Failed to regenerate section. Please try again.");
  }
}

