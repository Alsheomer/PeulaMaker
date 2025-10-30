import { type User, type InsertUser, type Peula, type InsertPeula } from "@shared/schema";
import { randomUUID } from "crypto";

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
    const peula: Peula = { ...insertPeula, id, createdAt };
    this.peulot.set(id, peula);
    return peula;
  }

  async deletePeula(id: string): Promise<void> {
    this.peulot.delete(id);
  }
}

export const storage = new MemStorage();
