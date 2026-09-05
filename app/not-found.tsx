import Link from "next/link";

export const metadata = { title: "Seite nicht gefunden" };

export default function NichtGefunden() {
  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Seite nicht gefunden</h1>
      <p className="mt-2 text-sm text-slate-600">
        Diese Adresse gibt es nicht – oder der verwendete Link ist nicht mehr gültig.
      </p>
      <Link className="knopf-primaer mt-6" href="/">
        Zur Startseite
      </Link>
    </main>
  );
}
