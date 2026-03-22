import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-full border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-4 text-sm text-[var(--color-text)] shadow-[var(--shadow-soft-token)] placeholder:text-[var(--color-input-placeholder)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
