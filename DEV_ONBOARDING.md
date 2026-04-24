# Afferens — Dev Onboarding Brief
### For: Aariz, Ayoub — and Faris

This document is written so Faris can understand it too. Every technical section has a plain-English version first. If you are Faris reading this and something is still confusing, ask.

---

## 1. What Is Afferens? (Plain English)

Imagine an AI agent — a program that makes decisions on its own, like a robot navigating a warehouse or a drone avoiding obstacles. Right now, most AI agents are effectively blind and deaf. They can only work from their training data. They can't feel what's happening in the physical world around them in real time.

Afferens fixes that. It's an API — a service that developers connect their AI agents to — that gives agents real-time physical perception. Temperature, gas levels, what a camera sees, where something is in space, sound events, the health of the hardware itself. Six types of sensory data ("modalities"), all returned in a standardised format the AI agent can immediately use to make decisions.

Developers connect to Afferens with a single line of code (a `curl` call or any HTTP request). They pay per query — priced by modality — using "Sense Tokens". Everyone gets 10,000 tokens free at signup, no card required.

**The live product is at:** https://afferens.com

---

## 2. The Six Modalities (What the API Returns)

| Modality | What it is | Cost per call |
|----------|-----------|--------------|
| VISION | What a camera sees — objects, people, bounding boxes | 14 tokens |
| SPATIAL | Where something is — GPS, altitude, heading, speed | 10 tokens |
| ACOUSTIC | Sound events — machinery, alarms, noise levels | 8 tokens |
| ENVIRONMENTAL | Temperature, humidity, pressure, wind | 6 tokens |
| MOLECULAR | Air quality — CO2, CO, VOCs, particulates, gas traces | 18 tokens |
| INTEROCEPTION | The health of the AI node itself — CPU, battery, memory, uptime | 5 tokens |

---

## 3. The Tech Stack (What the Codebase Is Made Of)

**Plain English:** The website and API are built with three main services wired together.

| Layer | Tool | What it does |
|-------|------|-------------|
| Frontend + API | Next.js (React) | The website (homepage, dashboard, docs, pricing) AND the API endpoints all live here |
| Database + Auth | Supabase | Stores user accounts, API keys, token balances, sensory data, and command queues |
| Hosting | Vercel | Runs the app live at afferens.com |
| Payments | Stripe | Handles token top-ups when users run out of free tokens |

Language: TypeScript throughout. No Python, no other languages.

---

## 4. Full File Map

```
afferens/
├── app/                        ← Everything the user sees or calls
│   ├── page.tsx                ← Homepage (afferens.com)
│   ├── dashboard/page.tsx      ← User dashboard — shows API key + token balance
│   ├── docs/page.tsx           ← API documentation
│   ├── pricing/page.tsx        ← Pricing page
│   ├── signup/page.tsx         ← Sign up page
│   ├── node/page.tsx           ← Edge node info page
│   ├── admin/page.tsx          ← Admin-only page (Faris only)
│   ├── legal/page.tsx          ← Terms / legal
│   └── api/                    ← The actual API (what developers call)
│       ├── demo/route.ts       ← Public demo — no API key needed, canned data
│       ├── perception/route.ts ← Real perception data — requires API key, costs tokens
│       ├── ingest/route.ts     ← Submit sensor data to the pool — requires API key
│       ├── actuation/route.ts  ← Send commands to physical nodes — requires API key
│       ├── commands/route.ts   ← Nodes poll this to receive their queued commands
│       ├── feedback/route.ts   ← User feedback widget submission
│       ├── checkout/route.ts   ← Stripe checkout (token top-up)
│       ├── autotopup/route.ts  ← Auto top-up trigger
│       ├── webhooks/stripe/route.ts ← Stripe webhook (fires after payment)
│       └── auth/               ← Supabase auth callbacks
├── components/
│   └── FeedbackWidget.tsx      ← Floating feedback button on every page
├── lib/
│   ├── supabase/
│   │   ├── admin.ts            ← Supabase admin client (bypasses auth — server-only)
│   │   ├── client.ts           ← Supabase browser client
│   │   └── server.ts           ← Supabase server client
│   └── ratelimit.ts            ← Rate limiting (prevents API abuse)
├── supabase/
│   ├── schema.sql              ← Full database schema — run this to set up a new DB
│   └── migration_*.sql         ← Incremental database changes
├── public/
│   ├── llms.txt                ← AEO file — tells AI crawlers what Afferens is
│   └── afferens-*.png          ← Logo assets
├── .env.local                  ← Secret keys (NEVER commit this to git)
└── CLAUDE.md                   ← Instructions for Claude Code AI assistant
```

---

## 5. The Database (What's Stored in Supabase)

**Plain English:** There are three main tables. Think of them like spreadsheet tabs.

### `api_keys`
One row per user. Stores their API key, how many tokens they've used, and whether auto top-up is on.

| Column | What it holds |
|--------|--------------|
| `user_id` | Links to the Supabase auth user |
| `key` | The actual API key string (e.g. `aff_abc123...`) |
| `tokens_consumed` | How many tokens this user has spent |
| `is_active` | Whether the key works (can be deactivated) |
| `auto_topup_enabled` | Whether to auto-charge when tokens run low |
| `auto_topup_threshold` | Token level that triggers auto top-up |

