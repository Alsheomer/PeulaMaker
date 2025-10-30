// Peula templates for common Tzofim topics

export interface PeulaTemplate {
  id: string;
  name: string;
  description: string;
  topic: string;
  goals: string;
  icon: string; // Lucide icon name
}

export const peulaTemplates: PeulaTemplate[] = [
  {
    id: "custom",
    name: "Start from Scratch",
    description: "Create a completely custom peula for any topic",
    topic: "",
    goals: "",
    icon: "Sparkles",
  },
  {
    id: "leadership",
    name: "Leadership & Responsibility",
    description: "Develop leadership skills and personal responsibility",
    topic: "Leadership and taking responsibility",
    goals: "Participants will understand different leadership styles, practice making decisions, and learn how to inspire and guide others effectively.",
    icon: "Users",
  },
  {
    id: "teamwork",
    name: "Teamwork & Collaboration",
    description: "Build cooperation and group cohesion",
    topic: "Teamwork and collaboration",
    goals: "Participants will develop communication skills, learn to work together toward common goals, and understand the value of each team member's contribution.",
    icon: "UsersRound",
  },
  {
    id: "community",
    name: "Community Service",
    description: "Foster social responsibility and community engagement",
    topic: "Community service and social responsibility",
    goals: "Participants will understand their role in the community, develop empathy for others, and learn practical ways to make a positive impact.",
    icon: "Heart",
  },
  {
    id: "nature",
    name: "Nature & Environment",
    description: "Connect with nature and environmental awareness",
    topic: "Environmental awareness and nature connection",
    goals: "Participants will develop appreciation for the natural world, understand environmental challenges, and learn sustainable practices.",
    icon: "TreePine",
  },
  {
    id: "identity",
    name: "Cultural & Israeli Identity",
    description: "Explore Israeli and Jewish heritage and values",
    topic: "Israeli and Jewish identity",
    goals: "Participants will connect with their cultural heritage, explore Israeli values and traditions, and develop a sense of belonging to the Jewish people and Israeli society.",
    icon: "Star",
  },
  {
    id: "creativity",
    name: "Creativity & Innovation",
    description: "Encourage creative thinking and problem-solving",
    topic: "Creativity and innovative thinking",
    goals: "Participants will practice creative problem-solving, learn to think outside the box, and develop confidence in expressing original ideas.",
    icon: "Lightbulb",
  },
  {
    id: "conflict",
    name: "Conflict Resolution",
    description: "Develop skills for resolving disagreements peacefully",
    topic: "Conflict resolution and communication",
    goals: "Participants will learn to identify sources of conflict, practice active listening, and develop strategies for peaceful resolution of disagreements.",
    icon: "Handshake",
  },
];

export function getTemplateById(id: string): PeulaTemplate | undefined {
  return peulaTemplates.find((t) => t.id === id);
}
