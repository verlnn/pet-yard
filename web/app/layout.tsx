import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import "@/src/styles/globals.scss";
import { Providers } from "./providers";
import { notoSansKr, playfairDisplay, spaceGrotesk } from "./fonts";
import { themeScript } from "@/src/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "멍냥마당 | 반려동물 성장과 이웃 매칭",
  description: "반려동물 성장 기록, 동네 산책/위탁 매칭, 초보 반려인을 위한 지식까지.",
  icons: {
    icon: [
      { url: "/images/brand/petyard-tiny-logo.png", type: "image/png" },
      { url: "/images/brand/petyard-logo.png", type: "image/png" }
    ],
    apple: "/images/brand/petyard-tiny-logo.png"
  }
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body
        className={`${spaceGrotesk.variable} ${playfairDisplay.variable} ${notoSansKr.variable}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
