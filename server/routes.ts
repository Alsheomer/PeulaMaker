import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePeula, regenerateSection, getTrainingInsightsSummary } from "./ai";
import { exportPeulaToGoogleDocs, importGoogleDocsContent, listGoogleDocsFiles } from "./google-docs";
import {
  questionnaireResponseSchema,
  insertFeedbackSchema,
  insertTrainingExampleSchema,
  insertTzofimAnchorSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const updateAnchorSchema = insertTzofimAnchorSchema.partial();

  // Tzofim knowledge anchors
  app.get("/api/tzofim-anchors", async (_req, res) => {
    try {
      const anchors = await storage.getTzofimAnchors();
      res.json(anchors);
    } catch (error) {
      console.error("Error fetching Tzofim anchors:", error);
      res.status(500).json({ error: "Failed to fetch Tzofim anchors" });
    }
  });

  app.post("/api/tzofim-anchors", async (req, res) => {
    try {
      const validation = insertTzofimAnchorSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid anchor data",
          details: validation.error.errors,
        });
      }

      const anchor = await storage.createTzofimAnchor(validation.data);
      res.json(anchor);
    } catch (error) {
      console.error("Error creating Tzofim anchor:", error);
      res.status(500).json({ error: "Failed to create Tzofim anchor" });
    }
  });

  app.patch("/api/tzofim-anchors/:id", async (req, res) => {
    try {
      const validation = updateAnchorSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid anchor update",
          details: validation.error.errors,
        });
      }

      const updated = await storage.updateTzofimAnchor(req.params.id, validation.data);
      if (!updated) {
        return res.status(404).json({ error: "Anchor not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating Tzofim anchor:", error);
      res.status(500).json({ error: "Failed to update Tzofim anchor" });
    }
  });

  app.delete("/api/tzofim-anchors/:id", async (req, res) => {
    try {
      await storage.deleteTzofimAnchor(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting Tzofim anchor:", error);
      res.status(500).json({ error: "Failed to delete Tzofim anchor" });
    }
  });

  app.post("/api/tzofim-anchors/reorder", async (req, res) => {
    try {
      const validation = z.object({ ids: z.array(z.string()) }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid reorder payload",
          details: validation.error.errors,
        });
      }

      const anchors = await storage.reorderTzofimAnchors(validation.data.ids);
      res.json(anchors);
    } catch (error) {
      console.error("Error reordering Tzofim anchors:", error);
      res.status(500).json({ error: "Failed to reorder Tzofim anchors" });
    }
  });

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

  // Regenerate specific section of peula
  app.post("/api/peulot/:id/regenerate-section", async (req, res) => {
    try {
      const peula = await storage.getPeula(req.params.id);
      if (!peula) {
        return res.status(404).json({ error: "Peula not found" });
      }

      const { sectionIndex } = req.body;
      if (typeof sectionIndex !== "number" || sectionIndex < 0 || sectionIndex > 8) {
        return res.status(400).json({ error: "Invalid section index" });
      }

      const content = peula.content as any;
      const sectionName = content.components[sectionIndex].component;

      // Regenerate the section
      const newSection = await regenerateSection(sectionIndex, sectionName, {
        topic: peula.topic,
        ageGroup: peula.ageGroup,
        duration: peula.duration,
        groupSize: peula.groupSize,
        goals: peula.goals,
        availableMaterials: peula.availableMaterials || undefined,
        specialConsiderations: peula.specialConsiderations || undefined,
      });

      // Update the section
      content.components[sectionIndex] = {
        component: sectionName,
        ...newSection
      };

      // Save updated peula
      const updated = await storage.updatePeula(peula.id, { content });
      res.json(updated);
    } catch (error) {
      console.error("Error regenerating section:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to regenerate section" 
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

  // Get feedback for a specific peula
  app.get("/api/peulot/:id/feedback", async (req, res) => {
    try {
      const feedbackList = await storage.getFeedbackForPeula(req.params.id);
      res.json(feedbackList);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Create feedback for a peula section
  app.post("/api/feedback", async (req, res) => {
    try {
      const validation = insertFeedbackSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid feedback data",
          details: validation.error.errors 
        });
      }

      // Validate componentIndex is in valid range (0-8 for 9 components)
      if (validation.data.componentIndex < 0 || validation.data.componentIndex > 8) {
        return res.status(400).json({ 
          error: "Invalid component index. Must be between 0 and 8." 
        });
      }

      const newFeedback = await storage.createFeedback(validation.data);
      res.json(newFeedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  });

  // Delete feedback
  app.delete("/api/feedback/:id", async (req, res) => {
    try {
      await storage.deleteFeedback(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting feedback:", error);
      res.status(500).json({ error: "Failed to delete feedback" });
    }
  });

  // Get all training examples
  app.get("/api/training-examples", async (_req, res) => {
    try {
      const examples = await storage.getAllTrainingExamples();
      res.json(examples);
    } catch (error) {
      console.error("Error fetching training examples:", error);
      res.status(500).json({ error: "Failed to fetch training examples" });
    }
  });

  app.get("/api/training-examples/insights", async (_req, res) => {
    try {
      const summary = await getTrainingInsightsSummary();
      if (!summary) {
        return res.json({ insights: null, generatedAt: null, exampleCount: 0 });
      }

      res.json({
        insights: summary.insights,
        generatedAt: summary.generatedAt,
        exampleCount: summary.exampleCount,
      });
    } catch (error) {
      console.error("Error generating training insights:", error);
      res.status(500).json({ error: "Failed to analyze training examples" });
    }
  });

  // Create new training example
  app.post("/api/training-examples", async (req, res) => {
    try {
      const validation = insertTrainingExampleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid training example data",
          details: validation.error.errors 
        });
      }

      const newExample = await storage.createTrainingExample(validation.data);
      res.json(newExample);
    } catch (error) {
      console.error("Error creating training example:", error);
      res.status(500).json({ error: "Failed to create training example" });
    }
  });

  // Delete training example
  app.delete("/api/training-examples/:id", async (req, res) => {
    try {
      await storage.deleteTrainingExample(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting training example:", error);
      res.status(500).json({ error: "Failed to delete training example" });
    }
  });

  // List Google Docs files from Drive
  app.get("/api/google-drive/docs", async (_req, res) => {
    try {
      const files = await listGoogleDocsFiles();
      res.json(files);
    } catch (error) {
      console.error("Error listing Google Docs files:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to list Google Docs files" 
      });
    }
  });

  // Import training example from Google Docs by document ID
  app.post("/api/training-examples/import-from-drive", async (req, res) => {
    try {
      const { documentId, notes } = req.body;
      
      if (!documentId || typeof documentId !== "string") {
        return res.status(400).json({ error: "Document ID is required" });
      }

      // Import content from Google Docs
      const { title, content } = await importGoogleDocsContent(documentId);

      // Create training example with imported content
      const newExample = await storage.createTrainingExample({
        title,
        content,
        notes: notes || `Imported from Google Drive`
      });

      res.json(newExample);
    } catch (error) {
      console.error("Error importing training example from Drive:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to import from Drive" 
      });
    }
  });

  // Import training example from Google Docs URL
  app.post("/api/training-examples/import-from-docs", async (req, res) => {
    try {
      const { url, notes } = req.body;
      
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Google Docs URL is required" });
      }

      // Extract document ID from URL
      // Supports formats:
      // https://docs.google.com/document/d/DOCUMENT_ID/edit
      // https://docs.google.com/document/d/DOCUMENT_ID
      const docIdMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      if (!docIdMatch) {
        return res.status(400).json({ error: "Invalid Google Docs URL format" });
      }

      const documentId = docIdMatch[1];

      // Import content from Google Docs
      const { title, content } = await importGoogleDocsContent(documentId);

      // Create training example with imported content
      const newExample = await storage.createTrainingExample({
        title,
        content,
        notes: notes || `Imported from Google Docs`
      });

      res.json(newExample);
    } catch (error) {
      console.error("Error importing training example from Google Docs:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to import from Google Docs" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
