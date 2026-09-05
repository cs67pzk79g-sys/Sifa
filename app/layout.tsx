import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { HAFTUNGSHINWEIS } from "@/lib/rechtstexte";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Arbeitsschutz-Dokumentation",
    template: "%s · Arbeitsschutz-Dokumentation",
  },
  description:
    "Gefährdungsbeurteilungen und Betriebsanweisungen für Kleinbetriebe im Unternehmermodell verwalten.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <footer className="mt-10 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
            <p className="text-xs leading-relaxed text-slate-600">{HAFTUNGSHINWEIS}</p>
            <nav aria-label="Rechtliches" className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
              <Link className="text-marine-700 underline hover:text-marine-800" href="/impressum">
                Impressum
              </Link>
              <Link className="text-marine-700 underline hover:text-marine-800" href="/datenschutz">
                Datenschutz
              </Link>
              <span className="text-slate-400">Prototyp – keine Rechtsberatung</span>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
