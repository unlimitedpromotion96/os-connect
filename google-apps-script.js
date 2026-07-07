/**
 * OS-Connect Auftragsempfang – Google Apps Script
 * -------------------------------------------------
 * Empfängt den unterschriebenen osnatel-Auftrag von os-connect.de
 * und schickt ihn als PDF-Anhang an dein Gmail-Postfach.
 *
 * EINRICHTUNG (einmalig, ca. 3 Minuten):
 * 1. https://script.google.com öffnen (mit unlimited.promotion96@gmail.com angemeldet)
 * 2. "Neues Projekt" -> den kompletten Inhalt dieser Datei hineinkopieren
 * 3. Oben rechts "Bereitstellen" -> "Neue Bereitstellung"
 *    - Typ (Zahnrad): "Web-App"
 *    - Ausführen als: "Ich"
 *    - Zugriff: "Jeder"
 *    -> "Bereitstellen" und die Berechtigungen bestätigen
 * 4. Die angezeigte Web-App-URL kopieren (endet auf /exec)
 *    und Claude geben – sie wird als webhookUrl in js/formular.js eingetragen.
 */

var EMPFAENGER = 'unlimited.promotion96@gmail.com';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var pdf = Utilities.newBlob(
      Utilities.base64Decode(data.pdf),
      'application/pdf',
      data.dateiname || 'osnatel-Auftrag.pdf'
    );

    MailApp.sendEmail({
      to: EMPFAENGER,
      subject: 'Neuer osnatel-Auftrag: ' + (data.name || 'Unbekannt') + ' (' + (data.status || '') + ')',
      body:
        'Neuer Auftrag über os-connect.de\n\n' +
        'Name:         ' + (data.name || '-') + '\n' +
        'Kundenstatus: ' + (data.status || '-') + '\n' +
        'Telefon:      ' + (data.telefon || '-') + '\n' +
        'E-Mail:       ' + (data.email || '-') + '\n' +
        'Tarif:        ' + (data.tarif || '-') + '\n\n' +
        'Das unterschriebene Auftrags-PDF hängt an.',
      attachments: [pdf]
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
