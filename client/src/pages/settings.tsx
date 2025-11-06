import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  FileText,
  FolderOpen,
  GripVertical,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { TrainingExample, TzofimAnchor } from "@shared/schema";
import { defaultTzofimAnchors } from "@shared/schema";

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export default function Settings() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [googleDocsUrl, setGoogleDocsUrl] = useState("");
  const [googleDocsNotes, setGoogleDocsNotes] = useState("");
  const [driveDialogOpen, setDriveDialogOpen] = useState(false);
  const [selectedDriveFile, setSelectedDriveFile] = useState<string | null>(null);
  const [driveImportNotes, setDriveImportNotes] = useState("");
  const [anchorText, setAnchorText] = useState("");
  const [anchorCategory, setAnchorCategory] = useState("");
  const [anchorDrafts, setAnchorDrafts] = useState<Record<string, { text: string; category: string }>>({});
  const { toast } = useToast();

  const { data: examples = [], isLoading } = useQuery<TrainingExample[]>({
    queryKey: ["/api/training-examples"],
  });

  const { data: anchors = [], isLoading: anchorsLoading } = useQuery<TzofimAnchor[]>({
    queryKey: ["/api/tzofim-anchors"],
  });

  useEffect(() => {
    setAnchorDrafts((previous) => {
      const next = { ...previous } as Record<string, { text: string; category: string }>;
      let changed = false;
      const incomingIds = new Set<string>();

      anchors.forEach((anchor) => {
        incomingIds.add(anchor.id);
        const existing = next[anchor.id];
        if (!existing || existing.text !== anchor.text || existing.category !== anchor.category) {
          next[anchor.id] = { text: anchor.text, category: anchor.category };
          changed = true;
        }
      });

      Object.keys(next).forEach((id) => {
        if (!incomingIds.has(id)) {
          delete next[id];
          changed = true;
        }
      });

      return changed ? next : previous;
    });
  }, [anchors]);

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; notes?: string }) => {
      return await apiRequest("POST", "/api/training-examples", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-examples"] });
      setTitle("");
      setContent("");
      setNotes("");
      toast({
        title: "Example added",
        description: "Training example uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/training-examples/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-examples"] });
      toast({
        title: "Example deleted",
        description: "Training example removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importFromDocsMutation = useMutation({
    mutationFn: async (data: { url: string; notes?: string }) => {
      return await apiRequest("POST", "/api/training-examples/import-from-docs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-examples"] });
      setGoogleDocsUrl("");
      setGoogleDocsNotes("");
      toast({
        title: "Import successful",
        description: "Training example imported from Google Docs",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const {
    data: driveFiles = [],
    isLoading: driveFilesLoading,
    error: driveFilesError,
  } = useQuery<DriveFile[]>({
    queryKey: ["/api/google-drive/docs"],
    enabled: driveDialogOpen,
  });

  const importFromDriveMutation = useMutation({
    mutationFn: async (data: { documentId: string; notes?: string }) => {
      return await apiRequest("POST", "/api/training-examples/import-from-drive", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-examples"] });
      const documentName = data.title || "Document";
      setDriveDialogOpen(false);
      setSelectedDriveFile(null);
      setDriveImportNotes("");
      toast({
        title: "Import successful",
        description: `"${documentName}" imported from Google Drive`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createAnchorMutation = useMutation({
    mutationFn: async (data: { text: string; category: string }) => {
      return await apiRequest("POST", "/api/tzofim-anchors", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tzofim-anchors"] });
      setAnchorText("");
      setAnchorCategory("");
      toast({
        title: "Anchor added",
        description: "Institutional knowledge anchor saved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAnchorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { text?: string; category?: string; displayOrder?: number } }) => {
      return await apiRequest("PATCH", `/api/tzofim-anchors/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tzofim-anchors"] });
      toast({
        title: "Anchor updated",
        description: "Changes saved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAnchorMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/tzofim-anchors/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tzofim-anchors"] });
      toast({
        title: "Anchor deleted",
        description: "Anchor removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reorderAnchorsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return await apiRequest("POST", "/api/tzofim-anchors/reorder", { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tzofim-anchors"] });
      toast({
        title: "Order updated",
        description: "Anchor priority refreshed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reorder failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for the example",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({ title, content, notes: notes || undefined });
  };

  const handleGoogleDocsImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleDocsUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please provide a Google Docs URL",
        variant: "destructive",
      });
      return;
    }
    importFromDocsMutation.mutate({
      url: googleDocsUrl,
      notes: googleDocsNotes || undefined,
    });
  };

  const handleDriveImport = () => {
    if (!selectedDriveFile) {
      toast({
        title: "No file selected",
        description: "Please select a document from your Drive",
        variant: "destructive",
      });
      return;
    }
    importFromDriveMutation.mutate({
      documentId: selectedDriveFile,
      notes: driveImportNotes || undefined,
    });
  };

  const handleAnchorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anchorText.trim() || !anchorCategory.trim()) {
      toast({
        title: "Missing details",
        description: "Please provide both anchor text and a category",
        variant: "destructive",
      });
      return;
    }

    createAnchorMutation.mutate({
      text: anchorText.trim(),
      category: anchorCategory.trim(),
    });
  };

  const handleAnchorDraftChange = (id: string, field: "text" | "category", value: string) => {
    setAnchorDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleAnchorSave = (id: string) => {
    const draft = anchorDrafts[id];
    if (!draft || !draft.text.trim() || !draft.category.trim()) {
      toast({
        title: "Incomplete anchor",
        description: "Both text and category are required",
        variant: "destructive",
      });
      return;
    }

    updateAnchorMutation.mutate({
      id,
      data: {
        text: draft.text.trim(),
        category: draft.category.trim(),
      },
    });
  };

  const handleAnchorMove = (id: string, direction: "up" | "down") => {
    if (reorderAnchorsMutation.isPending) return;
    const index = anchors.findIndex((anchor) => anchor.id === id);
    if (index === -1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= anchors.length) return;

    const ordered = [...anchors];
    [ordered[index], ordered[swapIndex]] = [ordered[swapIndex], ordered[index]];
    reorderAnchorsMutation.mutate(ordered.map((anchor) => anchor.id));
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24">
      <header className="rounded-3xl border border-border/70 bg-background/90 px-8 py-10 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className="w-fit text-xs uppercase tracking-[0.3em]">Model coaching</Badge>
            <h1 className="text-4xl font-semibold text-foreground">AI training studio</h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Curate exemplar peulot so the generator mirrors your language, structure, and values. Combine manual uploads with
              imports from Google Docs to continuously improve output.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Your examples directly tune the planner’s prompts.</span>
          </div>
        </div>
      </header>

      <div className="space-y-10">
        <section className="space-y-6">
          <Card className="border-border/70 bg-background/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <GripVertical className="h-5 w-5" /> Institutional knowledge anchors
              </CardTitle>
              <CardDescription>Curate short reminders that always accompany AI generations.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAnchorSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                  <div className="space-y-2">
                    <Label htmlFor="anchor-category" className="text-sm font-medium">Category</Label>
                    <Input
                      id="anchor-category"
                      placeholder="e.g. Leadership"
                      value={anchorCategory}
                      onChange={(e) => setAnchorCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anchor-text" className="text-sm font-medium">Anchor text</Label>
                    <Textarea
                      id="anchor-text"
                      placeholder="Describe the non-negotiable practice the AI must keep front-of-mind."
                      value={anchorText}
                      onChange={(e) => setAnchorText(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
                  <span>Anchors are prioritized top to bottom. Reordering updates future generations instantly.</span>
                  <Button type="submit" disabled={createAnchorMutation.isPending}>
                    {createAnchorMutation.isPending ? "Saving..." : "Add anchor"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <Sparkles className="h-5 w-5" /> Active anchor list
              </CardTitle>
              <CardDescription>Reorder and refine the institutional cues shaping every peula.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {anchorsLoading ? (
                <p className="text-sm text-muted-foreground">Loading anchors...</p>
              ) : anchors.length === 0 ? (
                <>
                  <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-5 text-sm text-muted-foreground">
                    No custom anchors yet. The generator currently falls back to the default Tzofim knowledge base below.
                  </div>
                  <div className="space-y-3">
                    {defaultTzofimAnchors.map((anchor) => (
                      <div key={`${anchor.category}-${anchor.displayOrder}`} className="rounded-2xl border border-border/60 bg-background/95 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{anchor.category}</p>
                        <p className="mt-2 text-sm text-foreground">{anchor.text}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {anchors.map((anchor, index) => {
                    const draft = anchorDrafts[anchor.id] ?? { text: anchor.text, category: anchor.category };
                    return (
                      <div key={anchor.id} className="space-y-4 rounded-2xl border border-border/60 bg-background/95 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            <GripVertical className="h-4 w-4 text-primary/60" />
                            <span>Priority {index + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleAnchorMove(anchor.id, "up")}
                              disabled={index === 0 || reorderAnchorsMutation.isPending}
                              aria-label="Move anchor up"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleAnchorMove(anchor.id, "down")}
                              disabled={index === anchors.length - 1 || reorderAnchorsMutation.isPending}
                              aria-label="Move anchor down"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteAnchorMutation.mutate(anchor.id)}
                              disabled={deleteAnchorMutation.isPending}
                              aria-label="Delete anchor"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
                          <div className="space-y-2">
                            <Label htmlFor={`anchor-text-${anchor.id}`} className="text-sm font-medium">Anchor text</Label>
                            <Textarea
                              id={`anchor-text-${anchor.id}`}
                              value={draft.text}
                              onChange={(e) => handleAnchorDraftChange(anchor.id, "text", e.target.value)}
                              className="min-h-[120px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`anchor-category-${anchor.id}`} className="text-sm font-medium">Category</Label>
                            <Input
                              id={`anchor-category-${anchor.id}`}
                              value={draft.category}
                              onChange={(e) => handleAnchorDraftChange(anchor.id, "category", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span>Last updated {formatDistanceToNow(new Date(anchor.createdAt), { addSuffix: true })}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnchorSave(anchor.id)}
                            disabled={updateAnchorMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <Save className="h-3.5 w-3.5" />
                            Save changes
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <Card className="border-border/70 bg-background/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                  <BookOpen className="h-5 w-5" /> Manual upload
                </CardTitle>
                <CardDescription>Paste your own peula to teach tone, pacing, and structure.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                    <Input
                      id="title"
                      placeholder="Peula title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-medium">Peula content</Label>
                    <Textarea
                      id="content"
                      placeholder="Paste your peula content here"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[220px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Tell the AI what to emulate in this example"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <span className="text-xs text-muted-foreground">Uploads immediately become part of your private corpus.</span>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Uploading..." : "Add example"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-background/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                  <Plus className="h-5 w-5" /> Training examples
                </CardTitle>
                <CardDescription>Review and manage the corpus guiding your generations.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading examples...</p>
                ) : examples.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-6 text-sm text-muted-foreground">
                    No examples yet. Add one to start teaching the AI.
                  </div>
                ) : (
                  <ScrollArea className="max-h-[420px] pr-4">
                    <div className="space-y-4">
                      {examples.map((example) => (
                        <Card key={example.id} className="border border-border/60 bg-background/95">
                          <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div className="space-y-1">
                              <CardTitle className="text-lg font-semibold text-foreground">{example.title}</CardTitle>
                              <CardDescription>
                                Added {formatDistanceToNow(new Date(example.createdAt), { addSuffix: true })}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(example.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {example.notes ? (
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{example.notes}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground">No curator notes provided.</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6">
            <Card className="border-border/70 bg-background/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                  <FileText className="h-5 w-5" /> Import from Google Docs
                </CardTitle>
                <CardDescription>Browse Drive or paste a link to sync existing peulot.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Dialog open={driveDialogOpen} onOpenChange={setDriveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" /> Browse Google Drive
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Select a document</DialogTitle>
                      <DialogDescription>Pick a Docs file to convert into a training example.</DialogDescription>
                    </DialogHeader>

                    {driveFilesLoading && <p className="text-sm text-muted-foreground">Loading documents...</p>}
                    {driveFilesError && <p className="text-sm text-destructive">Failed to load documents. Please try again.</p>}
                    {!driveFilesLoading && !driveFilesError && driveFiles.length === 0 && (
                      <p className="text-sm text-muted-foreground">No Docs files found.</p>
                    )}

                    <div className="mt-4 space-y-2">
                      {driveFiles.map((file) => (
                        <button
                          key={file.id}
                          className={`w-full rounded-xl border px-4 py-3 text-left transition hover-elevate ${
                            selectedDriveFile === file.id ? "border-primary bg-primary/10" : "border-border/70"
                          }`}
                          onClick={() => setSelectedDriveFile(file.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Last modified {formatDistanceToNow(new Date(file.modifiedTime), { addSuffix: true })}
                              </p>
                            </div>
                            {selectedDriveFile === file.id && (
                              <Badge variant="secondary" className="text-xs">Selected</Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <Label htmlFor="drive-notes" className="text-sm font-medium">Notes (optional)</Label>
                      <Textarea
                        id="drive-notes"
                        placeholder="Add context about this peula for future generations"
                        value={driveImportNotes}
                        onChange={(e) => setDriveImportNotes(e.target.value)}
                      />
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setDriveDialogOpen(false);
                          setSelectedDriveFile(null);
                          setDriveImportNotes("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleDriveImport} disabled={importFromDriveMutation.isPending}>
                        {importFromDriveMutation.isPending ? "Importing..." : "Import selected"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Separator />

                <form onSubmit={handleGoogleDocsImport} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="google-docs-url" className="text-sm font-medium">Google Docs URL</Label>
                    <Input
                      id="google-docs-url"
                      placeholder="https://docs.google.com/document/d/..."
                      value={googleDocsUrl}
                      onChange={(e) => setGoogleDocsUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="google-docs-notes" className="text-sm font-medium">Notes (optional)</Label>
                    <Textarea
                      id="google-docs-notes"
                      placeholder="Highlight what the AI should learn from this document"
                      value={googleDocsNotes}
                      onChange={(e) => setGoogleDocsNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Docs imports fetch the document text and store it privately.</span>
                    <Button type="submit" disabled={importFromDocsMutation.isPending}>
                      {importFromDocsMutation.isPending ? "Importing..." : "Import from URL"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-background/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                  <ArrowUpRight className="h-5 w-5" /> Tips for stronger training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• Upload peulot that reflect the tone and structure you want the AI to replicate.</p>
                <p>• Add notes explaining why an example works—these hints help weighting future generations.</p>
                <p>• Regenerate sections after uploading new examples to feel the difference immediately.</p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Need a refresher on our data policy? Contact your ken administrator.
              </CardFooter>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
