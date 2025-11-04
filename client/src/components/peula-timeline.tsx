import type { PeulaComponent } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface PeulaTimelineProps {
  components: PeulaComponent[];
  emphasisIndex?: number;
}

export function PeulaTimeline({ components, emphasisIndex }: PeulaTimelineProps) {
  return (
    <Card className="border-border/70 bg-background/90">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl font-semibold text-foreground">Peula flow overview</CardTitle>
          <CardDescription>
            A quick glance at the 9-component arc before you dive into full details.
          </CardDescription>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2 rounded-full">
          <Sparkles className="h-4 w-4 text-primary" />
          {components.length} stages
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {components.map((component, index) => {
          const isHighlighted = emphasisIndex === index;
          return (
            <div key={`${component.component}-${index}`} className="space-y-4">
              <div
                className={cn(
                  "flex gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 transition",
                  isHighlighted && "border-primary/60 bg-primary/10"
                )}
              >
                <div className="flex flex-col items-center gap-2 text-sm font-semibold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {index + 1}
                  </span>
                  {component.timeStructure ? (
                    <Badge variant="outline" className="whitespace-nowrap rounded-full border-dashed text-[0.65rem]">
                      {component.timeStructure}
                    </Badge>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{component.component}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                    {component.description}
                  </p>
                  {component.bestPractices ? (
                    <p className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
                      Best practice spotlight
                    </p>
                  ) : null}
                </div>
              </div>
              {index < components.length - 1 ? <Separator className="bg-border/60" /> : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
