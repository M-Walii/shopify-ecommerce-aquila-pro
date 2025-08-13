### Aquila Pro — Shopify OS 2.0 Theme
A clean, fast, and accessible Shopify theme built with Liquid and a small amount of vanilla JavaScript. It focuses on great UX, higher conversions, and solid technical SEO.

---

### Repository
- GitHub: https://github.com/M-Walii/shopify-ecommerce-aquila-pro

### Highlights
- Cart Drawer with AJAX add-to-cart, free-shipping progress, and line-item controls
- Predictive Search with debounce and keyboard navigation
- No-app Collection Filters (vendor, tag, price, sort) via AJAX + pushState
- Product page with variant syncing, swatches, price/media updates
- Structured Data: Organization, Product, BreadcrumbList
- Accessibility-first: skip link, focus states, aria-live, dialogs
- i18n: English and German (`en.default.json`, `de.json`)
- Performance: responsive images, lazy loading, deferred JS, system font stack

### Tech stack
- Shopify Liquid (OS2.0 JSON templates, modular sections/snippets)
- Vanilla JavaScript (no framework)
- HTML/CSS with a minimal style system and CSS variables bound to theme settings
- GitHub Actions CI (Theme Check + docs HTML validation)

### Requirements
- A Shopify store (Partner development store is fine)
- Node.js 18+ (20+ recommended)
- Shopify CLI: `npm i -g @shopify/cli @shopify/theme`

### Quick start
1) Clone repository
```bash
git clone https://github.com/M-Walii/shopify-ecommerce-aquila-pro
cd shopify-ecommerce-aquila-pro
```

2) Preview the theme locally (Shopify CLI)
```bash
shopify theme dev --path theme
```
- The CLI prints a preview URL. Any changes in `theme/` hot-reload.

3) Optional: Validate docs site locally
```bash
npm install
npm run docs:validate
```

### Project structure
```text
/
├─ theme/                # Shopify theme (Liquid sections, templates, assets, config, locales)
├─ docs/                 # Static showcase site (deploy to Netlify/Vercel/GitHub Pages)
├─ tools/                # Dev utilities (image optimizer)
├─ .theme-check.yml      # Theme Check config
├─ package.json          # Docs tooling and scripts
└─ README.md             # This file
```

Key theme files (non-exhaustive):
- `theme/layout/theme.liquid`: Base layout, SEO/head tags, a11y skip link, header/footer, cart drawer mount
- `theme/sections/header.liquid`: Logo, navigation, search trigger, mini-cart, predictive search panel
- `theme/sections/footer.liquid`: Footer navigation and basic info
- `theme/sections/hero.liquid`: Homepage hero module
- `theme/sections/product-grid.liquid`: Collection-bound grid with adjustable page size
- `theme/sections/main-product.liquid`: Product gallery, price, variants, swatches, USP badges, add-to-cart
- `theme/sections/cart-drawer.liquid`: AJAX cart with progress and controls
- `theme/sections/announcement-bar.liquid`: Announcement/free shipping threshold banner
- `theme/sections/collection-filters.liquid`: Vendor/tag/price/sort filters
- `theme/snippets/product-card.liquid`: Responsive images, sale badge, quick-add form
- `theme/snippets/seo-meta.liquid`: Open Graph + JSON‑LD (Product, BreadcrumbList, Organization)
- `theme/assets/main.js`: Predictive search, cart drawer, variants, AJAX filters
- `theme/assets/main.css.liquid`: Theme styles bound to color settings
- `theme/config/settings_schema.json`: Colors, free shipping threshold, announcement text, predictive search toggle, social links
- `theme/locales/en.default.json`, `theme/locales/de.default.json`: All strings in locales

### Metafields
- Create product metafield definition: `custom.usp_badges` (List of text)
- The `usp-badges.liquid` section will render these badges on the product page.

### Theme settings
- Colors: primary, secondary (used in CSS variables)
- Free shipping threshold (used by cart drawer progress + announcement bar)
- Announcement text (multi-locale via locales)
- Predictive search toggle
- Social links (used in Organization JSON‑LD)

### Analytics events
Events pushed to `window.dataLayer`:
- `view_item` (on product page render)
- `add_to_cart` (on successful AJAX add-to-cart)
- `begin_checkout` (on checkout CTA in cart drawer)

### Accessibility and SEO
- Skip link, focus states, aria-live region for status messages
- Predictive search dialog with Escape to close, and keyboard navigation
- Canonical URL + `hreflang` (EN/DE)
- JSON‑LD for Organization, Product (on PDP), BreadcrumbList (non-home)

### Performance
- Responsive images with `srcset`/`sizes` and `loading="lazy"`
- Preloaded CSS, deferred JS
- System font stack / `font-display: swap`
- Minimal JS, no front-end framework


### Image optimization (docs)
```bash
npm run docs:images
```
- Uses `tools/optimize-images.js` with `sharp` to convert images in `docs/` to WebP.

### Author
- Muhammad Waleed — [GitHub: M-Walii](https://github.com/M-Walii)