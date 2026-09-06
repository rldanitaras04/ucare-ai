import * as React from "react";
import { cn } from "@repo/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  iconBg?: "slate" | "blue" | "emerald" | "rose" | "amber" | "violet";
}

const iconBgClasses = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
};

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, description, icon, trend, trendValue, iconBg = "slate", ...props }, ref) => (
    <Card ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {icon && (
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconBgClasses[iconBg])}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="mt-1.5 flex items-center gap-2">
          {trend && trendValue && (
            <span className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
              trend === "up" && "bg-emerald-50 text-emerald-600",
              trend === "down" && "bg-rose-50 text-rose-600",
              trend === "neutral" && "bg-slate-100 text-slate-500"
            )}>
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {" "}{trendValue}
            </span>
          )}
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
);
StatCard.displayName = "StatCard";

export { StatCard };
