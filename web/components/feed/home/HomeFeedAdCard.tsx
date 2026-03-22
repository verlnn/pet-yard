"use client";

import { memo, useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

import type { HomeFeedAd } from "@/components/feed/home/homeFeedData";
import { homeFeedAdTracker } from "@/components/feed/home/homeFeedAdTracking";

interface HomeFeedAdCardProps {
  ad: HomeFeedAd;
  position: number;
}

export const HomeFeedAdCard = memo(function HomeFeedAdCard({ ad, position }: HomeFeedAdCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const hasTrackedImpressionRef = useRef(false);

  useEffect(() => {
    const target = cardRef.current;
    if (!target || hasTrackedImpressionRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting || hasTrackedImpressionRef.current) {
          return;
        }

        hasTrackedImpressionRef.current = true;
        homeFeedAdTracker.trackImpression(ad, { position });
        observer.disconnect();
      },
      {
        threshold: 0.6
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [ad, position]);

  const handleAdClick = () => {
    homeFeedAdTracker.trackClick(ad, { position });
  };

  return (
    <article ref={cardRef} className="home-feed-ad-card">
      <div className="home-feed-ad-header">
        <div>
          <p className="home-feed-ad-badge">광고</p>
          <p className="home-feed-ad-sponsor">{ad.sponsor}</p>
        </div>
        <a
          href={ad.targetUrl}
          className="home-feed-ad-cta"
          onClick={handleAdClick}
        >
          {ad.ctaLabel} <ArrowUpRight className="home-feed-ad-cta-icon" />
        </a>
      </div>
      <a href={ad.targetUrl} className="home-feed-ad-media" onClick={handleAdClick}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="home-feed-ad-image"
          loading="lazy"
          decoding="async"
        />
      </a>
      <div className="home-feed-ad-body">
        <p className="home-feed-ad-title">{ad.title}</p>
        <p className="home-feed-ad-description">{ad.description}</p>
      </div>
    </article>
  );
});
