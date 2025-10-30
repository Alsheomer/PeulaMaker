import { type User, type InsertUser, type Peula, type InsertPeula, users, peulot } from "@shared/schema";
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
  deletePeula(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private peulot: Map<string, Peula>;

  constructor() {
    this.users = new Map();
    this.peulot = new Map();
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

  async deletePeula(id: string): Promise<void> {
    this.peulot.delete(id);
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

  async deletePeula(id: string): Promise<void> {
    await db.delete(peulot).where(eq(peulot.id, id));
  }
}

export const storage = new DbStorage();
