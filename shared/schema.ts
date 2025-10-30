import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb } from "drizzle-orm/pg-core";
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

export const insertPeulaSchema = createInsertSchema(peulot).omit({
  id: true,
  createdAt: true,
});

export type InsertPeula = z.infer<typeof insertPeulaSchema>;
export type Peula = typeof peulot.$inferSelect;

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
