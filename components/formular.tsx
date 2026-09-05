"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { LEERER_ZUSTAND, type FormZustand } from "@/lib/form-state";
import { Erfolg, Fehler } from "./ui";

type Aktion = (vorher: FormZustand, formular: FormData) => Promise<FormZustand>;

/**
 * Thin wrapper around useActionState so that every form in the app reports
 * errors and success the same way. The fields themselves are passed as
 * children, which keeps the individual pages readable.
 */
export function AktionsFormular({
  aktion,
  absendenText,
  children,
  className = "space-y-4",
  ladeText = "Wird gespeichert …",
  variante = "primaer",
  zusatzAktion,
}: {
  aktion: Aktion;
  absendenText: string;
  children?: ReactNode;
  className?: string;
  ladeText?: string;
  variante?: "primaer" | "sekundaer";
  zusatzAktion?: ReactNode;
}) {
  const [zustand, formularAktion, laeuft] = useActionState(aktion, LEERER_ZUSTAND);

  return (
    <form action={formularAktion} className={className}>
      {children}
      <Fehler>{zustand.fehler}</Fehler>
      <Erfolg>{zustand.erfolg}</Erfolg>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={laeuft}
          className={variante === "primaer" ? "knopf-primaer" : "knopf-sekundaer"}
        >
          {laeuft ? ladeText : absendenText}
        </button>
        {zusatzAktion}
      </div>
    </form>
  );
}

/** Submit button that asks for confirmation first (delete, publish, discard). */
export function BestaetigenKnopf({
  text,
  frage,
  className = "knopf-gefahr",
  name,
  wert,
}: {
  text: string;
  frage: string;
  className?: string;
  name?: string;
  wert?: string;
}) {
  return (
    <button
      type="submit"
      name={name}
      value={wert}
      className={className}
      onClick={(ereignis) => {
        if (!window.confirm(frage)) ereignis.preventDefault();
      }}
    >
      {text}
    </button>
  );
}

/** Copy-to-clipboard for the reader link. */
export function KopierKnopf({ wert, text = "Link kopieren" }: { wert: string; text?: string }) {
  return (
    <button
      type="button"
      className="knopf-sekundaer"
      onClick={async (ereignis) => {
        const knopf = ereignis.currentTarget;
        try {
          await navigator.clipboard.writeText(wert);
          knopf.textContent = "Kopiert";
          window.setTimeout(() => {
            knopf.textContent = text;
          }, 2000);
        } catch {
          knopf.textContent = "Kopieren nicht möglich";
        }
      }}
    >
      {text}
    </button>
  );
}
