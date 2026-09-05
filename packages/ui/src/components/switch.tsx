"use client";

import * as React from "react";
import { cn } from "@repo/utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className={cn(
            "peer sr-only",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2" />
        {label && <span className="text-sm">{label}</span>}
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
