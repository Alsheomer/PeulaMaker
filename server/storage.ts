import {
  type User,
  type InsertUser,
  type Peula,
  type InsertPeula,
  type Feedback,
  type InsertFeedback,
  type TrainingExample,
  type InsertTrainingExample,
  type TzofimAnchor,
  type InsertTzofimAnchor,
  users,
  peulot,
  feedback,
  trainingExamples,
  tzofimAnchors,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { asc, desc, eq } from "drizzle-orm";
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

  // Tzofim anchor methods
  getTzofimAnchors(): Promise<TzofimAnchor[]>;
  createTzofimAnchor(anchor: InsertTzofimAnchor): Promise<TzofimAnchor>;
  updateTzofimAnchor(
    id: string,
    updates: Partial<Omit<InsertTzofimAnchor, "displayOrder">> & { displayOrder?: number },
  ): Promise<TzofimAnchor | undefined>;
  deleteTzofimAnchor(id: string): Promise<void>;
  reorderTzofimAnchors(order: string[]): Promise<TzofimAnchor[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private peulot: Map<string, Peula>;
  private feedback: Map<string, Feedback>;
  private trainingExamples: Map<string, TrainingExample>;
  private tzofimAnchors: Map<string, TzofimAnchor>;

  constructor() {
    this.users = new Map();
    this.peulot = new Map();
    this.feedback = new Map();
    this.trainingExamples = new Map();
    this.tzofimAnchors = new Map();
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

  // Tzofim anchor methods
  async getTzofimAnchors(): Promise<TzofimAnchor[]> {
    return Array.from(this.tzofimAnchors.values()).sort((a, b) => {
      if (a.displayOrder === b.displayOrder) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return a.displayOrder - b.displayOrder;
    });
  }

  async createTzofimAnchor(insertAnchor: InsertTzofimAnchor): Promise<TzofimAnchor> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const existing = await this.getTzofimAnchors();
    const nextOrder = existing.length > 0 ? Math.max(...existing.map((anchor) => anchor.displayOrder)) + 1 : 1;
    const displayOrder = insertAnchor.displayOrder ?? nextOrder;

    const anchor: TzofimAnchor = {
      ...insertAnchor,
      id,
      createdAt: now,
      displayOrder,
    };

    this.tzofimAnchors.set(id, anchor);
    return anchor;
  }

  async updateTzofimAnchor(
    id: string,
    updates: Partial<Omit<InsertTzofimAnchor, "displayOrder">> & { displayOrder?: number },
  ): Promise<TzofimAnchor | undefined> {
    const existing = this.tzofimAnchors.get(id);
    if (!existing) return undefined;

    const updated: TzofimAnchor = {
      ...existing,
      ...updates,
      displayOrder: updates.displayOrder ?? existing.displayOrder,
    };

    this.tzofimAnchors.set(id, updated);
    return updated;
  }

  async deleteTzofimAnchor(id: string): Promise<void> {
    this.tzofimAnchors.delete(id);
  }

  async reorderTzofimAnchors(order: string[]): Promise<TzofimAnchor[]> {
    order.forEach((id, index) => {
      const anchor = this.tzofimAnchors.get(id);
      if (anchor) {
        this.tzofimAnchors.set(id, { ...anchor, displayOrder: index + 1 });
      }
    });

    return this.getTzofimAnchors();
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

  // Tzofim anchor methods
  async getTzofimAnchors(): Promise<TzofimAnchor[]> {
    return await db.select().from(tzofimAnchors).orderBy(asc(tzofimAnchors.displayOrder), asc(tzofimAnchors.createdAt));
  }

  async createTzofimAnchor(insertAnchor: InsertTzofimAnchor): Promise<TzofimAnchor> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const existing = await this.getTzofimAnchors();
    const nextOrder = existing.length > 0 ? Math.max(...existing.map((anchor) => anchor.displayOrder)) + 1 : 1;
    const displayOrder = insertAnchor.displayOrder ?? nextOrder;

    const anchor: TzofimAnchor = {
      ...insertAnchor,
      id,
      createdAt,
      displayOrder,
    };

    await db.insert(tzofimAnchors).values(anchor);
    return anchor;
  }

  async updateTzofimAnchor(
    id: string,
    updates: Partial<Omit<InsertTzofimAnchor, "displayOrder">> & { displayOrder?: number },
  ): Promise<TzofimAnchor | undefined> {
    const [existing] = await db.select().from(tzofimAnchors).where(eq(tzofimAnchors.id, id)).limit(1);
    if (!existing) {
      return undefined;
    }

    const updated: TzofimAnchor = {
      ...existing,
      ...updates,
      displayOrder: updates.displayOrder ?? existing.displayOrder,
    };

    await db
      .update(tzofimAnchors)
      .set({
        text: updated.text,
        category: updated.category,
        displayOrder: updated.displayOrder,
      })
      .where(eq(tzofimAnchors.id, id));

    return updated;
  }

  async deleteTzofimAnchor(id: string): Promise<void> {
    await db.delete(tzofimAnchors).where(eq(tzofimAnchors.id, id));
  }

  async reorderTzofimAnchors(order: string[]): Promise<TzofimAnchor[]> {
    await db.transaction(async (tx) => {
      for (let index = 0; index < order.length; index++) {
        const id = order[index];
        await tx
          .update(tzofimAnchors)
          .set({ displayOrder: index + 1 })
          .where(eq(tzofimAnchors.id, id));
      }
    });

    return this.getTzofimAnchors();
  }
}

export const storage = new DbStorage();
