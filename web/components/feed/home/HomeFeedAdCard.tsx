"use client";

import { memo } from "react";
import { ArrowUpRight } from "lucide-react";

import type { HomeFeedAd } from "@/components/feed/home/homeFeedData";

interface HomeFeedAdCardProps {
  ad: HomeFeedAd;
}

export const HomeFeedAdCard = memo(function HomeFeedAdCard({ ad }: HomeFeedAdCardProps) {
  return (
    <article className="home-feed-ad-card">
      <div className="home-feed-ad-header">
        <div>
          <p className="home-feed-ad-badge">광고</p>
          <p className="home-feed-ad-sponsor">{ad.sponsor}</p>
        </div>
        <button type="button" className="home-feed-ad-cta">
          {ad.ctaLabel} <ArrowUpRight className="home-feed-ad-cta-icon" />
        </button>
      </div>
      <div className="home-feed-ad-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="home-feed-ad-image"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="home-feed-ad-body">
        <p className="home-feed-ad-title">{ad.title}</p>
        <p className="home-feed-ad-description">{ad.description}</p>
      </div>
    </article>
  );
});
