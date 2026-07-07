# OS-Connect Website (os-connect.de)

Statische Website mit Landingpage, Leistungsseite und interaktivem PDF-Formular
(online ausfüllen + digital unterschreiben, komplett im Browser — kein Server nötig).

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Landingpage (Hero, Leistungen, Ablauf, Kontakt) |
| `leistungen.html` | Info-/Leistungsseite |
| `formular.html` | Interaktives PDF-Formular mit Unterschrift |
| `impressum.html` | Impressum — **Platzhalter ausfüllen!** |
| `datenschutz.html` | Datenschutzerklärung — **Platzhalter ausfüllen!** |

## Vor dem Livegang — Checkliste

1. **Impressum & Datenschutz**: Platzhalter `[...]` in `impressum.html` und `datenschutz.html` durch echte Angaben ersetzen (gesetzlich Pflicht!).
2. **Kontaktdaten**: Telefonnummer in `index.html` (Abschnitt „Kontakt") eintragen.
3. **Texte anpassen**: Die Leistungsbeschreibungen sind bewusst allgemein gehalten — gerne konkretisieren.

## Eigenes PDF-Formular einbinden

Das aktuelle `assets/formular.pdf` ist ein Beispiel. Eigenes PDF verwenden:

1. Das eigene PDF (mit ausfüllbaren Formularfeldern / AcroForm) als `assets/formular.pdf` ablegen.
   Die Felder werden auf der Formular-Seite **automatisch erkannt** und als Eingabefelder angezeigt.
2. In `js/formular.js` oben in `CONFIG`:
   - `labels`: schöne Beschriftungen für die Feldnamen eintragen.
   - `signature`: Position der Unterschrift im PDF anpassen (`page`, `x`, `y` — Ursprung ist unten links, A4 = 595×842 Punkte).

Hat das PDF keine Formularfelder, kann es trotzdem unterschrieben und heruntergeladen werden.

## Formular für Kunden vorausfüllen (personalisierte Links)

Alle Formularfelder lassen sich über URL-Parameter vorausfüllen — praktisch, um
einem Kunden einen fertigen Link zu schicken. Parameter = Feldname im PDF:

```text
https://www.os-connect.de/formular.html?name=Max Mustermann&email=max@beispiel.de&telefon=0541 123456&tarif=OS-Connect M
```

- Beim Tarif reicht ein Teil des Namens (z. B. `tarif=OS-Connect M`) — die passende
  Option wird automatisch gewählt.
- Die „Jetzt bestellen"-Buttons der Tarifkarten auf der Startseite nutzen genau
  diesen Mechanismus.
- Der Kunde sieht den Hinweis, dass Felder vorausgefüllt wurden, und kann alles noch ändern.

## Tarife anpassen

Die Tarifkarten stehen in `index.html` (Abschnitt „Tarife"), die zugehörigen
Optionen des PDF-Dropdowns im PDF selbst (`assets/formular.pdf`). Wenn du eigene
Tarife/Preise einträgst: sowohl die Karten als auch die Dropdown-Optionen im PDF
anpassen (bzw. sag Claude Bescheid — das Beispiel-PDF wird per Skript erzeugt).

## E-Mail-Versand: zuverlässiger Weg über Google Apps Script (empfohlen)

formsubmit.co stellte sich als unzuverlässig bei der Zustellung an Gmail heraus.
Der robuste Weg läuft über ein kleines Skript im eigenen Google-Konto:

1. Anleitung in `google-apps-script.js` befolgen (script.google.com, ca. 3 Minuten)
2. Die Web-App-URL (endet auf `/exec`) in `js/formular.js` bei `CONFIG.webhookUrl` eintragen
3. Fertig – jeder abgesendete Auftrag landet mit PDF-Anhang direkt im Gmail-Postfach

Solange `webhookUrl` leer ist, versucht die Seite den Versand über formsubmit.co
(erfordert dort eine bestätigte Aktivierung).

## E-Mail-Versand aktivieren (optional)

Standardmäßig lädt der Kunde das fertige PDF nur herunter. Damit es zusätzlich
automatisch per E-Mail an dich geht:

1. In `js/formular.js` bei `CONFIG.emailTo` deine E-Mail eintragen, z. B. `'info@os-connect.de'`.
2. Einmalig das Formular selbst absenden — der Dienst [formsubmit.co](https://formsubmit.co)
   (kostenlos) schickt dir eine Bestätigungs-E-Mail. Nach der Bestätigung kommen alle
   Aufträge inkl. PDF-Anhang automatisch in dein Postfach.

## Veröffentlichen über GitHub Pages

1. Neues GitHub-Repository erstellen und diesen Ordner hochladen (pushen).
2. Im Repository: **Settings → Pages → Source: Deploy from a branch**, Branch `main`, Ordner `/ (root)`.
3. Unter **Settings → Pages → Custom domain** `www.os-connect.de` eintragen
   (die Datei `CNAME` liegt schon bereit) und „Enforce HTTPS" aktivieren.
4. Beim Domain-Anbieter (wo os-connect.de registriert ist) DNS setzen:
   - `www` → CNAME auf `<github-benutzername>.github.io`
   - Hauptdomain `os-connect.de` → A-Records auf GitHub Pages:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`

## SEO

Bereits eingebaut: Meta-Descriptions, Open-Graph-Tags, Canonical-URLs, `sitemap.xml`,
`robots.txt`, strukturierte Daten (schema.org LocalBusiness), semantisches HTML, mobile-optimiert.
Nach dem Livegang: Website bei der [Google Search Console](https://search.google.com/search-console)
anmelden und die Sitemap einreichen.

## Lokal testen

```bash
cd OS-Connect
python3 -m http.server 8000
# dann http://localhost:8000 im Browser öffnen
```
