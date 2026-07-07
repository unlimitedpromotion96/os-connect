/* =========================================================================
   OS-Connect – Interaktives osnatel-Auftragsformular (Glasfaser)
   Lädt das offizielle PDF (AcroForm), zeigt die kundenrelevanten Felder
   gruppiert als Web-Formular, setzt die Unterschrift an allen nötigen
   Stellen ein und erzeugt das fertige PDF.
   ========================================================================= */

// ======================= KONFIGURATION ===================================
var CONFIG = {
  pdfUrl: 'assets/formular.pdf',

  // E-Mail-Versand über formsubmit.co (kostenlos, unterstützt PDF-Anhänge).
  // Eigene E-Mail-Adresse eintragen zum Aktivieren, z.B. 'info@os-connect.de'.
  // Leer lassen ('') = Button "Per E-Mail absenden" wird ausgeblendet.
  emailTo: '',

  // Unterschriftsfelder im PDF: wo die gemalte Unterschrift eingesetzt wird.
  // when: 'always' | Funktion, die anhand der Eingaben entscheidet
  signatureFields: [
    { name: '16_Unterschrift', when: 'always' },                     // Hauptauftrag (S.4)
    { name: 'SEPA_Unterschrift', when: 'sepa' },                     // SEPA-Mandat (S.5)
    { name: '7-2_Unterschrift', when: 'portierung' }                 // Anbieterwechsel (S.3)
  ]
};

