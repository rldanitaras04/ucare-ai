import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-sm",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground shadow-sm",
        warning: "border-transparent bg-warning text-warning-foreground shadow-sm",
        info: "border-transparent bg-info text-info-foreground shadow-sm",

        /* ── Triage Priority (ui.md spec) ── */
        emergency: "border-triage-emergency-border bg-triage-emergency-bg text-triage-emergency shadow-sm",
        urgent: "border-triage-urgent-border bg-triage-urgent-bg text-triage-urgent shadow-sm",
        priority: "border-triage-priority-border bg-triage-priority-bg text-triage-priority shadow-sm",
        normal: "border-triage-normal-border bg-triage-normal-bg text-triage-normal shadow-sm",

        /* ── Clinic Operational Status ── */
        available: "border-transparent bg-status-available-bg text-status-available shadow-sm",
        seminar: "border-transparent bg-status-seminar-bg text-status-seminar shadow-sm",
        "on-leave": "border-transparent bg-status-on-leave-bg text-status-on-leave shadow-sm",
        fallback: "border-status-fallback-border bg-status-fallback-bg text-status-fallback shadow-sm",
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
