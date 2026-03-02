import { Calendar, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { WalkEvent } from "@/lib/mock";

export function WalkCard({ event }: { event: WalkEvent }) {
  return (
    <Card className="gradient-shell">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-semibold">{event.title}</p>
          <Badge variant={event.status === "모집중" ? "default" : "outline"}>
            {event.status}
          </Badge>
        </div>
        <div className="flex flex-col gap-2 text-sm text-ink/70">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {event.place}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {event.time}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" /> {event.capacity} · {event.petSize}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
