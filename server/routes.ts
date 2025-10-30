import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePeula } from "./ai";
import { exportPeulaToGoogleDocs } from "./google-docs";
import { questionnaireResponseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all peulot
  app.get("/api/peulot", async (_req, res) => {
    try {
      const peulot = await storage.getAllPeulot();
      res.json(peulot);
    } catch (error) {
      console.error("Error fetching peulot:", error);
      res.status(500).json({ error: "Failed to fetch peulot" });
    }
  });

  // Get single peula
  app.get("/api/peulot/:id", async (req, res) => {
    try {
      const peula = await storage.getPeula(req.params.id);
      if (!peula) {
        return res.status(404).json({ error: "Peula not found" });
      }
      res.json(peula);
    } catch (error) {
      console.error("Error fetching peula:", error);
      res.status(500).json({ error: "Failed to fetch peula" });
    }
  });

  // Generate new peula with AI
  app.post("/api/peulot/generate", async (req, res) => {
    try {
      // Validate request body
      const validation = questionnaireResponseSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request data",
          details: validation.error.errors 
        });
      }

      const responses = validation.data;

      // Generate peula using AI
      const { title, content } = await generatePeula(responses);

      // Save to storage
      const peula = await storage.createPeula({
        title,
        topic: responses.topic,
        ageGroup: responses.ageGroup,
        duration: responses.duration,
        groupSize: responses.groupSize,
        goals: responses.goals,
        availableMaterials: responses.availableMaterials || [],
        specialConsiderations: responses.specialConsiderations || null,
        content,
      });

      res.json(peula);
    } catch (error) {
      console.error("Error generating peula:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate peula" 
      });
    }
  });

  // Export peula to Google Docs
  app.post("/api/peulot/:id/export", async (req, res) => {
    try {
      const peula = await storage.getPeula(req.params.id);
      if (!peula) {
        return res.status(404).json({ error: "Peula not found" });
      }

      const documentUrl = await exportPeulaToGoogleDocs(peula);
      res.json({ documentUrl });
    } catch (error) {
      console.error("Error exporting peula:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to export peula" 
      });
    }
  });

  // Delete peula
  app.delete("/api/peulot/:id", async (req, res) => {
    try {
      await storage.deletePeula(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting peula:", error);
      res.status(500).json({ error: "Failed to delete peula" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
