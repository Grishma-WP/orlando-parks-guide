# RideReady — Orlando Parks Guide
## Project SKILL.md

---

## 🎡 Project Overview

**Project Name:** RideReady  
**Tagline:** Just show up RideReady.  
**Description:** Every parent knows the feeling — you've waited 45 minutes in line, your excited 4-year-old is next, and the sign says 102cm minimum. That moment of disappointment is exactly why RideReady exists. Enter your group's ages and heights — from infants to grandparents — and instantly know which rides everyone can enjoy together. 15 Orlando parks, 200+ attractions, height restrictions, infant policies, best times to ride, and pro tips for every attraction. All personalised to your group in seconds.

**Live URL:** https://Grishma-WP.github.io/orlando-parks-guide  
**GitHub Repo:** https://github.com/Grishma-WP/orlando-parks-guide  
**Current Version:** v9 (orlando-parks-guide-v9.jsx)

---

## 👩‍💻 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React (Vite) |
| Language | JSX |
| Styling | Inline styles (no CSS framework) |
| Hosting | GitHub Pages |
| Deploy | gh-pages npm package |
| Build | Vite v8 |

---

## 🗂️ Project Structure

```
orlando-parks-guide/
├── src/
│   ├── App.jsx          ← ENTIRE app lives here (single file)
│   ├── App.css          ← EMPTY (cleared intentionally)
│   ├── index.css        ← EMPTY (cleared intentionally)
│   └── main.jsx         ← Default Vite entry (unchanged)
├── public/
│   └── favicon.svg
├── index.html           ← Has visitor badge + Google Analytics
├── package.json         ← Has deploy scripts
├── vite.config.js       ← Has base: '/orlando-parks-guide/'
└── SKILL.md             ← This file
```

---

## 📦 package.json Key Scripts

