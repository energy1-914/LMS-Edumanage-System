import "./globals.css";
import type { Metadata } from "next";
import Provider from "./Provider";
import "sfac-designkit-react/style.css";

export const metadata: Metadata = {
  title: "LMS 학습관리 시스템",
  description: "LMS 학습관리 시스템입니다.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
