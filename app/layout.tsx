import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalFeedbackWrapper from "@/app/components/GlobalFeedbackWrapper";
import PageTransition from "@/app/components/PageTransition";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | MARKUP',
    default: 'MARKUP — O-Level Humanities AI Practice',
  },
  description: "LORMS-aligned diagnostic essay suite for Social Studies and Elective History. AI-powered SBQ, SEQ, and SRQ grading for Singapore SEAB O-Level students.",
  keywords: ['O-Level', 'Social Studies', 'Elective History', 'SBQ', 'SEQ', 'LORMS', 'Singapore', 'SEAB', 'Humanities', 'AI grading', 'essay practice', 'source-based case study'],
  authors: [{ name: 'MARKUP' }],
  openGraph: {
    title: 'MARKUP — O-Level Humanities AI Practice',
    description: 'The only Source-Based Case Study simulator designed for the Singapore SEAB Social Studies and History syllabus. Scan essays, get LORMS grades, and climb to A1.',
    url: process.env.SITE_URL || 'https://markup.app',
    siteName: 'MARKUP',
    type: 'website',
    locale: 'en_SG',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MARKUP — Master the O-Level Humanities with AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MARKUP — O-Level Humanities AI Practice',
    description: 'AI-powered LORMS grading for Singapore O-Level Social Studies & Elective History.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
} as const;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 💬 Wrap the children content inside the feedback layer so it renders perfectly */}
        <GlobalFeedbackWrapper>
          {/* 🎬 Route transition animation wrapper */}
          <PageTransition>
            {children}
          </PageTransition>
        </GlobalFeedbackWrapper>
        
        {/* 📊 Production analytics script tracking tag */}
        <Analytics />
      </body>
    </html>
  );
}