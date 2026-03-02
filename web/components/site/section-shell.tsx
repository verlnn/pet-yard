import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionShell({
  eyebrow,
  title,
  description,
  children,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-10", className)}>
      <div className="flex flex-col gap-3">
        {eyebrow && <p className="section-subtitle">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
        {description && <p className="text-ink/70">{description}</p>}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
