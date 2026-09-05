import Link from "next/link";
import type { ReactNode } from "react";
import { AMPEL_STIL, type AmpelFarbe } from "@/lib/ampel";
import { VORSCHLAG_HINWEIS } from "@/lib/rechtstexte";

export function Karte({
  titel,
  aktion,
  beschreibung,
  children,
  className = "",
}: {
  titel?: string;
  aktion?: ReactNode;
  beschreibung?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`karte ${className}`}>
      {titel ? (
        <div className="karte-kopf">
          <div>
            <h2 className="karte-titel">{titel}</h2>
            {beschreibung ? <p className="mt-0.5 text-sm text-slate-500">{beschreibung}</p> : null}
          </div>
          {aktion}
        </div>
      ) : null}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function Ampel({ farbe, klein = false }: { farbe: AmpelFarbe; klein?: boolean }) {
  const stil = AMPEL_STIL[farbe];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-medium ${stil.hintergrund} ${stil.text} ${
        klein ? "text-xs" : "text-sm"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${stil.punkt}`} aria-hidden="true" />
      {stil.label}
    </span>
  );
}

export function StatusMarke({
  ton,
  children,
}: {
  ton: "neutral" | "gruen" | "gelb" | "rot" | "blau";
  children: ReactNode;
}) {
  const toene = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    gruen: "bg-emerald-50 text-emerald-800 border-emerald-200",
    gelb: "bg-amber-50 text-amber-900 border-amber-200",
    rot: "bg-red-50 text-red-800 border-red-200",
    blau: "bg-marine-50 text-marine-800 border-marine-200",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toene[ton]}`}>
      {children}
    </span>
  );
}

/**
 * Every automatically derived statement carries this banner. It must stay
 * visually distinct from confirmed content - the software only suggests.
 */
export function VorschlagBanner({ className = "" }: { className?: string }) {
  return (
    <p
      className={`hinweis-box border-amber-300 bg-amber-50 text-amber-900 ${className}`}
      role="note"
    >
      <span className="font-semibold">Vorschlag – bitte prüfen.</span>{" "}
      <span className="text-amber-900/90">{VORSCHLAG_HINWEIS.replace("Vorschlag – bitte prüfen. ", "")}</span>
    </p>
  );
}

export function Fehler({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="hinweis-box border-red-200 bg-red-50 text-red-800" role="alert">
      {children}
    </p>
  );
}

export function Erfolg({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="hinweis-box border-emerald-200 bg-emerald-50 text-emerald-800" role="status">
      {children}
    </p>
  );
}

export function Leer({ children }: { children: ReactNode }) {
  return <p className="py-2 text-sm text-slate-500">{children}</p>;
}

export function Zurueck({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-marine-700 hover:text-marine-800 hover:underline"
    >
      <span aria-hidden="true">&larr;</span>
      {children}
    </Link>
  );
}

export function Beschriftet({ label, wert }: { label: string; wert: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{wert}</dd>
    </div>
  );
}

export function datumFormatieren(datum: Date | null | undefined): string {
  if (!datum) return "–";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(datum);
}

export function datumZeitFormatieren(datum: Date | null | undefined): string {
  if (!datum) return "–";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(datum);
}
