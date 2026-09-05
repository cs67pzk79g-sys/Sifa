"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nutzerErzwingen } from "@/lib/auth";
import { sdbVerarbeiten } from "@/lib/sdb-parser";
import { vorschlaegeErzeugen } from "@/lib/vorschlaege";
import {
  fehlerAusZod,
  gefahrstoffSchema,
  kontextFeldSchema,
  kontextSchritte,
  MAX_UPLOAD_BYTES,
} from "@/lib/validation";
import type { FormZustand } from "@/lib/form-state";

/** Loads a substance and verifies it belongs to the logged in admin's company. */
async function eigenerGefahrstoff(gefahrstoffId: string) {
  const nutzer = await nutzerErzwingen();
  const gefahrstoff = await prisma.gefahrstoff.findFirst({
    where: { id: gefahrstoffId, betriebId: nutzer.betriebId },
  });
  if (!gefahrstoff) throw new Error("Gefahrstoff nicht gefunden.");
  return { nutzer, gefahrstoff };
}

export async function gefahrstoffAnlegen(
  _vorher: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  const nutzer = await nutzerErzwingen();
  const geprueft = gefahrstoffSchema.safeParse({
    name: formular.get("name"),
    hersteller: formular.get("hersteller"),
  });
  if (!geprueft.success) return { fehler: fehlerAusZod(geprueft.error) };

  const gefahrstoff = await prisma.gefahrstoff.create({
    data: { ...geprueft.data, betriebId: nutzer.betriebId },
  });

  revalidatePath("/gefahrstoffe");
  revalidatePath("/dashboard");
  redirect(`/gefahrstoffe/${gefahrstoff.id}`);
}

export async function gefahrstoffAktualisieren(
  _vorher: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  const id = String(formular.get("gefahrstoffId") ?? "");
  await eigenerGefahrstoff(id);

  const geprueft = gefahrstoffSchema.safeParse({
    name: formular.get("name"),
    hersteller: formular.get("hersteller"),
  });
  if (!geprueft.success) return { fehler: fehlerAusZod(geprueft.error) };

  await prisma.gefahrstoff.update({ where: { id }, data: geprueft.data });
  revalidatePath(`/gefahrstoffe/${id}`);
  revalidatePath("/gefahrstoffe");
  return { erfolg: "Gefahrstoff gespeichert." };
}

export async function gefahrstoffLoeschen(formular: FormData): Promise<void> {
  const id = String(formular.get("gefahrstoffId") ?? "");
  await eigenerGefahrstoff(id);

  await prisma.gefahrstoff.delete({ where: { id } });
  revalidatePath("/gefahrstoffe");
  revalidatePath("/dashboard");
  redirect("/gefahrstoffe");
}

