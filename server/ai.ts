import OpenAI from "openai";
import type { QuestionnaireResponse, PeulaContent, Feedback } from "@shared/schema";
import { getTemplateById } from "@shared/templates";
import { storage } from "./storage";

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
${responses.specialConsiderations ? `Notes: ${responses.specialConsiderations}` : ''}${trainingContext}${feedbackContext}

Create a professional, actionable peula with these 9 components. Be specific, practical, and aligned with Tzofim educational values.

Tzofim Expertise & Educational DNA to apply:
• Anchor everything in authentic Israeli Scouts culture (youth leading youth, Zionist identity, chevra/community, social responsibility, Hebrew terminology).
• Map the age to the likely shichva (Ofarim, Tzofim, Tzofei Da-at, Shachbag) and calibrate language, independence, and challenge accordingly.
• Follow the classic peula arc: opening "hitkhadshut" to set tone, experiential core "chomer" with active kvutza work, processing "iyun"/"sikkum" for reflection, and take-home "hishtalvut" action.
• Showcase outdoor and creative movement where relevant (mifkad, masa, games, chetziot) and adapt to the specified environment while offering rain/indoor backups.
• Give clear tafkidim (roles) for madrichim and chanichim, highlighting leadership rotation, kvutzat avoda / peulot shetach, and accessibility needs.
• Tie every element back to Tzofim values like hadracha, teamwork, initiative, Israeli culture, manhigut, service, and Tnuat HaTzofim traditions.
• Integrate iconic rituals (opening mifkad with "Ani Nodar", kvutzot ma'agal, shir peula, ma'avar games) and Israeli cultural anchors (holidays, landscapes, Hebrew slang) where appropriate.
• Emphasize experiential learning that ends with concrete "ma'ase beshetach" or community follow-up so chanichim leave with actionable commitments.

${trainingExamples.length > 0 ? 'IMPORTANT: Study the training examples above and match the writing style, tone, structure, and level of detail shown in those examples. Create a peula that feels consistent with the user\'s own writing.' : ''}

${allFeedback.length > 0 ? 'Also use the feedback provided above to improve the quality of this peula by addressing common concerns and incorporating successful practices.' : ''}

For each component provide:
- Description: Step-by-step instructions that reference Tzofim practices (use Hebrew terms with short translations on first use) and link activities to the peula arc.
- Best Practices: Tzofim methodology, leadership focus, and facilitation tips.
- Time Structure: Specific time breakdown that sums to the total duration, clarifying transitions between stages (opening, experience, processing, sikkum) and naming key transition signals (e.g., mifkad call, shir ma'avar).

Guidelines:
• Write naturally and professionally
• Provide specific activities, not general advice
• Include exact timing that adds up to the total duration
• Use concrete examples and instructions (games, chants, mifkad ceremonies, patrol rotations, etc.)
• Integrate specified materials creatively and suggest Tzofim-appropriate alternatives if needed
• Apply Tzofim principles: experiential learning, active participation, reflection, leadership by youth, and chevra-building
• Keep language clear and implementation-focused, noting accessibility and inclusion considerations (neurodiversity, physical access, language)
• Address safety, logistics, and facilitation practically, especially for outdoor or physical elements, including Israeli Scouts risk management norms (briefings, buddy system, first-aid kit)
• Suggest chants, songs, or closing quotes that reinforce the theme when natural

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

Provide fresh, creative content for this specific component while staying aligned with the context above. Be specific, actionable, and professional. Infuse it with authentic Tzofim methodology: highlight youth leadership, kvutza dynamics, Hebrew terminology (with translations on first use), shichva-appropriate challenge, and the peula arc from hitkhadshut to sikkum with clear transition cues. Reference iconic practices (mifkad, ma'agal, shir peula, masa) where natural, and anchor outcomes in Tzofim values and community action. If feedback is provided above, use it to improve the quality of this section by addressing concerns and incorporating successful practices.

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

