import { type User, type InsertUser, type Peula, type InsertPeula, type Feedback, type InsertFeedback, type TrainingExample, type InsertTrainingExample, users, peulot, feedback, trainingExamples } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "./db";

// Storage interface for both users and peulot
export interface IStorage {
  // User methods (existing)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Peula methods
  getPeula(id: string): Promise<Peula | undefined>;
  getAllPeulot(): Promise<Peula[]>;
  createPeula(peula: InsertPeula): Promise<Peula>;
  updatePeula(id: string, updates: Partial<InsertPeula>): Promise<Peula | undefined>;
  deletePeula(id: string): Promise<void>;
  
  // Feedback methods
  getFeedbackForPeula(peulaId: string): Promise<Feedback[]>;
  getAllFeedback(): Promise<Feedback[]>;
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  deleteFeedback(id: string): Promise<void>;
  
  // Training example methods
  getAllTrainingExamples(): Promise<TrainingExample[]>;
  createTrainingExample(example: InsertTrainingExample): Promise<TrainingExample>;
  deleteTrainingExample(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private peulot: Map<string, Peula>;
  private feedback: Map<string, Feedback>;
  private trainingExamples: Map<string, TrainingExample>;

  constructor() {
    this.users = new Map();
    this.peulot = new Map();
    this.feedback = new Map();
    this.trainingExamples = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Peula methods
  async getPeula(id: string): Promise<Peula | undefined> {
    return this.peulot.get(id);
  }

  async getAllPeulot(): Promise<Peula[]> {
    return Array.from(this.peulot.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createPeula(insertPeula: InsertPeula): Promise<Peula> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const peula: Peula = { 
      ...insertPeula, 
      id, 
      createdAt,
      availableMaterials: insertPeula.availableMaterials ?? null,
      specialConsiderations: insertPeula.specialConsiderations ?? null,
    };
    this.peulot.set(id, peula);
    return peula;
  }

  async updatePeula(id: string, updates: Partial<InsertPeula>): Promise<Peula | undefined> {
    const existing = this.peulot.get(id);
    if (!existing) return undefined;
    
    const updated: Peula = {
      ...existing,
      ...updates,
      availableMaterials: updates.availableMaterials ?? existing.availableMaterials,
      specialConsiderations: updates.specialConsiderations ?? existing.specialConsiderations,
    };
    this.peulot.set(id, updated);
    return updated;
  }

  async deletePeula(id: string): Promise<void> {
    this.peulot.delete(id);
  }

  // Feedback methods
  async getFeedbackForPeula(peulaId: string): Promise<Feedback[]> {
    return Array.from(this.feedback.values()).filter(fb => fb.peulaId === peulaId);
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedback.values());
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const newFeedback: Feedback = { ...insertFeedback, id, createdAt };
    this.feedback.set(id, newFeedback);
    return newFeedback;
  }

  async deleteFeedback(id: string): Promise<void> {
    this.feedback.delete(id);
  }

  // Training example methods
  async getAllTrainingExamples(): Promise<TrainingExample[]> {
    return Array.from(this.trainingExamples.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createTrainingExample(insertExample: InsertTrainingExample): Promise<TrainingExample> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const example: TrainingExample = { 
      ...insertExample, 
      id, 
      createdAt,
      notes: insertExample.notes ?? null,
    };
    this.trainingExamples.set(id, example);
    return example;
  }

  async deleteTrainingExample(id: string): Promise<void> {
    this.trainingExamples.delete(id);
  }
}

// Database-backed storage implementation
export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      password: insertUser.password ?? null,
    };
    await db.insert(users).values(user);
    return user;
  }

  // Peula methods
  async getPeula(id: string): Promise<Peula | undefined> {
    const result = await db.select().from(peulot).where(eq(peulot.id, id)).limit(1);
    return result[0];
  }

  async getAllPeulot(): Promise<Peula[]> {
    return await db.select().from(peulot).orderBy(desc(peulot.createdAt));
  }

  async createPeula(insertPeula: InsertPeula): Promise<Peula> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const peula: Peula = { 
      ...insertPeula, 
      id, 
      createdAt,
      availableMaterials: insertPeula.availableMaterials ?? null,
      specialConsiderations: insertPeula.specialConsiderations ?? null,
    };
    await db.insert(peulot).values(peula);
    return peula;
  }

  async updatePeula(id: string, updates: Partial<InsertPeula>): Promise<Peula | undefined> {
    const existing = await this.getPeula(id);
    if (!existing) return undefined;
    
    const updated: Peula = {
      ...existing,
      ...updates,
      availableMaterials: updates.availableMaterials ?? existing.availableMaterials,
      specialConsiderations: updates.specialConsiderations ?? existing.specialConsiderations,
    };
    
    await db.update(peulot).set(updated).where(eq(peulot.id, id));
    return updated;
  }

  async deletePeula(id: string): Promise<void> {
    await db.delete(peulot).where(eq(peulot.id, id));
  }

  // Feedback methods
  async getFeedbackForPeula(peulaId: string): Promise<Feedback[]> {
    return await db.select().from(feedback).where(eq(feedback.peulaId, peulaId)).orderBy(desc(feedback.createdAt));
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const newFeedback: Feedback = { ...insertFeedback, id, createdAt };
    await db.insert(feedback).values(newFeedback);
    return newFeedback;
  }

  async deleteFeedback(id: string): Promise<void> {
    await db.delete(feedback).where(eq(feedback.id, id));
  }

  // Training example methods
  async getAllTrainingExamples(): Promise<TrainingExample[]> {
    return await db.select().from(trainingExamples).orderBy(desc(trainingExamples.createdAt));
  }

  async createTrainingExample(insertExample: InsertTrainingExample): Promise<TrainingExample> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const example: TrainingExample = { 
      ...insertExample, 
      id, 
      createdAt,
      notes: insertExample.notes ?? null,
    };
    await db.insert(trainingExamples).values(example);
    return example;
  }

  async deleteTrainingExample(id: string): Promise<void> {
    await db.delete(trainingExamples).where(eq(trainingExamples.id, id));
  }
}

export const storage = new DbStorage();
