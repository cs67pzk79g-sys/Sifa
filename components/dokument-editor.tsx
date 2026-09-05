"use client";

import { useActionState, useState } from "react";
import { BA_ABSCHNITTE, type DokumentInhalt } from "@/lib/dokument-inhalt";
import { LEERER_ZUSTAND, type FormZustand } from "@/lib/form-state";
import { Erfolg, Fehler } from "./ui";

/**
 * Editor for an operating instruction / risk assessment.
 *
 * Two submit buttons share one form: saving a draft, and publishing. Publishing
 * is only accepted together with the confirmation checkbox - there is no path
 * in this app where a document becomes published without that click.
 */
export function DokumentEditor({
  aktion,
  dokumentId,
  inhalt,
  bereitsVeroeffentlicht,
}: {
  aktion: (vorher: FormZustand, formular: FormData) => Promise<FormZustand>;
  dokumentId: string;
  inhalt: DokumentInhalt;
  bereitsVeroeffentlicht: boolean;
}) {
  const [zustand, formularAktion, laeuft] = useActionState(aktion, LEERER_ZUSTAND);
  const [bestaetigt, setBestaetigt] = useState(false);

  return (
    <form action={formularAktion} className="space-y-5">
      <input type="hidden" name="dokumentId" value={dokumentId} />

      {BA_ABSCHNITTE.map((abschnitt) => (
        <div key={abschnitt.key} className="karte px-5 py-4">
          <label className="etikett text-[15px]" htmlFor={abschnitt.key}>
            {abschnitt.titel}
          </label>
          <p className="mb-2 text-xs text-slate-500">{abschnitt.hilfe}</p>
          <textarea
            className="feld min-h-[130px]"
            id={abschnitt.key}
            name={abschnitt.key}
            defaultValue={inhalt[abschnitt.key]}
            maxLength={5000}
          />
        </div>
      ))}

      <Fehler>{zustand.fehler}</Fehler>
      <Erfolg>{zustand.erfolg}</Erfolg>

      <div className="karte space-y-4 px-5 py-4">
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            name="aktion"
            value="entwurf"
            disabled={laeuft}
            className="knopf-sekundaer"
          >
            {laeuft ? "Wird gespeichert …" : "Entwurf speichern"}
          </button>
          <button
            type="submit"
            name="aktion"
            value="veroeffentlichen"
            disabled={laeuft || !bestaetigt}
            className="knopf-primaer"
          >
            {bereitsVeroeffentlicht ? "Neue Version veröffentlichen" : "Veröffentlichen"}
          </button>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="bestaetigt"
            value="ja"
            checked={bestaetigt}
            onChange={(ereignis) => setBestaetigt(ereignis.target.checked)}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            Ich habe den Inhalt fachlich geprüft und übernehme als Arbeitgeber die Verantwortung für
            Richtigkeit und Aktualität (§ 3 GefStoffV). Erst dann wird veröffentlicht.
          </span>
        </label>
      </div>
    </form>
  );
}
