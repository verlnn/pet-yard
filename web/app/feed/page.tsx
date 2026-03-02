import { SiteNav } from "@/components/site/nav";
import { FeedClient } from "./FeedClient";

export default function FeedPage() {
  return (
    <div>
      <SiteNav />
      <main className="container py-10">
        <FeedClient />
      </main>
    </div>
  );
}
