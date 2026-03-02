import { CalendarRange, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { BoardingRequest } from "@/lib/mock";

export function BoardingCard({ request }: { request: BoardingRequest }) {
  return (
    <Card className="gradient-shell">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-semibold">{request.title}</p>
          <Badge variant="outline">위탁 요청</Badge>
        </div>
        <div className="flex flex-col gap-2 text-sm text-ink/70">
          <span className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4" /> {request.date}
          </span>
          <span className="flex items-center gap-2">
            <Wallet className="h-4 w-4" /> {request.price}
          </span>
          <span className="text-ink/60">{request.requirement}</span>
        </div>
      </CardContent>
    </Card>
  );
}
