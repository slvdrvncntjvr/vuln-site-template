# Vuln Site Template — Rework Plan (v3, no database)

**Status:** Implemented (v3.0.0)  
**Date:** 2026-08-13  
**Scope:** `vuln-site-template` only — **no changes to seenv2** if the frozen contract below is kept  

---

## What you’re asking for (in plain terms)

The current Acme Shop feels like **six disconnected CTF labs** glued to a fake storefront:

- **“Add to Cart” doesn’t cart** — buttons are decorative  
- **Profile page is broken** — web UI expects `name` / `bio` / `secret`; API returns `fullName` / `orderHistory`  
- Pages say things like **“Session Authorization Simulator”** — obvious AI/CTF slop  
- Web routes **re-implement vulns separately** from the API instead of one app  
- Nothing feels like a site you’d actually use; everything feels like a hint board  

You want an **upgrade**: a small shop that **actually works** (browse, login, cart, checkout, account), vulns buried in real features, **env-only deployment**, **no database**.

That’s doable. The platform doesn’t care how the app stores data — only that the **same HTTP probes and env vars** keep working.

---

## Two repos (unchanged)

| Repo | What it does |
|------|----------------|
| **seenv2** | CTF platform — flags, phases, grader, scoring |
| **vuln-site-template** | App Blues fork, patch, deploy |

Rework = template repo only. Platform stays untouched if probes + `FLAG1`…`FLAG6` + `/__gm/verify` stay the same.

**Contract source of truth:** `seenv2/src/lib/vulnContract.ts`

---

## Frozen contract (must not break)

Same as before — **non-negotiable** for zero platform work:

- Env: `FLAG1`…`FLAG6`, `GM_TOKEN`  
- `POST /__gm/verify` with `{ vulnId, hash }` → `{ match }`  
- Six exploit + six functional probes (exact paths/payloads in `vulnContract.ts`)  
- `GET /__internal/metadata` for SSRF  
- Plant `secret.txt` from `FLAG4` at startup  
- Fork of organizer’s `TEMPLATE_REPOSITORY`, liveness on :3000  

**SQLi note without a DB:** The grader sends a **specific UNION string** against `/api/products/search`. You don’t need SQLite — you need a **product search backend** that, on that exact input, returns `secret_config` rows shaped like products (same as today, but hidden inside a normal `ProductCatalog` service instead of a file named `CatalogRepository` with comments).

---

## Design principles for v3

1. **No database** — no SQLite, Postgres, migrations, or native addons  
2. **In-memory + files only** — seed data loaded at startup; optional JSON seed files in repo  
3. **Session cookie auth** — real login for the website (signed cookie, in-memory session map)  
4. **One service layer** — web pages and API routes call the **same** functions  
5. **Working UX first** — if a button exists, it must do something on the happy path  
6. **No CTF UI** — no simulators, no dropdowns labeled “attacker user id”, no `// Bug:` comments  
7. **Vulns in features** — IDOR in order API, SSRF in “preview supplier URL”, etc.  

---

## Data layer (no DB)

Everything lives in process memory, seeded once at boot:

```
src/data/
  products.json      # catalog
  users.json         # accounts (passwords hashed or plain for demo — your call)
  secret-config.json # internal keys (SQLi source) — not exposed via normal search
```

Runtime stores (Modules or classes):

| Store | Backing | Purpose |
|-------|---------|---------|
| `catalog` | `products.json` | Product list |
| `users` | `users.json` + Map | Accounts + **order history mutated on checkout** |
| `secretConfig` | `secret-config.json` | Row `internal_api_key` = FLAG3 |
| `sessions` | Map in RAM | `sessionId → { userId, cart[] }` |
| `orders` | Map or array | New orders appended at checkout |

**Restart = reset** (fine for Codespaces). **Env flags** still come from `process.env` via `flagService` — platform rotates flags without touching JSON.

**Persistence Blues might expect:** cart survives while server runs; logout/login keeps user orders in memory. Good enough for game day.

---

## What “working website” means (concrete)

These must work on the **happy path** before any exploit talk:

| Flow | Behavior |
|------|----------|
| Home | Lists products; search box filters catalog |
| Product detail | `/products/:id` — description, price, add to cart |
| Register / Login | Form POST → session cookie; bad password → error |
| Cart | Add / remove / change qty; shows line totals |
| Checkout | Logged-in only → creates order, clears cart, confirmation page |
| My account | `/account` — your profile + **your** order history only (via session) |
| Help | `/help` — readable docs from `docs/` folder |
| Staff/support | Subset of tools for “internal” workflows (see vulns) |

Navigation: header with logo, catalog, cart (count), account, help. Looks like one site, not a page per vuln.

---

## Architecture

```
src/
  app.js                 # express, seed load, FLAG4 → secret.txt
  config/
  data/                  # JSON seeds (git committed)
  docs/                  # help files (LFI)
  middleware/
    session.js           # parse cookie, attach req.user + req.cart
  services/
    flagService.js       # unchanged contract
    catalogService.js    # search + list (SQLi lives here)
    userService.js       # profiles, orders
    cartService.js       # session cart
    orderService.js      # checkout
    documentService.js   # file read (LFI)
    previewService.js    # fetch URL (SSRF) — used by web + /api/fetch
    adminTokenService.js # JWT verify (JWT vuln)
    diagnosticsService.js# ping (CMDINJ)
  controllers/           # thin: HTTP in/out
  routes/
    apiRoutes.js         # frozen probe paths only
    webRoutes.js           # HTML flows
  views/
    layout.js            # shared chrome (nav, footer)
    pages/               # split templates per page
```

**Delete the pattern** where `webRoutes.js` implements fetch/ping/profile logic inline. Web calls services; API calls the same services.

