# September 2026 Webflow pages

Edit source pages in `src`, then run `node webflow/build.js`. The generated `dist` files are the Webflow embeds or footer code for the results, curator, home, about, success and Go Deeper pages. The quiz sources retain existing quiz behavior and replace the supplied images; the quiz footer sources add button styling.

`assets.json` separates on-page JPGs from the original downloadable PNGs. Downloads include six cards and use native file sharing where supported, with individual download links as a fallback. Heart and Mind retain their existing gradient images because replacements were absent. The pre-house display JPG was derived from the supplied PNG.

Checkout uses `soul_report_september` (£19) and `soulbox_september` (£50). Physical checkout accepts GB shipping only. Existing checkout plans remain available.

Run `npm test` for result mappings, saving failures, checkout parameters and asset mappings. Browser checks cover desktop and mobile layouts, save failures, navigation and sharing with a mocked native API. Actual mobile share sheets still require a device check.
