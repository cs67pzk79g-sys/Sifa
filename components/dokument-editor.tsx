"use client";

import { useActionState, useState } from "react";
import { BA_ABSCHNITTE, type DokumentInhalt } from "@/lib/dokument-inhalt";
import { LEERER_ZUSTAND, type FormZustand } from "@/lib/form-state";
import type { Quellen } from "@/lib/vorbefuellung";
import { Erfolg, Fehler } from "./ui";

type Aktion = (vorher: FormZustand, formular: FormData) => Promise<FormZustand>;

/**
 * Editor for an operating instruction / risk assessment.
 *
 * Two submit buttons share one form: saving a draft, and publishing. Publishing
 * is only accepted together with the confirmation checkbox - there is no path
 * in this app where a document becomes published without that click.
 *
 * A third button transfers the safety data sheet into the empty fields. It uses
 * formAction so it posts the current form contents, which keeps unsaved edits.
 */
export function DokumentEditor({
  aktion,
  uebernehmenAktion,
  dokumentId,
  inhalt,
  quellen,
  bereitsVeroeffentlicht,
  vorbefuelltHinweis,
}: {
  aktion: Aktion;
  uebernehmenAktion: Aktion;
  dokumentId: string;
  inhalt: DokumentInhalt;
  quellen: Quellen;
  bereitsVeroeffentlicht: boolean;
  vorbefuelltHinweis: boolean;
}) {
  const [zustand, formularAktion, laeuft] = useActionState(aktion, LEERER_ZUSTAND);
  const [uebernahme, uebernahmeAktion, uebernahmeLaeuft] = useActionState(
    uebernehmenAktion,
    LEERER_ZUSTAND,
  );
  const [bestaetigt, setBestaetigt] = useState(false);
  const beschaeftigt = laeuft || uebernahmeLaeuft;

  return (
    <form action={formularAktion} className="space-y-5">
      <input type="hidden" name="dokumentId" value={dokumentId} />

      {vorbefuelltHinweis ? (
        <p className="hinweis-box border-amber-300 bg-amber-50 text-amber-900" role="note">
          <span className="font-semibold">Vorschlag – bitte prüfen.</span> Dieser Entwurf wurde aus
          dem Sicherheitsdatenblatt und Ihrem betrieblichen Kontext übertragen. Die Texte stammen
          wörtlich aus dem SDB, sind also vollständig, aber noch nicht auf Ihren Betrieb gekürzt.
          Streichen Sie, was nicht zutrifft, und ergänzen Sie, was fehlt.
        </p>
      ) : null}

      {BA_ABSCHNITTE.map((abschnitt) => {
        const herkunft = quellen[abschnitt.key] ?? [];
        return (
          <div key={abschnitt.key} className="karte px-5 py-4">
            <label className="etikett text-[15px]" htmlFor={abschnitt.key}>
              {abschnitt.titel}
            </label>
            <p className="mb-2 text-xs text-slate-500">
              {abschnitt.hilfe}
              {herkunft.length > 0 ? (
                <span className="ml-1 text-slate-400">· Zum Nachlesen: {herkunft.join(", ")}</span>
              ) : null}
            </p>
            <textarea
              className="feld min-h-[130px]"
              id={abschnitt.key}
              name={abschnitt.key}
              defaultValue={inhalt[abschnitt.key]}
              maxLength={5000}
            />
          </div>
        );
      })}

      <Fehler>{zustand.fehler ?? uebernahme.fehler}</Fehler>
      <Erfolg>{zustand.erfolg ?? uebernahme.erfolg}</Erfolg>

      <div className="karte space-y-4 px-5 py-4">
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            name="aktion"
            value="entwurf"
            disabled={beschaeftigt}
            className="knopf-sekundaer"
          >
            {laeuft ? "Wird gespeichert …" : "Entwurf speichern"}
          </button>
          <button
            type="submit"
            formAction={uebernahmeAktion}
            disabled={beschaeftigt}
            className="knopf-sekundaer"
          >
            {uebernahmeLaeuft ? "Wird übertragen …" : "Leere Felder aus SDB befüllen"}
          </button>
          <button
            type="submit"
            name="aktion"
            value="veroeffentlichen"
            disabled={beschaeftigt || !bestaetigt}
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
