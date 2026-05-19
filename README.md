# HAVN — v3 (Deep Forest theme)

Real-time community coordination app — mobile-first PWA prototype.
Find food, shelter, healthcare, transit, clothing, warming, and cooling resources nearby.

This is the **v3** styling pass. It reuses the working logic from v2 (Leaflet map, Firebase Firestore live sync, ZIP search, mock pin fallback, post flow, emergency mode) and applies the **Deep Forest + Sage Teal + Warm Cream** theme from `HAVN-Mockup.png` — Fraunces serif headlines, Inter body text, Ember accents for emergency mode. No pink.

---

## Files

```
havn-v3-app/
├── index.html      Mobile-first layout, 7 screens, semantic HTML5
├── styles.css      Visual system — Deep Forest, Sage Teal, Fraunces + Inter
├── app.js          ES module — Firebase + Leaflet + ZIP search + state
└── README.md       This file
```

No inline scripts. No inline styles. No internal `<script>` blocks. All three asset files are external and loaded from `index.html`.

---

## External APIs & libraries used

The app talks to several external services. None require credit cards or paid accounts — only Firestore needs an account, and only if you choose to enable it.

### Loaded automatically on every page load

| Service | URL | What it does | Auth |
| --- | --- | --- | --- |
| **Google Fonts** | `fonts.googleapis.com` | Loads Fraunces (serif) + Inter (sans-serif) | None |
| **Leaflet 1.9.4** | `unpkg.com/leaflet@1.9.4/` | The open-source map library — CSS + JS | None |
| **Firebase SDK** | `gstatic.com/firebasejs/10.12.5/` | Google's Firestore client library | None |
| **OpenStreetMap tiles** | `tile.openstreetmap.org/{z}/{x}/{y}.png` | The actual street-map images | None |

These all load from public CDNs. Loading the Firebase SDK is harmless — it does nothing until you paste a real Firebase config into `app.js`. With placeholders left in, the SDK just sits idle and the app runs purely on mock pins.

### Called only when needed

| Service | When | What it does | Auth |
| --- | --- | --- | --- |
| **Zippopotam.us** — `api.zippopotam.us/us/{ZIP}` | User types a ZIP not in `zipFallback` | Returns `{city, state, lat, lng}` for any US ZIP | None |
| **Firestore database** — `firestore.googleapis.com` | User publishes a resource (if Firebase configured) | Stores the post + streams updates to other devices | Your Firebase API key |
| **Google Maps** — `google.com/maps/dir/?api=1` | User taps "Directions" on a resource card | Opens turn-by-turn directions in their Maps app | None |

### Where the mock data lives (no JSON file)

The mock pins live **inside `app.js` as a JavaScript array** (`initialResources`), not a separate JSON file. Two reasons:

1. **Works without a server.** If the data were in `pins.json`, the app would have to `fetch()` it — and `fetch` against `file://` URLs is blocked by every modern browser. Inlining the data means the UI renders even when you double-click the HTML directly.
2. **The ZIP fallback table is referenced synchronously.** When a user submits a ZIP, the code checks `zipFallback['89101']` immediately. Loading it async from JSON would mean handling a "still loading" state on first interaction.

If you ever want to update mock pins without editing code, swapping to a `pins.json` + `fetch()` is a 15-line change. For an MVP comparison prototype, inline is faster.

### What Leaflet actually is

**Leaflet** (`leafletjs.com`) is the most widely used open-source JavaScript map library. It does what Google Maps' JS SDK does — pan, zoom, drop pins, show popups — but with no API key, no billing, no quota limits, and a 40 KB footprint. The mapping community built it around the OpenStreetMap data project so you can run a map app for free.

The actual street imagery comes from **OpenStreetMap** — a Wikipedia-style project where volunteers map streets, parks, and landmarks. Leaflet renders OSM's tile images and adds the interactive layer on top. Together they give you a fully working map without ever signing up for Google Maps or Mapbox.

