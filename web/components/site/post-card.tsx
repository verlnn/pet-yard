import { Heart, MessageCircle, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FeedPost } from "@/lib/mock";

export function PostCard({ post }: { post: FeedPost }) {
  return (
    <Card className="gradient-shell overflow-hidden">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-ink/60">
          <span>
            {post.author} · {post.petName}({post.petType})
          </span>
          <span>{post.time}</span>
        </div>
        <p className="text-base text-ink">{post.content}</p>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="soft">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-xs text-ink/60">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {post.location}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" /> {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" /> {post.comments}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
