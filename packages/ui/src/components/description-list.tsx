import * as React from "react";
import { cn } from "@repo/utils";

interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  items: { label: string; value: React.ReactNode }[];
}

const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ className, items, ...props }, ref) => (
    <dl
      ref={ref}
      className={cn("divide-y divide-border", className)}
      {...props}
    >
      {items.map((item) => (
        <div key={item.label} className="flex flex-col py-4 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt className="text-sm font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
);
DescriptionList.displayName = "DescriptionList";

export { DescriptionList };