### `perception_events`
The pool of sensory data. When a developer calls `/api/perception`, rows from this table are returned.

| Column | What it holds |
|--------|--------------|
| `entity_id` | ID of the detected object (e.g. `ENT-0x1A3F`) |
| `modality` | VISION / SPATIAL / ACOUSTIC / ENVIRONMENTAL / MOLECULAR / INTEROCEPTION |
| `classification` | What was detected (e.g. `forklift`, `methane_trace`) |
| `confidence` | How confident the reading is (0.0–1.0) |
| `spatial_coords` | Where it is (JSON — varies by modality) |
| `sense_tokens_cost` | How many tokens this row costs to return |

### `commands`
When a developer calls `/api/actuation` to send a command to a physical node, it queues here. The node polls `/api/commands` to pick it up.

| Column | What it holds |
|--------|--------------|
| `target_node_id` | Which physical node to send the command to |
| `command_type` | One of: CAPTURE_FRAME, TRIGGER_ALARM, MOVE_TO, ROTATE_CAMERA, LOCK, UNLOCK, ADJUST_SENSOR, SHUTDOWN_NODE |
| `parameters` | Any extra details (e.g. `{"x": 10, "y": 5}` for MOVE_TO) |
| `status` | `queued` → `executed` |
| `sense_tokens_cost` | 5 tokens flat per command |

---

## 6. How to Get Set Up Locally

**Plain English:** You're going to copy the code to your laptop, install its dependencies, add the secret keys, and start a local version of the app.

### Step 1 — Clone the repo
```bash
git clone https://github.com/afferens/afferens.git
cd afferens
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Create your local secrets file
Create a file called `.env.local` in the root of the project (same folder as `package.json`). **Never commit this file to git.** Ask Faris for the values.

```
NEXT_PUBLIC_SUPABASE_URL=          ← Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     ← Supabase publishable key
SUPABASE_SERVICE_ROLE_KEY=         ← Supabase secret key (ask Faris)
STRIPE_SECRET_KEY=                 ← Stripe live key (ask Faris)
STRIPE_WEBHOOK_SECRET=             ← Stripe webhook secret (ask Faris)
```

### Step 4 — Run locally
```bash
npm run dev
```

App will be at http://localhost:3000

---

## 7. Smoke Test — Verify Everything Works

Run these tests after any change to confirm nothing is broken. These are curl commands — run them in a terminal.

### Test 1: Demo endpoint (no key needed)
```bash
curl "https://afferens.com/api/demo?modality=VISION"
```
**Expected:** JSON with `"demo": true` and a forklift/person detection result.

### Test 2: Demo — all 6 modalities
```bash
for m in VISION SPATIAL ACOUSTIC ENVIRONMENTAL MOLECULAR INTEROCEPTION; do
  echo "--- $m ---"
  curl -s "https://afferens.com/api/demo?modality=$m" | head -c 200
  echo ""
done
```
**Expected:** Each returns different data. None should 404 or error.

### Test 3: Real API (requires a valid API key)
Replace `YOUR_KEY_HERE` with the key from afferens.com/dashboard after signing in.
```bash
curl -H "X-API-KEY: YOUR_KEY_HERE" "https://afferens.com/api/perception?modality=VISION"
```
**Expected:** JSON with `"status": 200` and real perception data. Token balance decreases by 14.

### Test 4: No key → should reject
```bash
curl "https://afferens.com/api/perception"
```
**Expected:** `{"status": 401, "error": "Missing API key..."}` — correct, this is working as designed.

### Test 5: Actuation command
```bash
curl -X POST "https://afferens.com/api/actuation" \
  -H "X-API-KEY: YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"target_node_id": "NODE-001", "command_type": "CAPTURE_FRAME"}'
