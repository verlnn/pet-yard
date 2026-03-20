import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { KnowledgeCard } from "@/lib/mock";

export function KnowledgeCardView({ card }: { card: KnowledgeCard }) {
  return (
    <Card className="gradient-shell">
      <CardContent className="flex h-full flex-col gap-3">
        <div>
          <p className="font-display text-base font-semibold">{card.title}</p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{card.subtitle}</p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <Badge key={tag} variant="soft">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
