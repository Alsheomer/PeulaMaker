import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Peula data schema
export const peulot = pgTable("peulot", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  ageGroup: text("age_group").notNull(),
  duration: text("duration").notNull(),
  groupSize: text("group_size").notNull(),
  goals: text("goals").notNull(),
  availableMaterials: text("available_materials").array(),
  specialConsiderations: text("special_considerations"),
  // Generated peula content with all 9 components
  content: jsonb("content").notNull(),
  createdAt: text("created_at").notNull().default(sql`NOW()`),
});

// Feedback on peula sections for AI learning
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  peulaId: varchar("peula_id").notNull().references(() => peulot.id, { onDelete: 'cascade' }),
  componentIndex: integer("component_index").notNull(), // 0-8 for the 9 components
  comment: text("comment").notNull(),
  createdAt: text("created_at").notNull().default(sql`NOW()`),
});

// Training examples for AI to learn from user's writing style
export const trainingExamples = pgTable("training_examples", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(), // The full example peula text
  notes: text("notes"), // Optional notes about what makes this example good
  createdAt: text("created_at").notNull().default(sql`NOW()`),
});

export const tzofimAnchors = pgTable("tzofim_anchors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  category: text("category").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`NOW()`),
});

export const insertPeulaSchema = createInsertSchema(peulot).omit({
  id: true,
  createdAt: true,
});

export type InsertPeula = z.infer<typeof insertPeulaSchema>;
export type Peula = typeof peulot.$inferSelect;

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export const insertTrainingExampleSchema = createInsertSchema(trainingExamples).omit({
  id: true,
  createdAt: true,
});

export type InsertTrainingExample = z.infer<typeof insertTrainingExampleSchema>;
export type TrainingExample = typeof trainingExamples.$inferSelect;

const baseInsertAnchorSchema = createInsertSchema(tzofimAnchors).omit({
  id: true,
  createdAt: true,
});

export const insertTzofimAnchorSchema = baseInsertAnchorSchema.extend({
  displayOrder: baseInsertAnchorSchema.shape.displayOrder.optional(),
});

export type InsertTzofimAnchor = z.infer<typeof insertTzofimAnchorSchema>;
export type TzofimAnchor = typeof tzofimAnchors.$inferSelect;

export const defaultTzofimAnchors: ReadonlyArray<{
  text: string;
  category: string;
  displayOrder: number;
}> = [
  {
    text: "Peulot balance action, creativity, and kvutzah connection so every chanich feels seen and energized.",
    category: "Educational DNA",
    displayOrder: 1,
  },
  {
    text: "Kol Yachad: plan with roles, rotating leadership, and concrete ways chanichim practice responsibility.",
    category: "Leadership",
    displayOrder: 2,
  },
  {
    text: "Embed Eretz Yisrael and Jewish peoplehood through stories, symbols, and reflective questions tied to lived experience.",
    category: "Content Anchors",
    displayOrder: 3,
  },
  {
    text: "Always close with structured reflection that connects actions to values and next steps back in the shevet.",
    category: "Reflection",
    displayOrder: 4,
  },
  {
    text: "Logistics and safety are proactive: scout the space, prep materials, and assign backups before chevraya arrives.",
    category: "Readiness",
    displayOrder: 5,
  },
];

export interface TrainingInsights {
  voiceAndTone: string;
  signatureMoves: string[];
  facilitationFocus: string[];
  reflectionPatterns: string[];
  measurementFocus: string[];
}

export interface TrainingInsightsResponse {
  insights: TrainingInsights | null;
  generatedAt: string | null;
  exampleCount: number;
}

// Questionnaire response schema (for frontend state)
export const questionnaireResponseSchema = z.object({
  templateId: z.string().optional(),
  topic: z.string().min(1, "Topic is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  duration: z.string().min(1, "Duration is required"),
  groupSize: z.string().min(1, "Group size is required"),
  goals: z.string().min(1, "Educational goals are required"),
  availableMaterials: z.array(z.string()).optional(),
  specialConsiderations: z.string().optional(),
});

export type QuestionnaireResponse = z.infer<typeof questionnaireResponseSchema>;

// Peula component structure (for generated content)
export interface PeulaComponent {
  component: string;
  description: string;
  bestPractices: string;
  timeStructure: string;
}

export interface PeulaContent {
  components: PeulaComponent[];
}

// For backward compatibility with users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
