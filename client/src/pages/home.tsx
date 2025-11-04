import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Link } from "wouter";
import {
  CalendarClock,
  ClipboardList,
  Compass,
  Download,
  GraduationCap,
  HeartHandshake,
  Layers,
  Map,
  Quote,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const highlights = [
  { label: "Templates", value: "8 Tzofim arcs" },
  { label: "Average prep", value: "under 7 minutes" },
  { label: "Exports", value: "Docs-ready instantly" },
  { label: "Feedback", value: "Continuously learned" },
];

const commitments = [
  {
    icon: Sparkles,
    title: "Authentic peulot",
    description: "The prompts lean on kvutza rituals, hitkhadshut to sikkum flow, and real tafkid expectations.",
  },
  {
    icon: ClipboardList,
    title: "Guided intake",
    description: "A step-by-step studio helps you capture chanichim context, logistics, and safety in one calm space.",
  },
  {
    icon: Download,
    title: "Share in minutes",
    description: "Send the finished plan to Google Docs in the familiar three-column format for easy collaboration.",
  },
];

const journey = [
  {
    title: "Start with intention",
    description: "Choose a curated template or begin custom, then articulate your kvutza focus and outcomes.",
  },
  {
    title: "Shape the logistics",
    description: "Age group, duration, group size, and materials ensure recommendations meet your reality.",
  },
  {
    title: "Preview the blueprint",
    description: "The studio surfaces a live summary so you can tweak before asking the AI to generate.",
  },
  {
    title: "Refine & export",
    description: "Regenerate individual sections, add feedback, and share the plan with co-madrichim in one click.",
  },
];

const practiceCards = [
  {
    icon: Layers,
    title: "Multi-step clarity",
    description: "Progress tracking, template guidance, and contextual tips keep planning calm and organised.",
  },
  {
    icon: CalendarClock,
    title: "Time you can trust",
    description: "Duration-aware pacing recommendations make sure each component has space to breathe.",
  },
  {
    icon: HeartHandshake,
    title: "Community-first",
    description: "We highlight shichva dynamics, accessibility, and risk management so chanichim feel held.",
  },
  {
    icon: Zap,
    title: "Rapid iteration",
    description: "Regenerate or fine-tune any section, capturing feedback that the AI reuses immediately.",
  },
];

const craftPillars = [
  {
    icon: Users,
    title: "Kvutza-centred",
    description: "Language, rituals, and facilitation cues adapt to the maturity and ruach of every shichva.",
  },
  {
    icon: ShieldCheck,
    title: "Risk-aware",
    description: "Built-in reminders highlight accessibility, safety, and madrichim-to-chanich ratios.",
  },
  {
    icon: Map,
    title: "Clear flow",
    description: "Transitions are annotated so the peula moves effortlessly from hitkhadshut to sikkum.",
  },
  {
    icon: GraduationCap,
    title: "Leadership growth",
    description: "Assignments suggest peer-led tafkidim and reflection prompts that build chanich agency.",
  },
];

const testimonials = [
  {
    quote:
      "Our kvutza finally has plans that sound like us. The AI remembers our tone and keeps the chanichim leading.",
    name: "Noa",
    role: "Rosh Chavaya, Tzofim Modiin",
  },
  {
    quote:
      "The export to Docs is magic. I tweak a section, click regenerate, and share a new version with my tzevet instantly.",
    name: "Yarden",
    role: "Merakez, Shevet Harishonim",
  },
  {
    quote:
      "Guided intake keeps me calm before a peula. I never forget materials or safety notes anymore.",
    name: "Lior",
    role: "Madracha, Shichva Tzofi",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-28">
      <PageHeader
        eyebrow="For madrichim and kvutzot"
        title="A planning studio built around authentic Tzofim peulot"
        description="Peula Maker weaves your knowledge with AI structure so every activity moves smoothly from hitkhadshut to sikkum while keeping chanichim safe, inspired, and leading."
        actions={
          <>
            <Link href="/create">
              <Button size="lg" className="h-14 px-8 text-base" data-testid="button-start-planning">
                <Compass className="mr-2 h-5 w-5" /> Start a new peula
              </Button>
            </Link>
            <Link href="/library">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base" data-testid="button-view-library">
                Review saved peulot
              </Button>
            </Link>
          </>
        }
        meta={highlights}
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/50 bg-background/90 backdrop-blur">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <Badge variant="secondary" className="rounded-full bg-primary/15 px-3 py-1 text-primary">
                  Designed with Tzofim madrichim
                </Badge>
                <CardTitle className="mt-4 text-2xl">The 9-component arc, ready in minutes</CardTitle>
                <CardDescription className="mt-2 text-base leading-relaxed">
                  Topic & goals, audience, logistics, methods, reflection, and more – generated with context from your kvutza and tailored to shichva culture.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {commitments.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-background/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Planning journey</CardTitle>
              <CardDescription>How Peula Maker walks you from idea to shareable plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {journey.map((step, index) => (
                <div key={step.title} className="relative rounded-2xl border border-border/50 bg-background/80 p-5 shadow-sm">
                  <span className="absolute -top-3 left-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-lg">
                    {index + 1}
                  </span>
                  <div className="pl-10">
                    <p className="text-base font-medium text-foreground">{step.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageHeader>

      <section className="grid gap-8 md:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-foreground">Crafted for calm, intentional preparation</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Every touchpoint in Peula Maker mirrors how madrichim plan in real life. You can move between steps, preview the live blueprint, and trust that the AI has absorbed Tzofim terminology and safety expectations.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {practiceCards.slice(0, 2).map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="border-border/60 bg-background/80">
                  <CardContent className="flex flex-col gap-3 pt-6">
                    <div className="flex items-center gap-2 text-primary">
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium uppercase tracking-[0.25em]">{item.title}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {practiceCards.slice(2).map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="border-border/60 bg-background/80">
                  <CardContent className="flex flex-col gap-3 pt-6">
                    <div className="flex items-center gap-2 text-primary">
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium uppercase tracking-[0.25em]">{item.title}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="flex h-full flex-col justify-between border-border/50 bg-background/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">From hitkhadshut to sikkum</CardTitle>
            <CardDescription className="leading-relaxed">
              The AI understands the progression of a classic peula: energizers, experiential body, hadracha, value exploration, reflection, and concrete next steps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/10 p-5 text-sm leading-relaxed text-primary">
              "The structure does the heavy lifting so I can focus on how my chanichim will internalize the message."
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-primary/70">- Gal, Merkazit of Shevet Alon</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-5 text-sm leading-relaxed text-muted-foreground">
              • Capture kvutza nuances with templates tuned for shichva, age, and theme.
              <br />• Preview pacing and transitions before you generate.
              <br />• Export a Google Doc ready for madrichim and hanhaga review.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-10 rounded-3xl border border-border/60 bg-background/85 p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Badge variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-primary">
            Designed for madrichim in motion
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground">Elevate every element of your hadracha craft</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Focus mode, contextual guidance, and a live blueprint help you plan with clarity. Each pillar below shows how the studio keeps the kvutza experience authentic to Tzofim culture while saving precious prep time.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {craftPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-base font-semibold text-foreground">{pillar.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-background/90">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Trusted voices</p>
                  <p className="text-base font-medium text-foreground">Built with shichva leaders</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Experienced madrichim from across the movement informed every flow, ensuring the studio honours kvutza autonomy while easing the planning load.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {testimonials.map((quote) => (
              <Card key={quote.name} className="border-border/60 bg-background/95">
                <CardContent className="space-y-3 pt-6">
                  <Quote className="h-6 w-6 text-primary" />
                  <p className="text-base leading-relaxed text-foreground">“{quote.quote}”</p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {quote.name} • {quote.role}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-background/80 px-8 py-16 text-center shadow-xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <GraduationCap className="h-12 w-12 text-primary" />
          <h2 className="text-3xl font-semibold text-foreground">Bring the kvutza together with confidence</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Whether you are prepping for a weekly activity, a tekes, or a yom shevet, Peula Maker keeps the details tight and the experience full of ruach.
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
