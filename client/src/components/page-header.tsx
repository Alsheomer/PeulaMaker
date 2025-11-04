import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Fragment } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  meta?: Array<{ label: string; value: string }>;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  meta,
  className,
  children,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background/95 via-background to-muted/40",
        "px-6 py-12 shadow-xl transition-shadow hover:shadow-2xl md:px-10 md:py-16",
        className,
      )}
    >
      <GradientBackdrop />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-6 text-left">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">{eyebrow}</p>
          ) : null}
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>
          </div>
          {meta && meta.length > 0 ? (
            <dl className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
              {meta.map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  className="rounded-2xl border border-border/40 bg-background/70 px-4 py-3 backdrop-blur"
                >
                  <dt className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground/80">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-shrink-0 flex-col items-stretch gap-3 sm:flex-row lg:flex-col">
            {actions}
          </div>
        ) : null}
      </div>
      {children ? <div className="relative mt-10">{children}</div> : null}
    </section>
  );
}

function GradientBackdrop() {
  return (
    <Fragment>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_10%_0%,theme(colors.primary/15),transparent_55%)]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_circle_at_95%_40%,theme(colors.primary/10),transparent_55%)]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
      />
    </Fragment>
  );
}
