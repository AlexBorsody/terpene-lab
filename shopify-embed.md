# Embedding Terpene Lab in Shopify

## Option A: iframe from hosted URL (recommended)

1. Deploy this repo to a static host (Vercel: `vercel --prod`). Note the URL, e.g. `https://terpene-lab.vercel.app`.
2. In Shopify admin: Online Store > Themes > Customize > add a **Custom liquid** section on the page you want (e.g. a new "Terpene Lab" page).
3. Paste:

```html
<div style="max-width:1100px;margin:0 auto;">
  <iframe src="https://terpene-lab.vercel.app"
          style="width:100%;height:900px;border:1px solid #26334f;border-radius:12px;"
          loading="lazy" title="Terpene Lab"></iframe>
</div>
```

4. Adjust `height` to taste. The app is responsive; on mobile it stacks.

Pros: update the tool by pushing to the repo and redeploying, no theme edits needed.
Cons: iframe sandboxing; the tool cannot read the Shopify cart directly (fine for a content tool).

## Option B: theme assets (no iframe)

1. In Shopify admin: Content > Files, upload `index.html` content as a page template alternative, or simpler:
2. Upload `styles.css`, `app.js`, `data.js` under Online Store > Themes > ... > Edit code > Assets.
3. Create a new template `page.terpene-lab.json` with a Custom liquid section that inlines the HTML structure from `index.html` and references the assets:

```html
{{ 'terpene-lab-styles.css' | asset_url | stylesheet_tag }}
<div id="terpene-lab-root"><!-- paste body markup from index.html here --></div>
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
{{ 'terpene-lab-data.js' | asset_url | script_tag }}
{{ 'terpene-lab-app.js' | asset_url | script_tag }}
```

Pros: same domain, full styling control.
Cons: manual re-upload on every data update.

## Notes

- The ECharts CDN must be reachable; if the store blocks third-party scripts, self-host `echarts.min.js` as an asset.
- Keep `data.js` as the single source of truth. When research adds oils, terpenes, or studies, only that file changes.
