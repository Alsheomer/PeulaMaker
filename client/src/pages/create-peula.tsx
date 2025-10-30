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
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Peula } from "@shared/schema";

const TOTAL_STEPS = 7;

const questions = [
  {
    step: 1,
    field: "topic" as const,
    title: "What is the topic or theme of your peula?",
    description: "E.g., Leadership, Teamwork, Personal Growth, Community Service, Identity",
    type: "text",
    placeholder: "Enter the main topic or value you want to explore...",
  },
  {
    step: 2,
    field: "ageGroup" as const,
    title: "What is the age group of your chanichim?",
    description: "This helps tailor the complexity and activities to their developmental stage",
    type: "select",
    options: [
      { value: "6-8", label: "6-8 years (Young scouts)" },
      { value: "9-11", label: "9-11 years (Pre-teens)" },
      { value: "12-14", label: "12-14 years (Early teens)" },
      { value: "15-17", label: "15-17 years (Older teens)" },
      { value: "18+", label: "18+ years (Young adults)" },
    ],
  },
  {
    step: 3,
    field: "duration" as const,
    title: "How long will the peula be?",
    description: "Consider your meeting schedule and the complexity of activities",
    type: "select",
    options: [
      { value: "30-45", label: "30-45 minutes (Short session)" },
      { value: "45-60", label: "45-60 minutes (Standard session)" },
      { value: "60-90", label: "60-90 minutes (Extended session)" },
      { value: "90+", label: "90+ minutes (Workshop/Special event)" },
    ],
  },
  {
    step: 4,
    field: "groupSize" as const,
    title: "How many chanichim will participate?",
    description: "Group size affects activity selection and breakout planning",
    type: "select",
    options: [
      { value: "5-10", label: "5-10 chanichim (Small group)" },
      { value: "11-20", label: "11-20 chanichim (Medium group)" },
      { value: "21-30", label: "21-30 chanichim (Large group)" },
      { value: "30+", label: "30+ chanichim (Very large group)" },
    ],
  },
  {
    step: 5,
    field: "goals" as const,
    title: "What are your educational goals for this peula?",
    description: "What should chanichim learn, feel, or be able to do by the end?",
    type: "textarea",
    placeholder: "Describe the learning outcomes and values you want to emphasize...\n\nExample: Chanichim will understand the importance of active listening in teamwork and be able to identify at least two ways they can improve their own listening skills.",
  },
  {
    step: 6,
    field: "availableMaterials" as const,
    title: "What materials or resources do you have available?",
    description: "Optional: Select any items, locations, or equipment you can use",
    type: "checkbox",
    options: [
      { value: "outdoor-space", label: "Outdoor space / Field" },
      { value: "art-supplies", label: "Art supplies (paper, markers, paint)" },
      { value: "rope-string", label: "Rope / String" },
      { value: "balls-sports", label: "Balls / Sports equipment" },
      { value: "whiteboard", label: "Whiteboard / Flip chart" },
      { value: "projector", label: "Projector / Screen" },
      { value: "music-speakers", label: "Music / Speakers" },
      { value: "costumes-props", label: "Costumes / Props" },
      { value: "craft-materials", label: "Craft materials (glue, scissors, fabric)" },
      { value: "camping-gear", label: "Camping gear" },
    ],
  },
  {
    step: 7,
    field: "specialConsiderations" as const,
    title: "Any special considerations or preferences?",
    description: "Optional: Mention any safety concerns, group dynamics, or specific requests",
    type: "textarea",
    placeholder: "E.g., prefer indoor activities due to weather, one chanich has mobility limitations, group has done trust games before...\n\n(Leave blank if none)",
  },
];

export default function CreatePeula() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  
  const form = useForm<QuestionnaireResponse>({
    resolver: zodResolver(questionnaireResponseSchema),
    defaultValues: {
      topic: "",
      ageGroup: "",
      duration: "",
      groupSize: "",
      goals: "",
      availableMaterials: [],
      specialConsiderations: "",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: QuestionnaireResponse) => {
      const response = await apiRequest("POST", "/api/peulot/generate", data);
      return await response.json() as Peula;
    },
    onSuccess: (peula) => {
      setLocation(`/peula/${peula.id}`);
    },
  });

  const currentQuestion = questions.find(q => q.step === currentStep)!;
  const progress = (currentStep / TOTAL_STEPS) * 100;
  const canGoNext = currentStep < TOTAL_STEPS;
  const canGoBack = currentStep > 1;

  const handleNext = async () => {
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
            {/* Question Card */}
            <Card className="p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  {currentQuestion.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.description}
                </p>
              </div>

              <FormField
                control={form.control}
                name={currentQuestion.field}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {currentQuestion.type === "text" ? (
                        <Input
                          {...field}
                          placeholder={currentQuestion.placeholder}
                          className="text-base"
                          data-testid={`input-${currentQuestion.field}`}
                        />
                      ) : currentQuestion.type === "textarea" ? (
                        <Textarea
                          {...field}
                          placeholder={currentQuestion.placeholder}
                          className="min-h-32 text-base resize-y"
                          data-testid={`textarea-${currentQuestion.field}`}
                        />
                      ) : currentQuestion.type === "select" ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger 
                            className="text-base"
                            data-testid={`select-${currentQuestion.field}`}
                          >
                            <SelectValue placeholder="Select an option..." />
                          </SelectTrigger>
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
                      ) : currentQuestion.type === "checkbox" ? (
                        <div className="space-y-3">
                          {currentQuestion.options?.map((option) => {
                            const values = field.value as string[] || [];
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
                      ) : null}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

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
