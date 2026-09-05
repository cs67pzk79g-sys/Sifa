import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function LeserLayout({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{children}</main>;
}
