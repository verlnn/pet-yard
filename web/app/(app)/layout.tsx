import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const path = headers().get("x-pathname") ?? "/";

  // TODO: 서버에서 토큰 유효성 검증 로직 추가
  if (!accessToken) {
    const next = encodeURIComponent(path);
    redirect(`/login?next=${next}`);
  }

  return <>{children}</>;
}
