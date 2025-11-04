import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  FileText,
  LayoutDashboard,
  Library,
  Settings,
  Sparkles,
} from "lucide-react";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard, testId: "nav-home" },
  { href: "/create", label: "Plan", icon: Compass, testId: "nav-create" },
  { href: "/library", label: "Library", icon: Library, testId: "nav-library" },
  { href: "/settings", label: "Training", icon: Settings, testId: "nav-settings" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,theme(colors.primary/9),transparent_45%)]">
      <div className="pointer-events-none fixed inset-0 -z-30 opacity-[0.12] [background-image:linear-gradient(to_right,theme(colors.border/40)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/40)_1px,transparent_1px)] [background-size:80px_80px]" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(800px_circle_at_top_left,theme(colors.primary/12),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-background via-background/95 to-muted/50" />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/">
            <div className="flex items-center gap-3 rounded-full border border-border/50 bg-background/70 px-4 py-2 shadow-sm transition hover:border-primary/40" data-testid="link-home">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight">Peula Maker</span>
                <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Tzofim Studio</span>
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border/60 bg-background/80 px-1 py-1 shadow-sm md:flex">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-full px-4"
                    data-testid={item.testId}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden flex-col items-end text-right text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/70 md:flex">
              <span>Plan with confidence</span>
              <Badge variant="secondary" className="mt-1 w-fit rounded-full px-3 py-1 text-[0.6rem] tracking-[0.25em]">
                Youth-led • Experiential • Safe
              </Badge>
            </div>
            <Link href="/create" className="hidden md:inline-flex">
              <Button className="px-5 py-2 text-sm font-semibold shadow-lg" data-testid="nav-create-cta">
                <Compass className="mr-2 h-4 w-4" />
                New Peula
              </Button>
            </Link>
            <Link href="/library" className="hidden md:inline-flex">
              <Button variant="ghost" size="sm" className="rounded-full" data-testid="nav-quick-library">
                <FileText className="mr-2 h-4 w-4" />
                Library
              </Button>
            </Link>

            <div className="md:hidden">
              <Button variant="outline" size="icon" className="rounded-full border-border/70 bg-background/80" asChild>
                <Link href="/create" data-testid="nav-create-mobile">
                  <Compass className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex min-h-screen flex-col pb-32 pt-10 md:pt-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/10 via-background to-transparent" />
        <div className="relative flex-1 pb-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">{children}</div>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p className="font-medium text-foreground">Crafting high-impact peulot with Tzofim insight and AI structure.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span>9-component peula arc</span>
            <span aria-hidden="true" className="hidden md:inline">
              •
            </span>
            <span>Guidance for every shichva and tafkid</span>
          </div>
        </div>
      </footer>

      <MobileNavigation currentPath={location} />
    </div>
  );
}

function MobileNavigation({ currentPath }: { currentPath: string }) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center md:hidden">
      <nav className="flex w-[90%] max-w-md items-center justify-between rounded-full border border-border/60 bg-background/95 px-4 py-2 shadow-2xl backdrop-blur">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          return (
            <Link key={`mobile-${item.href}`} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className="flex h-10 w-16 flex-col items-center justify-center rounded-full px-0 text-xs"
                data-testid={`${item.testId}-mobile`}
              >
                <Icon className="h-4 w-4" />
                <span className="mt-1 text-[0.65rem] font-semibold">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
