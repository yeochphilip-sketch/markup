import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MARKUP - Secondary Humanities Suite",
  description: "LORMS-aligned diagnostic essay suite for Social Studies and Elective History.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#07090e] antialiased`}>
        {children}
      </body>
    </html>
  );
}
