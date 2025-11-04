import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PageHeader } from "@/components/page-header";
import {
  CalendarDays,
  Download,
  Eye,
  LayoutGrid,
  FileText,
  Filter,
  FolderPlus,
  Loader2,
  Plus,
  Search,
  Trash2,
  Rows,
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
        title: "Export Failed",
        description: "There was an error exporting your peula. Please try again.",
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

  const totalPeulot = peulot.length;
  const headerMeta = [
    { label: "Saved peulot", value: `${totalPeulot}` },
    { label: "Active filters", value: hasActiveFilters ? "Yes" : "No" },
    { label: "Matching list", value: `${filteredPeulot.length}` },
    { label: "View", value: viewMode === "grid" ? "Grid" : "List" },
  ];

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

    if (viewMode === "list") {
      return (
        <div className="space-y-4">
          {filteredPeulot.map((peula) => (
            <Card
              key={peula.id}
              className="group flex flex-col overflow-hidden border-border/60 bg-background/95 shadow-sm transition hover:shadow-lg"
              data-testid={`card-peula-${peula.id}`}
            >
              <CardHeader className="flex flex-col gap-3 pb-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl font-semibold text-foreground">{peula.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">{peula.topic}</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full border-dashed px-3 text-xs uppercase tracking-wide">
                  #{peula.id.slice(0, 4)}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3 md:max-w-2xl">
                  <p className="text-sm text-muted-foreground">
                    {peula.goals || "No goals captured yet. Add feedback or regenerate sections to enrich this plan."}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(peula.availableMaterials ?? []).slice(0, 4).map((material) => {
                      const label = material.replace(/-/g, " ");
                      return (
                        <Badge key={material} variant="outline" className="rounded-full">
                          {label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground md:w-56">
                  <Badge variant="secondary" className="w-fit rounded-full">
                    {peula.ageGroup}
                  </Badge>
                  <Badge variant="secondary" className="w-fit rounded-full">
                    {peula.duration} min
                  </Badge>
                  <Badge variant="outline" className="w-fit rounded-full border-dashed">
                    Kvutza size: {peula.groupSize}
                  </Badge>
                  <Badge variant="outline" className="w-fit rounded-full border-dashed">
                    Saved {new Date(peula.createdAt ?? Date.now()).toLocaleDateString()}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-border/60 bg-background/80 p-4 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-muted-foreground">
                  {peula.availableMaterials?.length ? `${peula.availableMaterials.length} materials listed` : "No materials added"}
                </div>
                <div className="flex w-full gap-2 md:w-auto">
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
                    {exportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
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
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredPeulot.map((peula) => (
          <Card
            key={peula.id}
            className="group flex h-full flex-col overflow-hidden border-border/60 bg-background/90 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            data-testid={`card-peula-${peula.id}`}
          >
            <CardHeader className="relative space-y-4 pb-6">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary to-primary/60" />
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-2 text-lg font-semibold text-foreground">
                    {peula.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                    {peula.topic}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full border-dashed px-3 text-xs uppercase tracking-wide">
                  #{peula.id.slice(0, 4)}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="rounded-full">
                  {peula.ageGroup}
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  {peula.duration} min
                </Badge>
                <Badge variant="outline" className="rounded-full border-dashed">
                  Saved {new Date(peula.createdAt ?? Date.now()).toLocaleDateString()}
                </Badge>
                <Badge variant="outline" className="rounded-full border-dashed">
                  Kvutza size: {peula.groupSize}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 px-6 pb-6 text-sm text-muted-foreground">
              <p className="line-clamp-3">
                {peula.goals || "No goals captured yet. Add feedback or regenerate sections to enrich this plan."}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {(peula.availableMaterials ?? []).slice(0, 3).map((material) => {
                  const label = material.replace(/-/g, " ");
                  return (
                    <Badge key={material} variant="outline" className="rounded-full">
                      {label}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t border-border/60 bg-background/80 p-4">
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
    <div className="flex flex-col gap-12 pb-24">
      <PageHeader
        eyebrow="Your peula archive"
        title="Library"
        description="Revisit, improve, and share the peulot you’ve crafted. Filter by age group or duration to quickly find the right session for your kvutza."
        meta={headerMeta}
        actions={
          <>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "grid" | "list")}
              className="hidden rounded-full border border-border/60 bg-background/70 p-1 md:flex"
              size="sm"
              variant="outline"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view" className="rounded-full px-3">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view" className="rounded-full px-3">
                <Rows className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setLocation("/settings")}
            >
              Training studio
            </Button>
            <Button
              size="lg"
              className="rounded-full px-6"
              onClick={() => setLocation("/create")}
              data-testid="button-create-new"
            >
              <FolderPlus className="mr-2 h-4 w-4" /> Plan a new peula
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/60 bg-background/80">
            <CardContent className="flex gap-3 pt-6">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Consistent sync</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Autosaved drafts update whenever you regenerate sections or log feedback.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-background/80">
            <CardContent className="flex gap-3 pt-6">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Docs-ready exports</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Share peulot with co-madrichim in seconds using Google Docs.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="hidden border-border/60 bg-background/80 sm:flex">
            <CardContent className="flex gap-3 pt-6">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Focused browsing</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Use filters to surface peulot for specific shichvot, durations, or materials.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHeader>

      <section className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-border/60 bg-background/85 shadow-sm xl:sticky xl:top-28 xl:h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Search & filters</CardTitle>
            <CardDescription>Refine your archive by chanichim, pacing, or focus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Search</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Title, topic, or age group"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-full pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Age group</p>
                <Select value={ageFilter} onValueChange={setAgeFilter}>
                  <SelectTrigger className="mt-2 rounded-full" data-testid="select-age-filter">
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
                  <SelectTrigger className="mt-2 rounded-full" data-testid="select-duration-filter">
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
              <div className="space-y-3 rounded-2xl border border-border/60 bg-background/80 p-4">
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
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>Showing {filteredPeulot.length} of {totalPeulot} saved peulot.</span>
            {hasActiveFilters ? (
              <Badge variant="outline" className="border-dashed">Filters active</Badge>
            ) : (
              <Badge variant="outline" className="border-dashed">All peulot</Badge>
            )}
          </div>

          {renderLibraryContent()}
        </div>
      </section>
    </div>
  );
}