// Abschnitte des Web-Formulars. Nur diese Felder werden angezeigt –
// alle übrigen Felder des PDFs bleiben leer.
var FORM_SECTIONS = [
  {
    title: 'Auftragsart',
    fields: [
      { name: '1_Auftragsart', label: 'Art des Auftrags', options: { neu: 'Neuauftrag', Aenderung: 'Änderungsauftrag', Umzug: 'Umzug', Datenaufnahme: 'Aufnahme meiner Daten (Bestellung erfolgt im Nachgang)' } },
      { name: '1_Kundennummer', label: 'Kunden-/Vertragsnummer (falls zur Hand)', bestand: true }
    ]
  },
  {
    title: 'Terminwunsch (unverbindlich)',
    fields: [
      { name: '2_Termin', label: 'Gewünschter Termin', options: { asap: 'Schnellstmöglich', Datum: 'Ab Wunschdatum' } },
      { name: '2_Datum', label: 'Wunschdatum (falls gewählt)' }
    ]
  },
  {
    title: 'Ihre Daten (Auftraggeber:in)',
    fields: [
      { name: '3_Vorname', label: 'Vorname', bestand: true, row: 'name' },
      { name: '3_Name', label: 'Nachname (ggf. Titel)', bestand: true, row: 'name' },
      { name: '3_Datum', label: 'Geburtsdatum' },
      { name: '3_PLZ', label: 'PLZ', bestand: true, row: 'plz' },
      { name: '3_Ort', label: 'Ort', bestand: true, row: 'plz' },
      { name: '3_Str', label: 'Straße', bestand: true, row: 'str' },
      { name: '3_Hausnummer', label: 'Hausnummer', bestand: true, row: 'str' },
      { name: '3_Kennwort', label: 'Persönliches Kennwort (für telefonische Rückfragen)' }
    ]
  },
  {
    title: 'Kontakt für Rückfragen',
    fields: [
      { name: '4_Name', label: 'Ansprechpartner:in (nur falls abweichend)' },
      { name: '4_Telefon', label: 'Telefon' },
      { name: '4_Mobil', label: 'Mobiltelefon' },
      { name: '4_E-Mail', label: 'E-Mail-Adresse' }
    ]
  },
  {
    title: 'Anschlussanschrift (nur falls abweichend)',
    fields: [
      { name: '5-1_PLZ', label: 'PLZ', row: 'plz' },
      { name: '5-1_Ort', label: 'Ort', row: 'plz' },
      { name: '5-1_Str', label: 'Straße', row: 'str' },
      { name: '5-1_Hausnummer', label: 'Hausnummer', row: 'str' }
    ]
  },
  {
    title: 'Glasfaser-Hausanschluss',
    fields: [
      { name: '5-3_ONT', label: 'Glasfaser-Hausanschluss', options: { vorhanden: 'Ist vorhanden', installieren: 'Habe ich beauftragt / werde ich beauftragen' } },
      { name: '5-3_LageONT', label: 'Lage der Glasfaser-Dose (z.B. EFH/MFH, Etage, Raum)' },
      { name: '5-3_Home-ID', label: 'Home-ID (falls bekannt)' }
    ]
  },
  {
    title: 'Vormieter:in (soweit bekannt)',
    fields: [
      { name: '5-4_Vormieter', label: 'Vor- & Nachname bzw. Firma' },
      { name: '5-4_Telefon', label: 'Telefonnummer (falls unbekannt: 0000)' },
      { name: '5-4_Check_Anschluss', label: 'Ich übernehme den Anschluss von meinem/meiner Vormieter:in' }
    ]
  },
  {
    title: 'Ihr Glasfaser-Tarif & Router',
    fields: [
      { name: '6-2_Produkt', label: 'Glasfaser-Paket', bestand: true, row: 'tarif', onlyListed: true, options: {
        '100': 'Glasfaser 150 – 19,99 €/Mon., ab dem 4. Monat 43,99 €',
        '300': 'Glasfaser 300 – 19,99 €/Mon., ab dem 4. Monat 48,99 €',
        '500': 'Glasfaser 600 – 19,99 €/Mon., ab dem 4. Monat 58,99 €',
        '1000': 'Glasfaser 1.000 – 19,99 €/Mon., ab dem 4. Monat 68,99 €'
      } },
      { name: '6-4_Hardware', label: 'Router', bestand: true, row: 'tarif', hardwareCombo: [
        { v: 'Basisbox|Ratenkauf', label: 'FRITZ!Box 5630 (Basisbox) – Kauf auf Raten, 6,99 €/Mon. (24 Monate)' },
        { v: 'Basisbox|einmalig', label: 'FRITZ!Box 5630 (Basisbox) – einmaliger Kauf, 159,99 €' },
        { v: 'Premiumbox|Ratenkauf', label: 'FRITZ!Box 5690 (Premiumbox) – Kauf auf Raten, 7,99 €/Mon. (24 Monate)' },
        { v: 'Premiumbox|einmalig', label: 'FRITZ!Box 5690 (Premiumbox) – einmaliger Kauf, 209,99 €' },
        { v: 'Eigenes', label: 'Eigenes Gerät (0 €)' }
      ] },
      { name: '6-1_Check_Aktion', label: 'Ich nehme an einer Aktion teil' },
      { name: '6-1_Aktion', label: 'Aktionsname (falls zutreffend)' },
      { name: '6-1_Check_Bonus', label: 'Ich habe einen Bonuscode' },
      { name: '6-1_Bonuscode', label: 'Bonuscode (falls vorhanden)' }
    ]
  },
  {
    title: 'TV & Optionen',
    fields: [
      { name: '6-3_Check_ZuhauseTV', label: 'ZuhauseTV – 9,99 €/Monat (inkl. UHD-Receiver, einmalig 49,99 €)' },
      { name: '6-3_Check_weitereReceiver', label: 'Weitere UHD-Receiver – einmalig 99,99 € pro Stück' },
      { name: '6-3_Anzahl', label: 'Anzahl weiterer Receiver (max. 4)' },
      { name: '6-3_Check_Aufnahmespeicher', label: 'Aufnahmespeicher dazubuchen' },
      { name: '6-3_Check_Aufnahmespeicher-100', label: 'Aufnahmespeicher +100 Stunden' },
      { name: '6-3_Check_Aufnahmespeicher-200', label: 'Aufnahmespeicher +200 Stunden' },
      { name: '6-3_Check_Mobilfunkflatrate', label: 'Mobilfunk-Flatrate' }
    ]
  },
  {
    title: 'Bisheriger Anschluss & Rufnummernmitnahme',
    fields: [
      { name: '7-1_Anschluss', label: 'Anschluss', options: { neu: 'Ich beauftrage einen neuen Anschluss', vorhanden: 'Ich habe bereits einen Anschluss (Anbieterwechsel)' } },
      { name: '7-1_Anbieter', label: 'Bisheriger Netzbetreiber', options: { Telekom: 'Telekom Deutschland GmbH', Anderer: 'Anderer Betreiber' } },
      { name: '7-1_Betreiber', label: 'Name des anderen Betreibers' },
      { name: '7-5_Check_Rufnummeruebernahme', label: 'Ich möchte meine Rufnummer(n) mitnehmen' },
      { name: '7-5_Vorwahl', label: 'Vorwahl' },
      { name: '7-5_Check_Nummer-1', label: 'Rufnummer 1 mitnehmen' },
      { name: '7-5_Nummer-1', label: 'Rufnummer 1' },
      { name: '7-5_Check_Nummer-2', label: 'Rufnummer 2 mitnehmen' },
      { name: '7-5_Nummer-2', label: 'Rufnummer 2' },
      { name: '7-2_vorname', label: 'Bisherige:r Anschlussinhaber:in – Vorname (nur falls abweichend)' },
      { name: '7-2_Name', label: 'Bisherige:r Anschlussinhaber:in – Nachname (nur falls abweichend)' }
    ]
  },
  {
    title: 'Wunsch-E-Mail-Adresse & Rechnung',
    fields: [
      { name: '8_E-Mail', label: 'Wunsch-E-Mail-Adresse (…@ewe.net)' },
      { name: '9-1_Check_Onlinerechnung', label: 'Online-Rechnung (per E-Mail-Benachrichtigung)' },
      { name: '9-1_E-Mail', label: 'E-Mail-Adresse für die Online-Rechnung' },
      { name: '9-1_Check_Postrechnung', label: 'Rechnung per Post' },
      { name: '9-2_EVN', label: 'Einzelverbindungsnachweis (EVN)', options: { kein: 'Kein EVN', ungekuerzt: 'EVN mit ungekürzten Rufnummern', gekuerzt: 'EVN mit gekürzten Rufnummern' } }
    ]
  },
  {
    title: 'Telefonbucheintrag',
    fields: [
      { name: '10_Eintrag', label: 'Telefonbucheintrag', options: { kein: 'Kein Eintrag', ja: 'Eintrag gewünscht' } }
    ]
  },
  {
    title: 'SEPA-Lastschrift-Mandat (Bankeinzug)',
    note: 'Wenn Sie eine IBAN angeben, wird Ihre Unterschrift automatisch auch unter das SEPA-Mandat gesetzt. Ohne IBAN bleibt das SEPA-Blatt leer.',
    fields: [
      { name: 'SEPA_Bank', label: 'Name der Bank' },
      { name: 'SEPA_IBAN', label: 'IBAN' },
      { name: 'SEPA_Kontoinhaber_Vorname', label: 'Kontoinhaber:in Vorname (nur falls abweichend)' },
      { name: 'SEPA_Kontoinhaber_Name', label: 'Kontoinhaber:in Nachname (nur falls abweichend)' }
    ]
  }
];

