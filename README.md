# Arbeitsschutz-Dokumentation für Kleinbetriebe (MVP)

Basisversion einer Web-Software, mit der Betriebe im **Unternehmermodell**
(ASiG / DGUV Vorschrift 2, Anlage 3) ihre Gefährdungsbeurteilungen und
Betriebsanweisungen verwalten.

Kernidee: Bei jeder neuen Lieferung eines Gefahrstoffs wird das aktuelle
**Sicherheitsdatenblatt (SDB)** hochgeladen. Die Software vergleicht es
abschnittsweise mit der Vorversion (16 Abschnitte nach REACH Art. 31, Anhang II),
erkennt Änderungen und zeigt einen **strukturierten Hinweis**, was in
Betriebsanweisung und Gefährdungsbeurteilung zu prüfen ist.

> **Die Software ändert nie automatisch etwas.** Jeder Hinweis ist als
> *Vorschlag – bitte prüfen* gekennzeichnet. Ein Dokument erreicht den Status
> „veröffentlicht" ausschließlich durch eine ausdrückliche, manuelle Bestätigung.

## Schnellstart

```bash
npm install
cp .env.example .env          # SESSION_SECRET setzen (siehe unten)
npm run db:push               # Datenbankschema anlegen
npm run db:seed               # Demo-Daten (optional, empfohlen)
npm run dev                   # http://localhost:3000
```

`SESSION_SECRET` erzeugen:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

**Demo-Zugang nach `npm run db:seed`:**

| | |
|---|---|
| E-Mail | `demo@betrieb.example` |
| Passwort | `arbeitsschutz2026` |

Die Demo enthält einen Betrieb, einen Gefahrstoff mit erfasstem Kontext, **zwei
SDB-Versionen** und eine veröffentlichte Betriebsanweisung, die noch dem alten
SDB entspricht – also genau die Situation, für die die offenen Vorschläge da
sind. Den Leser-Link zeigt das Seed-Skript am Ende an; er steht außerdem unter
*Betrieb → Leser-Zugang*.

## Kern-Workflow

1. **Betrieb anlegen** – Name, Branche, Logo (`/registrieren`, `/betrieb`)
2. **Gefahrstoff anlegen** und erstes SDB als PDF hochladen
3. **Betrieblichen Kontext erfassen** – geführter Fünf-Schritt-Flow, jede
   Antwort wird einzeln gespeichert
4. **Neue SDB-Version hochladen** – der Vergleich startet automatisch
5. **Abschnittsweiser Vergleich** – Tabelle über alle 16 Abschnitte plus
   Wort-Diff je geändertem Abschnitt
6. **Strukturierter Hinweis** – Abschnitt, Einstufung, betroffene
   Dokumentabschnitte, Kontextbezug und Prüffragen
7. **Manuell einarbeiten und veröffentlichen** – Editor nach TRGS 555 mit
   Bestätigungspflicht
8. **PDF-Export** mit Firmenlogo und Haftungshinweis
9. **Dashboard mit Ampel** – rot/gelb/grün nach offenem Handlungsbedarf
10. **Leser-Link** ohne Login – zeigt ausschließlich veröffentlichte Fassungen

## Ampel-Logik

| Farbe | Bedeutung |
|---|---|
| 🔴 Handlungsbedarf | Offener Vorschlag in einem sicherheitsrelevanten Abschnitt (2, 3, 4, 5, 6, 7, 8) **oder** keine veröffentlichte Betriebsanweisung |
| 🟡 Prüfen | Sonstige offene Vorschläge oder unveröffentlichte Entwurfsänderungen |
| 🟢 Aktuell | Alle Vorschläge geprüft, Dokumente veröffentlicht |

Die Einstufung je SDB-Abschnitt steht in `lib/sdb-abschnitte.ts` – dort liegen
auch die betroffenen Dokumentabschnitte und die Prüffragen.

## Technik

| Bereich | Wahl |
|---|---|
| Framework | Next.js (App Router), TypeScript, React Server Components + Server Actions |
| Styling | Tailwind CSS, System-Schriftarten (keine externen Fonts) |
| Datenbank | Prisma ORM – SQLite für die Entwicklung, PostgreSQL für den Betrieb |
| Auth | Eigene Credential-Auth: bcrypt-Hash + signiertes HttpOnly-Cookie (`jose`) |
| PDF-Text | `pdf-parse` (pdfjs) |
| Textvergleich | `diff` (Wort-Diff je Abschnitt) |
| PDF-Export | `pdf-lib` |
| Validierung | Zod |

**Abweichung vom Vorschlag im Briefing:** Statt NextAuth/Auth.js kommt eine
schlanke eigene Credential-Auth zum Einsatz (~90 Zeilen in `lib/auth.ts`). Für
genau eine Rolle ohne OAuth-Provider ist das weniger Abhängigkeit und weniger
Konfiguration. Ein späterer Wechsel zu Auth.js berührt nur `lib/auth.ts` und
`app/actions/auth.ts`.

### Von SQLite auf PostgreSQL wechseln

1. In `prisma/schema.prisma` `provider = "postgresql"` setzen
2. `DATABASE_URL` auf die Postgres-Instanz zeigen lassen (EU-Region)
3. `npx prisma migrate dev` ausführen

Das Schema nutzt bewusst keine providerspezifischen Spaltentypen: strukturierte
Inhalte (SDB-Abschnitte, Dokumentinhalte, Diffs) liegen als JSON-kodierte
`String`-Spalten, die beide Provider identisch behandeln.

