import OpenAI from "openai";
import type { QuestionnaireResponse, PeulaContent } from "@shared/schema";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// Reference: blueprint:javascript_openai_ai_integrations
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export async function generatePeula(responses: QuestionnaireResponse): Promise<{ title: string; content: PeulaContent }> {
  const prompt = `You are an expert Tzofim (Israeli Scouts) activity planner with deep knowledge of scout methodology and best practices. Based on the following questionnaire responses, create a comprehensive peula (activity plan) following the 9-component framework.

Questionnaire Responses:
- Topic/Theme: ${responses.topic}
- Age Group: ${responses.ageGroup} years old
- Duration: ${responses.duration} minutes
- Group Size: ${responses.groupSize} chanichim
- Educational Goals: ${responses.goals}
${responses.availableMaterials && responses.availableMaterials.length > 0 ? `- Available Materials: ${responses.availableMaterials.map(m => m.replace(/-/g, ' ')).join(', ')}` : ''}
${responses.specialConsiderations ? `- Special Considerations: ${responses.specialConsiderations}` : ''}

Create a detailed peula plan with the following 9 components. For each component, provide:
1. Description & Guidelines - Detailed, specific instructions for this peula
2. Tzofim Best Practices & Tips - Scout-specific insights and methodology
3. Time Structure - Specific time allocations and suggestions

The 9 components are:
1. Topic & Educational Goal
2. Know Your Audience
3. Choose Methods & Activities
4. Structure the Peula (Flow)
5. Time Management
6. Materials & Logistics
7. Risk & Safety
8. Delivery & Facilitation
9. Reflection & Debrief

IMPORTANT GUIDELINES:
- Be specific and actionable, not generic
- Include concrete activity suggestions that fit the topic, age, and goals
- Reference the exact age group, duration, and group size provided
- If materials were mentioned, incorporate them creatively
- Follow Tzofim principles: experiential learning, self-discovery, personal example
- Use Hebrew/Israeli scout terminology appropriately (madrich, chanichim, shevet, ken yachad, etc.)
- Ensure time allocations match the total duration provided
- Address any special considerations mentioned
- Make it engaging, educational, and aligned with scout values

Return your response as a JSON object with this structure:
{
  "title": "A clear, descriptive title for this peula (e.g., 'Leadership Through Team Challenges - Ages 12-14')",
  "components": [
    {
      "component": "1. Topic & Educational Goal",
      "description": "Detailed description and guidelines specific to this peula...",
      "bestPractices": "Tzofim-specific best practices and tips...",
      "timeStructure": "Specific time allocations and suggestions..."
    },
    // ... repeat for all 9 components
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
