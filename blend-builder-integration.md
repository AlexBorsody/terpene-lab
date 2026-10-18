# Custom Blend: implementation and launch gate

The builder adds a focused `?tab=blend` view to the existing static Lab. It uses
whole essential oils, a maximum of five ingredients, versioned recipes, and the
existing literature dataset. It does not create a medically validated formula.

## What works now

- Equal qualities-first and oils-first entry points; selected qualities are
  research-topic filters, never efficacy rankings.
- One to five oils, relative oil-mixture percentages, proportional rebalancing,
  live totals, and validation before results/save/share.
- Written study summaries with evidence tiers, limitations and primary-source
  links. Counterevidence is retained. Isolated-constituent findings are not
  promoted into whole-oil claims.
- Per-oil chemistry with the existing provenance checks. Unverified legacy
  ranges remain hidden rather than becoming invented typical percentages.
- Cautions alongside research, pet-context warnings, and explicit missing data.
- Local drafts and up to 12 saved recipes; account-free, portable share links.
  Anyone with a link can read its recipe name and contents. No personal profile,
  account token, cart token or payment information is encoded.
- Offline exploration using the existing integrity-checked PWA release.

## Product decisions

Custom Blend is a flat **$45 USD**, standard **8 oz Sunny's Shield spray**,
standard base, bottle, label, and shipping workflow. There are no oil adders,
custom packaging options, subscriptions, or additional product sizes.

Percentages in a recipe add to 100% **of the essential-oil mixture**. They are
not percentages in the finished spray. The finished-product oil loading must
be supplied separately and reviewed before any purchase is possible. For a
configured final oil load `L` and recipe portion `P`, the oil concentration
checked against its sourced finished-product dermal maximum is `L * P / 100`.

Do not fill missing fields with conventional dilution guesses or infer loading
from an older Sunny's Shield recipe. A nominal bottle size does not establish
mass, density, stability, preservation, dispersion, exposure or safe loading.
The static builder is not a manufacturing instruction generator.

## Data ownership and review

`TERPENE_DATA.blendBuilder` contains the catalog version, controlled quality
labels, product configuration and starter IDs. Each `oils[].blend` contains
quality mappings, availability, review status, sourced dermal limits, separate
caution thresholds, phototoxicity, sensitization, pet context and interactions.
The eight starter oils are an exploratory collection; inventory is unconfirmed.

The shipped records intentionally contain null limits and unconfirmed stock.
Legacy `oil.safety` text is retained for audit but is not a verified purchase
rule. `legacySafetyNotesVerified:false` and `safetyReviewStatus:'unverified'`
make that distinction explicit. No source-linked final safety review has been
supplied. German chamomile and ginger can be added once their identity,
whole-oil research, supplier preparation and review records are available.

`blend-engine.js` documents the machine-readable source, caution and interaction
schemas. All percentages used in safety records refer to the finished product.
An unknown source or malformed safety record blocks checkout; an absence of
warnings is not evidence of safety. Pet context requires an explicit,
source-backed review, not just an oil being absent from a toxicity list.
Review must also cover combined/constituent exposure and the intended spray
application; individual dermal caps alone are insufficient.

Update `catalogVersion` after material recipe/safety changes. Old or unsupported
catalog links are rejected with a visible message, rather than silently
substituting oils or accepting stale safety assumptions.

## Shopify boundary

The Lab is hosted on GitHub Pages at `lab.sunnysshield.com`, outside a Shopify
theme. Do not call cross-origin Shopify Ajax `/cart/add.js`; the Ajax API is
intended for Shopify-hosted themes. No Custom Blend product or variant ID has
been verified in this repository, and no checkout service is deployed here.

The optional client adapter POSTs the engine's canonical `checkoutPayload` to
`product.checkoutEndpoint`. It redirects only to an HTTPS URL whose hostname
is in `product.checkoutAllowedHosts`. All these settings default to unavailable.
The response contract is `{ "checkoutUrl": "https://<verified-host>/..." }`.
Network failures, malformed responses, and unapproved destinations keep the
recipe available and never report an order as completed. One in-flight request
is allowed per button. There is no payment collection in this repository.

A production service must independently:

1. Validate the payload schema, recipe/catalog versions and allowed oil IDs.
2. Re-read current inventory, reviewed formula loading, oil and combined limits,
   pet context, and approval state from trusted server-side data.
3. Resolve the real Custom Blend SKU/variant and enforce the $45 USD price.
   Never trust client price, variant, attributes or readiness flags.
4. Store an immutable canonical recipe and a server-generated approval identity
   for fulfillment; attach readable oil names/portions, recipe version, review
   reference and finalized loading to the actual Shopify order. Customer name
   fields and arbitrary line attributes must not become mixing instructions.
5. Create a Shopify cart or approved draft-order handoff with line properties,
   and verify the actual checkout/order preserves the correct recipe. Exercise
   accelerated checkout, direct variant purchase, altered attributes, old PWA
   clients, quantities, cart merging, out-of-stock changes and duplicate clicks.
6. Reject unapproved orders at the authoritative checkout/approval boundary.
   A disabled browser button or a signed-looking client attribute is insufficient.

There are two possible production approaches. Choose based on the shop's real
plan and operations, not an assumption in this static app:

- A verified app-backed cart and checkout validation integration, available on
  the actual shop, that checks a server-approved recipe. Shopify Functions
  availability depends on app distribution and plan; a bespoke custom Function
  must not be assumed to work on a non-Plus store.
- Manual formula review followed by an approved-recipe draft order. The custom
  SKU must not permit arbitrary unreviewed direct purchases. The customer-facing
  review request and merchant review workflow are not implemented or faked here.

Set `serverValidationVerified:true` only after an end-to-end test proves that
unreviewed/tampered recipes cannot be purchased. Merely deploying an endpoint
or setting an admin flag does not constitute verification. Production checkout
configuration requires a new reviewed change; share links cannot enable it.

Official references:
- [Shopify Ajax API scope](https://shopify.dev/docs/api/ajax)
- [Storefront Cart API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage)
- [Cart and Checkout Validation](https://shopify.dev/docs/api/functions/latest/cart-and-checkout-validation)
- [Shopify Functions availability](https://shopify.dev/docs/apps/build/functions)

## Verification

```sh
python3 scripts/build-pwa.py
node --check blend-engine.js && node --check blend-builder.js
node tests/blend-engine.cjs
node tests/chemistry.cjs
node tests/research-labels-unit.cjs
node tests/pwa-updates.cjs
# With Playwright and Chromium installed:
export PLAYWRIGHT_MODULE=playwright
export CHROME_PATH=/path/to/chromium
node tests/pwa.cjs
python3 -m http.server 8000
# In another shell with the same browser variables:
node tests/browser.cjs
node tests/research-labels.cjs
node tests/blend-browser.cjs
node tests/blend-checkout.cjs
```

Synthetic engine test limits are fixtures only and must never be copied into
production data. Browser tests do not purchase anything. The checkout-adapter suite uses explicitly synthetic in-memory records and intercepts all test POSTs locally, with external traffic blocked. Regenerate and commit
`index.html` and `sw.js` after changing any shipped asset, including the new
builder CSS/JS; CI checks release integrity and regressions.
