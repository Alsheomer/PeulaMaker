import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Compass } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/40 px-6">
      <Card className="w-full max-w-md border-border/70 bg-background/95 shadow-xl">
        <CardHeader className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-7 w-7" />
          </span>
          <CardTitle className="text-2xl font-semibold text-foreground">This trail doesn’t exist yet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
          <p>The page you’re looking for might be on a different route. Head back to the library or start a new peula.</p>
          <Button className="w-full" onClick={() => setLocation("/")}>
            Return home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