// Zusatzoptionen für Bestandskunden (Mehrfachauswahl im Aufklapp-Menü).
// Jede Option entspricht einem Ankreuzfeld im osnatel-PDF.
var BESTAND_OPTIONEN = [
  { name: '6-3_Check_ZuhauseTV', label: 'ZuhauseTV – 9,99 €/Monat (inkl. UHD-Receiver, einmalig 49,99 €)' },
  { name: '6-3_Check_weitereReceiver', label: 'Weitere UHD-Receiver – einmalig 99,99 € pro Stück' },
  { name: '6-3_Check_Aufnahmespeicher-100', label: 'Aufnahmespeicher +100 Stunden' },
  { name: '6-3_Check_Aufnahmespeicher-200', label: 'Aufnahmespeicher +200 Stunden' },
  { name: '6-3_Check_DOKU', label: 'TV-Themenpaket DOKU' },
  { name: '6-3_Check_FILM', label: 'TV-Themenpaket FILM' },
  { name: '6-3_Check_KINDER', label: 'TV-Themenpaket KINDER' },
  { name: '6-3_Check_SPORT', label: 'TV-Themenpaket SPORT' },
  { name: '6-3_Check_MEGAMIX', label: 'TV-Themenpaket MEGAMIX' },
  { name: '6-3_Check_Tuerkisch', label: 'TV-Paket Türkisch' },
  { name: '6-3_Check_Polnisch', label: 'TV-Paket Polnisch' },
  { name: '6-3_Check_Italienisch', label: 'TV-Paket Italienisch' },
  { name: '6-3_Check_Russisch', label: 'TV-Paket Russisch' },
  { name: '6-3_Check_Mobilfunkflatrate', label: 'Mobilfunk-Flatrate' },
  { name: '6-3_Check_Ausland1', label: 'Auslandsflatrate 1' },
  { name: '6-3_Check_Ausland2', label: 'Auslandsflatrate 2' }
];

// Kurz-Parameter für personalisierte Links (?tarif=…, ?name=… usw.)
var PARAM_ALIASES = {
  tarif: { field: '6-2_Produkt', map: { '150': '100', '300': '300', '600': '500', '1000': '1000', '1.000': '1000' } },
  router: { field: '6-4_Hardware', map: { '5690': 'Premiumbox', '5630': 'Basisbox', 'premium': 'Premiumbox', 'basis': 'Basisbox', 'eigenes': 'Eigenes' } },
  zuhause_tv: { field: '6-3_Check_ZuhauseTV' },
  vorname: { field: '3_Vorname' },
  nachname: { field: '3_Name' },
  email: { field: '4_E-Mail' },
  telefon: { field: '4_Telefon' },
  strasse: { field: '3_Str' },
  hausnummer: { field: '3_Hausnummer' },
  plz: { field: '3_PLZ' },
  ort: { field: '3_Ort' }
};
// =========================================================================

