# your amigo

**your amigo** is a mission-based, autonomous operating system for founders that runs long-lived research and analysis workflows. It is built as an internal developer tool using a dark, sleek, keyboard-navigable command bar interface.

Unlike traditional chatbots, **your amigo** works in the background using a structured crew of 7 specialized workers that coordinate, make real-world data requests via the **Anakin Wire** integration layer, update a persistent memory graph, and synthesize structured, evidence-backed executive reports.

---

## 🛠️ feature suite

1. **mission-first ux** — assign tasks in natural language or use pre-configured templates.
2. **real-time terminal logs** — see exactly what queries your workers are running in a dedicated developer console.
3. **anakin wire explorer** — hero dashboard tracking every API request with latencies, cached hits, and detail flowcharts.
4. **obsidian-style memory graph** — visualize connections between different topics in your persistent workspace memory.
5. **mission replay** — scrub backwards and forwards through a mission's timeline to replay exactly what actions were taken.
6. **dedicated voice interface** — speak a mission directly using the Web Speech API with live visualizers.
7. **structured reporting** — dynamic market summaries, competitor listings, pricing, and execution risk sections.
8. **raycast command palette** — navigate instantly using `Cmd+K` / `Ctrl+K`.

---

## 🏗️ architecture

```
                     [ voice or text input ]
                                ↓
                      [ useStore.addMission ]
                                ↓
                     [ missionRunner engine ]
                   ↙            ↓            ↘
     [ market-intel ]   [ customer-disc ]   [ competitive ]
                   ↘            ↓            ↙
                 [ wireService (scraping/search) ]
                                ↓
                     [ api.anakin.io/v1 ]
                                ↓
             [ useStore.addWireRequest & appendLog ]
                     ↙                       ↘
         [ wire explorer ]               [ terminal ]
                     ↘                       ↙
                     [ useStore.addMemory ]
                                ↓
                     [ Obsidian-style Graph ]
                                ↓
                   [ Synthesized Report Tab ]
```

---

## 🧑‍✈️ the crew

- **market intelligence** — searches Reddit and Hacker News for community pain points and signals.
- **customer discovery** — maps demographic target groups and high-intent customer segments.
- **competitive research** — benchmarks direct/indirect alternatives.
- **pricing intelligence** — extracts pricing data from competitor product grids.
- **growth** — audits acquisition channels and marketing distribution lines.
- **technical research** — deep-dives into tech stacks, API documentation, and libraries.
- **reporting** — gathers the crew's logs and compiles the final executive report.

---

## 🚀 quick start

### 1. install dependencies
Ensure you use the legacy peer dependencies flag due to React 19 lockfile configs:
```bash
npm install --legacy-peer-deps
```

### 2. run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. configure your api key
1. Navigate to the **wire** tab in the sidebar (or hit `Ctrl+K` and type `wire settings`).
2. Paste your Anakin API Key from [anakin.io](https://anakin.io) and click **"save key"**.
3. Click **"test connection"** to verify that your key successfully authenticates with the Anakin API.

---

## 📸 screenshots

### dashboard overview
![dashboard overview](/screenshots/dashboard.png)

### missions assignment
![missions assignment](/screenshots/missions.png)

### anakin wire explorer
![wire explorer](/screenshots/wire-explorer.png)

### executive report generated
![executive report generated](/screenshots/report.png)