This pairing (Leaflet + OSM) is what powers a lot of civic-tech and disaster-response apps, including Red Cross mapping tools and several 211 services.

---

## Run locally

`app.js` uses ES module imports, so it must be served (not opened as `file://`):

```bash
cd havn-v3-app
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Any local server works (`npx serve`, `live-server`, VS Code Live Server, etc.).

---

## Firebase setup (optional — app works without it)

The app runs on the inline mock pins by default. Setting up Firebase turns it into a **live, multi-device demo**: a pin you publish on your phone shows up on your laptop seconds later. That's the magic moment for showing investors or partners.

### What Firebase gives you

Firestore is Google's hosted NoSQL database. Your app talks to it directly from the browser using the Firebase JavaScript SDK — there's no server you need to run. When someone publishes a resource:

1. The browser sends the new pin to Firestore over the public internet.
2. Every other browser currently watching the `resources` collection gets pushed the update in roughly 1–2 seconds.
3. That update fires `onSnapshot()` in `app.js`, which re-renders the map.

This is the same mechanism that powers Google Docs collaboration.

### Step-by-step setup

1. Go to <https://console.firebase.google.com> and click **Add project**. Name it `havn-demo` or whatever you like. You can skip Google Analytics.
2. Inside the project, open **Build → Firestore Database** and click **Create database**. Choose a region near you (`us-east1` is fine for the US east coast). Pick **Start in test mode** for now.
3. Open **Project settings** (gear icon, top left). Scroll down to **Your apps** and click the `</>` web-app icon. Register the app with any nickname; you do *not* need Firebase Hosting.
4. Firebase will show you a `firebaseConfig` object with six fields. Copy it.
5. Open `app.js` and replace the six `PASTE_…` placeholders at the top with the values from your config object.
6. Save, refresh the page. The pin status badge on the map card will switch from **MOCK PINS** to **LIVE FIREBASE**. The app auto-seeds the initial mock pins to your Firestore on first load.

### Trying the live demo on your phone

You need the page served from a real URL your phone can reach — not `localhost`. The simplest options:

- **Free hosting (recommended for a demo):** drag the `havn-v3-app` folder into <https://app.netlify.com/drop> or <https://vercel.com/new>. You'll get a public HTTPS URL in 20 seconds. Open it on your phone.
- **Same-WiFi quick test:** find your computer's local IP (`ipconfig` on Windows, `ifconfig` on Mac), run `python3 -m http.server 8000`, then open `http://192.168.1.X:8000` on your phone. Both devices must be on the same WiFi.

The geolocation API and Firestore both require HTTPS in production, so Netlify/Vercel is the better long-term path.