export async function sdbHochladen(
  _vorher: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  const gefahrstoffId = String(formular.get("gefahrstoffId") ?? "");
  const { gefahrstoff } = await eigenerGefahrstoff(gefahrstoffId);

  const datei = formular.get("sdb");
  if (!(datei instanceof File) || datei.size === 0) {
    return { fehler: "Bitte eine PDF-Datei auswählen." };
  }
  if (datei.type !== "application/pdf") {
    return { fehler: "Bitte ein Sicherheitsdatenblatt im PDF-Format hochladen." };
  }
  if (datei.size > MAX_UPLOAD_BYTES) {
    return { fehler: "Die Datei darf höchstens 10 MB groß sein." };
  }

  const rohdaten = Buffer.from(await datei.arrayBuffer());

  let verarbeitet;
  try {
    verarbeitet = await sdbVerarbeiten(rohdaten);
  } catch {
    return {
      fehler:
        "Das PDF konnte nicht gelesen werden. Bitte ein textbasiertes PDF hochladen – eingescannte Blätter werden nicht unterstützt.",
    };
  }

  if (verarbeitet.text.trim().length < 200) {
    return {
      fehler:
        "In diesem PDF wurde kaum Text gefunden. Vermutlich handelt es sich um einen Scan. Bitte laden Sie die Originaldatei des Herstellers hoch (OCR wird nicht unterstützt).",
    };
  }

  const letzte = await prisma.sdbDokument.findFirst({
    where: { gefahrstoffId },
    orderBy: { versionNummer: "desc" },
  });
  const naechsteVersion = (letzte?.versionNummer ?? 0) + 1;

  const gespeicherteDatei = await prisma.datei.create({
    data: {
      dateiName: datei.name || `sdb-v${naechsteVersion}.pdf`,
      mimeTyp: "application/pdf",
      groesse: rohdaten.length,
      inhalt: rohdaten,
    },
  });

  const neuesSdb = await prisma.sdbDokument.create({
    data: {
      gefahrstoffId,
      dateiId: gespeicherteDatei.id,
      dateiUrl: `/api/dateien/${gespeicherteDatei.id}`,
      dateiName: gespeicherteDatei.dateiName,
      versionNummer: naechsteVersion,
      extrahierterText: verarbeitet.text,
      abschnitte: JSON.stringify(verarbeitet.abschnitte),
      erkannteAbschnitte: verarbeitet.erkannteAbschnitte,
    },
  });

  revalidatePath(`/gefahrstoffe/${gefahrstoffId}`);
  revalidatePath("/dashboard");

  if (!letzte) {
    return {
      erfolg: `Version 1 gespeichert. ${verarbeitet.erkannteAbschnitte} von 16 Abschnitten erkannt.`,
    };
  }

  await vorschlaegeErzeugen(gefahrstoff.id, letzte.id, neuesSdb.id);
  redirect(`/gefahrstoffe/${gefahrstoffId}/vergleich?alt=${letzte.id}&neu=${neuesSdb.id}`);
}

export async function kontextSpeichern(
  _vorher: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  const gefahrstoffId = String(formular.get("gefahrstoffId") ?? "");
  await eigenerGefahrstoff(gefahrstoffId);

  const geprueft = kontextFeldSchema.safeParse({
    feld: formular.get("feld"),
    wert: formular.get("wert"),
  });
  if (!geprueft.success) return { fehler: fehlerAusZod(geprueft.error) };

  const { feld, wert } = geprueft.data;
  await prisma.gefahrstoffKontext.upsert({
    where: { gefahrstoffId },
    create: { gefahrstoffId, [feld]: wert },
    update: { [feld]: wert },
  });

  revalidatePath(`/gefahrstoffe/${gefahrstoffId}`);

  const index = kontextSchritte.indexOf(feld);
  const naechsterSchritt = index + 2; // steps are 1-based in the URL
  if (naechsterSchritt <= kontextSchritte.length) {
    redirect(`/gefahrstoffe/${gefahrstoffId}/kontext?schritt=${naechsterSchritt}`);
  }
  redirect(`/gefahrstoffe/${gefahrstoffId}?kontext=fertig`);
}

export async function vorschlagBewerten(
  _vorher: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  const vorschlagId = String(formular.get("vorschlagId") ?? "");
  const entscheidung = String(formular.get("entscheidung") ?? "");
  const notiz = String(formular.get("notiz") ?? "").trim().slice(0, 1000);
  const nutzer = await nutzerErzwingen();

  const vorschlag = await prisma.aenderungsvorschlag.findFirst({
    where: { id: vorschlagId, gefahrstoff: { betriebId: nutzer.betriebId } },
  });
  if (!vorschlag) return { fehler: "Vorschlag nicht gefunden." };

  const status =
    entscheidung === "uebernommen"
      ? "GEPRUEFT_UEBERNOMMEN"
      : entscheidung === "verworfen"
        ? "GEPRUEFT_VERWORFEN"
        : entscheidung === "zuruecksetzen"
          ? "OFFEN"
          : null;
  if (!status) return { fehler: "Unbekannte Entscheidung." };

  await prisma.aenderungsvorschlag.update({
    where: { id: vorschlagId },
    data: {
      status,
      geprueftAm: status === "OFFEN" ? null : new Date(),
      notiz: notiz.length > 0 ? notiz : null,
    },
  });

  revalidatePath(`/gefahrstoffe/${vorschlag.gefahrstoffId}`);
  revalidatePath("/dashboard");
  redirect(`/gefahrstoffe/${vorschlag.gefahrstoffId}?vorschlag=geprueft`);
}
