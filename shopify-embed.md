# Embedding Terpene Lab in Shopify

The tool is hosted on GitHub Pages: `https://alexborsody.github.io/terpene-lab/`
No build step, no server. Pushing to the repo redeploys it automatically.

## Option A: JS widget (recommended, one paste)

In Shopify admin: Online Store > Themes > Customize, add a **Custom liquid**
section on the page you want (e.g. a new "Terpene Lab" page), and paste:

```html
<div id="terpene-lab"></div>
<script src="https://alexborsody.github.io/terpene-lab/embed.js"
        data-target="terpene-lab"></script>
```

Options on the script tag:

- `data-target`: id of the div to mount into (default `sunnys-terpene-lab`).
- The iframe starts at 1000px high, has no border, and fills its container.
- Valid height messages are accepted only from this iframe on either the
  existing GitHub Pages origin or `https://lab.sunnysshield.com`.

## Planned standalone lab domain

After the coordinated DNS/GitHub Pages cutover and HTTPS verification, the
standalone lab will be available at `https://lab.sunnysshield.com/`. Link to
that address to open the full-width lab outside the Shopify page wrapper.

Existing script snippets remain compatible with GitHub Pages' redirect.
For new embeds after cutover, use:

```html
<div id="terpene-lab"></div>
<script src="https://lab.sunnysshield.com/embed.js"
        data-target="terpene-lab"></script>
```

The helper uses the custom-domain root when loaded there. Embedded pages hide
the standalone return link and keep their existing compact layout.

## Option B: plain iframe

Same Custom liquid section, no script:

```html
<div style="max-width:1100px;margin:0 auto;">
  <iframe src="https://alexborsody.github.io/terpene-lab/?embed=1"
          style="width:100%;height:900px;border:1px solid #26334f;border-radius:12px;"
          loading="lazy" title="Terpene Lab"></iframe>
</div>
```

## Option C: theme assets (no iframe, same domain)

1. Upload `styles.css`, `app.js`, `data.js`, `embed.js` content under
   Online Store > Themes > Edit code > Assets.
2. Create a `page.terpene-lab.json` template with a Custom liquid section
   that inlines the body markup from `index.html` and references the assets.

More manual than A/B, but same-domain. Only worth it if the store blocks
third-party iframes.

## Notes

- ECharts loads from jsDelivr CDN. If the store blocks third-party scripts,
  self-host `echarts.min.js` and change the script tag in `index.html`.
- The app is responsive and touch-friendly; on mobile the views stack.
- Content updates: edit `data.js`, push, done. No theme edits needed for A/B.