### Development-only Firestore rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /resources/{resourceId} {
      allow read, write: if true;
    }
  }
}
```

⚠️ Do not use open rules in production. Anyone with your project URL could write garbage to your database. Lock down with `request.auth != null` and field validation before going live publicly.

---

## ZIP codes to try

The search bar accepts any US ZIP. The codes below are pre-loaded with mock resources, so they work instantly even when offline. ZIPs not in this list fall back to <https://api.zippopotam.us> for forward geocoding.

### User-requested anchor cities

| ZIP   | City              | Why it's seeded                                             |
| ----- | ----------------- | ----------------------------------------------------------- |
| 10001 | New York, NY      | #2 raw total nationally (158,019) · 2 pins                  |
| 90001 | Los Angeles, CA   | Skid Row epicenter · 2 pins                                 |
| 89101 | Las Vegas, NV     | Mojave heat exposure · 2 pins                               |

### States with the highest homelessness rates (per-capita)

Per the 2024 HUD Annual Homelessness Assessment Report (AHAR), Point-in-Time count from January 2024. Rates expressed as people per 10,000 residents.

| ZIP   | City              | State rank | Rate/10K | Notes                              |
| ----- | ----------------- | ---------- | -------- | ---------------------------------- |
| 96813 | Honolulu, HI      | **#1**     | 80.5     | Highest per-capita in the nation   |
| 20001 | Washington, DC    | **#2**     | 80.0     | Treated as a state for ranking     |
| 10001 | New York, NY      | **#3**     | 79.5     | Right behind DC                    |
| 90001 | Los Angeles, CA   | #4 (state) | ~48      | California: 187,084 total — #1 raw |
| 97201 | Portland, OR      | #5         | ~44      | West Coast cluster                 |
| 98101 | Seattle, WA       | #6         | ~38      |                                    |
| 02108 | Boston, MA        | #7         | ~33      | Massachusetts has right-to-shelter |
| 05401 | Burlington, VT    | #8         | ~32      | Largest rate jump 2019–2024        |
| 85001 | Phoenix, AZ       | #9         | ~28      | Extreme-heat fatalities cluster    |
| 80202 | Denver, CO        | #10        | ~26      |                                    |

### States you specifically called out

A note on the four states you mentioned (Florida, Maryland, Hawaii, Washington DC):

- **Hawaii** and **Washington DC** are correct — they're #1 and #2 per-capita nationally.
- **Florida** is #4 by raw total (~31,000 people) but ranks ~18th per-capita. The high raw number reflects population size, not rate.
- **Maryland** ranks mid-tier per-capita (~22nd) and actually *decreased* slightly in 2024 — one of only four states to do so.

Both Florida and Maryland still have severe localized hotspots (Miami-Dade and Baltimore City respectively), so they get pins anyway:

| ZIP   | City          | Notes                                          |
| ----- | ------------- | ---------------------------------------------- |
| 33101 | Miami, FL     | Heat-driven need · cooling center pinned       |
| 21201 | Baltimore, MD | Concentrated urban need · 2 pins               |

### Connecticut corridor (kept from v2 for backwards compatibility)

| ZIP   | City              |
| ----- | ----------------- |
| 06510 | New Haven, CT     |
| 06103 | Hartford, CT      |
| 19103 | Philadelphia, PA  |
| 02108 | Boston, MA        |

**Data source:** U.S. Department of Housing and Urban Development, *2024 Annual Homelessness Assessment Report (AHAR) to Congress, Part 1: Point-in-Time Estimates of Homelessness*, December 2024. Per-capita rates derived using U.S. Census Bureau population estimates. Per-capita is the more meaningful comparison than raw totals because it normalizes for state population size.

---

## What's in v3 vs v2

**Same** — All the working logic is preserved verbatim:
- Leaflet + OpenStreetMap tiles (no API key needed)
- Firebase Firestore live sync (when configured)
- ZIP code search with offline fallback
- Mock pin generation
- Provider post flow with localStorage persistence
- Emergency mode toggle
- Save / Share / Directions actions

**New** — Visual styling pulled from `HAVN-Mockup.png`:
- Deep Forest (`#0F3D2E`) header, Sage Teal (`#3FA796`) brand accent
- Warm Cream (`#FAF8F3`) background, Soft Stone (`#E8E5DE`) dividers
- Fraunces serif for headlines and brand mark
- Inter for all UI text
- Ember (`#E0593C`) for emergency mode — no pink anywhere
- Category-colored circular icons in cards and pins
- Expanded mock pin set covering 13 cities across the highest-need states

---

## Browser support

Modern evergreen browsers. ES modules are required (Chrome 63+, Firefox 60+, Safari 11+, Edge 79+). Older Android WebView 4.4 is not supported because of the ES module imports — would need a build step (esbuild/Vite) to ship to that target.

## Accessibility

- All labels paired with input `id`s
- Tap targets ≥ 48 px
- `aria-pressed` on chips and nav buttons
- `aria-live="polite"` on toasts, ZIP feedback, and post form hints
- `role="dialog"` + `aria-modal="true"` on overlays
- Visible `:focus-visible` rings on every interactive element
- `prefers-reduced-motion` respected (animations collapse to ~0 ms)
- Pin markers carry semantic labels ("St. Luke's — Food — OPEN") for screen readers
