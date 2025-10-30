import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { questionnaireResponseSchema, type QuestionnaireResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Sparkles, Users, UsersRound, Heart, TreePine, Star, Lightbulb, Handshake } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Peula } from "@shared/schema";
import { peulaTemplates, getTemplateById } from "@shared/templates";

const TOTAL_STEPS = 8;

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

const questions = [
  {
    step: 2,
    field: "topic" as const,
    title: "Topic or theme",
    description: "What topic or value would you like to explore?",
    type: "text",
    placeholder: "e.g., leadership, teamwork, identity, community...",
  },
  {
    step: 3,
    field: "ageGroup" as const,
    title: "Age group",
    description: "Select the age range of participants",
    type: "select",
    options: [
      { value: "6-8", label: "6-8 years" },
      { value: "9-11", label: "9-11 years" },
      { value: "12-14", label: "12-14 years" },
      { value: "15-17", label: "15-17 years" },
      { value: "18+", label: "18+ years" },
    ],
  },
  {
    step: 4,
    field: "duration" as const,
    title: "Duration",
    description: "How much time is available for this activity?",
    type: "select",
    options: [
      { value: "30-45", label: "30-45 minutes" },
      { value: "45-60", label: "45-60 minutes" },
      { value: "60-90", label: "60-90 minutes" },
      { value: "90+", label: "90+ minutes" },
    ],
  },
  {
    step: 5,
    field: "groupSize" as const,
    title: "Group size",
    description: "Number of participants",
    type: "select",
    options: [
      { value: "5-10", label: "5-10" },
      { value: "11-20", label: "11-20" },
      { value: "21-30", label: "21-30" },
      { value: "30+", label: "30+" },
    ],
  },
  {
    step: 6,
    field: "goals" as const,
    title: "Goals and outcomes",
    description: "What should participants gain from this activity?",
    type: "textarea",
    placeholder: "Describe what you'd like participants to learn, understand, or experience...",
  },
  {
    step: 7,
    field: "availableMaterials" as const,
    title: "Available materials",
    description: "Select resources you have access to (optional)",
    type: "checkbox",
    options: [
      { value: "outdoor-space", label: "Outdoor space" },
      { value: "art-supplies", label: "Art supplies" },
      { value: "rope-string", label: "Rope/string" },
      { value: "balls-sports", label: "Sports equipment" },
      { value: "whiteboard", label: "Whiteboard" },
      { value: "projector", label: "Projector" },
      { value: "music-speakers", label: "Music/speakers" },
      { value: "costumes-props", label: "Costumes/props" },
      { value: "craft-materials", label: "Craft materials" },
      { value: "camping-gear", label: "Camping gear" },
    ],
  },
  {
    step: 8,
    field: "specialConsiderations" as const,
    title: "Additional notes",
    description: "Any other information we should know? (optional)",
    type: "textarea",
    placeholder: "Safety considerations, group dynamics, preferences, limitations...",
  },
];

export default function CreatePeula() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("custom");
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

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    form.setValue("templateId", templateId);
    const template = getTemplateById(templateId);
    if (template && templateId !== "custom") {
      form.setValue("topic", template.topic);
      form.setValue("goals", template.goals);
    } else {
      form.setValue("topic", "");
      form.setValue("goals", "");
    }
    setCurrentStep(2);
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

  const currentQuestion = questions.find(q => q.step === currentStep);
  const progress = (currentStep / TOTAL_STEPS) * 100;
  const canGoNext = currentStep < TOTAL_STEPS;
  const canGoBack = currentStep > 1;

  const handleNext = async () => {
    if (!currentQuestion) return;
    const field = currentQuestion.field;
    const isValid = await form.trigger(field);
    
    if (isValid && canGoNext) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: QuestionnaireResponse) => {
    generateMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Question {currentStep} of {TOTAL_STEPS}
            </h2>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-questionnaire" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Template Selection (Step 1) */}
            {currentStep === 1 ? (
              <div className="space-y-6">
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-semibold text-foreground mb-3">
                    Choose a Template
                  </h1>
                  <p className="text-base text-muted-foreground">
                    Select a template to get started, or create a custom peula from scratch
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {peulaTemplates.map((template) => {
                    const IconComponent = iconMap[template.icon as keyof typeof iconMap];
                    return (
                      <Card
                        key={template.id}
                        className={`p-6 cursor-pointer transition-all hover-elevate ${
                          selectedTemplate === template.id ? "border-primary bg-accent/30" : ""
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                        data-testid={`template-${template.id}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-md bg-primary/10">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {template.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : currentQuestion ? (
              <Card className="p-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    {currentQuestion.title}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.description}
                  </p>
                </div>

                {currentQuestion.type === "text" ? (
                <FormField
                  control={form.control}
                  name={currentQuestion.field}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={currentQuestion.placeholder}
                          className="text-base"
                          data-testid={`input-${currentQuestion.field}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : currentQuestion.type === "textarea" ? (
                <FormField
                  control={form.control}
                  name={currentQuestion.field}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          value={field.value as string || ""}
                          onChange={field.onChange}
                          placeholder={currentQuestion.placeholder}
                          className="min-h-32 text-base resize-y"
                          data-testid={`textarea-${currentQuestion.field}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : currentQuestion.type === "select" ? (
                <FormField
                  control={form.control}
                  name={currentQuestion.field}
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value as string || ""}>
                        <FormControl>
                          <SelectTrigger 
                            className="text-base"
                            data-testid={`select-${currentQuestion.field}`}
                          >
                            <SelectValue placeholder="Select an option..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currentQuestion.options?.map((option) => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                              data-testid={`option-${option.value}`}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : currentQuestion.type === "checkbox" ? (
                <FormField
                  control={form.control}
                  name={currentQuestion.field}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-3">
                          {currentQuestion.options?.map((option) => {
                            const values = (field.value as string[]) || [];
                            const isChecked = values.includes(option.value);
                            
                            return (
                              <div key={option.value} className="flex items-center space-x-3">
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
                                <Label
                                  htmlFor={option.value}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {option.label}
                                </Label>
                              </div>
                            );
                          })}
                          {(field.value as string[] || []).length === 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              No materials selected. AI will suggest common materials.
                            </p>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
              </Card>
            ) : null}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={!canGoBack || generateMutation.isPending}
                data-testid="button-back"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep === TOTAL_STEPS ? (
                <Button
                  type="submit"
                  disabled={generateMutation.isPending}
                  className="min-w-40"
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Peula
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={generateMutation.isPending}
                  data-testid="button-next"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
