import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        info: "border-transparent bg-info text-info-foreground",

        /* ── Triage Priority (ui.md spec) ── */
        emergency: "border-triage-emergency-border bg-triage-emergency-bg text-triage-emergency",
        urgent: "border-triage-urgent-border bg-triage-urgent-bg text-triage-urgent",
        priority: "border-triage-priority-border bg-triage-priority-bg text-triage-priority",
        normal: "border-triage-normal-border bg-triage-normal-bg text-triage-normal",

        /* ── Clinic Operational Status ── */
        available: "border-transparent bg-status-available-bg text-status-available",
        seminar: "border-transparent bg-status-seminar-bg text-status-seminar",
        "on-leave": "border-transparent bg-status-on-leave-bg text-status-on-leave",
        fallback: "border-status-fallback-border bg-status-fallback-bg text-status-fallback",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
