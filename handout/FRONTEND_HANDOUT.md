# AgriSense Frontend Handout

## Branch
- Working branch: `AI/Development` (no merge performed)

## Stack
- React 19 + TypeScript + Vite 8
- Tailwind CSS v4, `react-router`, `chart.js` / `react-chartjs-2`, `react-icons`, `driver.js`, `sileo`

## Routes / Pages
| Route | Page/Component | Status |
|---|---|---|
| `/` | `components/landingPage.tsx` | Static landing, tour, contact/project toasts |
| `/dashboard` | `components/dashboard.tsx` + `pages/mainDash.tsx` | Static overview, search UI, chart, alerts |
| `/device` | `components/dashboard.tsx` + `pages/device.tsx` | Static device table/cards |
| `/analytics` | `components/dashboard.tsx` + `pages/analytics.tsx` | Static report cards + chart range tabs |
| `/notification` | `components/dashboard.tsx` + `pages/notification.tsx` | Static alerts list |
| `/setting` | `components/dashboard.tsx` + `pages/setting.tsx` | Static settings form/toggles |
| `/help` | `components/dashboard.tsx` + `pages/helpSupport.tsx` | Static quick start, contact, FAQs |
| `/profile` | `components/dashboard.tsx` + `pages/profile.tsx` | Static profile details |

## Main Components
- `components/dashboard.tsx` – shell layout, background, renders page by `initialPage`/state.
- `components/leftNavbar.tsx` – sidebar navigation and profile shortcut (inline prop/state typing, no `type/interface`).
- `components/chartComp.tsx` – `LineChart` with static hour/day/month data.
- `components/landingPage.tsx` – hero, CTA, driver.js tour, sileo toasts.
- `components/pages/mainDash.tsx` – main dashboard UI (theme toggle, search shortcut, stats, device card, chart, alerts).
- `components/pages/device.tsx` – devices page (static).
- `components/pages/analytics.tsx` – analytics/reports page (static).
- `components/pages/notification.tsx` – notifications page (static).
- `components/pages/setting.tsx` – settings page (static).
- `components/pages/helpSupport.tsx` – help & support page (static).
- `components/pages/profile.tsx` – profile page (static).

## Other Existing Components/Files
- `components/themeMode.tsx` – legacy toast-based theme prompt (not mounted by default).
- `components/tourGuide.tsx` – styled demo button component (not currently used).
- `styles/landing.style.css`, `styles/leftNav.style.css`, `index.css`, `App.css`.

## Fixes Applied
- Corrected route wiring and dashboard page switching (including profile).
- Replaced loose/incorrect typings (`String`, untyped props/state) with inline strict typings and `useState<...>` where applicable.
- Fixed chart data/labels and simplified chart styling to match app theme.
- Fixed landing toast/theme handling and minor UI/text issues.
- Cleaned `index.html` theme init script and icon paths; removed duplicate Toaster mounting.
- Kept UI simple, static, and easy to modify.

## Static / TODO for Integration
- Connect backend API (`/soil/status`, `/soil/latest`, `/soil/readings/:id`, `/soil/alerts`) for live data.
- Replace static device/alert/notification/profile data with API/DB data.
- Implement real device actions (restart/configure/remove/add), auth, and persistence.
- Add form validation/submission for settings and profile editing as needed.

## Run
```bash
cd moistFrontend
npm install
npm run dev
npm run build
```