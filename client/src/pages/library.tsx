import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Download, Trash2, Eye, Loader2, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Peula } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: peulot = [], isLoading } = useQuery<Peula[]>({
    queryKey: ["/api/peulot"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/peulot/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/peulot"] });
      toast({
        title: "Peula Deleted",
        description: "The peula has been removed from your library.",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the peula. Please try again.",
        variant: "destructive",
      });
    },
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

  const filteredPeulot = peulot.filter((peula) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" || (
      peula.title.toLowerCase().includes(query) ||
      peula.topic.toLowerCase().includes(query) ||
      peula.ageGroup.toLowerCase().includes(query)
    );
    
    const matchesAge = ageFilter === "all" || peula.ageGroup === ageFilter;
    const matchesDuration = durationFilter === "all" || peula.duration === durationFilter;
    
    return matchesSearch && matchesAge && matchesDuration;
  });

  const hasActiveFilters = ageFilter !== "all" || durationFilter !== "all";
  
  const clearAllFilters = () => {
    setAgeFilter("all");
    setDurationFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">My Peulot</h1>
            <p className="text-muted-foreground">
              {peulot.length} {peulot.length === 1 ? 'peula' : 'peulot'} in your library
            </p>
          </div>
          <Link href="/create">
            <Button data-testid="button-create-new">
              <Plus className="w-4 h-4 mr-2" />
              Create New Peula
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, topic, or age group..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-40" data-testid="select-age-filter">
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="6-8">6-8 years</SelectItem>
                  <SelectItem value="9-11">9-11 years</SelectItem>
                  <SelectItem value="12-14">12-14 years</SelectItem>
                  <SelectItem value="15-17">15-17 years</SelectItem>
                  <SelectItem value="18+">18+ years</SelectItem>
                </SelectContent>
              </Select>

              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger className="w-40" data-testid="select-duration-filter">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="30-45">30-45 min</SelectItem>
                  <SelectItem value="45-60">45-60 min</SelectItem>
                  <SelectItem value="60-90">60-90 min</SelectItem>
                  <SelectItem value="90+">90+ min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                data-testid="button-clear-filters"
              >
                <X className="w-3 h-3 mr-1" />
                Clear Filters
              </Button>
            )}

            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                {ageFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Age: {ageFilter}
                  </Badge>
                )}
                {durationFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Duration: {durationFilter}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your peulot...</p>
            </div>
          </div>
        ) : filteredPeulot.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              {searchQuery ? "No peulot found" : "No peulot yet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery
                ? "Try a different search term or create a new peula."
                : "Start creating expert-level peulot with AI assistance based on Tzofim methodology."}
            </p>
            {!searchQuery && (
              <Link href="/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Peula
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeulot.map((peula) => (
              <Card
                key={peula.id}
                className="p-6 flex flex-col hover-elevate"
                data-testid={`card-peula-${peula.id}`}
              >
                <div className="flex-1 mb-4">
                  <h3 className="text-lg font-medium text-foreground mb-3 line-clamp-2">
                    {peula.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {peula.ageGroup}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {peula.duration} min
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {peula.topic}
                  </p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setLocation(`/peula/${peula.id}`)}
                    data-testid={`button-view-${peula.id}`}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportMutation.mutate(peula.id)}
                    disabled={exportMutation.isPending}
                    data-testid={`button-export-${peula.id}`}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(peula.id)}
                    data-testid={`button-delete-${peula.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Peula</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this peula? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
