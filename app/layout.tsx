import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalFeedbackWrapper from "@/app/components/GlobalFeedbackWrapper";
import { Analytics } from '@vercel/analytics/react';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MARKUP - Secondary Humanities Suite",
  description: "LORMS-aligned diagnostic essay suite for Social Studies and Elective History.",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* 📊 This injects the tracking script on production builds */}
        <Analytics />
      </body>
    </html>
  );
}
