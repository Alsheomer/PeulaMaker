import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { questionnaireResponseSchema, type QuestionnaireResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader } from "@/components/page-header";
import {
  BookOpen,
  Compass,
  Focus,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Peula } from "@shared/schema";
import { peulaTemplates, getTemplateById } from "@shared/templates";

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

const stepGuidance: Record<
  number,
  {
    title: string;
    points: string[];
    highlight?: string;
  }
> = {
  1: {
    title: "What to capture",
    points: [
      "Name the core theme or dilemma and the shichva it speaks to.",
      "Write goals in language that clarifies what chanichim will feel, know, and do.",
      "Mention leadership roles (madrich, chanich leading a part, kvutza roles).",
    ],
    highlight: "The clearer your intention, the more the AI can echo authentic Tzofim tone.",
  },
  2: {
    title: "Logistics checklist",
    points: [
      "Choose the age group that reflects maturity and kvutza dynamics.",
      "Duration guides pacing — think about transitions and sikkum time.",
      "Share group size so the plan scales safely (splits, circles, chevrati).",
    ],
    highlight: "Logistics help the AI match ruach and responsibility to your reality.",
  },
  3: {
    title: "Materials & safety",
    points: [
      "Tick equipment even if optional so the AI suggests alternatives when missing.",
      "Use the notes box for safety, accessibility, or sensitive topics.",
      "Flag if you expect outdoor/indoor spaces or special weather concerns.",
    ],
    highlight: "Thoughtful notes help ensure chanichim feel included and protected.",
  },
  4: {
    title: "Before you generate",
    points: [
      "Scan the summary for gaps in goals, logistics, and notes.",
      "Confirm materials align with what you’ll actually bring.",
      "If anything feels off, jump back to earlier steps to adjust before generating.",
    ],
    highlight: "You can always regenerate individual sections later — this review sets a strong baseline.",
  },
};

