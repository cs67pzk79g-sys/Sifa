"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nutzerErzwingen } from "@/lib/auth";
import { inhaltIstLeer, inhaltLesen, inhaltSchreiben } from "@/lib/dokument-inhalt";
import { BA_ABSCHNITTE } from "@/lib/dokument-inhalt";
import { leereFelderFuellen, vorbefuellungErzeugen } from "@/lib/vorbefuellung";
import { dokumentInhaltSchema, fehlerAusZod } from "@/lib/validation";
import type { FormZustand } from "@/lib/form-state";

function inhaltAusFormular(formular: FormData) {
  return dokumentInhaltSchema.safeParse({
    anwendungsbereich: String(formular.get("anwendungsbereich") ?? ""),
    gefahren: String(formular.get("gefahren") ?? ""),
    schutzmassnahmen: String(formular.get("schutzmassnahmen") ?? ""),
    verhaltenImGefahrfall: String(formular.get("verhaltenImGefahrfall") ?? ""),
    ersteHilfe: String(formular.get("ersteHilfe") ?? ""),
    entsorgung: String(formular.get("entsorgung") ?? ""),
  });
}

async function eigenesDokument(dokumentId: string) {
  const nutzer = await nutzerErzwingen();
  const dokument = await prisma.dokument.findFirst({
    where: { id: dokumentId, betriebId: nutzer.betriebId },
  });
  if (!dokument) throw new Error("Dokument nicht gefunden.");
  return dokument;
}

/**
 * Single entry point for the editor form. The submit button decides whether
 * the working copy is saved or published - publishing additionally requires
 * the confirmation checkbox, so a document can never become visible to readers
 * without an explicit, manual decision.
 */
export async function dokumentAbsenden(
  _vorher: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  const dokument = await eigenesDokument(String(formular.get("dokumentId") ?? ""));
  const geprueft = inhaltAusFormular(formular);
  if (!geprueft.success) return { fehler: fehlerAusZod(geprueft.error) };

  const inhalt = inhaltSchreiben(geprueft.data);
  const veroeffentlichen = formular.get("aktion") === "veroeffentlichen";

  if (!veroeffentlichen) {
    const unveraendert = inhalt === dokument.veroeffentlichterInhalt;
    await prisma.dokument.update({
      where: { id: dokument.id },
      data: {
        inhalt,
        status: unveraendert ? "VEROEFFENTLICHT" : "ENTWURF",
        version: unveraendert
          ? (dokument.veroeffentlichteVersion ?? dokument.version)
          : (dokument.veroeffentlichteVersion ?? 0) + 1,
      },
    });

    revalidatePath(`/gefahrstoffe/${dokument.gefahrstoffId}`);
    revalidatePath("/dashboard");
    return {
      erfolg: unveraendert
        ? "Gespeichert. Der Entwurf entspricht wieder der veröffentlichten Fassung."
        : "Entwurf gespeichert. Für Leser ist er noch nicht sichtbar.",
    };
  }

  if (formular.get("bestaetigt") !== "ja") {
    return {
      fehler:
        "Bitte bestätigen Sie, dass Sie den Inhalt fachlich geprüft haben. Ohne Bestätigung wird nicht veröffentlicht.",
    };
  }

  if (inhaltIstLeer(geprueft.data)) {
    return { fehler: "Ein leeres Dokument kann nicht veröffentlicht werden." };
  }

  const neueVersion =
    inhalt === dokument.veroeffentlichterInhalt
      ? (dokument.veroeffentlichteVersion ?? dokument.version)
      : (dokument.veroeffentlichteVersion ?? 0) + 1;

  await prisma.dokument.update({
    where: { id: dokument.id },
    data: {
      inhalt,
      veroeffentlichterInhalt: inhalt,
      veroeffentlichteVersion: neueVersion,
      version: neueVersion,
      status: "VEROEFFENTLICHT",
      veroeffentlichtAm: new Date(),
    },
  });

  revalidatePath(`/gefahrstoffe/${dokument.gefahrstoffId}`);
  revalidatePath("/dashboard");
  redirect(`/gefahrstoffe/${dokument.gefahrstoffId}?dokument=veroeffentlicht`);
}

/**
 * Fills the fields the user left empty from the latest safety data sheet and
 * the company context. Text the user already wrote is never overwritten.
 */
export async function vorbefuellungUebernehmen(
  _vorher: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  const dokument = await eigenesDokument(String(formular.get("dokumentId") ?? ""));

  const gefahrstoff = await prisma.gefahrstoff.findUnique({
    where: { id: dokument.gefahrstoffId },
    include: {
      kontext: true,
      sdbDokumente: { orderBy: { versionNummer: "desc" }, take: 1 },
    },
  });
  if (!gefahrstoff) return { fehler: "Gefahrstoff nicht gefunden." };

  const vorschlag = vorbefuellungErzeugen(
    gefahrstoff,
    gefahrstoff.kontext,
    gefahrstoff.sdbDokumente[0] ?? null,
  );
  if (!vorschlag.hatInhalt) {
    return {
      fehler:
        "Es gibt noch nichts zum Übertragen. Laden Sie zuerst ein Sicherheitsdatenblatt hoch oder erfassen Sie den betrieblichen Kontext.",
    };
  }

  // Work on what is currently in the form, so unsaved edits are not lost.
  const ausFormular = inhaltAusFormular(formular);
  const basis = ausFormular.success ? ausFormular.data : inhaltLesen(dokument.inhalt);

  const { inhalt, gefuellteFelder } = leereFelderFuellen(basis, vorschlag.inhalt);
  if (gefuellteFelder.length === 0) {
    return { erfolg: "Alle Felder sind bereits ausgefüllt - es wurde nichts überschrieben." };
  }

  await prisma.dokument.update({
    where: { id: dokument.id },
    data: { inhalt: inhaltSchreiben(inhalt), status: "ENTWURF" },
  });

  const namen = gefuellteFelder
    .map((key) => BA_ABSCHNITTE.find((a) => a.key === key)?.titel ?? key)
    .join(", ");

  revalidatePath(`/gefahrstoffe/${dokument.gefahrstoffId}`);
  return {
    erfolg: `Aus dem Sicherheitsdatenblatt übertragen: ${namen}. Bitte prüfen und kürzen - veröffentlicht wird nichts automatisch.`,
  };
}
