import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { MainLayout } from "@/components/layout/MainLayout";
import RouteGuard from "@/src/components/RouteGuard";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  return (
    <RouteGuard accessToken={accessToken}>
      <MainLayout>{children}</MainLayout>
    </RouteGuard>
  );
}
