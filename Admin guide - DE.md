# Admin-Guide

Dieser Guide beschreibt die grundlegende Verwaltung der Luminous-App für Administratoren. Die folgenden Abschnitte führen durch die häufigsten administrativen Aufgaben und Hilfestellungen bei auftretenden Problemen.

---

## Problembehebung

Die meisten ungewöhnlichen Probleme lassen sich durch einen Systemneustart lösen. Starte sowohl den Raspberry Pi als auch die Luminous-App neu. Sollte das Problem weiterhin bestehen, könnte es sich um einen Fehler im Code handeln. In diesem Fall kannst du die Entwickler per E-Mail kontaktieren: [pietasdarwin@gmail.com, l.hoelzel@icloud.com](mailto:pietasdarwin@gmail.com,l.hoelzel@icloud.com).

---

## Allgemeine Verwaltung

Die Verwaltungsfunktionen der Luminous-App findest du oben links über das Zahnrad-Icon. Besonders relevant sind die ersten beiden Menüpunkte Einstellungen und Geräte:

### Einstellungen

Im ersten Reiter findest du allgemeine Benutzereinstellungen:
- Sprache ändern
- Design anpassen

#### Administrator

Der Administratorbereich erfordert ein Passwort. Aktuell lautet das Admin-Passwort "licht". Nach einem Datenbank-Reset ist das Passwort standardmäßig leer und kann danach geändert werden.

Solltest du das Passwort vergessen, ist der Zugriff nicht trivial, da das Passwort verschlüsselt in der Datenbank gespeichert ist. Als Notlösung kannst du per SSH auf den Raspberry Pi zugreifen und die Datenbank durch eine ältere Version ersetzen.

Weitere Funktionen:
- **OLA-Übersicht öffnen**: Hilfreich zum Debuggen von DMX-Signalen, da hier die aktuellen Channel-Werte angezeigt werden.
- **Server URL und Port ändern**: Besonders nützlich, wenn sich die Netzwerkkonfiguration (z.B. WLAN) geändert hat.
- **Datenbank verwalten**:
  - **Backup herunterladen**: Empfohlen vor jeder Änderung.
  - **Datenbank zurücksetzen**: Alle Daten werden gelöscht, jedoch auf dem Pi wird ein Backup erstellt.
  - **Datenbank hochladen**: Eigene Version hochladen und bestehende ersetzen.

---

#### Studio-Übersicht

Anpassungen der Lampenpositionen und Icons zur Aktualisierung der Studio-Ansicht:
- Definiere das **Hauptgrid** über Zeilen und Spalten.
- Weist jeder Zelle rechts in der Übersicht Lampen mit passenden Icons oder „None“ zu, falls leer.
- **Custom-Lampen** außerhalb des Grids platzierst du frei per Pixelkoordinaten (Abstand oben/links). Du kannst sie auch „flippen“, falls sie nach unten zeigen sollen.

Speicheroptionen:
- **Temporär speichern**: Einstellungen gehen beim Neustart verloren.
- **Speichern** (per Admin-Passwort): Einstellungen dauerhaft in der Datenbank sichern.

---

### Geräteverwaltung

Im Menü „Geräte“ kannst du Lampen hinzufügen oder bestehende Geräte konfigurieren:

### Grundeinstellungen je Gerät:
- **Universum**: DMX-Universum, dem das Gerät zugeordnet ist.
- **Nummer**: Kennzeichnung im Studio; bestimmt auch Reihenfolge in der App.
- **Gerätename**
- **Typ**:
  - **RGBDim**: RGB-Lampen (z.B. Traverse)
  - **BiColor**: LEDs z.B. für Greenscreen
  - **Spot/Fill**: Gleiche Funktion, aber unterschiedliche Icons in der App
  - **HMI**: Automatisch bei Blendenöffnung aktiv; manuelles Ausschalten erforderlich
  - **Misc**: Sonstige Geräte

Kanäle und Kanalnamen:
- Jedes Gerät hat mindestens einen "Main"-Kanal (Hauptfader).
- Zusätzliche Kanäle können benannt und frei gewählt werden. (Inputfelder)
- Kanäle müssen nicht lückenlos folgen. Der **Startkanal** hilft nur beim Zuordnen.

Übersicht DMX-Belegung:
- Graue Markierung: Aktuell ausgewähltes Gerät
- Farbig hinterlegt: Belegte Kanäle
- Rot markiert: Kanalüberschneidungen

Speichern und Löschen erfolgt nach Eingabe des Admin-Passworts.

---

### Szenenverwaltung

Szenen kannst du auf den Seiten „Studio“, „LightFX“ oder „Szenen“ speichern:
- Es werden alle aktuell eingeschalteten Lampen mit deren Kanalwerten gespeichert. Der Masterfader wird aktuell nicht berücksichtigt.
- In LightFX empfiehlt sich das Aktivieren des „Solo“-Modus, um nur die Auswahl zu speichern.

Beim Speichern einer Szene:
- Namen vergeben
- Option „Als Standard Szene setzen“ aktiviert die dauerhafte Speicherung nach Passworteingabe.
- Ohne diese Option wird die Szene beim Neustart gelöscht.

**Szenenübersicht**:
- Bookmark-Icon mit Haken: dauerhaft gespeichert
- Bookmark-Icon mit Plus: Möglichkeit, mit Passwort dauerhaft zu speichern
- Mülltonnen-Icon: Szene löschen

Direktes Bearbeiten von Szenen ist nicht möglich. Bearbeite Szenen wie folgt:
- Szene mit „Solo“ aktivieren
- Änderungen vornehmen
- Als neue Szene speichern
- Alte Szene löschen

---

Bei Fragen und Problemen steht das Entwicklungsteam jederzeit zur Verfügung.


