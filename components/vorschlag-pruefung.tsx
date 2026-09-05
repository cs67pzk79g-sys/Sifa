"use client";

import { useActionState } from "react";
import { LEERER_ZUSTAND, type FormZustand } from "@/lib/form-state";
import { Fehler } from "./ui";

/**
 * Review of a single change suggestion. The two decisions are ordinary submit
 * buttons - nothing here changes a document, it only records that a person
 * looked at the change.
 */
export function VorschlagPruefung({
  aktion,
  vorschlagId,
  notiz,
  bereitsGeprueft,
}: {
  aktion: (vorher: FormZustand, formular: FormData) => Promise<FormZustand>;
  vorschlagId: string;
  notiz: string;
  bereitsGeprueft: boolean;
}) {
  const [zustand, formularAktion, laeuft] = useActionState(aktion, LEERER_ZUSTAND);

  return (
    <form action={formularAktion} className="space-y-4">
      <input type="hidden" name="vorschlagId" value={vorschlagId} />
      <div>
        <label className="etikett" htmlFor="notiz">
          Notiz zur Prüfung (optional)
        </label>
        <textarea
          className="feld min-h-[80px]"
          id="notiz"
          name="notiz"
          defaultValue={notiz}
          maxLength={1000}
          placeholder="z. B. „Handschuhmaterial geprüft, Nitril weiterhin ausreichend – Betriebsanweisung Abschnitt Schutzmaßnahmen ergänzt.“"
        />
      </div>

      <Fehler>{zustand.fehler}</Fehler>

      {bereitsGeprueft ? (
        <button
          type="submit"
          name="entscheidung"
          value="zuruecksetzen"
          disabled={laeuft}
          className="knopf-sekundaer"
        >
          {laeuft ? "Wird gespeichert …" : "Prüfung zurücksetzen"}
        </button>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            name="entscheidung"
            value="uebernommen"
            disabled={laeuft}
            className="knopf-primaer"
          >
            {laeuft ? "Wird gespeichert …" : "Geprüft und eingearbeitet"}
          </button>
          <button
            type="submit"
            name="entscheidung"
            value="verworfen"
            disabled={laeuft}
            className="knopf-sekundaer"
          >
            Geprüft, nicht relevant
          </button>
        </div>
      )}
    </form>
  );
}
