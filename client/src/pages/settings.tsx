import { useState } from "react";
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
import { PageHeader } from "@/components/page-header";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  FolderOpen,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { TrainingExample } from "@shared/schema";

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
  const { toast } = useToast();

  const { data: examples = [], isLoading } = useQuery<TrainingExample[]>({
    queryKey: ["/api/training-examples"],
  });

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

  const examplesWithNotes = examples.filter((example) => example.notes && example.notes.trim().length > 0);
  const headerMeta = [
    { label: "Training examples", value: `${examples.length}` },
    { label: "With notes", value: `${examplesWithNotes.length}` },
    { label: "Drive import", value: driveDialogOpen ? "Connected" : "On demand" },
  ];

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

  return (
    <div className="flex flex-col gap-12 pb-24">
      <PageHeader
        eyebrow="Model coaching"
        title="AI training studio"
        description="Curate exemplar peulot so the generator mirrors your language, structure, and values. Combine manual uploads with imports from Google Docs to continuously improve output."
        meta={headerMeta}
        actions={
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={() => setDriveDialogOpen(true)}
          >
            <FolderOpen className="mr-2 h-4 w-4" /> Browse Drive
          </Button>
        }
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Your examples directly tune the planner’s prompts.</span>
        </div>
      </PageHeader>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
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
                  className="min-h-32"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Detailed notes help weight this example during generation.</span>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Add training example"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
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
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Training examples</h2>
          <span className="text-sm text-muted-foreground">{examples.length} saved</span>
        </div>

        {examples.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-background/90 p-10 text-center">
            <CardContent className="space-y-3">
              <p className="text-base text-muted-foreground">No examples yet. Upload a peula to start tuning the AI.</p>
              <Button variant="secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Add your first example
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[460px] rounded-2xl border border-border/70 bg-background/95">
            <div className="space-y-4 p-6">
              {examples.map((example) => (
                <Card key={example.id} className="border-border/70 bg-background/90 p-4" data-testid={`example-${example.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{example.title}</h3>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{example.content}</p>
                      {example.notes && (
                        <p className="text-xs text-primary">Notes: {example.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(example.id)}
                      data-testid={`button-delete-example-${example.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </section>
    </div>
  );
}
