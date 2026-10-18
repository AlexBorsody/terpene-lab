# Terpene Lab Blend Builder: Spec for Codex

Date: 2026-10-17
Owner decisions: Alex Borsody (locked in chat, 2026-10-17)
Status: Ready to build. Pricing set by Habib per Alex's delegation.

## One-line summary

A custom essential-oil blend builder inside Terpene Lab (lab.sunnysshield.com), integrated with Sunny's Shield, where customers design their own blend, see the research and the warnings behind every choice, and buy it as the standard 8 oz Sunny's Shield spray.

## Governing principle (Alex's words, paraphrased once)

The logic and the information are as complex as possible. The delivery, shipping, and fulfillment are as simple as possible.

## Product facts

- This is a BUYABLE product, not a free tool and not education-only.
- Ships as the standard 8 oz Sunny's Shield spray bottle, standard base, standard label.
- NO custom labels, no custom packaging, nothing new in fulfillment. It slots into the existing pack-and-ship flow (Pirate Ship, 4x6 labels).
- Price: flat $45 per custom blend. No per-oil pricing, no tiers, no adders. Price does not change with oil selection.

## Terminology

- The builder works with ESSENTIAL OILS, not isolated terpenes. Oils contain terpenes plus other compounds, and the data model must reflect whole-oil chemistry (major constituents listed per oil).
- Effect language is always "purported." No medical claims anywhere. Cosmetic framing only, with a visible disclaimer on the results screen and at checkout.

## User flow

1. Entry choice (user picks, both paths equal):
   - Qualities first: user selects target qualities (e.g. calm, focus, sleep, uplifting). The tool suggests essential oils whose research maps to those qualities.
   - Oils first: user selects essential oils directly. The tool shows the qualities those oils map to.
2. Blend building:
   - Maximum 5 essential oils per blend.
   - User sets the percentage of each oil.
   - Live blend summary updates as percentages change.
3. Generate:
   - Full results screen (see Information Engine below).
   - Safety evaluation runs before purchase is possible (see Safety Rules).
4. Purchase:
   - Add to cart / checkout through the existing Sunny's Shield Shopify setup as its own product ("Custom Blend" SKU), flat $45.
   - The generated blend (oils + percentages) attaches to the order so fulfillment knows exactly what to mix.

## Information engine (the complex part)

For every generated blend, show as much verified information as exists:

- Per-oil profile: major constituents, aroma notes, the qualities it maps to.
- Per-quality research: studies backing the oil-to-quality link, presented as TEXT IN A DESCRIPTION: a written description of what the study found, plus an evidence tier (human clinical / animal / in vitro / traditional use). Description text is the primary format, not a bare link and not a full-text dump. Whether to also attach a PMID link is Codex's call.
- Benefits and warnings get EQUAL visual prominence. Warnings are never below the fold, never smaller, never behind a click.
- Interaction warnings: when selected oils have known interactions or compounding risks (e.g. two phototoxic oils, two high-sensitization oils, additive dermal load), the results call it out by name.
- Percentage warnings: when a single oil's percentage, or the total oil load, passes a caution threshold, flag it with the specific reason and the source limit (e.g. Tisserand/Young dermal maximums).
- Pet context: a "will be used around pets" toggle. When on, oils not considered pet-safer are flagged hard, with the reason shown.
- Blends can be saved and shared via a link (no account required to build; the link encodes the blend).

## Safety rules (hard requirements)

- No general percentage caps. Users may set percentages freely BELOW safe limits.
- HARD CAP: any oil percentage above its documented safe limit for a leave-on spray blocks purchase until lowered. The block message names the oil, the limit, and the source.
- Total blend load cap likewise applies if the data supports one.
- All limit data lives in the oil data records (see Data), never hardcoded in UI logic.
- If research on an oil is thin, the results say so plainly ("limited research") instead of filling space.

## Data model

Per essential oil record in data.js:
- name, botanical name, major constituents (with typical % ranges)
- aroma profile
- quality mappings: quality, evidence tier, study summary, PMID
- dermal max % (with source), phototoxic flag, sensitization notes
- pet-safer flag (with source)
- interaction notes keyed to other oil IDs
- caution thresholds distinct from hard caps

Research content is supplied separately: Habib researches and PMID-tags the studies; Codex builds the structures and logic that consume them. Do not invent studies, PMIDs, or limits. Empty fields render as "no verified data yet."

Granularity note (Alex, 2026-10-17): this spec deliberately leaves implementation detail to Codex. Only the product decisions above are locked; how they are built is Codex's call.

## Out of scope

- Custom labels or any packaging change.
- New bottle formats (8 oz spray only).
- Accounts, subscriptions, blend marketplaces, reviews.
- Medical, therapeutic, or disease claims of any kind.
- AI-generated brand imagery (standing Sunny's Shield rule).

## Build order suggestion

1. Data structures + a starter oil set wired end to end (suggest starting with the oils already in the Sunny's Shield formulas plus German chamomile and ginger).
2. Both entry flows + percentage builder with max-5 enforcement.
3. Results screen with research, warnings, interactions.
4. Safety engine (hard caps, caution flags, pet toggle).
5. Shopify product + blend attached to order + shareable blend links.
