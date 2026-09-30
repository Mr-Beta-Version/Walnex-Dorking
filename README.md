# Walnex-Dorking

**by Walnex-Technologies**

A curated collection of Google dorking queries for security researchers and bug bounty hunters. Enter a target domain, browse categorized dorks, and launch searches directly — one at a time or in bulk.

> For educational and **authorized** security testing only.

---

## Features

- **44 built-in dorks** across categories like directory listings, exposed configs/databases/backups, login pages, SQL errors, subdomains, cloud storage, source-code leaks, and more.
- **Target domain input** with automatic cleanup — paste a full URL and it's normalized to a bare domain:
  - `https://website.com` → `website.com`
  - `http://www.website.com/abc/def?x=1` → `website.com`
- **Search & filter** dorks by name, description, or tag; toggle a tag to narrow the grid.
- **One-click dork cards** — clicking a card opens the built query (Google, crt.sh, Wayback Machine, Shodan, GitHub, etc.) for the current domain in a new tab.
- **Bulk tab opening** — "Tabs 1-10", "Tabs 11-20", etc., open every dork in that batch (10 at a time) for the current filtered list.
- **Guard rails**
  - Opening a card or a batch with no domain entered shows a toast — *"Please enter a target domain first."* — and focuses the input instead of silently doing nothing.
  - If the browser blocks pop-up tabs (only one `window.open` is allowed per click without permission), a toast tells you how many tabs were blocked and how to allow pop-ups for the site.
- **Fully themeable** — every color in the UI comes from CSS variables in one place, so the whole look can be re-skinned by editing a handful of values.


## Usage

1. Open https://mr-beta-version.github.io/Walnex-Dorking/
2. Type or paste a target domain into the **"Enter target domain"** field (URLs are auto-cleaned to a bare domain).
3. Optionally search or filter by category tag to narrow the list.
4. Click any dork card to open that query in a new tab, or use the **Tabs X-Y** buttons to open a whole batch (10 at a time) of the currently filtered dorks.
5. If pop-ups are blocked, allow pop-ups for the page via the browser's address-bar icon and try again.

---

## Adding or editing dorks

All dork definitions live in `js/data.js` as entries in the `dorkCategories` array:

```js
{
  id: "unique-id",
  name: "Display Name",
  description: "Shown under the title on the card",
  url: (d) => go(`site:${d} intitle:index.of`), // `d` is the target domain
  tags: ["recon", "exposure"],
}
```

- Use the `go(query)` helper for a standard Google search URL, or return any other URL (as several entries do for crt.sh, Wayback Machine, Shodan, etc.).
- `tags` populate the category filter row automatically — no other file needs to change.

---


## Browser notes

- Multiple tabs opened at once (bulk buttons) require the browser's pop-up blocker to allow the site — most browsers only allow one automatic `window.open()` per click otherwise.
- The page sends no referrer (`<meta name="referrer" content="no-referrer">`) when navigating to dork targets.

---

## Owner

**Muhammad Walid**
GitHub: [Mr-Beta-Version](https://github.com/Mr-Beta-Version)
Email: [mdwalidmahmud@gmail.com](mailto:mdwalidmahmud@gmail.com)

## Disclaimer

This tool only builds and opens search-engine queries; it does not scan, exploit, or access any system on your behalf. Use it only against domains you own or are explicitly authorized to test. Walnex-Technologies is not responsible for misuse.
