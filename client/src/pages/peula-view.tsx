import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Edit, ArrowLeft, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Peula, PeulaContent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function PeulaView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: peula, isLoading } = useQuery<Peula>({
    queryKey: ["/api/peulot", id],
    enabled: !!id,
  });

  const exportMutation = useMutation({
    mutationFn: async (peulaId: string) => {
      const response = await apiRequest("POST", `/api/peulot/${peulaId}/export`, {});
      return response as { documentUrl: string };
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading peula...</p>
        </div>
      </div>
    );
  }

  if (!peula) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Peula Not Found</h2>
          <p className="text-muted-foreground mb-6">The peula you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/library")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  const content = peula.content as PeulaContent;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/library")}
            className="mb-4"
            data-testid="button-back-to-library"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-3" data-testid="text-peula-title">
                {peula.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" data-testid="badge-age-group">
                  Age: {peula.ageGroup}
                </Badge>
                <Badge variant="secondary" data-testid="badge-duration">
                  Duration: {peula.duration} min
                </Badge>
                <Badge variant="secondary" data-testid="badge-group-size">
                  Group: {peula.groupSize}
                </Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => exportMutation.mutate(peula.id)}
                disabled={exportMutation.isPending}
                data-testid="button-export"
              >
                {exportMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export to Google Docs
                  </>
                )}
              </Button>
            </div>
          </div>

          <Card className="p-6 bg-accent/30 border-accent-border">
            <h3 className="text-sm font-medium text-accent-foreground mb-2">Educational Goals</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="text-goals">
              {peula.goals}
            </p>
          </Card>
        </div>

        {/* Peula Content Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left p-4 font-medium text-sm text-foreground w-[30%]">
                    Peula Component
                  </th>
                  <th className="text-left p-4 font-medium text-sm text-foreground w-[40%]">
                    Description & Guidelines
                  </th>
                  <th className="text-left p-4 font-medium text-sm text-foreground w-[30%]">
                    Tzofim Best Practices & Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {content.components.map((component, index) => (
                  <tr
                    key={index}
                    className="border-b border-border last:border-0 hover-elevate"
                    data-testid={`row-component-${index}`}
                  >
                    <td className="p-4 align-top">
                      <div className="font-medium text-sm text-foreground">
                        {component.component}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-sm text-foreground whitespace-pre-wrap">
                        {component.description}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-sm text-muted-foreground space-y-3">
                        <div className="whitespace-pre-wrap">
                          {component.bestPractices}
                        </div>
                        {component.timeStructure && (
                          <div className="pt-2 border-t border-border">
                            <div className="font-medium text-foreground mb-1">Time Structure:</div>
                            <div className="whitespace-pre-wrap">{component.timeStructure}</div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
