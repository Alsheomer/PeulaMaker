import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Compass, FileText, LayoutDashboard, Plus, Settings } from "lucide-react";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard, testId: "nav-home" },
  { href: "/create", label: "Plan Peula", icon: Compass, testId: "nav-create" },
  { href: "/library", label: "My Library", icon: FileText, testId: "nav-library" },
  { href: "/settings", label: "Training", icon: Settings, testId: "nav-settings" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/60 text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer" data-testid="link-home">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight">Peula Maker</span>
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tzofim Edition</span>
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-background/70 p-1 shadow-sm md:flex">
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
            <Link href="/create" className="hidden md:inline-flex">
              <Button className="px-5 py-2 text-sm font-semibold" data-testid="nav-create-cta">
                <Plus className="mr-2 h-4 w-4" />
                New Peula
              </Button>
            </Link>

            <div className="md:hidden">
              <Link href="/create" data-testid="nav-create-mobile">
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex min-h-screen flex-col pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 via-background to-transparent" />
        <div className="relative flex-1 pb-24">{children}</div>
      </main>

      <footer className="border-t border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p className="font-medium text-foreground">Empowering Tzofim madrichim with AI-crafted peulot.</p>
          <div className="flex flex-wrap gap-3">
            <span>Structured around the 9-component peula framework</span>
            <span className="hidden md:inline" aria-hidden="true">
              •
            </span>
            <span>Built for collaboration and rapid planning</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
