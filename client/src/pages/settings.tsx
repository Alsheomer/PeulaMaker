import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, BookOpen, FileText, FolderOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
        title: "Example Added",
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
        title: "Example Deleted",
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
        title: "Import Successful",
        description: "Training example imported from Google Docs",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { 
    data: driveFiles = [], 
    isLoading: driveFilesLoading,
    error: driveFilesError 
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
        title: "Import Successful",
        description: `"${documentName}" imported from Google Drive`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
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
      notes: googleDocsNotes || undefined 
    });
  };

  const handleDriveImport = () => {
    if (!selectedDriveFile) {
      toast({
        title: "No File Selected",
        description: "Please select a document from your Drive",
        variant: "destructive",
      });
      return;
    }
    importFromDriveMutation.mutate({
      documentId: selectedDriveFile,
      notes: driveImportNotes || undefined
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Training Settings</h1>
        <p className="text-muted-foreground">
          Upload your own peulot to teach the AI your writing style and preferences
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import from Google Docs
          </CardTitle>
          <CardDescription>
            Browse your Drive or paste a document URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={driveDialogOpen} onOpenChange={setDriveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                data-testid="button-browse-drive"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Browse Google Drive
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Select Document from Google Drive</DialogTitle>
                <DialogDescription>
                  Choose a Google Doc to import as a training example
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-auto">
                {driveFilesLoading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    Loading your Google Docs...
                  </div>
                ) : driveFilesError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-destructive font-medium mb-2">Failed to load Google Docs</p>
                    <p className="text-sm text-muted-foreground">
                      {driveFilesError instanceof Error ? driveFilesError.message : "Unable to connect to Google Drive"}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/google-drive/docs"] })}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    No Google Docs found in your Drive
                  </div>
                ) : (
                  <div className="space-y-2">
                    {driveFiles.map((file) => (
                      <Card
                        key={file.id}
                        className={`cursor-pointer transition-colors ${
                          selectedDriveFile === file.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedDriveFile(file.id)}
                        data-testid={`drive-file-${file.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{file.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                Modified {formatDistanceToNow(new Date(file.modifiedTime), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="drive-notes">Notes (Optional)</Label>
                  <Textarea
                    id="drive-notes"
                    data-testid="input-drive-notes"
                    placeholder="e.g., This example demonstrates excellent reflection..."
                    value={driveImportNotes}
                    onChange={(e) => setDriveImportNotes(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                <Button
                  onClick={handleDriveImport}
                  disabled={!selectedDriveFile || importFromDriveMutation.isPending}
                  className="w-full"
                  data-testid="button-import-selected"
                >
                  {importFromDriveMutation.isPending ? "Importing..." : "Import Selected Document"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or paste URL</span>
            </div>
          </div>

          <form onSubmit={handleGoogleDocsImport} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google-docs-url">Google Docs URL</Label>
              <Input
                id="google-docs-url"
                data-testid="input-google-docs-url"
                placeholder="https://docs.google.com/document/d/..."
                value={googleDocsUrl}
                onChange={(e) => setGoogleDocsUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Make sure the document is shared with "Anyone with the link can view"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google-docs-notes">Notes (Optional)</Label>
              <Textarea
                id="google-docs-notes"
                data-testid="input-google-docs-notes"
                placeholder="e.g., This example demonstrates excellent reflection techniques..."
                value={googleDocsNotes}
                onChange={(e) => setGoogleDocsNotes(e.target.value)}
                className="min-h-[60px]"
              />
            </div>

            <Button
              type="submit"
              data-testid="button-import-from-url"
              disabled={importFromDocsMutation.isPending}
              className="w-full"
            >
              {importFromDocsMutation.isPending ? "Importing..." : "Import from URL"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Manual Upload
            </CardTitle>
            <CardDescription>
              Paste the text of a peula you've written
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  data-testid="input-example-title"
                  placeholder="e.g., תוכנית משמרת קיץ - הרפתקה ביער"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Peula Content</Label>
                <Textarea
                  id="content"
                  data-testid="input-example-content"
                  placeholder="Paste the full peula text here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  data-testid="input-example-notes"
                  placeholder="e.g., This example demonstrates good time management and strong reflection..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <Button
                type="submit"
                data-testid="button-add-example"
                disabled={createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? "Uploading..." : "Add Training Example"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Your Training Examples ({examples.length})
            </CardTitle>
            <CardDescription>
              The AI will learn from these examples when generating new peulot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                Loading examples...
              </div>
            ) : examples.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No training examples yet. Add your first example to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {examples.map((example) => (
                  <Card key={example.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-sm mb-1 truncate"
                            data-testid={`text-example-title-${example.id}`}
                          >
                            {example.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {example.content.slice(0, 100)}...
                          </p>
                          {example.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              Note: {example.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-delete-example-${example.id}`}
                          onClick={() => deleteMutation.mutate(example.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How AI Training Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            When you upload your own peulot as training examples, the AI will use them as references when generating new activities:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>The AI learns your writing style, tone, and structure</li>
            <li>It adapts to your preferred activity formats and methods</li>
            <li>Examples are used as "few-shot learning" to guide generation</li>
            <li>Your examples help create peulot that match your expectations</li>
          </ul>
          <p className="mt-3">
            <strong>Tip:</strong> Upload 3-5 of your best peulot for optimal results. Choose examples that represent the quality and style you want the AI to replicate.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
