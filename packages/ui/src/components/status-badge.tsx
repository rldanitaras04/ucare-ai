import * as React from "react";
import { cn } from "@repo/utils";

type Status =
  | "active"
  | "inactive"
  | "pending"
  | "suspended"
  | "deleted"
  // Triage Priorities (scope.md Section 11)
  | "emergency"
  | "urgent"
  | "priority"
  | "normal"
  // Staff Availability & Duty (scope.md Section 8)
  | "available"
  | "unavailable"
  | "training"
  | "on_leave"
  | "fallback_active"
  // Provider Sessions & Clearance (scope.md Sections 9, 19)
  | "in_session"
  | "confirmed"
  | "cleared"
  | "pending_clearance";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: Status;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-border",
  },
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  suspended: {
    label: "Suspended",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  deleted: {
    label: "Deleted",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  // Triage Priority Variants
  emergency: {
    label: "Emergency",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 font-bold animate-pulse",
  },
  urgent: {
    label: "Urgent",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold",
  },
  priority: {
    label: "Priority",
    className: "bg-yellow-500/15 text-yellow-800 dark:text-yellow-400 border-yellow-500/30",
  },
  normal: {
    label: "Normal",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  // Clinic Staff Duty Variants
  available: {
    label: "On Duty",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  unavailable: {
    label: "Unavailable",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
  training: {
    label: "Training / Seminar",
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  on_leave: {
    label: "On Leave",
    className: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
  },
  fallback_active: {
    label: "Fallback Triage Active",
    className: "bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 font-semibold",
  },
  // Clinical Operations
  in_session: {
    label: "In Session",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-medium",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  cleared: {
    label: "Cleared",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold",
  },
  pending_clearance: {
    label: "Requirements Pending",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
};

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, ...props }, ref) => {
    const config = statusConfig[status];

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
          config.className,
          className
        )}
        {...props}
      >
        {config.label}
      </span>
    );
  }
);
StatusBadge.displayName = "StatusBadge";

export { StatusBadge };
