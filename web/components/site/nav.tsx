import Link from "next/link";
import { Bell, Compass, HeartHandshake, MapPin, PawPrint, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const links = [
  { href: "/feed", label: "피드", icon: PawPrint },
  { href: "/walks", label: "산책", icon: Compass },
  { href: "/boarding", label: "위탁", icon: HeartHandshake },
  { href: "/knowledge", label: "지식", icon: Shield }
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/70 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sand">
            <PawPrint className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">멍냥마당</p>
            <div className="flex items-center gap-2 text-xs text-ink/60">
              <MapPin className="h-3 w-3" />
              <span>성수동 · 동네 커뮤니티</span>
            </div>
          </div>
        </div>
        <nav className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink/70 hover:bg-sand"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Badge variant="soft" className="hidden md:inline-flex">
            산책 매칭 12건
          </Badge>
          <Button variant="ghost" size="sm" aria-label="알림">
            <Bell className="h-4 w-4" />
          </Button>
          <Link href="/profile">
            <Button variant="secondary" size="sm">
              내 프로필
            </Button>
          </Link>
        </div>
      </div>
      <div className="border-t border-ink/10 bg-white/90 md:hidden">
        <div className="container flex items-center justify-between py-2 text-xs text-ink/60">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="px-2 py-1">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
