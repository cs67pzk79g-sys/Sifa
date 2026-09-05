import type { DiffTeil } from "@/lib/diff-service";

/**
 * Shortens long unchanged passages so that the actual change stays visible.
 * The full section text remains available in the linked original PDF.
 */
function kontextKuerzen(teile: DiffTeil[], umgebung = 180): DiffTeil[] {
  return teile.map((teil, index) => {
    if (teil.art !== "gleich" || teil.text.length <= umgebung * 2) return teil;

    const ersterTeil = index === 0;
    const letzterTeil = index === teile.length - 1;

    if (ersterTeil) return { ...teil, text: `… ${teil.text.slice(-umgebung)}` };
    if (letzterTeil) return { ...teil, text: `${teil.text.slice(0, umgebung)} …` };
    return {
      ...teil,
      text: `${teil.text.slice(0, umgebung)} … ${teil.text.slice(-umgebung)}`,
    };
  });
}

export function DiffAnsicht({ teile, gekuerzt = true }: { teile: DiffTeil[]; gekuerzt?: boolean }) {
  const anzuzeigen = gekuerzt ? kontextKuerzen(teile) : teile;

  return (
    <div className="space-y-3">
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-200" aria-hidden="true" />
          entfernt (alte Version)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-200" aria-hidden="true" />
          neu (aktuelle Version)
        </span>
      </p>
      <p className="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
        {anzuzeigen.map((teil, index) => {
          if (teil.art === "gleich") return <span key={index}>{teil.text}</span>;
          if (teil.art === "entfernt") {
            return (
              <del key={index} className="mx-0.5 rounded bg-red-100 px-1 text-red-900 decoration-red-400">
                {teil.text}
              </del>
            );
          }
          return (
            <ins key={index} className="mx-0.5 rounded bg-emerald-100 px-1 font-medium text-emerald-900 no-underline">
              {teil.text}
            </ins>
          );
        })}
      </p>
    </div>
  );
}