(function () {
  var PDFLib = window.PDFLib;
  var pdfBytes = null;
  var fieldDefs = [];        // { name, kind, el }
  var signaturePad = null;
  var statusEl = document.getElementById('status-msg');

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'status-msg' + (type ? ' ' + type : '');
  }

  function fieldKind(f) {
    if (f instanceof PDFLib.PDFCheckBox) return 'checkbox';
    if (f instanceof PDFLib.PDFDropdown) return 'dropdown';
    if (f instanceof PDFLib.PDFRadioGroup) return 'radio';
    if (f instanceof PDFLib.PDFSignature) return 'signature';
    return 'text';
  }

  // ---------- PDF laden und konfigurierte Felder aufbauen ----------
  async function loadPdf() {
    var container = document.getElementById('form-fields');
    try {
      var res = await fetch(CONFIG.pdfUrl, { cache: 'no-cache' });
      if (!res.ok) throw new Error('PDF nicht gefunden (' + res.status + ')');
      pdfBytes = await res.arrayBuffer();

      var doc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      var form = doc.getForm();

      container.innerHTML = '';
      fieldDefs = [];

      FORM_SECTIONS.forEach(function (section) {
        var sectionEl = document.createElement('div');
        sectionEl.className = 'form-section';
        var h = document.createElement('h3');
        h.className = 'form-section-title';
        h.textContent = section.title;
        sectionEl.appendChild(h);
        if (section.note) {
          var n = document.createElement('p');
          n.className = 'form-section-note';
          n.textContent = section.note;
          sectionEl.appendChild(n);
        }

        var added = 0;
        section.fields.forEach(function (cfg) {
          var f;
          try { f = form.getField(cfg.name); } catch (e) { return; } // Feld existiert nicht -> überspringen
          var kind = fieldKind(f);
          if (kind === 'signature') return;

          var wrap = document.createElement('div');
          var input;

          if (kind === 'checkbox') {
            wrap.className = 'field field-check';
            input = document.createElement('input');
            input.type = 'checkbox';
            input.id = 'fld_' + cfg.name;
            var lbl = document.createElement('label');
            lbl.setAttribute('for', input.id);
            lbl.textContent = cfg.label;
            wrap.appendChild(input);
            wrap.appendChild(lbl);
          } else {
            wrap.className = 'field';
            var label = document.createElement('label');
            label.textContent = cfg.label;
            label.setAttribute('for', 'fld_' + cfg.name);
            wrap.appendChild(label);

            if (cfg.hardwareCombo) {
              // Kombinierte Auswahl: Router + Kaufoption in einem Dropdown
              kind = 'hardwareCombo';
              input = document.createElement('select');
              var emptyHc = document.createElement('option');
              emptyHc.value = ''; emptyHc.textContent = 'Bitte wählen …';
              input.appendChild(emptyHc);
              cfg.hardwareCombo.forEach(function (o) {
                var opt = document.createElement('option');
                opt.value = o.v;
                opt.textContent = o.label;
                input.appendChild(opt);
              });
            } else if (kind === 'dropdown' || kind === 'radio') {
              input = document.createElement('select');
              var empty = document.createElement('option');
              empty.value = ''; empty.textContent = 'Bitte wählen …';
              input.appendChild(empty);
              var opts = f.getOptions ? f.getOptions() : [];
              opts.forEach(function (o) {
                // Nicht gelistete Optionen ausblenden (z.B. Glasfaser 50)
                if (cfg.onlyListed && !(cfg.options && cfg.options[o])) return;
                var opt = document.createElement('option');
                opt.value = o;
                opt.textContent = (cfg.options && cfg.options[o]) || o;
                input.appendChild(opt);
              });
            } else {
              var multiline = false;
              try { multiline = f.isMultiline(); } catch (e) {}
              input = document.createElement(multiline ? 'textarea' : 'input');
              if (!multiline) input.type = guessInputType(cfg.name);
            }
            input.id = 'fld_' + cfg.name;
            wrap.appendChild(input);
          }

          input.name = cfg.name;
          // Felder mit gleichem row-Kürzel nebeneinander anordnen (z.B. PLZ + Ort)
          var parent = sectionEl;
          if (cfg.row) {
            var rowEl = sectionEl.querySelector('.field-row[data-row="' + cfg.row + '"]');
            if (!rowEl) {
              rowEl = document.createElement('div');
              rowEl.className = 'field-row field-row-' + cfg.row;
              rowEl.dataset.row = cfg.row;
              sectionEl.appendChild(rowEl);
            }
            parent = rowEl;
          }
          parent.appendChild(wrap);
          fieldDefs.push({ name: cfg.name, kind: kind, el: input, bestand: !!cfg.bestand, wrap: wrap });
          added++;
        });

        if (added > 0) container.appendChild(sectionEl);
      });

      if (fieldDefs.length === 0) {
        container.innerHTML = '<p>Es konnten keine Formularfelder geladen werden.</p>';
        return;
      }

      buildBestandOptionen(form, container);
      setupKundenstatus(container);
      setupAddressHelpers();
      prefillFromUrl();
    } catch (err) {
      container.innerHTML = '<p style="color:#a83232;">Das Formular konnte nicht geladen werden: ' +
        err.message + '</p>';
    }
  }

  // ---------- Adress-Vorschläge (PLZ -> Ort, Straßen-Vorschläge) ----------
  // Nutzt die freien Dienste api.zippopotam.us (PLZ -> Ort) und
  // openplzapi.org (Straßenverzeichnis). Fällt bei Fehlern stumm zurück –
  // das Formular funktioniert auch ohne Internet-Vorschläge.
  var ADDRESS_GROUPS = [
    { plz: '3_PLZ', ort: '3_Ort', str: '3_Str' },
    { plz: '5-1_PLZ', ort: '5-1_Ort', str: '5-1_Str' },
    { plz: '7-3_PLZ', ort: '7-3_Ort', str: '7-3_Str' }
  ];

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  function attachDatalist(input, idSuffix) {
    var dl = document.createElement('datalist');
    dl.id = 'dl_' + idSuffix;
    document.body.appendChild(dl);
    input.setAttribute('list', dl.id);
    input.setAttribute('autocomplete', 'off');
    return dl;
  }

  function setupAddressHelpers() {
    ADDRESS_GROUPS.forEach(function (g) {
      var plzDef = findDef(g.plz), ortDef = findDef(g.ort), strDef = findDef(g.str);
      if (!plzDef || !ortDef) return;

      var ortAutoFilled = false;

      // PLZ eingegeben -> Ort nachschlagen und ausfüllen
      plzDef.el.addEventListener('input', debounce(async function () {
        var plz = plzDef.el.value.trim();
        if (!/^\d{5}$/.test(plz)) return;
        try {
          var res = await fetch('https://api.zippopotam.us/de/' + plz);
          if (!res.ok) return;
          var data = await res.json();
          var places = (data.places || []).map(function (p) { return p['place name']; });
          if (places.length === 0) return;
          if (!ortDef.el.value.trim() || ortAutoFilled) {
            ortDef.el.value = places[0];
            ortAutoFilled = true;
          }
          if (places.length > 1) {
            var dl = document.getElementById('dl_' + g.ort) || attachDatalist(ortDef.el, g.ort);
            dl.innerHTML = '';
            places.forEach(function (p) {
              var o = document.createElement('option');
              o.value = p;
              dl.appendChild(o);
            });
          }
        } catch (e) { /* Vorschläge sind optional */ }
      }, 350));

      ortDef.el.addEventListener('input', function () { ortAutoFilled = false; });

      // Straße tippen -> Vorschläge aus dem Straßenverzeichnis zur PLZ
      if (strDef) {
        var strDl = attachDatalist(strDef.el, g.str);
        strDef.el.addEventListener('input', debounce(async function () {
          var plz = plzDef.el.value.trim();
          var q = strDef.el.value.trim();
          if (!/^\d{5}$/.test(plz) || q.length < 2) return;
          try {
            var url = 'https://openplzapi.org/de/Streets?postalCode=' + plz +
                      '&name=' + encodeURIComponent(q) + '&page=1&pageSize=10';
            var res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) return;
            var streets = await res.json();
            var names = [];
            (streets || []).forEach(function (s) {
              if (s && s.name && names.indexOf(s.name) === -1) names.push(s.name);
            });
            strDl.innerHTML = '';
            names.forEach(function (n) {
              var o = document.createElement('option');
              o.value = n;
              strDl.appendChild(o);
            });
          } catch (e) { /* Vorschläge sind optional */ }
        }, 350));
      }
    });
  }

  // ---------- Zusatzoptionen-Menü für Bestandskunden ----------
  function buildBestandOptionen(form, container) {
    // Nur Optionen anbieten, die es im PDF wirklich gibt
    var available = BESTAND_OPTIONEN.filter(function (o) {
      try { form.getCheckBox(o.name); return true; } catch (e) { return false; }
    });
    if (available.length === 0) return;

    var sectionEl = document.createElement('div');
    sectionEl.className = 'form-section bestand-optionen';
    var h = document.createElement('h3');
    h.className = 'form-section-title';
    h.textContent = 'Zusatzoptionen (optional, Mehrfachauswahl möglich)';
    sectionEl.appendChild(h);

    var details = document.createElement('details');
    details.className = 'multi-dd';
    var summary = document.createElement('summary');
    summary.textContent = 'Zusatzoptionen wählen …';
    details.appendChild(summary);
    var panel = document.createElement('div');
    panel.className = 'multi-dd-panel';
    details.appendChild(panel);
    sectionEl.appendChild(details);

    function updateSummary() {
      var selected = available.filter(function (o) { return o.input.checked; });
      summary.textContent = selected.length === 0
        ? 'Zusatzoptionen wählen …'
        : selected.length + ' Option' + (selected.length > 1 ? 'en' : '') + ' ausgewählt: ' +
          selected.map(function (o) { return o.label; }).join(', ');
    }

    available.forEach(function (o) {
      var wrap = document.createElement('div');
      wrap.className = 'field field-check';
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.id = 'fld_bo_' + o.name;
      var lbl = document.createElement('label');
      lbl.setAttribute('for', input.id);
      lbl.textContent = o.label;
      wrap.appendChild(input);
      wrap.appendChild(lbl);
      panel.appendChild(wrap);
      input.addEventListener('change', updateSummary);
      o.input = input;
      fieldDefs.push({ name: o.name, kind: 'checkbox', el: input, bestand: true, bestandOnly: true, wrap: wrap });
    });

    container.appendChild(sectionEl);
  }

  // ---------- Bestandskunden-Umschaltung ----------
  function isBestandskunde() {
    var r = document.querySelector('input[name="kundenstatus"]:checked');
    return r && r.value === 'bestand';
  }

  function setupKundenstatus(container) {
    var box = document.createElement('div');
    box.className = 'form-section kunde-toggle';
    box.innerHTML =
      '<h3 class="form-section-title">Sind Sie bereits osnatel-Kunde?</h3>' +
      '<div class="kunde-chips">' +
      '<label class="kunde-chip"><input type="radio" name="kundenstatus" value="bestand" checked> Ja, ich bin Bestandskunde</label>' +
      '<label class="kunde-chip"><input type="radio" name="kundenstatus" value="neu"> Nein, ich bin Neukunde</label>' +
      '</div>' +
      '<p class="form-section-note" id="bestand-note">Als Bestandskunde genügen uns Ihr Name und Ihre Adresse. Unten können Sie zusätzlich gewünschte Zusatzoptionen auswählen – alles Weitere stimmen wir persönlich mit Ihnen ab.</p>';
    container.insertBefore(box, container.firstChild);

    box.querySelectorAll('input[name="kundenstatus"]').forEach(function (r) {
      r.addEventListener('change', applyKundenstatus);
    });
    applyKundenstatus();
  }

  function applyKundenstatus() {
    var bestand = isBestandskunde();
    document.getElementById('bestand-note').hidden = !bestand;
    document.querySelectorAll('.kunde-chip').forEach(function (chip) {
      chip.classList.toggle('active', chip.querySelector('input').checked);
    });

    fieldDefs.forEach(function (fd) {
      fd.wrap.hidden = bestand ? !fd.bestand : !!fd.bestandOnly;
    });
    // Abschnitte ohne sichtbare Felder komplett ausblenden
    document.querySelectorAll('#form-fields .form-section').forEach(function (sec) {
      if (sec.classList.contains('kunde-toggle')) return;
      var anyVisible = Array.from(sec.querySelectorAll('.field')).some(function (f) { return !f.hidden; });
      sec.hidden = !anyVisible;
    });
  }

  function guessInputType(name) {
    var n = name.toLowerCase();
    if (n.indexOf('mail') !== -1) return 'email';
    if (n.indexOf('telefon') !== -1 || n.indexOf('mobil') !== -1) return 'tel';
    return 'text';
  }

  // ---------- Felder aus URL-Parametern vorausfüllen ----------
  function findDef(name) {
    return fieldDefs.find(function (fd) { return fd.name === name; });
  }

  function setFieldValue(fd, value) {
    if (!fd) return false;
    if (fd.kind === 'checkbox') {
      fd.el.checked = (value === '1' || String(value).toLowerCase() === 'ja' || String(value).toLowerCase() === 'true');
      return true;
    }
    if (fd.el.tagName === 'SELECT') {
      var options = Array.from(fd.el.options);
      var match = options.find(function (o) { return o.value === value; }) ||
                  options.find(function (o) { return o.textContent.toLowerCase().indexOf(String(value).toLowerCase()) !== -1; });
      if (match) { fd.el.value = match.value; return true; }
      return false;
    }
    fd.el.value = value;
    return true;
  }

  function prefillFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var filledAny = false;

    params.forEach(function (value, key) {
      if (!value) return;

      // 1) Kurz-Parameter (Aliase)
      var alias = PARAM_ALIASES[key.toLowerCase()];
      if (alias) {
        var v = value;
        if (alias.map) {
          var digits = String(value).replace(/[^0-9]/g, '');
          var mapped = alias.map[value] || alias.map[digits] || alias.map[String(value).toLowerCase()];
          // Router: Modellnummer im Wert suchen (z.B. "FRITZ!Box 5690")
          if (!mapped) {
            Object.keys(alias.map).forEach(function (k) {
              if (String(value).toLowerCase().indexOf(k) !== -1) mapped = alias.map[k];
            });
          }
          if (mapped) v = mapped;
        }
        if (setFieldValue(findDef(alias.field), v)) { filledAny = true; return; }
      }

      // 2) "name" = "Vorname Nachname" aufteilen
      if (key.toLowerCase() === 'name') {
        var parts = value.trim().split(/\s+/);
        if (parts.length > 1) {
          var last = parts.pop();
          if (setFieldValue(findDef('3_Vorname'), parts.join(' '))) filledAny = true;
          if (setFieldValue(findDef('3_Name'), last)) filledAny = true;
        } else if (setFieldValue(findDef('3_Name'), value)) {
          filledAny = true;
        }
        return;
      }

      // 3) Direkter PDF-Feldname
      if (setFieldValue(findDef(key), value)) filledAny = true;
    });

    if (filledAny) {
      setStatus('Einige Felder wurden bereits für Sie vorausgefüllt. Bitte prüfen Sie die Angaben und ergänzen Sie den Rest.', 'ok');
    }
  }

  // ---------- Unterschriften-Pad ----------
  function initSignaturePad() {
    var canvas = document.getElementById('sig-canvas');
    signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgba(255,255,255,0)',
      penColor: '#1a2b6d'
    });
    function resize() {
      var ratio = Math.max(window.devicePixelRatio || 1, 1);
      var data = signaturePad.toData();
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d').scale(ratio, ratio);
      signaturePad.fromData(data);
    }
    window.addEventListener('resize', resize);
    resize();
    document.getElementById('sig-clear').addEventListener('click', function () {
      signaturePad.clear();
    });
  }

  // ---------- Hilfen ----------
  function getValue(name) {
    var fd = findDef(name);
    if (!fd) return '';
    return fd.kind === 'checkbox' ? (fd.el.checked ? '1' : '') : (fd.el.value || '');
  }

  function today() {
    return new Date().toLocaleDateString('de-DE');
  }

  // Position (Seite + Rechteck) eines Unterschriftsfelds ermitteln
  function widgetPlacement(doc, form, fieldName) {
    try {
      var f = form.getField(fieldName);
      var widget = f.acroField.getWidgets()[0];
      var rect = widget.getRectangle();
      var pRef = widget.P && widget.P();
      var pages = doc.getPages();
      var pageIndex = -1;
      pages.forEach(function (pg, i) { if (pg.ref === pRef) pageIndex = i; });
      if (pageIndex === -1) return null;
      return { pageIndex: pageIndex, rect: rect };
    } catch (e) { return null; }
  }

  function needsSignature(when) {
    if (when === 'always') return true;
    if (isBestandskunde()) return false; // Bestandskunden unterschreiben nur den Auftrag
    if (when === 'sepa') return getValue('SEPA_IBAN').trim() !== '';
    if (when === 'portierung') {
      return findDef('7-5_Check_Rufnummeruebernahme') && findDef('7-5_Check_Rufnummeruebernahme').el.checked ||
             getValue('7-1_Anschluss') === 'vorhanden';
    }
    return false;
  }

  // ---------- Ausgefülltes, unterschriebenes PDF erzeugen ----------
  async function buildPdf() {
    if (!pdfBytes) throw new Error('Das PDF ist noch nicht geladen.');

    var doc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    var form = doc.getForm();
    var helv = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    var touched = [];   // Namen aller Felder, die wir befüllt haben

    var bestand = isBestandskunde();

    // Eingaben übernehmen (nur die aktuell sichtbaren Felder)
    fieldDefs.forEach(function (fd) {
      if (fd.wrap && fd.wrap.hidden) return;
      try {
        if (fd.kind === 'checkbox') {
          var cb = form.getCheckBox(fd.name);
          fd.el.checked ? cb.check() : cb.uncheck();
          touched.push(fd.name);
        } else if (fd.kind === 'dropdown') {
          if (fd.el.value) { form.getDropdown(fd.name).select(fd.el.value); touched.push(fd.name); }
        } else if (fd.kind === 'radio') {
          if (fd.el.value) { form.getRadioGroup(fd.name).select(fd.el.value); touched.push(fd.name); }
        } else if (fd.kind === 'hardwareCombo') {
          // Wert wie "Premiumbox|Ratenkauf": Router + zugehörige Kaufoption ankreuzen
          if (fd.el.value) {
            var teile = fd.el.value.split('|');
            form.getRadioGroup('6-4_Hardware').select(teile[0]);
            touched.push('6-4_Hardware');
            if (teile[1]) {
              var kaufFeld = teile[0] === 'Basisbox' ? '6-4_Hardware-Kaufoption_BB' : '6-4_Hardware-Kaufoption_PB';
              form.getRadioGroup(kaufFeld).select(teile[1]);
              touched.push(kaufFeld);
            }
          }
        } else {
          form.getTextField(fd.name).setText(fd.el.value || '');
          touched.push(fd.name);
        }
      } catch (e) { /* Feld überspringen */ }
    });

    // Bestandskunde = Änderungsauftrag im PDF ankreuzen
    if (bestand) {
      try { form.getRadioGroup('1_Auftragsart').select('Aenderung'); touched.push('1_Auftragsart'); } catch (e) {}
      // Aufnahmespeicher-Hauptfeld mit ankreuzen, wenn +100/+200 gewählt wurde
      var speicherGewaehlt = fieldDefs.some(function (fd) {
        return fd.bestandOnly && fd.el.checked &&
          (fd.name === '6-3_Check_Aufnahmespeicher-100' || fd.name === '6-3_Check_Aufnahmespeicher-200');
      });
      if (speicherGewaehlt) {
        try { form.getCheckBox('6-3_Check_Aufnahmespeicher').check(); touched.push('6-3_Check_Aufnahmespeicher'); } catch (e) {}
      }
    }

    var sepaActive = !bestand && getValue('SEPA_IBAN').trim() !== '';

    // SEPA: Vertragspartner-Daten automatisch aus Abschnitt 3 übernehmen
    if (sepaActive) {
      var copy = {
        SEPA_Vorname: '3_Vorname', SEPA_Name: '3_Name', SEPA_Str: '3_Str',
        SEPA_Hausnummer: '3_Hausnummer', SEPA_PLZ: '3_PLZ', SEPA_Ort: '3_Ort'
      };
      Object.keys(copy).forEach(function (target) {
        try { form.getTextField(target).setText(getValue(copy[target])); touched.push(target); } catch (e) {}
      });
      try { form.getTextField('SEPA_Ort-Datum').setText((getValue('3_Ort') ? getValue('3_Ort') + ', ' : '') + today()); touched.push('SEPA_Ort-Datum'); } catch (e) {}
    }

    // Datumsfelder bei den Unterschriften
    try { form.getTextField('16_Datum').setText(today()); touched.push('16_Datum'); } catch (e) {}
    if (needsSignature('portierung')) {
      try { form.getTextField('7-2_Datum').setText(today()); touched.push('7-2_Datum'); } catch (e) {}
    }

    // Unterschrift einsetzen
    var signed = false;
    if (signaturePad && !signaturePad.isEmpty()) {
      var pngUrl = signaturePad.toDataURL('image/png');
      var pngBytes = await fetch(pngUrl).then(function (r) { return r.arrayBuffer(); });
      var png = await doc.embedPng(pngBytes);
      var pages = doc.getPages();

      CONFIG.signatureFields.forEach(function (sf) {
        if (!needsSignature(sf.when)) return;
        var place = widgetPlacement(doc, form, sf.name);
        if (!place) return;
        var r = place.rect;
        var scale = Math.min(r.width / png.width, r.height / png.height);
        // Unterschrift etwas größer als das (oft flache) Feld zulassen
        var w = png.width * scale, h = png.height * scale;
        if (h < 18 && r.width / png.width > scale) {
          var scale2 = Math.min((r.height * 2.2) / png.height, r.width / png.width);
          w = png.width * scale2; h = png.height * scale2;
        }
        pages[place.pageIndex].drawImage(png, {
          x: r.x + 2,
          y: r.y + 1,
          width: w,
          height: h
        });
        signed = true;
      });
    }

    // Darstellungen (Appearances) nur für die von uns befüllten Felder
    // aktualisieren – das globale Update scheitert an internen
    // Rich-Text-Feldern des Original-PDFs.
    touched.forEach(function (name) {
      try {
        var f = form.getField(name);
        if (typeof f.updateAppearances === 'function') {
          if (f instanceof PDFLib.PDFTextField || f instanceof PDFLib.PDFDropdown) {
            f.updateAppearances(helv);
          } else {
            f.updateAppearances();
          }
        }
      } catch (e) { /* Feld überspringen */ }
    });

    // Unterschriftsfelder entfernen und alle Felder schreibschützen,
    // damit das fertige Dokument nicht mehr verändert werden kann.
    CONFIG.signatureFields.forEach(function (sf) {
      try { form.removeField(form.getField(sf.name)); } catch (e) {}
    });
    form.getFields().forEach(function (f) {
      try { f.enableReadOnly(); } catch (e) {}
    });

    return doc.save({ updateFieldAppearances: false });
  }

  function requireSignature() {
    if (!signaturePad || signaturePad.isEmpty()) {
      setStatus('Bitte unterschreiben Sie zuerst im Unterschriftsfeld.', 'err');
      return false;
    }
    return true;
  }

  function fileName() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var name = (getValue('3_Name') || 'Auftrag').replace(/[^A-Za-z0-9ÄÖÜäöüß-]/g, '_');
    return 'osnatel-Glasfaser-Auftrag_' + name + '_' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '.pdf';
  }

  // ---------- Buttons ----------
  document.getElementById('btn-preview').addEventListener('click', async function () {
    try {
      setStatus('Vorschau wird erstellt …');
      var bytes = await buildPdf();
      var blob = new Blob([bytes], { type: 'application/pdf' });
      document.getElementById('pdf-frame').src = URL.createObjectURL(blob);
      setStatus('Vorschau aktualisiert.', 'ok');
    } catch (err) {
      setStatus('Fehler: ' + err.message, 'err');
    }
  });

  document.getElementById('btn-download').addEventListener('click', async function () {
    if (!requireSignature()) return;
    try {
      setStatus('PDF wird erstellt …');
      var bytes = await buildPdf();
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatus('Ihr unterschriebener Auftrag wurde heruntergeladen. Vielen Dank!', 'ok');
    } catch (err) {
      setStatus('Fehler: ' + err.message, 'err');
    }
  });

  // E-Mail-Versand (nur aktiv, wenn CONFIG.emailTo gesetzt ist)
  var sendBtn = document.getElementById('btn-send');
  if (CONFIG.emailTo) {
    sendBtn.hidden = false;
    sendBtn.addEventListener('click', async function () {
      if (!requireSignature()) return;
      try {
        sendBtn.disabled = true;
        setStatus('Auftrag wird gesendet …');
        var bytes = await buildPdf();
        var blob = new Blob([bytes], { type: 'application/pdf' });

        var fd = new FormData();
        fd.append('_subject', 'Neuer osnatel-Auftrag über os-connect.de');
        fd.append('_template', 'table');
        fd.append('_captcha', 'false');
        fd.append('Name', getValue('3_Vorname') + ' ' + getValue('3_Name'));
        fd.append('Telefon', getValue('4_Telefon') || getValue('4_Mobil'));
        fd.append('E-Mail', getValue('4_E-Mail'));
        fd.append('Tarif', getValue('6-2_Produkt'));
        fd.append('attachment', blob, fileName());

        var res = await fetch('https://formsubmit.co/' + encodeURIComponent(CONFIG.emailTo), {
          method: 'POST',
          body: fd
        });
        if (!res.ok) throw new Error('Versand fehlgeschlagen (' + res.status + ')');
        setStatus('Vielen Dank! Ihr unterschriebener Auftrag wurde erfolgreich an uns gesendet.', 'ok');
      } catch (err) {
        setStatus('Der Versand hat leider nicht geklappt: ' + err.message +
          ' – Bitte laden Sie das PDF herunter und senden Sie es uns per E-Mail.', 'err');
      } finally {
        sendBtn.disabled = false;
      }
    });
  }

  // ---------- Start ----------
  loadPdf();
  initSignaturePad();
})();
