import Link from "next/link";
import { abmelden } from "@/app/actions/auth";
import { nutzerErzwingen } from "@/lib/auth";

const NAVIGATION = [
  { href: "/dashboard", label: "Übersicht" },
  { href: "/gefahrstoffe", label: "Gefahrstoffe" },
  { href: "/betrieb", label: "Betrieb" },
  { href: "/hilfe", label: "Hilfe" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const nutzer = await nutzerErzwingen();

  return (
    <div>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            {nutzer.betrieb.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={nutzer.betrieb.logoUrl}
                alt=""
                className="h-9 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-marine-700 text-sm font-bold text-white"
                aria-hidden="true"
              >
                AS
              </span>
            )}
            <span className="text-sm font-semibold text-slate-900">{nutzer.betrieb.name}</span>
          </Link>

          <nav aria-label="Hauptnavigation" className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
            {NAVIGATION.map((eintrag) => (
              <Link
                key={eintrag.href}
                href={eintrag.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {eintrag.label}
              </Link>
            ))}
          </nav>

          <form action={abmelden} className="ml-auto">
            <button type="submit" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Abmelden
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
