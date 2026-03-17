"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ROUTES } from "@/src/lib/routes";

type RouteGuardProps = {
  children: ReactNode;
  accessToken?: string | null;
};

export default function RouteGuard({ children, accessToken }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname() ?? ROUTES.login;

  useEffect(() => {
    if (accessToken) {
      return;
    }
    if (pathname.startsWith(ROUTES.oauth) || pathname.startsWith(ROUTES.onboarding)) {
      return;
    }
    if ([ROUTES.login, ROUTES.signup, ROUTES.start, ROUTES.verify].includes(pathname)) {
      return;
    }
    const next = encodeURIComponent(pathname);
    router.replace(`${ROUTES.login}?next=${next}`);
  }, [accessToken, pathname, router]);

  if (!accessToken) {
    return null;
  }

  return <>{children}</>;
}
