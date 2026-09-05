import { z } from "zod";

const pflichtText = (feld: string, max = 200) =>
  z
    .string()
    .trim()
    .min(1, `${feld} ist erforderlich.`)
    .max(max, `${feld} darf höchstens ${max} Zeichen lang sein.`);

export const registrierungSchema = z
  .object({
    betriebName: pflichtText("Betriebsname"),
    branche: pflichtText("Branche"),
    email: z.string().trim().toLowerCase().email("Bitte eine gültige E-Mail-Adresse angeben."),
    passwort: z.string().min(10, "Das Passwort muss mindestens 10 Zeichen lang sein.").max(200),
    passwortWiederholung: z.string(),
  })
  .refine((daten) => daten.passwort === daten.passwortWiederholung, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["passwortWiederholung"],
  });

export const anmeldungSchema = z.object({
  email: z.string().trim().toLowerCase().email("Bitte eine gültige E-Mail-Adresse angeben."),
  passwort: z.string().min(1, "Bitte das Passwort eingeben."),
});

export const betriebSchema = z.object({
  name: pflichtText("Betriebsname"),
  branche: pflichtText("Branche"),
});

export const gefahrstoffSchema = z.object({
  name: pflichtText("Name des Gefahrstoffs"),
  hersteller: pflichtText("Hersteller"),
});

export const kontextSchritte = [
  "taetigkeit",
  "arbeitsbereich",
  "mengeHaeufigkeit",
  "vorhandeneSchutzmassnahmen",
  "raeumlicheGegebenheiten",
] as const;

export type KontextSchritt = (typeof kontextSchritte)[number];

export const kontextFeldSchema = z.object({
  feld: z.enum(kontextSchritte),
  wert: z.string().trim().max(1000, "Bitte höchstens 1000 Zeichen."),
});

export const dokumentInhaltSchema = z.object({
  anwendungsbereich: z.string().max(5000),
  gefahren: z.string().max(5000),
  schutzmassnahmen: z.string().max(5000),
  verhaltenImGefahrfall: z.string().max(5000),
  ersteHilfe: z.string().max(5000),
  entsorgung: z.string().max(5000),
});

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export const ERLAUBTE_LOGO_TYPEN = ["image/png", "image/jpeg"];

export function fehlerAusZod(fehler: z.ZodError): string {
  return fehler.issues[0]?.message ?? "Die Eingabe ist ungültig.";
}
