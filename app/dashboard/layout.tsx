import type { Metadata } from 'next';

/** The practice app is a logged-in surface — keep it out of search indexes. */
export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
