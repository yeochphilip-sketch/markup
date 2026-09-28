import type { Metadata } from 'next';

/** Admin surfaces are private — keep them out of search indexes. */
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
