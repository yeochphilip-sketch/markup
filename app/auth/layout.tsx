import type { Metadata } from 'next';

/** Auth pages must never appear in search results. */
export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