### Dateiablage

Hochgeladene PDFs und Logos liegen als `Bytes` in der Datenbank
(Modell `Datei`). Das hält den Prototyp auf Plattformen mit schreibgeschütztem
Dateisystem (z. B. Vercel) lauffähig. Für den Produktivbetrieb sollte das auf
einen S3-kompatiblen Objektspeicher in der EU umgestellt werden – betroffen sind
nur `app/actions/betrieb.ts`, `app/actions/gefahrstoff.ts` und
`app/api/dateien/[id]/route.ts`.

## Projektstruktur

```
app/
  (admin)/            Angemeldeter Bereich (Dashboard, Gefahrstoffe, Betrieb)
  actions/            Server Actions (auth, betrieb, gefahrstoff, dokument)
  api/dateien/        Ausliefern gespeicherter Dateien (mit Zugriffsprüfung)
  api/export/         PDF-Export für Admins
  api/lesen/          PDF-Export über den Leser-Link
  lesen/[token]/      Login-freie Leseransicht
  impressum, datenschutz
lib/
  sdb-abschnitte.ts   Die 16 Abschnitte inkl. Einstufung und Prüffragen
  sdb-parser.ts       PDF-Textextraktion und Abschnittserkennung
  diff-service.ts     Abschnittsweiser Wort-Diff
  hinweis.ts          Regelbasierter strukturierter Hinweis (keine KI)
  ampel.ts            Ampel-Logik
  pdf-export.ts       PDF-Erzeugung mit Logo und Haftungshinweis
prisma/
  schema.prisma       Datenmodell
  seed.ts             Demo-Daten
  beispiel-sdb.ts     Zwei erfundene SDB-Versionen als echte PDFs
```

## Fachliche und rechtliche Leitplanken

- Die Software macht **ausschließlich Vorschläge**. Es gibt keinen Pfad, auf dem
  ein Dokument ohne manuelle Bestätigung veröffentlicht wird
  (`app/actions/dokument.ts`).
- Jeder abgeleitete Hinweis ist in der Oberfläche als *Vorschlag – bitte prüfen*
  gekennzeichnet (`components/ui.tsx`, `VorschlagBanner`).
- Im Footer **und auf jedem exportierten PDF** steht: Die rechtliche
  Verantwortung für Inhalt und Aktualität liegt beim Arbeitgeber
  (§ 3 GefStoffV); die Software unterstützt, ersetzt aber nicht die fachliche
  Prüfung.
- Die Verwaltung der Zugänge liegt beim Unternehmer: eine Rolle (ADMIN), keine
  Nutzergruppen, keine Freigabe-Workflows. Leser haben keinen Datensatz,
  sondern nur einen Link mit Zufalls-Token, der jederzeit erneuert werden kann.

### Datenschutz (DSGVO)

- Keine Analyse-, Tracking- oder Werbedienste; **keine externen CDNs, Fonts oder
  Skripte** – alles wird vom eigenen Server ausgeliefert.
- Nur ein technisch notwendiges Sitzungs-Cookie → kein Einwilligungsbanner nötig
  (§ 25 Abs. 2 Nr. 2 TDDDG).
- Passwörter ausschließlich als bcrypt-Hash (Kostenfaktor 12).
- Secrets nur über `.env`, nicht im Repository.

> **Vor einem Livegang zwingend:** `app/impressum/page.tsx` und
> `app/datenschutz/page.tsx` enthalten Platzhalter (`[BITTE ERGÄNZEN: …]`). Mit
> diesen Platzhaltern darf die Anwendung nicht öffentlich betrieben werden. Die
> Texte sind ein ungeprüfter Entwurf und ersetzen keine Rechtsberatung.

## Bewusst nicht Teil dieser Version

Keine KI-generierte Formulierung von Dokumenttexten · keine Mehrsprachigkeit ·
keine Fristenüberwachung oder Erinnerungsmails · kein eigenes
Gefahrstoffverzeichnis-Modul · keine granulare Rechteverwaltung · keine OCR für
eingescannte SDB (nur textbasierte PDFs) · keine Mobile-App (responsive Web,
auch für Tablets in Werkstatt und Lager).

## Bekannte Grenzen des Prototyps

- **Nur textbasierte PDFs.** Bei einem Scan meldet der Upload, dass kaum Text
  gefunden wurde, statt einen unbrauchbaren Vergleich zu erzeugen. Wie viele der
  16 Abschnitte erkannt wurden, steht bei jeder SDB-Version.
- **Abschnittserkennung per Regex** auf `ABSCHNITT n` / `SECTION n` mit Rückfall
  auf nummerierte Überschriften; Abschnitte müssen aufsteigend auftreten, damit
  Querverweise („siehe Abschnitt 8") nicht fälschlich als Überschrift zählen.
  Seitenmarkierungen werden entfernt, damit ein verschobener Seitenumbruch nicht
  als inhaltliche Änderung erscheint.
- **Der Vergleich ist rein mechanisch** (Wort-Diff). Er bewertet nicht, ob eine
  Änderung fachlich relevant ist – das entscheidet der Mensch.

## Skripte

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run build` / `npm start` | Produktionsbuild und -server |
| `npm run typecheck` | TypeScript prüfen |
| `npm run db:push` | Schema in die Datenbank übertragen |
| `npm run db:seed` | Demo-Daten anlegen |
| `npm run db:reset` | Datenbank zurücksetzen und neu befüllen |
