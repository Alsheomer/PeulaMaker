import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CalendarDays,
  Download,
  Eye,
  FileText,
  Filter,
  FolderPlus,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Peula } from "@shared/schema";
import { useMemo, useState } from "react";
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
        title: "Peula deleted",
        description: "The activity has been removed from your library.",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "We couldn’t delete this peula. Please try again.",
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (peulaId: string) => {
      const response = await apiRequest("POST", `/api/peulot/${peulaId}/export`, {});
      return (await response.json()) as { documentUrl: string };
    },
    onSuccess: (data) => {
      toast({
        title: "Export successful",
        description: "Your peula is ready in Google Docs.",
      });
      if (data.documentUrl) {
        window.open(data.documentUrl, "_blank");
      }
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "We couldn’t export this peula. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredPeulot = useMemo(() => {
    return peulot.filter((peula) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        peula.title.toLowerCase().includes(query) ||
        peula.topic.toLowerCase().includes(query) ||
        peula.ageGroup.toLowerCase().includes(query);

      const matchesAge = ageFilter === "all" || peula.ageGroup === ageFilter;
      const matchesDuration = durationFilter === "all" || peula.duration === durationFilter;

      return matchesSearch && matchesAge && matchesDuration;
    });
  }, [ageFilter, durationFilter, peulot, searchQuery]);

  const hasActiveFilters = ageFilter !== "all" || durationFilter !== "all" || searchQuery !== "";

  const clearAllFilters = () => {
    setAgeFilter("all");
    setDurationFilter("all");
    setSearchQuery("");
  };

  const renderLibraryContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching your saved peulot...</p>
          </div>
        </div>
      );
    }

    if (filteredPeulot.length === 0) {
      return (
        <Card className="border-dashed border-border/70 bg-background/80 text-center shadow-none">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {searchQuery ? "No peulot match this search" : "Your library is ready for its first peula"}
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your filters or search terms."
                  : "Plan a new activity to see it appear here and build your archive of meaningful experiences."}
              </p>
            </div>
            <Link href="/create">
              <Button size="lg" className="px-8">
                <Plus className="mr-2 h-4 w-4" /> Start a new peula
              </Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPeulot.map((peula) => (
          <Card
            key={peula.id}
            className="flex h-full flex-col justify-between border-border/70 bg-background/90 hover-elevate"
            data-testid={`card-peula-${peula.id}`}
          >
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-2 text-lg font-semibold text-foreground">
                    {peula.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">{peula.topic}</p>
                </div>
                <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                  #{peula.id.slice(0, 4)}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{peula.ageGroup}</Badge>
                <Badge variant="secondary">{peula.duration} min</Badge>
                <Badge variant="outline" className="border-dashed">
                  Saved {new Date(peula.createdAt ?? Date.now()).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-4">
              <div className="flex w-full gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => setLocation(`/peula/${peula.id}`)}
                  data-testid={`button-view-${peula.id}`}
                >
                  <Eye className="mr-2 h-4 w-4" /> Open
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportMutation.mutate(peula.id)}
                  disabled={exportMutation.isPending}
                  data-testid={`button-export-${peula.id}`}
                >
                  {exportMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(peula.id)}
                  data-testid={`button-delete-${peula.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24">
      <header className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-background/90 px-8 py-12 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Your peula archive</p>
            <h1 className="text-4xl font-semibold text-foreground">Library</h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Revisit, improve, and share the peulot you’ve crafted. Filter by age group or duration to quickly find the right
              session for your kvutza.
            </p>
          </div>
          <Link href="/create">
            <Button size="lg" className="px-7" data-testid="button-create-new">
              <FolderPlus className="mr-2 h-4 w-4" /> Plan a new peula
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{peulot.length} {peulot.length === 1 ? "peula" : "peulot"} saved</span>
          <span className="hidden md:inline" aria-hidden="true">•</span>
          <span>Autosaved drafts sync when you add feedback and regenerations.</span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6 rounded-2xl border border-border/70 bg-background/80 p-6 shadow-sm lg:sticky lg:top-28 lg:h-fit">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Search</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Title, topic, or age group"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Filter className="h-4 w-4" /> Filters
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Age group</p>
                <Select value={ageFilter} onValueChange={setAgeFilter}>
                  <SelectTrigger className="mt-2" data-testid="select-age-filter">
                    <SelectValue placeholder="All ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ages</SelectItem>
                    <SelectItem value="6-8">6-8 years</SelectItem>
                    <SelectItem value="9-11">9-11 years</SelectItem>
                    <SelectItem value="12-14">12-14 years</SelectItem>
                    <SelectItem value="15-17">15-17 years</SelectItem>
                    <SelectItem value="18+">18+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Duration</p>
                <Select value={durationFilter} onValueChange={setDurationFilter}>
                  <SelectTrigger className="mt-2" data-testid="select-duration-filter">
                    <SelectValue placeholder="All durations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All durations</SelectItem>
                    <SelectItem value="30-45">30-45 min</SelectItem>
                    <SelectItem value="45-60">45-60 min</SelectItem>
                    <SelectItem value="60-90">60-90 min</SelectItem>
                    <SelectItem value="90+">90+ min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="space-y-3 rounded-xl border border-border/60 bg-background/90 p-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  <span>Active filters</span>
                  <Button variant="ghost" size="sm" className="h-auto px-2 text-xs" onClick={clearAllFilters} data-testid="button-clear-filters">
                    <X className="mr-1 h-3 w-3" /> Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && <Badge variant="secondary">Search: {searchQuery}</Badge>}
                  {ageFilter !== "all" && <Badge variant="secondary">Age: {ageFilter}</Badge>}
                  {durationFilter !== "all" && <Badge variant="secondary">Duration: {durationFilter}</Badge>}
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          {renderLibraryContent()}
        </section>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete peula</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the peula from your library. You can always regenerate it later with the same inputs.
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
