import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "메시지 컨펌 협업 시스템 — 위드에스마케팅",
  description:
    "로그인 없이 누구나 URL만으로 접근·편집·코멘트할 수 있는 메시지 컨펌 협업 도구. 김진·이서진 대표 2인 협업 최적화.",
  keywords: [
    "메시지 컨펌",
    "협업 시스템",
    "위드에스마케팅",
    "CRM",
    "리마인드 메시지",
    "이서진",
    "김진",
  ],
  authors: [{ name: "위드에스마케팅" }],
  openGraph: {
    title: "메시지 컨펌 협업 시스템",
    description:
      "URL이 곧 접근 권한 · 누구나 편집 가능한 오픈 액세스 협업 도구",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a1228",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