---

## Where the six vulns live (same probes, better stories)

### FLAG1 — IDOR

- **Feature:** REST order/profile API used by a future mobile app / partner integration  
- **Implementation:** `GET /api/users/:id/profile` returns user + `orderHistory` (Alice’s third order has `accessToken` = FLAG1)  
- **Flaw:** Trusts `X-User-Id` header instead of binding to session/API key  
- **Web:** `/account` uses session correctly; API remains vulnerable for grader  
- **No** profile “simulator” page  

### FLAG2 — SSRF

- **Feature:** Merchandising — “Preview image from URL” before adding product image link  
- **Web:** `/staff/preview` form (optional login gate as staff user)  
- **API:** `GET /api/fetch?url=` — same backend as web  
- **Flaw:** No block on localhost / internal paths  
- **`/__internal/metadata`:** unchanged JSON with `iam_credentials.session_token`  

### FLAG3 — SQLI

- **Feature:** Catalog search (home + `/search`)  
- **Implementation:** `catalogService.search(q)` — normal filter for regular queries; **one code path** detects the grader’s exact UNION pattern and merges `secretConfig` rows into results (same shape as today’s fake SQLi)  
- **Looks like:** Search service, not “secret_config table” in UI  
- **Patch:** Blues fix that code path; normal search (`q=acme`) must still work  

### FLAG4 — LFI

- **Feature:** Help center — load markdown/text from `docs/`  
- **Web + API:** `/help?doc=readme.txt` and `GET /api/files?path=readme.txt` share `documentService`  
- **Flaw:** Path join allows `../secret.txt`  
- **Startup:** Write `FLAG4` into `secret.txt` (fix env var to `FLAG4`, not legacy `FLAG_LFI`)  

### FLAG5 — JWT

- **Feature:** Admin API dashboard (ops metrics)  
- **Web:** `/staff/admin` — paste JWT, calls `/api/admin/secret` (keep existing admin page idea but styled as internal tool)  
- **Flaw:** `alg: none` accepted  
- **Functional probe:** `POST /api/auth/login` still returns 401 for bad creds, not 500  

### FLAG6 — CMDINJ

- **Feature:** Support diagnostics — ping customer-reported host  
- **Web:** `/staff/diagnostics` — form posts to same logic as `/api/ping`  
- **Flaw:** Shell concat on host param (Linux Codespaces)  

---

## What we remove / fix from current template

| Current trash | v3 fix |
|---------------|--------|
| Non-clickable Add to Cart | Real cart + checkout |
| Profile page field mismatch | Account page uses same `userService` as API |
| “Session Authorization Simulator” | Removed — IDOR only on API |
| `webRoutes` duplicate vuln code | Single service layer |
| `// Bug:` comments everywhere | Gone |
| Obvious page-per-vuln nav | Staff tools grouped; public nav is shop-only |
| `FLAG_LFI` in `app.js` | `FLAG4` |
| Product cards showing `secretFlag` in HTML | Never leak flags in server-rendered pages |

---

## UI direction (avoid AI slop)

- **One layout** — nav, footer, consistent typography (keep CSS variables, tighten spacing)  
- **Copy** — write like a small business (“Acme Shop”), not a security lab  
- **Staff section** — `/staff/*` behind login as Alice (seed admin); explains why SSRF/ping tools exist  
- **No lorem ipsum walls** — short real product descriptions, 6–8 products max  
- **Errors** — normal HTTP messages, not “EXPLOIT HERE”  

---

## Implementation phases

### Phase 1 — Working shop, no vulns (2 days)

- JSON seed + in-memory stores  
- Session auth (login/logout/register)  
- Catalog, cart, checkout, account, help  
- Shared layout + nav  
- All API routes return **safe stub** responses or 501  

**Done when:** You can shop as Bob end-to-end on Codespaces.

### Phase 2 — Wire frozen API + plant vulns (1 day)

- Implement six services with flaws per above  
- `/__gm/verify`, `flagService`, metadata endpoint  
- `secret.txt` planter  
- Run organizer smoke script locally (`scripts/staff-smoke.js`, not shipped in fork) or platform `answer-key/` curls  

---

## Anti-hint policy (game day)

Blues fork **must not** contain:

- Comments or names that reveal vulnerability type (`Bug`, `exploit`, `IDOR`, etc.)
- `test-exploits.js` or staff smoke scripts (gitignored; organizers use platform answer-key)
- Committed real flag values (only env at runtime)
- Public nav links to vuln lab pages

---

## Testing checklist

- [x] Browse → add to cart → checkout → see order on `/account`  
- [x] Login wrong password → error; right password → session  
- [x] Organizer smoke / answer-key curls pass on default branch  
- [x] Functional probes pass (search `acme`, own profile, readme.txt, etc.)  
- [x] No flag strings in HTML source except via intentional API exploit  
- [x] Restart server → cart clears, users/orders from JSON re-seed (document in README)  

---

## Platform impact

| Item | Change? |
|------|---------|
| seenv2 code | **No** |
| `vulnContract.ts` | **No** |
| Env block | **No** |
| Grader | **No** |
| `answer-key/` | Optional wording tweaks only |
| GitHub template repo | Tag new release when ready |

---

## Success = you said it’s not ass

You’ll know v3 is right when:

1. A non-security friend can **buy something** without instructions  
2. Blues patch **features**, not “the IDOR page”  
3. Red still uses the **same** platform flag submit + probes  
4. Deploy is still **env paste + npm start** — no DB setup  

---

## Next step

Branch `v3-rework` → **Phase 1 only** (working shop, secure stubs). Review the storefront feel before planting vulns.

Say when to start implementation.
