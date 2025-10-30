import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Home } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Peula Maker</span>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant={location === "/" ? "secondary" : "ghost"}
                size="sm"
                data-testid="nav-home"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/library">
              <Button
                variant={location === "/library" ? "secondary" : "ghost"}
                size="sm"
                data-testid="nav-library"
              >
                <FileText className="w-4 h-4 mr-2" />
                My Peulot
              </Button>
            </Link>
            <Link href="/create">
              <Button
                variant={location === "/create" ? "default" : "outline"}
                size="sm"
                data-testid="nav-create"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">Built for Tzofim Madrichim</p>
            <p>AI-powered peula planning based on elite scout methodology</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
