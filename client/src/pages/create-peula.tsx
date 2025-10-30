import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { questionnaireResponseSchema, type QuestionnaireResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sparkles, Users, UsersRound, Heart, TreePine, Star, Lightbulb, Handshake } from "lucide-react";
import { Card } from "@/components/ui/card";
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

export default function CreatePeula() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
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
    }
    setShowForm(true);
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-6">
        {!showForm ? (
          // Template Selection
          <div className="space-y-6">
            <div className="mb-8 text-center">
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
        ) : (
          // Questionnaire Form
          <div className="space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Create Your Peula
              </h1>
              <p className="text-muted-foreground">
                Fill in the details below to generate your activity plan
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="p-6 space-y-6">
                  {/* Topic */}
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Topic or Theme</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., leadership, teamwork, identity, community..."
                            className="text-base"
                            data-testid="input-topic"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Age Group */}
                  <FormField
                    control={form.control}
                    name="ageGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Age Group</FormLabel>
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

                  {/* Duration */}
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

                  {/* Group Size */}
                  <FormField
                    control={form.control}
                    name="groupSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Group Size</FormLabel>
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

                  {/* Goals */}
                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Educational Goals</FormLabel>
                        <FormControl>
                          <Textarea
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Describe what you'd like participants to learn, understand, or experience..."
                            className="min-h-24 text-base resize-y"
                            data-testid="textarea-goals"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Available Materials */}
                  <FormField
                    control={form.control}
                    name="availableMaterials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Available Materials (Optional)</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            {[
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
                            ].map((option) => {
                              const values = (field.value as string[]) || [];
                              const isChecked = values.includes(option.value);
                              
                              return (
                                <div key={option.value} className="flex items-center space-x-2">
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
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Special Considerations */}
                  <FormField
                    control={form.control}
                    name="specialConsiderations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Safety considerations, group dynamics, preferences, limitations..."
                            className="min-h-24 text-base resize-y"
                            data-testid="textarea-specialConsiderations"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <div className="flex justify-between items-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={generateMutation.isPending}
                    data-testid="button-back"
                  >
                    Change Template
                  </Button>

                  <Button
                    type="submit"
                    disabled={generateMutation.isPending}
                    className="min-w-48"
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
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
