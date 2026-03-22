import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-2xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-4 py-3 text-sm text-[var(--color-text)] shadow-[var(--shadow-soft-token)] placeholder:text-[var(--color-input-placeholder)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border)]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