export default function CreatePeula() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const [currentStep, setCurrentStep] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [, setLocation] = useLocation();

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
  const currentTemplate = getTemplateById(selectedTemplate);
  const templateName = currentTemplate?.name ?? "Custom build";
  const templateDescription = currentTemplate?.description ??
    "Craft a fresh peula arc by sharing the exact tone, values, and flow you want.";
  const headerMeta = [
    { label: "Step", value: `${currentStep + 1}/${steps.length}` },
    { label: "Template", value: templateName },
    { label: "Age group", value: watchedValues.ageGroup || "Add age group" },
    { label: "Duration", value: watchedValues.duration || "Choose duration" },
    { label: "Mode", value: focusMode ? "Focus" : "Guided" },
  ];
  const summaryEntries = [
    { label: "Topic", value: watchedValues.topic || "Add a topic or theme" },
    { label: "Goals", value: watchedValues.goals || "Clarify the educational goals" },
    { label: "Group size", value: watchedValues.groupSize || "Select the expected group size" },
    {
      label: "Special notes",
      value:
        watchedValues.specialConsiderations ||
        "Capture accessibility needs, risk notes, or leadership roles you want highlighted.",
    },
  ];
  const materialsList = watchedValues.availableMaterials ?? [];
  const guidance = stepGuidance[currentStep];

  return (
    <div className="flex flex-col gap-12 pb-24">
      <PageHeader
        eyebrow="Peula planning studio"
        title="Guide the AI with your kvutza’s reality"
        description="Move through a focused, multi-step flow to share goals, logistics, and materials. The clearer the context, the richer the generated peula." 
        actions={
          <>
            <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground md:flex">
              <Focus className="h-4 w-4 text-primary" />
              Focus mode
              <Switch
                checked={focusMode}
                onCheckedChange={setFocusMode}
                aria-label="Toggle focus mode"
                data-testid="switch-focus-mode"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              Back to overview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setLocation("/library")}
              data-testid="button-open-library"
            >
              Open library
            </Button>
          </>
        }
        meta={headerMeta}
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/60 bg-background/85 backdrop-blur">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  Selected template
                </Badge>
                <CardTitle className="mt-4 text-2xl text-foreground">{templateName}</CardTitle>
                <CardDescription className="mt-2 text-base leading-relaxed">
                  {templateDescription}
                </CardDescription>
              </div>
              {currentTemplate?.topic ? (
                <div className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-xs font-medium uppercase tracking-[0.25em] text-primary">
                  Focus: {currentTemplate.topic}
                </div>
              ) : null}
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1">
                <Sparkles className="h-4 w-4 text-primary" />
                {currentTemplate ? "Pre-filled tone and goals" : "Custom arc with your own tone"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => goToStep(0)}
                disabled={currentStep === 0}
                data-testid="button-browse-templates"
              >
                Browse templates
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/85 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Live blueprint</CardTitle>
              <CardDescription className="leading-relaxed">
                See what the AI has heard so far. Update any field and the summary refreshes instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="grid gap-4 sm:grid-cols-2">
                {summaryEntries.map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-border/50 bg-background/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Materials</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {materialsList.length > 0 ? (
                    materialsList.map((material) => {
                      const label = materialOptions.find((option) => option.value === material)?.label ?? material;
                      return (
                        <span
                          key={material}
                          className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {label}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-sm text-muted-foreground">Add materials when you reach the enhancements step.</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHeader>

      {currentStep === 0 ? (
        <section className="grid gap-8 rounded-3xl border border-border/60 bg-background/85 p-8 shadow-xl lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-foreground">Choose a launch point</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Explore curated madrich playbooks steeped in Tzofim practice or start completely fresh. Templates prefill tone and example goals so you can focus on tailoring to your kvutza.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {peulaTemplates.map((template) => {
                const IconComponent = iconMap[template.icon as keyof typeof iconMap];
                const isSelected = selectedTemplate === template.id;
                return (
                  <Card
                    key={template.id}
                    className={`h-full cursor-pointer border border-border/60 bg-background/90 transition-all hover:shadow-lg ${
                      isSelected ? "border-primary shadow-xl" : ""
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                    data-testid={`template-${template.id}`}
                  >
                    <CardHeader className="flex items-start gap-3 pb-2">
                      <div className="rounded-lg bg-primary/10 p-3 text-primary">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">{template.name}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {template.topic ? `Focus: ${template.topic}` : "Custom build"}
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

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Pick a template to prefill tone, or continue with a blank canvas.</span>
              </div>
              <Button onClick={handleBeginPlanning} size="lg" className="min-w-[220px]" data-testid="button-begin-planning">
                Begin planning
              </Button>
            </div>
          </div>

          <Card className="h-full border-border/60 bg-background/90">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">What you can expect</CardTitle>
              <CardDescription className="leading-relaxed">
                Each template carries iconic Tzofim flow, values, and recommended leadership roles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-sm leading-relaxed text-muted-foreground">
              <p>
                • Hitkhadshut sparks, experiential body, hadracha moments, and reflective sikkum steps.
              </p>
              <p>
                • Guidance on tafkidim, kvutza splits, and the tone that best fits the shichva.
              </p>
              <p className="rounded-xl border border-border/60 bg-background/80 p-4 text-primary">
                Already have a vision? Choose “Custom build” to write goals in your own voice and let the AI craft the rest.
              </p>
            </CardContent>
          </Card>
        </section>
      ) : (
        <div
          className={`grid gap-8 ${focusMode ? "xl:grid-cols-[minmax(0,1fr)]" : "xl:grid-cols-[260px_minmax(0,1fr)_320px]"}`}
        >
          {!focusMode && (
            <aside className="space-y-6 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Progress</p>
                    <p className="text-base font-medium text-foreground">{steps[currentStep].title}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
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
                      className={`flex items-start gap-3 rounded-xl px-3 py-2 ${
                        isActive ? "border border-primary/60 bg-primary/10" : "border border-transparent"
                      }`}
                    >
                      <span
                        className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                          isComplete
                            ? "bg-primary text-primary-foreground"
                            : isActive
                              ? "border border-primary text-primary"
                              : "border border-border/70 text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.title}
                        </p>
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
                className="w-full rounded-full"
                data-testid="button-change-template"
              >
                Change template
              </Button>
            </aside>
          )}

          <div className={`space-y-6 ${focusMode ? "" : "xl:col-start-2 xl:row-start-1"}`}>
            {focusMode && guidance ? (
              <Card className="border-border/60 bg-background/85">
                <CardHeader className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">{steps[currentStep].title}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        Guided navigation is tucked away so you can stay immersed in the form. Expand reminders whenever you
                        need them.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      Step {currentStep + 1} of {steps.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />
                  </div>
                  <Accordion type="single" collapsible defaultValue="guidance">
                    <AccordionItem value="guidance">
                      <AccordionTrigger className="text-sm font-semibold text-foreground">
                        Step guidance
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                        {guidance.highlight ? (
                          <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-primary">
                            {guidance.highlight}
                          </div>
                        ) : null}
                        {guidance.points.map((point) => (
                          <div key={point} className="flex gap-3 rounded-xl border border-border/60 bg-background/80 p-3">
                            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
                            <p>{point}</p>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ) : null}

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
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Compass className="h-4 w-4" />
                  </span>
                  <span>
                    Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
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

          {!focusMode && guidance ? (
            <div className="space-y-4 xl:col-start-3 xl:row-start-1">
              <Card className="border-border/60 bg-background/85">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">{guidance.title}</CardTitle>
                  {guidance.highlight ? (
                    <CardDescription className="leading-relaxed text-primary">
                      {guidance.highlight}
                    </CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {guidance.points.map((point) => (
                    <div key={point} className="flex gap-3 rounded-xl border border-border/50 bg-background/80 p-3">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <p>{point}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-background/80">
                <CardContent className="space-y-2 p-5 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <span className="text-[0.7rem] font-semibold text-foreground">Tip</span>
                  <p className="text-sm normal-case leading-relaxed text-muted-foreground">
                    You can revisit any step without losing progress. The live blueprint above updates instantly so you always see what the AI will use.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