```
**Expected:** `{"status": 200, "command_id": "...", "status_label": "queued"}` — confirms the actuation layer is live.

### Test 6: Sign up flow (do this in a browser)
- Go to afferens.com/signup
- Create an account with a test email
- Confirm email if required
- Go to /dashboard
- Verify API key is shown and token balance shows 10,000

---

## 8. Current Task List

### Ayoub — Start Here

These tasks are well-defined, don't require deep knowledge of the codebase, and will get you familiar with how everything works.

**A1 — Run all smoke tests above and document results**
Run every curl command in Section 7. Note which pass, which fail, what the actual responses look like. Create a file `SMOKE_TEST_RESULTS.md` with your findings.

**A2 — Sign up and use the product as a real developer would**
Create an account at afferens.com. Get your API key. Call all 6 modalities. Check your token balance changes correctly. Note anything that feels broken, confusing, or missing.

**A3 — Read the docs page and audit it**
Go to afferens.com/docs. Compare every curl example on the docs page against what the API actually returns when you call it. Flag any examples that are wrong or out of date.

**A4 — Vercel redeployment verification**
The app's secret keys were recently rotated. Confirm the live app is working correctly by running all smoke tests against `afferens.com` (not localhost). If any fail, report back.

---

### Aariz — Start Here

**B0 — Beta test the product first (before touching the MCP server)**
Sign up at afferens.com. Get your API key from the dashboard. Call all 6 modalities using the demo endpoint (no key needed) and then the real `/api/perception` endpoint (uses your key). Use the feedback widget on the site to log anything that feels broken, confusing, or missing — attach screenshots. Do this before building anything.

**B1 — Main Task: MCP Server**
See Section 9 below. This is a standalone repo, published to npm. Full spec is there.

---

## 9. Aariz — MCP Server: Full Spec

### What is an MCP Server? (Plain English)
MCP (Model Context Protocol) is a standard that lets AI assistants like Claude and ChatGPT call external tools. If Afferens has an MCP server, a developer can say to Claude: *"Check the MOLECULAR reading for my warehouse node"* — and Claude calls Afferens directly without the developer writing any code.

This is a distribution play. MCP registries (Smithery, mcp.so) list available servers. Developers browse them. We get discovered.

### Repository
- New standalone repo: `afferens-mcp` (not inside the main afferens codebase)
- npm package name: `@afferens/mcp-server`
- Install command for end users: `npx @afferens/mcp-server`

### Tech
- Language: TypeScript
- MCP SDK: `@modelcontextprotocol/sdk` (official Anthropic SDK)
- Transport: stdio (standard for npx-style MCP servers)
- No database — the MCP server just forwards requests to `afferens.com`

### Tools to Expose

The server exposes two sets of tools: **demo tools** (no API key needed, great for first discovery) and **perception tools** (require an API key, real data).

#### Demo Tools (no key needed)

**`afferens_demo`**
- Description: `"Try the Afferens sensory API without an API key. Returns sample real-time physical perception data. Get your free API key with 10,000 tokens at afferens.com — no card required."`
- Input: `{ modality: "VISION" | "SPATIAL" | "ACOUSTIC" | "ENVIRONMENTAL" | "MOLECULAR" | "INTEROCEPTION" }`
- What it does: GET `https://afferens.com/api/demo?modality={modality}`
- Returns: raw API response

#### Perception Tools (require API key)

**`afferens_perceive`**
- Description: `"Query real-time physical perception data from Afferens. Requires an API key (free tier: 10,000 Sense Tokens at afferens.com)."`
- Input: `{ api_key: string, modality: "VISION" | "SPATIAL" | "ACOUSTIC" | "ENVIRONMENTAL" | "MOLECULAR" | "INTEROCEPTION", limit?: number }`
- What it does: GET `https://afferens.com/api/perception?modality={modality}&limit={limit}` with `X-API-KEY: {api_key}` header
- Returns: raw API response

**`afferens_actuate`**
- Description: `"Send a command to a physical node connected to Afferens. Valid commands: CAPTURE_FRAME, TRIGGER_ALARM, MOVE_TO, ROTATE_CAMERA, LOCK, UNLOCK, ADJUST_SENSOR, SHUTDOWN_NODE. Costs 5 Sense Tokens per command."`
- Input: `{ api_key: string, target_node_id: string, command_type: string, parameters?: object }`
- What it does: POST `https://afferens.com/api/actuation` with JSON body
- Returns: raw API response

**`afferens_ingest`**
- Description: `"Submit sensor data into the Afferens perception pool. Use this to push readings from your own hardware into the system."`
- Input: `{ api_key: string, modality: string, entity_id: string, classification: string, confidence: number, spatial_coords: object }`
- What it does: POST `https://afferens.com/api/ingest` with JSON body
- Returns: raw API response

### Claude Desktop Config (paste this in the README)
```json
{
  "mcpServers": {
    "afferens": {
      "command": "npx",
      "args": ["-y", "@afferens/mcp-server"]
    }
  }
}
```

### Deliverables
1. `src/index.ts` — the full server
2. `package.json` — publishable to npm under `@afferens/mcp-server`
3. `README.md` — install instructions + Claude Desktop config + one example of each tool
4. Published to npm (`npm publish --access public`)
5. Submitted to Smithery (smithery.ai) — they have a form, takes 5 minutes

### Priority
Build `afferens_demo` and `afferens_perceive` first. Ship those. Then add `afferens_actuate` and `afferens_ingest`.

---

## 10. What NOT to Build Right Now

To avoid scope creep before YC (deadline: May 4, 2026):

- No new modalities
- No new API endpoints
- No UI redesign
- No Python SDK
- No authentication changes
- No database schema changes

If you spot something broken — report it. Don't fix anything that isn't on the task list above without checking with Faris first.

---

## 11. How to Reach Faris

Faris is non-technical and will not always understand code. When you need to communicate:

- **Report in plain English first.** "X is broken, here's what I did, here's what I saw."
- **If it's a blocker,** say so explicitly. Don't assume Faris will infer urgency.
- **If you need a key or credential,** ask Faris directly. Don't commit secrets.
- **If something in this doc is wrong,** fix it and push the update.

---

*Last updated: April 21, 2026*
