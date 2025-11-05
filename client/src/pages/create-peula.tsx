import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  questionnaireResponseSchema,
  type QuestionnaireResponse,
  type TrainingInsightsResponse,
  type Peula,
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Handshake,
  Heart,
  Layers,
  Lightbulb,
  Sparkles,
  Star,
  TreePine,
  Users,
  UsersRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { peulaTemplates, getTemplateById } from "@shared/templates";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const iconMap = {
  Sparkles,
  Users,
  UsersRound,
  Heart,
  TreePine,
  Star,
  Lightbulb,
  Handshake,
};

const materialOptions = [
  { value: "outdoor-space", label: "Outdoor space" },
  { value: "art-supplies", label: "Art supplies" },
  { value: "rope-string", label: "Rope & string" },
  { value: "balls-sports", label: "Sports equipment" },
  { value: "whiteboard", label: "Whiteboard or easel" },
  { value: "projector", label: "Projector or screen" },
  { value: "music-speakers", label: "Music / speakers" },
  { value: "costumes-props", label: "Costumes & props" },
  { value: "craft-materials", label: "Craft materials" },
  { value: "camping-gear", label: "Camping gear" },
];

export default function CreatePeula() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();
  const { data: insightsResponse, isLoading: insightsLoading } = useQuery<TrainingInsightsResponse>({
    queryKey: ["/api/training-examples", "insights"],
  });

  const trainingInsights = insightsResponse?.insights ?? null;
  const insightsGeneratedAt = insightsResponse?.generatedAt ? new Date(insightsResponse.generatedAt) : null;

  const form = useForm<QuestionnaireResponse>({
    resolver: zodResolver(questionnaireResponseSchema),
    defaultValues: {
      templateId: "custom",
      topic: "",
      ageGroup: "",
      duration: "",
      groupSize: "",
      goals: "",
      availableMaterials: [],
      specialConsiderations: "",
    },
  });

  const steps = useMemo(
    () => [
      {
        id: "template",
        title: "Choose a starting point",
        subtitle: "Use a preset or begin from scratch",
      },
      {
        id: "essentials",
        title: "Set the learning intention",
        subtitle: "Define topic and educational goals",
      },
      {
        id: "logistics",
        title: "Dial in logistics",
        subtitle: "Age range, duration, and group size",
      },
      {
        id: "enhancements",
        title: "Enhance delivery",
        subtitle: "Materials and special considerations",
      },
      {
        id: "review",
        title: "Review & generate",
        subtitle: "Check the plan before generating",
      },
    ],
    []
  );

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    form.setValue("templateId", templateId);
    const template = getTemplateById(templateId);
    if (template && templateId !== "custom") {
      form.setValue("topic", template.topic);
      form.setValue("goals", template.goals);
    } else if (templateId === "custom") {
      form.setValue("topic", "");
      form.setValue("goals", "");
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleBeginPlanning = () => {
    if (!selectedTemplate) {
      setSelectedTemplate("custom");
      form.setValue("templateId", "custom");
    }
    goToStep(1);
  };

  const stepFieldValidation: Record<number, (keyof QuestionnaireResponse)[]> = {
    1: ["topic", "goals"],
    2: ["ageGroup", "duration", "groupSize"],
  };

  const handleNext = async () => {
    if (currentStep >= steps.length - 1) return;
    const fields = stepFieldValidation[currentStep] ?? [];
    if (fields.length) {
      const isValid = await form.trigger(fields);
      if (!isValid) {
        return;
      }
    }
    goToStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) return;
    goToStep(currentStep - 1);
  };

  const generateMutation = useMutation({
    mutationFn: async (data: QuestionnaireResponse) => {
      const response = await apiRequest("POST", "/api/peulot/generate", data);
      return await response.json() as Peula;
    },
    onSuccess: (peula) => {
      setLocation(`/peula/${peula.id}`);
    },
  });

  const onSubmit = (data: QuestionnaireResponse) => {
    generateMutation.mutate(data);
  };

  const watchedValues = form.watch();
  const insightSections = useMemo(() => {
    if (!trainingInsights) {
      return [] as { title: string; items: string[] }[];
    }

    return [
      { title: "Signature moves", items: trainingInsights.signatureMoves },
      { title: "Facilitation focus", items: trainingInsights.facilitationFocus },
      { title: "Reflection patterns", items: trainingInsights.reflectionPatterns },
      { title: "Impact signals", items: trainingInsights.measurementFocus },
    ].filter((section) => section.items.length > 0);
  }, [trainingInsights]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24">
      <div className="flex flex-col gap-2 pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => setLocation("/")}
          data-testid="button-back-home"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to overview
        </Button>
        <h1 className="text-4xl font-semibold text-foreground">Peula planning studio</h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
          Move through a calm, multi-step flow to capture your kvutza’s context, goals, and logistics. When you’re ready, Peula
          Maker will generate the full 9-component experience.
        </p>
      </div>

      {currentStep === 0 ? (
        <section className="grid gap-8 rounded-3xl border border-border/70 bg-background/80 p-8 shadow-xl lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-foreground">Start with a template</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Choose one of our curated madrich playbooks or create your own structure. Templates pre-fill goals and tone so
                you can focus on tailoring the experience.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {peulaTemplates.map((template) => {
                const IconComponent = iconMap[template.icon as keyof typeof iconMap];
                const isSelected = selectedTemplate === template.id;
                return (
                  <Card
                    key={template.id}
                    className={`h-full cursor-pointer border-border/70 bg-background/90 transition-all hover-elevate ${
                      isSelected ? "border-primary shadow-lg" : ""
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                    data-testid={`template-${template.id}`}
                  >
                    <CardHeader className="flex flex-row items-start gap-3 pb-2">
                      <div className="rounded-lg bg-primary/10 p-3 text-primary">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">{template.name}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {template.topic ? `Focus: ${template.topic}` : "Custom template"}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm leading-relaxed text-muted-foreground">
                      {template.description}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Select a template to autofill tone, or continue with a blank canvas.</span>
              </div>
              <Button onClick={handleBeginPlanning} size="lg" className="min-w-[220px]" data-testid="button-begin-planning">
                Begin planning
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {insightsLoading && (
              <Card className="border-border/70 bg-background/90">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Studying your peulot…</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            )}

            {!insightsLoading && trainingInsights && (
              <Card className="border-border/70 bg-background/90" data-testid="card-training-insights">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-lg font-semibold text-foreground">Study from your peulot</CardTitle>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {insightsResponse?.exampleCount ?? 0} uploads analyzed
                  </p>
                  {insightsGeneratedAt && (
                    <p className="text-xs text-muted-foreground">
                      Refreshed {formatDistanceToNow(insightsGeneratedAt, { addSuffix: true })}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-xl border border-border/60 bg-background/80 p-4 text-sm text-foreground">
                    <p className="font-medium text-foreground">Voice & tone</p>
                    <p className="mt-2 text-muted-foreground">{trainingInsights.voiceAndTone}</p>
                  </div>

                  <div className="space-y-4">
                    {insightSections.map((section) => (
                      <div key={section.title}>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{section.title}</p>
                        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                          {section.items.map((item, idx) => (
                            <li key={`${section.title}-${idx}`} className="flex gap-3">
                              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-primary/60" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="h-full border-border/70 bg-background/90">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">What’s inside each template?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>Templates reflect popular Tzofim program arcs—like identity exploration or outdoor leadership—complete with recommended tone and goals.</p>
                <p>
                  When you generate a peula you can regenerate individual sections, add feedback, and export to Google Docs, so you’re always in control of the final plan.
                </p>
                <p className="rounded-xl border border-border/60 bg-background/80 p-4 text-primary">
                  Already know your approach? Choose “Custom build” and you’ll start with a clean slate.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Progress</p>
                <p className="text-base font-medium text-foreground">{steps[currentStep].title}</p>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
            </div>
            <ol className="space-y-3">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                return (
                  <li
                    key={step.id}
                    className={`flex items-start gap-3 rounded-xl border border-transparent px-3 py-2 ${
                      isActive ? "border-primary/60 bg-primary/10" : isComplete ? "text-muted-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isComplete ? "bg-primary text-primary-foreground" : isActive ? "border border-primary text-primary" : "border border-border/70 text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${isActive ? "text-foreground" : ""}`}>{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToStep(0)}
              className="w-full"
              data-testid="button-change-template"
            >
              Change template
            </Button>
          </aside>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <Card className="border-border/60 bg-background/90">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground">Learning foundations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Topic or theme</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Leadership through service, Identity and belonging"
                              className="text-base"
                              data-testid="input-topic"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Educational goals</FormLabel>
                          <FormControl>
                            <Textarea
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="What should chanichim think, feel, or be able to do after this peula?"
                              className="min-h-32 resize-y text-base"
                              data-testid="textarea-goals"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card className="border-border/60 bg-background/90">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground">Logistics & pacing</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="ageGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Age group</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-base" data-testid="select-ageGroup">
                                <SelectValue placeholder="Select age range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="6-8">6-8 years</SelectItem>
                              <SelectItem value="9-11">9-11 years</SelectItem>
                              <SelectItem value="12-14">12-14 years</SelectItem>
                              <SelectItem value="15-17">15-17 years</SelectItem>
                              <SelectItem value="18+">18+ years</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Duration</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-base" data-testid="select-duration">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="30-45">30-45 minutes</SelectItem>
                              <SelectItem value="45-60">45-60 minutes</SelectItem>
                              <SelectItem value="60-90">60-90 minutes</SelectItem>
                              <SelectItem value="90+">90+ minutes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="groupSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Group size</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-base" data-testid="select-groupSize">
                                <SelectValue placeholder="Select group size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="5-10">5-10 participants</SelectItem>
                              <SelectItem value="11-20">11-20 participants</SelectItem>
                              <SelectItem value="21-30">21-30 participants</SelectItem>
                              <SelectItem value="30+">30+ participants</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card className="border-border/60 bg-background/90">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground">Materials & considerations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="availableMaterials"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">What’s available? <span className="text-sm font-normal text-muted-foreground">(Select all that apply)</span></FormLabel>
                          <FormControl>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {materialOptions.map((option) => {
                                const values = (field.value as string[]) || [];
                                const isChecked = values.includes(option.value);

                                return (
                                  <label
                                    key={option.value}
                                    htmlFor={option.value}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-2 hover-elevate ${
                                      isChecked ? "border-primary/60" : ""
                                    }`}
                                  >
                                    <Checkbox
                                      id={option.value}
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        const newValues = checked
                                          ? [...values, option.value]
                                          : values.filter((v) => v !== option.value);
                                        field.onChange(newValues);
                                      }}
                                      data-testid={`checkbox-${option.value}`}
                                    />
                                    <span className="text-sm font-medium text-foreground">{option.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialConsiderations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Special considerations</FormLabel>
                          <FormControl>
                            <Textarea
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="Safety, accessibility, group dynamics, or other notes for the AI to factor in"
                              className="min-h-32 resize-y text-base"
                              data-testid="textarea-specialConsiderations"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {currentStep === 4 && (
                <>
                  <Card className="border-border/60 bg-background/90">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-foreground">Review summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-sm text-muted-foreground">
                      <div className="grid gap-6 md:grid-cols-2">
                        {[
                          { label: "Template", value: getTemplateById(selectedTemplate)?.name ?? "Custom build" },
                          { label: "Topic", value: watchedValues.topic || "—" },
                          { label: "Goals", value: watchedValues.goals || "—" },
                          { label: "Age group", value: watchedValues.ageGroup || "—" },
                          { label: "Duration", value: watchedValues.duration || "—" },
                          { label: "Group size", value: watchedValues.groupSize || "—" },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
                            <p className="mt-2 text-base font-medium text-foreground whitespace-pre-wrap">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Materials</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(watchedValues.availableMaterials?.length ?? 0) > 0 ? (
                            watchedValues.availableMaterials?.map((material) => {
                              const label = materialOptions.find((option) => option.value === material)?.label ?? material;
                              return (
                                <span
                                  key={material}
                                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                >
                                  {label}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-sm text-muted-foreground">No materials selected</span>
                          )}
                        </div>
                      </div>

                      {watchedValues.specialConsiderations && (
                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Special considerations</p>
                          <p className="mt-2 whitespace-pre-wrap text-base text-foreground">
                            {watchedValues.specialConsiderations}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {trainingInsights && (
                    <Card className="border-border/60 bg-background/90" data-testid="card-review-insights">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold text-foreground">How the AI will tailor this peula</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Your uploaded peulot teach Peula Maker what “good” looks like. Expect the generation to emphasize these hallmarks while blending in your current context.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-5 text-sm text-muted-foreground">
                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Voice & tone</p>
                          <p className="mt-2 whitespace-pre-wrap text-base text-foreground">{trainingInsights.voiceAndTone}</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {insightSections.map((section) => (
                            <div key={`review-${section.title}`} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{section.title}</p>
                              <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                                {section.items.map((item, idx) => (
                                  <li key={`review-${section.title}-${idx}`} className="flex gap-3">
                                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-primary/60" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Compass className="h-4 w-4" />
                  </span>
                  <span>
                    Step {currentStep} of {steps.length - 1}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0} data-testid="button-back">
                    Back
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext} data-testid="button-next">
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={generateMutation.isPending}
                      className="min-w-[200px]"
                      data-testid="button-generate"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate peula
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
