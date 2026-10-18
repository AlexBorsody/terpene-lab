# Custom Blend: simple Shopify handoff

The Lab is a static, account-free builder at `lab.sunnysshield.com`. Customers
choose up to five oils and relative portions totaling 100%, then continue to
Shopify for a **$40 USD, standard 8 oz Custom Blend**. Every custom recipe is
reviewed manually before mixing. No Lab backend, webhook, API token, extra login
or Shopify Plus feature is required.

## Current configuration

`master-data.json` → `blendBuilder.product` (generated as `TERPENE_DATA.blendBuilder.product`) is the product configuration:

- `name: "Custom Blend"`, `price: 40`, `currency: "USD"`, `size: "8 oz"`.
- `shopifyStoreUrl: "https://sunnysshield.com"`, the verified existing storefront.
- `shopifyVariantId: null` until the actual Custom Blend variant is verified.
- `baseVersion: null` unless the merchant supplies a real base version.
- Existing final-loading/limit fields stay unknown unless supported by reviewed
  formulation data. No dilution, base composition or stock is inferred.

Product name, price, currency and size are read from this configuration for the
display and readable recipe. The engine validates their shape rather than
maintaining another hard-coded product definition. The current offer remains
$40 USD / 8 oz. A recipe cannot override these values, the destination or variant;
Shopify remains authoritative for the actual price and availability.

As of 2026-10-18, the public store does not list a Custom Blend product. The Lab
therefore shows a concise setup message rather than an active purchase link.
The handoff is implemented and tested with fixtures; no real custom order,
merchant order-property display or payment has been verified.

## Cart link and recipe field

`BLEND_ENGINE.cartPermalink(recipe, data)` revalidates the canonical recipe and
configured product, then returns `{url, recipe, properties, encodedRecipe}`.
The link is constructed only from the trusted store configuration:

`https://sunnysshield.com/cart/{verified-variant-id}:1?properties={encoded-properties}`

`encoded-properties` is UTF-8 Base64URL encoding of a JSON object containing
exactly one string property, **Recipe**. The readable value includes:

- Recipe name, recipe schema version and catalog version.
- Oil names, stable oil IDs and relative percentages totaling 100% of the oil
  mixture. These are not finished-spray concentrations.
- Pet context as a customer-supplied review flag, not a pet-safety claim.
- Base version only if actually configured.
- A canonical recipe code for exact reconstruction and manual-review wording.

There are no efficacy promises, safety certificates, automatic approvals,
customer addresses, emails, tokens or payment details in the property. Shopify
collects checkout information and owns the actual price, taxes and shipping.
The displayed $40 is not a client-side override of the Shopify variant price.

The property belongs to this order line, not the product description or the
order-wide note. Only one custom product/quantity is sent per handoff. Shopify's
permalink documentation permits up to 25 properties on the first product; this
implementation deliberately uses only one. It does not promise merging an
existing cart or preserving multiple custom blends across separate visits.
Customers are prompted to check cart contents before paying.

The anchor is rebuilt whenever the recipe changes, revalidated on click and
targets the top window so embedded Lab users reach Shopify checkout outside the
iframe. Draft choices are persisted before navigation. There is no asynchronous
checkout POST, returned redirect URL or application server to configure.

## Validation and manual review

Schema validation continues to reject missing/unknown oils, duplicates, more
than five oils, invalid percentages, totals other than 100%, unsupported recipe
or catalog versions, invalid names and extra fields. Oils-first recipes never
retain invisible selected qualities, including older saved/shared recipes.
Store URLs must be HTTPS root origins without credentials, query, fragment or
custom port. Variant IDs must be valid positive numeric IDs; recipes cannot
change the destination or product configuration.

Research and cautions remain equally prominent. Missing formulation, stock or
ingredient-review data is information for manual review, not an automatic
approval or a requirement for a separate checkout service. If actually sourced
final loading and a sourced hard limit establish an excess, or a sourced
blocking interaction exists, the Lab does not offer the handoff until corrected.

The browser is not an enforcement boundary. Anyone can alter a URL or buy the
variant directly. Every order must be treated as an unreviewed recipe request,
including orders without a Recipe property. Before mixing, the merchant checks
the oils and stock, proportions, final formulation/loading, base, application,
combined risks and pet context. Missing, changed or unsuitable requests require
merchant resolution before fulfillment; no automatic mixing workflow is implied.

The Lab does not invent a refund policy or guarantee fulfillment of every
requested combination. The merchant's product page should explain the actual
review and resolution policy.

## Enable the real handoff

1. Create or identify the actual standard 8 oz Custom Blend variant in Shopify,
   confirm $40 USD, availability and the merchant's manual review process.
2. Verify the numeric variant ID and storefront, then set `shopifyVariantId` in
   a reviewed change. Do not paste credentials or a Shopify Admin API token.
3. Verify a test handoff on the actual store: correct product/price/quantity,
   Unicode recipe, readable Recipe property, changed recipe, existing cart,
   mobile/embedded navigation and unavailable product behavior. Inspect the
   merchant order line with an authorized test order before claiming end-to-end
   order verification. No paid order is part of the current implementation.
4. Keep fulfillment manual and review orders missing or carrying altered recipe
   data. A client-rendered link is not safety certification.

## Local cache and sharing

The existing `terpene-lab:blend:v1` local-storage record holds the draft and up to
12 saved recipes. It includes the name, starting path, visible selected
research topics (the version-1 field remains `qualityIds`), oils, percentages and pet context. No account is created. Browser
storage can be cleared, blocked or device-specific; share links provide a
portable fallback. Legacy calm/focus/sleep/uplifting IDs migrate through canonical aliases; valid saved recipes are canonicalized before deduplication. Topics come from the same hierarchical master used by the research library, while per-oil relevance remains explicitly scoped. Anyone with a share link can read its recipe and name.
No Shopify cart secret is stored in those links or cached by the Lab.

The integrity-checked PWA caches the explorer for offline use. Shopify checkout
still requires a network connection. After asset edits, regenerate `index.html`
and `sw.js` with `python3 scripts/build-pwa.py`; existing installed clients use
the app's update control to accept the new release.

## Verification

```sh
python3 scripts/build-data.py
python3 scripts/build-data.py --check
python3 scripts/build-pwa.py
node tests/master-data.cjs
node tests/research.cjs
node tests/research-audit.cjs
node tests/blend-engine.cjs
node tests/chemistry.cjs
node tests/research-labels-unit.cjs
node tests/pwa-updates.cjs
# Playwright + Chromium and local HTTP server required:
node tests/pwa.cjs
python3 -m http.server 8000
node tests/browser.cjs
node tests/research-labels.cjs
node tests/taxonomy-browser.cjs
node tests/blend-browser.cjs
node tests/blend-checkout.cjs
```

The handoff browser suite uses synthetic variant/store fixtures and intercepts
all external navigation. It never reaches Shopify, creates an order or collects
payment. Synthetic safety values are fixtures, not production recommendations.

Official reference: [Shopify cart permalinks and line-item properties](https://shopify.dev/docs/apps/build/checkout/create-cart-permalinks).
