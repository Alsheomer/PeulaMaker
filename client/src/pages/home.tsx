import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  CalendarClock,
  ClipboardList,
  Compass,
  Download,
  GraduationCap,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-crafted flow",
    description:
      "Our prompts are tuned for the full Tzofim methodology, giving you structured activity components in seconds.",
  },
  {
    icon: ClipboardList,
    title: "Guided questionnaire",
    description:
      "Move through a calm, multi-step form that mirrors how madrichim think about chanichim and outcomes.",
  },
  {
    icon: Download,
    title: "Share-ready exports",
    description:
      "Send the finished peula straight to Google Docs with the three-column format scouts already expect.",
  },
];

const timeline = [
  {
    title: "Frame the intention",
    description: "Select a template or start fresh, then capture the goals for your kvutza.",
  },
  {
    title: "Design logistics",
    description: "Dial in age range, duration, and group size so pacing recommendations are spot-on.",
  },
  {
    title: "Fine-tune delivery",
    description: "Highlight available materials, safety notes, and special considerations before you generate.",
  },
  {
    title: "Review & share",
    description: "Regenerate individual sections, gather feedback, and export to Docs with one click.",
  },
];

export default function Home() {
  return (
    <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-24 px-6 pb-32">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary/20 via-background to-primary/5 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/15),transparent_45%)]" />
        <div className="relative grid gap-12 px-8 pb-16 pt-20 md:grid-cols-[1.1fr_0.9fr] md:px-16 md:pb-20 md:pt-24">
          <div className="flex flex-col justify-between gap-10">
            <div className="space-y-6">
              <Badge className="bg-primary/15 text-primary" variant="secondary">
                Designed with Tzofim madrichim
              </Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
                Plan experiential peulot with clarity, structure, and AI support.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Peula Maker guides you through intentional planning, then generates a complete 9-component activity you can
                review, refine, and export to your kvutza.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/create">
                <Button size="lg" className="h-14 px-8 text-base" data-testid="button-start-planning">
                  <Compass className="mr-2 h-5 w-5" />
                  Start a new peula
                </Button>
              </Link>
              <Link href="/library">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base"
                  data-testid="button-view-library"
                >
                  Review saved peulot
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="bg-background/70">
                <CardContent className="flex flex-col gap-2 pt-6">
                  <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Templates</span>
                  <p className="text-lg font-semibold text-foreground">8 curated madrich playbooks</p>
                </CardContent>
              </Card>
              <Card className="bg-background/70">
                <CardContent className="flex flex-col gap-2 pt-6">
                  <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Feedback</span>
                  <p className="text-lg font-semibold text-foreground">Loop insights back into the AI</p>
                </CardContent>
              </Card>
              <Card className="bg-background/70">
                <CardContent className="flex flex-col gap-2 pt-6">
                  <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Exports</span>
                  <p className="text-lg font-semibold text-foreground">Docs-ready in under a minute</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="relative flex flex-col gap-6 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-lg">
            <div className="rounded-xl border border-primary/40 bg-primary/10 p-6 text-primary-foreground">
              <div className="flex items-center gap-3">
                <Users className="h-10 w-10 rounded-full bg-primary/20 p-2 text-primary" />
                <div>
                  <p className="text-sm font-medium text-primary">Peula framework</p>
                  <p className="text-lg font-semibold text-foreground">The 9 essential components</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-primary/80">
                Topic & Goals · Audience · Structure · Time · Materials · Safety · Methods · Delivery · Reflection
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 rounded-xl border border-border/60 bg-background/90 p-4 shadow-sm hover-elevate"
                  >
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-12 md:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-foreground">An experience built for calm, intentional planning</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Peula Maker keeps you focused with a streamlined questionnaire, contextual guidance, and inline actions so you never
            lose momentum. The result is a confident plan aligned with your kvutza’s needs.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-background/60">
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex items-center gap-2 text-primary">
                  <Layers className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-[0.2em]">Multi-step flow</span>
                </div>
                <p className="text-base text-muted-foreground">
                  Progress indicator, autosaved answers, and contextual templates keep chanichim front-and-center.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/60">
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex items-center gap-2 text-primary">
                  <CalendarClock className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-[0.2em]">Clear pacing</span>
                </div>
                <p className="text-base text-muted-foreground">
                  Time guidance adapts to the chosen duration so every component has room to breathe.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-lg">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">How it works</h3>
          <div className="mt-6 space-y-6">
            {timeline.map((item, index) => (
              <div key={item.title} className="relative rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm">
                <span className="absolute -top-3 left-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground shadow-lg">
                  {index + 1}
                </span>
                <div className="pl-10">
                  <h4 className="text-lg font-medium text-foreground">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-background/70 px-8 py-16 text-center shadow-xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <GraduationCap className="h-12 w-12 text-primary" />
          <h2 className="text-3xl font-semibold text-foreground">Craft meaningful experiences for every kvutza</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Whether you’re preparing for a weekly peula or shaping a special seminar, Peula Maker gives you structure, creative
            sparks, and exportable documentation that’s easy to share with fellow madrichim.
          </p>
          <Link href="/create">
            <Button size="lg" className="h-14 px-10 text-base">
              Launch the planner
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
