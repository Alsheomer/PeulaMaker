import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Download,
  Loader2,
  MessageCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Peula, PeulaContent, Feedback } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PeulaTimeline } from "@/components/peula-timeline";

export default function PeulaView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [regeneratingSection, setRegeneratingSection] = useState<number | null>(null);
  const [expandedFeedback, setExpandedFeedback] = useState<Set<number>>(new Set());
  const [feedbackInputs, setFeedbackInputs] = useState<Record<number, string>>({});

  const { data: peula, isLoading } = useQuery<Peula>({
    queryKey: ["/api/peulot", id],
    enabled: !!id,
  });

  const { data: feedbackList = [] } = useQuery<Feedback[]>({
    queryKey: ["/api/peulot", id, "feedback"],
    enabled: !!id,
  });

  const exportMutation = useMutation({
    mutationFn: async (peulaId: string) => {
      const response = await apiRequest("POST", `/api/peulot/${peulaId}/export`, {});
      return await response.json() as { documentUrl: string };
    },
    onSuccess: (data) => {
      toast({
        title: "Export Successful",
        description: "Your peula has been exported to Google Docs.",
      });
      if (data.documentUrl) {
        window.open(data.documentUrl, '_blank');
      }
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your peula. Please try again.",
        variant: "destructive",
      });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: async ({ peulaId, sectionIndex }: { peulaId: string; sectionIndex: number }) => {
      const response = await apiRequest("POST", `/api/peulot/${peulaId}/regenerate-section`, { sectionIndex });
      return await response.json() as Peula;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/peulot", id] });
      toast({
        title: "Section Regenerated",
        description: "The section has been successfully regenerated with new content.",
      });
      setRegeneratingSection(null);
    },
    onError: () => {
      toast({
        title: "Regeneration Failed",
        description: "There was an error regenerating the section. Please try again.",
        variant: "destructive",
      });
      setRegeneratingSection(null);
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ peulaId, componentIndex, comment }: { peulaId: string; componentIndex: number; comment: string }) => {
      const response = await apiRequest("POST", "/api/feedback", { peulaId, componentIndex, comment });
      return await response.json() as Feedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/peulot", id, "feedback"] });
      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been saved and will help improve future peulot.",
      });
    },
    onError: () => {
      toast({
        title: "Feedback Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRegenerateSection = (sectionIndex: number) => {
    if (!id) return;
    setRegeneratingSection(sectionIndex);
    regenerateMutation.mutate({ peulaId: id, sectionIndex });
  };

  const toggleFeedback = (index: number) => {
    const newExpanded = new Set(expandedFeedback);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFeedback(newExpanded);
  };

  const handleSubmitFeedback = (componentIndex: number) => {
    if (!id) return;
    const comment = feedbackInputs[componentIndex]?.trim();
    if (!comment) return;

    feedbackMutation.mutate({ peulaId: id, componentIndex, comment });
    setFeedbackInputs({ ...feedbackInputs, [componentIndex]: "" });
  };

  const getFeedbackForComponent = (componentIndex: number) => {
    return feedbackList.filter(fb => fb.componentIndex === componentIndex);
  };

  const headerMeta = peula
    ? [
        { label: "Age group", value: peula.ageGroup },
        { label: "Duration", value: peula.duration },
        { label: "Group size", value: peula.groupSize },
      ]
    : [];
  const materialsPreview = peula?.availableMaterials?.slice(0, 4) ?? [];
  const emphasisIndex =
    regeneratingSection !== null
      ? regeneratingSection
      : expandedFeedback.size
        ? Math.min(...Array.from(expandedFeedback))
        : undefined;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading peula...</p>
        </div>
      </div>
    );
  }

  if (!peula) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md border-border/70 bg-background/90 p-8 text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">Peula not found</CardTitle>
          <p className="mt-3 text-sm text-muted-foreground">
            We couldn’t locate this activity. It may have been deleted or the link is incorrect.
          </p>
          <Button className="mt-6" onClick={() => setLocation("/library")}
            data-testid="button-back-missing">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to library
          </Button>
        </Card>
      </div>
    );
  }

  const content = peula.content as PeulaContent;

  return (
    <div className="flex flex-col gap-12 pb-24">
      <PageHeader
        eyebrow="Generated peula"
        title={peula.title}
        description="AI-crafted based on your questionnaire responses. Regenerate sections, gather feedback, and export to share with fellow madrichim."
        meta={headerMeta}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setLocation("/library")}
              data-testid="button-back-to-library"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Library
            </Button>
            <Button
              size="lg"
              className="rounded-full px-6"
              onClick={() => exportMutation.mutate(peula.id)}
              disabled={exportMutation.isPending}
              data-testid="button-export"
            >
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Export to Google Docs
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-full border-dashed">
            Created {new Date(peula.createdAt).toLocaleDateString()}
          </Badge>
          {materialsPreview.length > 0 ? (
            materialsPreview.map((material) => {
              const label = material.replace(/-/g, " ");
              return (
                <Badge key={material} variant="secondary" className="rounded-full">
                  {label}
                </Badge>
              );
            })
          ) : (
            <span>No materials listed</span>
          )}
        </div>
      </PageHeader>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <PeulaTimeline components={content.components} emphasisIndex={emphasisIndex} />
          <Card className="border-border/70 bg-background/90">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Educational goals</CardTitle>
              <CardDescription>Provided during planning. Update by regenerating with new context.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-base text-muted-foreground" data-testid="text-goals">
                {peula.goals}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 bg-background/95">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">Peula components</CardTitle>
              <CardDescription>Nine stages aligned with the Tzofim methodology. Regenerate any section to get a fresh take.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.components.map((component, index) => {
              const sectionFeedback = getFeedbackForComponent(index);
              const isExpanded = expandedFeedback.has(index);

              return (
                <div key={index} className="rounded-2xl border border-border/60 bg-background/90 p-6" data-testid={`row-component-${index}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{component.component}</h3>
                          {component.timeStructure && (
                            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{component.timeStructure}</p>
                          )}
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-foreground">{component.description}</p>
                      <div className="rounded-xl border border-border/60 bg-background/80 p-4 text-sm text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Best practices</span>
                        <p className="mt-2 whitespace-pre-wrap leading-relaxed">{component.bestPractices}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateSection(index)}
                        disabled={regeneratingSection === index}
                        data-testid={`button-regenerate-${index}`}
                      >
                        {regeneratingSection === index ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Regenerate section
                      </Button>
                      <Button
                        variant={isExpanded ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => toggleFeedback(index)}
                        data-testid={`button-feedback-${index}`}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {sectionFeedback.length > 0 ? `${sectionFeedback.length} feedback` : "Feedback"}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 space-y-4">
                      {sectionFeedback.length > 0 && (
                        <div className="space-y-3">
                          {sectionFeedback.map((fb) => (
                            <Card key={fb.id} className="border-border/60 bg-background/95 p-4" data-testid={`feedback-item-${fb.id}`}>
                              <p className="text-sm text-foreground whitespace-pre-wrap">{fb.comment}</p>
                              <p className="mt-2 text-xs text-muted-foreground">{new Date(fb.createdAt).toLocaleString()}</p>
                            </Card>
                          ))}
                        </div>
                      )}

                      <div className="space-y-3">
                        <Textarea
                          placeholder="Share feedback to teach the AI what to emphasize or adjust next time."
                          value={feedbackInputs[index] || ""}
                          onChange={(e) => setFeedbackInputs({ ...feedbackInputs, [index]: e.target.value })}
                          className="min-h-24"
                          data-testid={`input-feedback-${index}`}
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            onClick={() => handleSubmitFeedback(index)}
                            disabled={!feedbackInputs[index]?.trim() || feedbackMutation.isPending}
                            size="sm"
                            data-testid={`button-submit-feedback-${index}`}
                          >
                            {feedbackMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Submitting
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-3 w-3" />
                                Save feedback
                              </>
                            )}
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            Feedback improves future generations for you and your kvutza.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
