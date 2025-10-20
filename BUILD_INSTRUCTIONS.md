# 🏗️ Send-It - Build Instructions

## Voraussetzungen

- Node.js 18+ installiert
- Expo CLI installiert
- EAS CLI installiert (`npm install -g eas-cli`)
- Expo Account (kostenlos auf expo.dev)

## 🤖 Android APK bauen

### Option 1: Cloud Build (Empfohlen)

1. **EAS CLI installieren:**
```bash
npm install -g eas-cli
```

2. **Bei Expo einloggen:**
```bash
eas login
```

3. **EAS Projekt konfigurieren:**
```bash
cd C:\Users\sebil\mvp\send-it
eas build:configure
```

4. **Android APK bauen:**
```bash
eas build --platform android --profile preview
```

Der Build dauert ca. 10-15 Minuten. Du bekommst eine Download-URL für die APK.

### Option 2: Development Build

Für schnelleres Testen:

```bash
eas build --platform android --profile development
```

### Option 3: Production Build

Für Play Store:

```bash
eas build --platform android --profile production
```

## 📱 iOS IPA bauen

```bash
eas build --platform ios --profile production
```

*Hinweis: Benötigt Apple Developer Account*

## 🌐 Web App bauen

```bash
npx expo export:web
```

Output in `dist/` Ordner.

---

## 📋 EAS Build Profiles

Die Build-Profile sind bereits in `eas.json` konfiguriert (wird beim ersten `eas build:configure` erstellt):

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

---

## 🚀 Nach dem Build

### APK Installieren (Android)

1. Download APK von der EAS Build URL
2. Aktiviere "Unbekannte Quellen" auf deinem Android-Gerät
3. Öffne die APK-Datei
4. Installiere die App

### Play Store Veröffentlichung

1. Baue Production AAB:
```bash
eas build --platform android --profile production
```

2. Gehe zu [Google Play Console](https://play.google.com/console)

3. Erstelle eine neue App

4. Lade die AAB-Datei hoch

5. Fülle alle erforderlichen Informationen aus:
   - App-Name: **Send-It**
   - Kurzbeschreibung: **Save and organize your favorite videos from Instagram, TikTok & YouTube**
   - Vollständige Beschreibung: (siehe `APP_DESCRIPTION.md`)
   - Screenshots: (5-8 Screenshots der App)
   - App-Icon: `./assets/images/icon.png`
   - Feature Grafik: (1024x500px Banner)
   - Kategorie: **Productivity**
   - Altersbeschränkung: **13+**

6. Datenschutzrichtlinie hochladen

7. App zur Prüfung einreichen

---

## 🔧 Troubleshooting

### Build schlägt fehl

1. **Credentials-Problem:**
```bash
eas credentials
```

2. **Cache-Problem:**
```bash
eas build --platform android --profile preview --clear-cache
```

3. **Dependencies-Problem:**
```bash
rm -rf node_modules
pnpm install
```

### APK funktioniert nicht

1. **Permissions prüfen:**
   - Stelle sicher, dass alle Permissions in `app.json` korrekt sind

2. **Signing-Problem:**
   - EAS erstellt automatisch Signing Keys
   - Prüfe mit `eas credentials`

3. **Version-Conflict:**
   - Erhöhe `versionCode` in `app.json`

---

## 📊 Build Status überprüfen

```bash
eas build:list
```

Zeigt alle Builds mit Status an.

---

## 🎯 Quick Commands

**Development Build:**
```bash
eas build -p android --profile development
```

**Preview APK (für Testen):**
```bash
eas build -p android --profile preview
```

**Production AAB (für Play Store):**
```bash
eas build -p android --profile production
```

**Build Status:**
```bash
eas build:view
```

**Download neuesten Build:**
```bash
eas build:download --latest --platform android
```

---

## 📝 Wichtige Dateien

- `app.json` - App-Konfiguration
- `eas.json` - Build-Konfiguration
- `package.json` - Dependencies
- `.npmrc` - pnpm-Konfiguration

---

## 🌟 Alternative: Expo Go

Für schnelles Testen ohne Build:

1. Installiere Expo Go App auf deinem Android-Gerät
2. Starte Dev Server:
```bash
pnpm start
```
3. Scanne QR-Code mit Expo Go

**Limitierung:** Deep Linking und Share Extension funktionieren nur in Standalone Builds!

---

## 💡 Tipps

1. **Erste Builds dauern länger** (10-20 Min)
   - Nachfolgende Builds sind schneller (5-10 Min)

2. **Preview Profile für Testen**
   - Erstellt APK statt AAB
   - Kann direkt installiert werden
   - Keine Play Store Signatur nötig

3. **Production Profile für Release**
   - Erstellt AAB für Play Store
   - Automatische Code-Optimierung
   - Kleinere Dateigröße

4. **Versionierung nicht vergessen:**
   - Erhöhe `version` in `app.json` bei jedem Release
   - Erhöhe `versionCode` bei jedem Build

---

## 🎉 Erfolgreicher Build!

Nach erfolgreichem Build erhältst du:
- 📦 Download-URL für APK/AAB
- 📊 Build-Report
- 📝 Build-Logs

Die APK kann sofort auf Android-Geräten installiert werden!

---

**Fragen? Problem?**
- Expo Documentation: https://docs.expo.dev/build/introduction/
- EAS Build Docs: https://docs.expo.dev/build/setup/
