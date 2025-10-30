import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, BookOpen, FileText } from "lucide-react";
import type { TrainingExample } from "@shared/schema";

export default function Settings() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [googleDocsUrl, setGoogleDocsUrl] = useState("");
  const [googleDocsNotes, setGoogleDocsNotes] = useState("");
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
            Import a peula directly from Google Docs by pasting its URL
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              data-testid="button-import-from-docs"
              disabled={importFromDocsMutation.isPending}
              className="w-full"
            >
              {importFromDocsMutation.isPending ? "Importing..." : "Import from Google Docs"}
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