```json
{
  "homepage": "https://Grishma-WP.github.io/orlando-parks-guide",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**To deploy:** `npm run deploy`  
**To run locally:** `npm run dev` → http://localhost:5173

---

## 🏗️ App Architecture

The entire app is a **single React file** (`src/App.jsx`) with these sections in order:

1. **Theme config** — light/dark mode colors
2. **kidColors** — array of non-red colors for group members
3. **Helper functions** — height conversion, age estimation, infant detection
4. **Config objects** — infantPolicyConfig, thrillConfig, bestTimeConfig
5. **featuredRides** — top 3 recommended rides per park (for scorecard)
6. **getParkScore()** — computes scorecard stats for a park
7. **Parks data array** — all 15 parks with full rides data
8. **ZoneAccordion component** — zone chips + ride list with family/restricted split
9. **Footer component** — disclaimer + official park links
10. **PersonCard component** — individual member input card
11. **makeMember()** — factory function for empty member
12. **App (main component)** — setup screen + guide screen

---

## 🏖️ Parks Covered (15 total)

### Disney (6 parks)
| ID | Name | Type |
|---|---|---|
| mk | Magic Kingdom | Theme Park |
| epcot | EPCOT | Theme Park |
| hs | Hollywood Studios | Theme Park |
| ak | Animal Kingdom | Theme Park |
| tl | Typhoon Lagoon | Water Park |
| bb | Blizzard Beach | Water Park |

### Universal (4 parks)
| ID | Name | Type |
|---|---|---|
| usf | Universal Studios Florida | Theme Park |
| ioa | Islands of Adventure | Theme Park |
| eu | Epic Universe | Theme Park (opened May 2025) |
| vb | Volcano Bay | Water Park |

### SeaWorld (2 parks)
| ID | Name | Type |
|---|---|---|
| sw | SeaWorld Orlando | Theme Park |
| aq | Aquatica | Water Park |

### Other Orlando (3 parks)
| ID | Name | Type |
|---|---|---|
| lg | LEGOLAND Florida | Theme Park (45 mins from Orlando) |
| gl | Gatorland | Wildlife/Theme Park |
| ksc | Kennedy Space Center | Attraction (45 mins from Orlando) |

---

## 🎢 Ride Data Schema

Each ride has these fields:

```js
{
  name: String,           // Ride name
  land: String,           // Zone/land within the park
  thrill: String,         // "gentle" | "moderate" | "thrill"
  height: Number|null,    // Min height in cm (null = no restriction)
  infantPolicy: String,   // "welcome" | "lap" | "carrier" | "none" | "check"
  bestTime: String,       // One of bestTimeConfig keys
  tip: String,            // Plain English pro tip for this ride
}
```

---

## 👥 Group Member Schema

```js
{
  name: String,           // Display name (optional)
  ageYears: String,       // Age in years (empty string if not set)
  ageMonths: String,      // Age in months (empty string if not set)
  heightUnit: String,     // "cm" | "ftin"
  heightCm: String,       // Height in cm (if unit is cm)
  heightFt: String,       // Height in feet (if unit is ftin)
  heightIn: String,       // Height in inches (if unit is ftin)
  infantOverride: Boolean|null, // null = auto-detect from age
}
```

**Resolved member** (computed from above):
```js
{
  ...member,
  displayName: String,         // Name or "Person N"
  heightCmResolved: Number,    // Final height in cm
  isInfant: Boolean,           // Under 24 months
  color: String,               // Hex color from kidColors array
  ageStr: String,              // Formatted e.g. "4yr 6mo"
  heightDisplay: String,       // e.g. "102cm" or "~102cm" if estimated
  hasData: Boolean,            // Whether member has enough data to use
}
```

---

## 🔑 Key Business Logic

### Height Estimation
Uses WHO growth chart data — estimates height from age in years + months using interpolation between known data points.

### Infant Detection
Auto-detected if age < 24 months. User can override with toggle button.

### canRide() function
```js
function canRide(ride, member) {
  if (member.isInfant && ride.infantPolicy === "none") return false;
  if (ride.height && member.heightCmResolved < ride.height) return false;
  return true;
}
```

### Ride ordering in ZoneAccordion
1. Family rides first (whole group can ride) — green header
2. Divider with count
3. Restricted rides below — slightly muted

### Park scorecard (getParkScore)
Returns: total rides, familyCount, infantFriendly count, top 3 featured rides

---

## 🎨 Design System

### Theme (light/dark)
```js
// Key colors
bg, bgCard, bgSecondary, bgInput   // Backgrounds
border, text, textSub, textMuted   // Text and borders
headerBg, shadow, toggleBg         // Special elements
```

### Kid colors (no red — red reserved for errors only)
```js
["#2196F3","#FF9800","#9C27B0","#00BCD4","#4CAF50","#FF5722","#3F51B5","#E91E63"]
```

### Infant policy colors
- ✅ Welcome → green
- 👶 Lap only → blue
- 🎒 Carrier only → amber
- ❌ No infants → red (only use of red)
- 🎟️ Check at gate → purple

### Thrill level colors
- 😊 Gentle → green
- ⚡ Moderate → amber
- 🔥 Thrill → blue (NOT red — avoids confusion with restrictions)

---

## 📱 UI Components

### Setup Screen
- Group name input (optional)
- PersonCard per member (name + age in yrs/mo + height in cm or ft/in)
- Infant auto-detection + manual override toggle
- "Show Me the Rides!" CTA button
- "Skip & browse all" option

### Guide Screen Header
- Group name + member badges
- Edit / Dark mode / Print / Copy / Email buttons
- Member badges show: emoji + name + age + height + infant label

### Park Selection
- Operator filter buttons: All / Disney / Universal / SeaWorld / LEGOLAND / Other
- Horizontal scrollable park tabs (15 parks, swipe to see all)
- Park scorecard: group rides / infant friendly / total rides / top 3 picks

### Zone Accordion
- Wrapping zone chip buttons with colored dot (green/orange/red) + ride count
- Click to filter ride list to that zone
- Click again to clear

### Ride Cards
- Zone label
- Ride name (full width, never competes with height pill)
- Chips row: Thrill + Infant Policy + Best Time (left) | Height pill (right, fixed)
- Pro tip (💡)
- Best time description (⏱️)
- Per-member badges (✅/❌ with reason)

### Footer
- Disclaimer + "Last verified: May 2026"
- Links to all 10 official park websites

---

## ⚙️ Features

| Feature | Status |
|---|---|
| Group member input (name, age, height) | ✅ |
| Age in years + months | ✅ |
| Height in cm or ft/in | ✅ |
| Height estimate from age (WHO charts) | ✅ |
| Infant auto-detection (under 2) | ✅ |
| Infant manual override | ✅ |
| 15 parks across Disney/Universal/SeaWorld/Other | ✅ |
| 200+ verified attractions | ✅ |
| Ride eligibility per member | ✅ |
| Family rides first, restricted below | ✅ |
| Zone filtering via chips | ✅ |
| Thrill level filter | ✅ |
| Infant policy filter | ✅ |
| Park scorecard (group/infant/total counts) | ✅ |
| Top 3 featured rides per park | ✅ |
| Pro tips per ride (plain English) | ✅ |
| Best time to ride (7 options) | ✅ |
| Light / Dark mode | ✅ |
| Print to PDF | ✅ |
| Copy summary to clipboard | ✅ |
| Email summary (mailto) | ✅ |
| Visitor counter badge | ✅ |
| Disclaimer + official park links | ✅ |
| GitHub Pages hosting | ✅ |

---

## 🚧 Known Issues & Notes

### Data accuracy
- DinoLand U.S.A. (Animal Kingdom) — closed permanently Feb 2026
- Jurassic Park River Adventure (IOA) — closed Jan–Nov 2026 for refurbishment
- Pteranodon Flyers (IOA) — closed Feb–May 2026, reopens before July
- Volcano Bay — closes Oct 26, 2026 for major refurbishment
- Fast & Furious: Supercharged (USF) — closing permanently 2027
- Last verified: May 2026

### Code notes
- `"it's a small world"` ride name has escaped quotes — be careful with Python string replacements on line ~85
- Red is reserved ONLY for "cannot ride" states — never use for kid color badges
- All CSS is inline — no external stylesheets
- App.css and index.css are intentionally empty

---

## 🗺️ Planned / Future Features

- [ ] Cost component (ticket prices, Lightning Lane costs, day budget estimator)
- [ ] More parks (Busch Gardens Tampa, Discovery Cove)
- [ ] SeaWorld / LEGOLAND full data verification
- [ ] User-submitted ride photos
- [ ] Day planner / suggested itinerary
- [ ] Majority threshold for group rides (not 100% — e.g. 75% of group)
- [ ] Price tier badges per park (💰 / 💰💰 / 💰💰💰)

---

## 🚀 Deploy Checklist

1. Make changes in `src/App.jsx`
2. Test locally: `npm run dev`
3. Deploy: `npm run deploy`
4. Wait 2 minutes
5. Hard refresh: `Cmd + Shift + R` at https://Grishma-WP.github.io/orlando-parks-guide

---

## 📣 Marketing

**LinkedIn post:** Published May 2026 — "Musing Monday | From a parent's problem to a published app"  
**WhatsApp groups shared:** AI Adda (IIMAC), School parents group, Family group, Apartment building group

**App description (full):**
> Every parent knows the feeling — you've waited 45 minutes in line, your excited 4-year-old is next, and the sign says 102cm minimum. That moment of disappointment is exactly why RideReady exists. Enter your group's ages and heights — from infants to grandparents — and instantly know which rides everyone can enjoy together. 15 Orlando parks, 200+ attractions, height restrictions, infant policies, best times to ride, and pro tips for every attraction. All personalised to your group in seconds. No more surprises at the gate. No more YouTube rabbit holes. No more guessing. Just show up RideReady.

