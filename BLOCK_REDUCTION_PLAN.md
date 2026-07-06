# HerbAtlas-EDS Block Reduction Plan

Goal: document the completed reduction from 37 blocks to 23 blocks, then guide the final reduction from 23 blocks to 20 blocks without losing functionality.

This file is a handoff document for another AI/chat. The current da.live content is remote through `fstab.yaml`, so do not assume a block is unused only because local HTML does not reference it. Ask the user for da.live screenshots/tables whenever a block may still be authored on a page.

## Current Blocks

```text
account-profile
addresses
ailments-results
browse-results
cards
cart
category-strip
checkout-flow
columns
contact-form
disclaimer-callout
faq
feature-cards
footer
fragment
header
herb-cards
herb-detail
hero
home-hero
image-text
login-auth
orders
order-success
process-list
process-steps
product-cards
recommended-herbs
reviews-grid
section
section-header
shop-detail
shop-results
stats-band
team-cards
text
widget
```

Current count: 37.

Final target count: 23.

Note: the project has already reached the 23-block state. The next target is a final 20-block state. See "Final 20 Extension Plan" below before doing any more deletion or merging.

## Final 23 Blocks

```text
header
footer
fragment
hero
home-hero
category-strip
feature-cards
faq
reviews-grid
herb-cards
browse-results
ailments-results
shop-results
herb-detail
shop-detail
contact-form
login-auth
account-profile
cart
checkout-flow
addresses
orders
order-success
```

## Blocks To Remove Or Merge

```text
cards                 -> remove if unused
columns               -> remove if unused
text                  -> remove if unused
section               -> remove if unused
widget                -> remove if unused
process-steps         -> merge into feature-cards/process variant
process-list          -> merge into feature-cards/process variant
team-cards            -> merge into feature-cards/team variant
stats-band            -> merge into feature-cards/stats variant
disclaimer-callout    -> merge into feature-cards/callout variant
image-text            -> merge into hero/image-right where possible
section-header        -> absorb into blocks that already support eyebrow/title/CTA
recommended-herbs     -> merge into herb-cards/recommended mode
product-cards         -> merge into shop-results/featured mode
```

## Blocks Not To Merge

Keep these separate because they contain page-level behavior, localStorage/sessionStorage, data loading, or complex UI state:

```text
header
footer
home-hero
browse-results
ailments-results
shop-results
herb-detail
shop-detail
contact-form
login-auth
account-profile
cart
checkout-flow
addresses
orders
order-success
```

## Recommended Work Order

### Phase 1: Usage Proof Before Deleting Boilerplate

Goal: safely remove unused starter blocks.

Candidate blocks:

```text
cards
columns
text
section
widget
```

Rules:

1. Search local files.
2. Ask the user for da.live page screenshots/tables where needed.
3. Do not delete if any page still uses the block title.
4. If unused, remove the block folder.

Expected reduction: 5 blocks.

Count after Phase 1:

```text
37 - 5 = 32
```

### Phase 2: Merge Static Layout Blocks Into feature-cards

Goal: one reusable visual card/list block with variants.

Merge these into `feature-cards`:

```text
team-cards
stats-band
process-list
process-steps
disclaimer-callout
```

Add/confirm feature-cards variants:

```text
feature-cards
feature-cards (nav, four-column)
feature-cards (team)
feature-cards (stats)
feature-cards (process)
feature-cards (steps)
feature-cards (callout)
```

Rules:

1. Do one merge at a time.
2. Preserve visuals before deleting the old block.
3. Ask user to update da.live table title for that page.
4. Test affected page.
5. Only then remove old block folder.

Expected reduction: 5 blocks.

Count after Phase 2:

```text
32 - 5 = 27
```

### Phase 3: Merge image-text Into hero Variants

Goal: remove `image-text` where it is only used for intro/story two-column sections.

Replace:

```text
image-text (image-left)
image-text (image-right)
```

With:

```text
hero (image-left)
hero (image-right)
```

Rules:

1. Only merge image-text sections that match a simple image/text layout.
2. Do not merge complex body content into hero.
3. Ask user for About page da.live screenshot before removing `image-text`.

Expected reduction: 1 block.

Count after Phase 3:

```text
27 - 1 = 26
```

### Phase 4: Remove section-header By Absorbing Header Fields

Goal: avoid separate section-header tables before each block.

Most blocks already support or can support:

```text
Eyebrow
Title
Description
CTA Text
CTA Link
```

Move section-header content into these blocks where possible:

```text
herb-cards
recommended/herb-cards
shop-results/product-cards
reviews-grid
feature-cards
process/features
```

Rules:

1. Do not remove `section-header` until all da.live pages stop using it.
2. Ask user for screenshots of Home, About, Contact, Browse, Shop.
3. Convert page by page.

Expected reduction: 1 block.

Count after Phase 4:

```text
26 - 1 = 25
```

### Phase 5: Merge recommended-herbs Into herb-cards

Goal: one herb card renderer.

Replace:

```text
recommended-herbs
```

With:

```text
herb-cards (recommended)
```

Rules:

1. Move recommendation profile matching logic into `herb-cards`.
2. Preserve localStorage keys:
   - `loggedIn`
   - `userEmail`
   - `userProfiles`
3. Preserve empty state when profile is missing.
4. Ask user to update Home da.live table.

Expected reduction: 1 block.

Count after Phase 5:

```text
25 - 1 = 24
```

### Phase 6: Merge product-cards Into shop-results

Goal: one product/shop listing renderer.

Replace:

```text
product-cards
```

With:

```text
shop-results (featured)
```

Rules:

1. Preserve featured product card visuals on Home.
2. Preserve shop listing mode separately inside the same block.
3. Preserve product detail links.
4. Do not break add-to-cart behavior on Shop page.
5. Ask user to update Home da.live product table.

Expected reduction: 1 block.

Final count:

```text
24 - 1 = 23
```

## Final Count Math

```text
Current blocks: 37
- remove unused boilerplate: 5
- merge static blocks into feature-cards: 5
- merge image-text into hero: 1
- remove section-header: 1
- merge recommended-herbs into herb-cards: 1
- merge product-cards into shop-results: 1
= 23 blocks
```

## Rules For The Next AI

1. Do not remove a block unless both are true:
   - local search shows no dependency after migration
   - user confirms da.live no longer uses that block title
2. Ask the user for a da.live screenshot/table before changing any authored table name.
3. Change one merge group at a time.
4. After every merge:
   - update the JS/CSS
   - provide the exact new da.live table
   - ask user to update da.live
   - wait for screenshot/result if needed
   - only then remove the old block folder
5. Do not merge commerce/auth/page-flow blocks.
6. Do not change business logic while reducing blocks.
7. Do not redesign the UI.
8. Preserve localStorage/sessionStorage keys.
9. Preserve existing routes without `.html`:
   - `/`
   - `/browse`
   - `/ailments`
   - `/shop`
   - `/herb-detail`
   - `/shop-detail`
   - `/cart`
   - `/checkout`
   - `/login`
   - `/account`
   - `/profile`
   - `/addresses`
   - `/orders`
   - `/order-success`
   - `/about`
   - `/contact`

## Prompt For Another AI / New Chat

Copy this prompt into the new chat:

```text
You are continuing HerbAtlas-EDS migration cleanup.

Important context:
- Source repo folder: herbatlas
- Target EDS folder: herbatlas-eds
- HerbAtlas source is reference only unless user explicitly asks changes there.
- Main task now: reduce HerbAtlas-EDS blocks from 37 to final target 23 without losing functionality.
- Read these files first:
  - herbatlas-eds/BLOCK_REDUCTION_PLAN.md
  - herbatlas-eds/DA_LIVE_TABLES.md
  - herbatlas-eds/fstab.yaml
  - herbatlas-eds/blocks

Rules:
1. Do not remove a block unless usage has been verified locally and with the user when da.live content is required.
2. Ask the user for da.live screenshots/tables whenever a block may still be authored remotely.
3. Merge one block group at a time.
4. After each merge, give exact da.live replacement table.
5. Do not merge commerce/auth/page-flow blocks:
   cart, checkout-flow, login-auth, account-profile, addresses, orders, order-success, herb-detail, shop-detail, browse-results, ailments-results, shop-results, home-hero.
6. Preserve existing localStorage/sessionStorage keys and routes.
7. Do not redesign UI.
8. Do not change business logic unless the merge requires moving existing logic unchanged.

Recommended start:
Phase 1: verify and remove unused boilerplate blocks:
cards, columns, text, section, widget.

Then:
Phase 2: merge static visual blocks into feature-cards:
team-cards, stats-band, process-list, process-steps, disclaimer-callout.

Final target block list:
header, footer, fragment, hero, home-hero, category-strip, feature-cards, faq, reviews-grid, herb-cards, browse-results, ailments-results, shop-results, herb-detail, shop-detail, contact-form, login-auth, account-profile, cart, checkout-flow, addresses, orders, order-success.
```

---

# Final 20 Extension Plan

Current confirmed block count: 23.

Target final block count: 20.

This phase should happen only after confirming the related da.live tables have been updated. Do not remove a block folder just because the local repo has no direct HTML reference; the actual page content is authored remotely through da.live.

## Current 23 Blocks

```text
account-profile
addresses
ailments-results
browse-results
cart
category-strip
checkout-flow
contact-form
faq
feature-cards
footer
fragment
header
herb-cards
herb-detail
hero
home-hero
login-auth
orders
order-success
reviews-grid
shop-detail
shop-results
```

## Final 20 Blocks

```text
header
footer
fragment
hero
home-hero
feature-cards
faq
herb-cards
browse-results
ailments-results
shop-results
herb-detail
shop-detail
contact-form
login-auth
account-profile
cart
checkout-flow
addresses
orders
```

## Final 3 Merges

| Current Block | Merge Into | Final Authoring Pattern | Risk | Reason |
|---|---|---|---|---|
| `category-strip` | `home-hero` | `home-hero` with `Pill` rows | Low | The category strip is home-only and visually belongs directly under the home hero. |
| `reviews-grid` | `feature-cards` | `feature-cards (reviews)` | Medium | Review cards are static card content plus optional aggregate styling. |
| `order-success` | `orders` | `orders (success)` | Medium | Order success and order history use the same order data and localStorage source. |

Expected count:

```text
23 - 3 = 20
```

## Blocks Not To Merge Further

Keep these separate because merging them would reduce maintainability or mix unrelated business flows:

```text
cart
checkout-flow
login-auth
account-profile
addresses
herb-detail
shop-detail
browse-results
ailments-results
shop-results
home-hero
```

Reasons:

- `cart`, `checkout-flow`, `addresses`, `orders`: commerce flow and localStorage order/address data.
- `login-auth`, `account-profile`: auth/profile state and validation.
- `herb-detail`, `shop-detail`: URL-param-driven detail pages with different layouts.
- `browse-results`, `ailments-results`, `shop-results`: different search/filter/listing behavior.
- `home-hero`: unique home carousel, hero stats, coupon handoff, and home-only intro behavior.

## Final 20 Work Order

### Phase 7: Merge category-strip Into home-hero

Goal: remove the standalone `category-strip` block while preserving the home Browse By pill row.

Required behavior:

- Render the Browse By strip directly from `home-hero`.
- Preserve pill links exactly:
  - `/ailments?ailment=Stress+%26+Anxiety`
  - `/ailments?ailment=Sleep+Issues`
  - `/ailments?ailment=Low+Immunity`
  - `/ailments?ailment=Digestion`
  - `/ailments?ailment=Skin+Problems`
  - `/ailments?ailment=Low+Energy`
  - `/ailments?ailment=Joint+Pain`
  - `/ailments?ailment=Hormonal+Balance`
- Preserve responsive behavior:
  - desktop horizontal row
  - tablet wrap or horizontal scroll if space is tight
  - mobile usable pill spacing, no clipping, no overlapping

da.live change required:

- Move the existing `category-strip` rows into the existing `home-hero` table as `Pill` rows.
- Delete the separate `category-strip` table only after the home page renders correctly.

Safe delete condition:

- da.live home page no longer has any table titled `category-strip`.
- Local search shows no remaining dependency on `blocks/category-strip`.
- Home page pill row works on desktop and mobile.

### Phase 8: Merge reviews-grid Into feature-cards

Goal: remove `reviews-grid` by adding a `feature-cards (reviews)` variant.

Required behavior:

- Preserve customer review card layout.
- Preserve rating display.
- Preserve reviewer name, review text, optional location/avatar if authored.
- Preserve aggregate/summary styling if currently used.
- Preserve home page spacing and responsive card grid.

Responsive requirements:

- desktop: multi-column review grid matching original HerbAtlas spacing.
- tablet: cards reduce cleanly without overflow.
- mobile: single-column cards with readable spacing.

da.live change required:

- Replace the `reviews-grid` table with `feature-cards (reviews)`.

Safe delete condition:

- da.live home page no longer has any table titled `reviews-grid`.
- Review cards render correctly from `feature-cards (reviews)`.
- Local search shows no remaining dependency on `blocks/reviews-grid`.

### Phase 9: Merge order-success Into orders

Goal: remove `order-success` by adding an `orders (success)` variant.

Required behavior:

- `orders` default mode continues to render order history.
- `orders (success)` renders the order confirmation page.
- Read `orderId` from the URL query parameter.
- Read matching order from `localStorage.orders`.
- Preserve missing/invalid order empty state.
- Preserve links to `/orders` and `/shop`.

Responsive requirements:

- confirmation card remains centered and readable.
- action buttons wrap on small screens.
- order item rows do not overflow on mobile.

da.live change required:

- On `/order-success`, replace the `order-success` table with `orders (success)`.

Safe delete condition:

- da.live order success page no longer has any table titled `order-success`.
- `/orders` still renders order history.
- `/order-success?orderId=...` renders confirmation.
- Local search shows no remaining dependency on `blocks/order-success`.

## Final 20 Rules

1. Merge only one block at a time.
2. Ask the user for the current da.live table/screenshot before changing any authored page.
3. Provide the exact replacement da.live table before asking the user to update da.live.
4. After the user updates da.live, verify the page before deleting the old block folder.
5. Do not delete a block folder while da.live still contains that block title.
6. Do not change business logic while reducing block count.
7. Do not change localStorage or sessionStorage structures.
8. Do not redesign the UI.
9. Preserve no-`.html` routes.
10. Preserve responsive behavior at:
    - 1440px
    - 1280px
    - 1024px
    - 768px
    - 480px
    - 360px
11. Run lint after each merge if possible:
    - `node ./node_modules/eslint/bin/eslint.js .`
    - `node ./node_modules/stylelint/bin/stylelint.mjs "blocks/**/*.css" "styles/*.css"`
12. If npm fails on Windows with `spawn C:\Program Files\nodejs ENOENT`, use the direct `node` lint commands above.

## Final 20 Prompt For Another AI

Copy this prompt into the new chat:

```text
You are continuing HerbAtlas-EDS cleanup from the existing 23-block state to the final 20-block state.

Project folders:
- Source/reference: herbatlas
- Target EDS project: herbatlas-eds

Read first:
- herbatlas-eds/BLOCK_REDUCTION_PLAN.md
- herbatlas-eds/DA_LIVE_TABLES.md
- herbatlas-eds/fstab.yaml
- herbatlas-eds/blocks

Important:
- HerbAtlas is reference only. Do not modify it.
- HerbAtlas-EDS is the target.
- da.live content is remote through fstab.yaml, so local HTML does not prove whether a block is unused.
- Ask the user for da.live screenshots/tables whenever an authored block table must be changed.

Current confirmed block count: 23.

Current blocks:
account-profile, addresses, ailments-results, browse-results, cart, category-strip, checkout-flow, contact-form, faq, feature-cards, footer, fragment, header, herb-cards, herb-detail, hero, home-hero, login-auth, orders, order-success, reviews-grid, shop-detail, shop-results.

Final target block count: 20.

Final blocks:
header, footer, fragment, hero, home-hero, feature-cards, faq, herb-cards, browse-results, ailments-results, shop-results, herb-detail, shop-detail, contact-form, login-auth, account-profile, cart, checkout-flow, addresses, orders.

Required final merges:
1. Merge category-strip into home-hero.
2. Merge reviews-grid into feature-cards as feature-cards (reviews).
3. Merge order-success into orders as orders (success).

Rules:
1. Do one merge at a time.
2. Before changing code, inspect both source and target block JS/CSS.
3. Before changing da.live assumptions, ask the user for the current table or screenshot.
4. Provide exact replacement da.live tables.
5. Wait for user confirmation/screenshots when needed.
6. Delete old block folders only after da.live no longer uses that block title.
7. Do not change business logic.
8. Do not change localStorage/sessionStorage structures.
9. Do not redesign UI.
10. Preserve responsive behavior at 1440, 1280, 1024, 768, 480, and 360px.
11. Run lint after each merge if possible:
   - node ./node_modules/eslint/bin/eslint.js .
   - node ./node_modules/stylelint/bin/stylelint.mjs "blocks/**/*.css" "styles/*.css"

Start with Phase 7:
Merge category-strip into home-hero.
Ask the user for the current Home page da.live home-hero and category-strip tables before editing.
```

---

# Optional 20 To 19 Review

The project has reached 20 blocks. This is the recommended final architecture because the remaining blocks are mostly page-level behavior blocks, not simple visual sections.

## Keep fragment

Do not remove `fragment`.

Reason:

- It is an EDS-native reuse mechanism.
- It is useful for shared authored content.
- `scripts/scripts.js` already supports `/fragments/` references.
- Removing it saves only one tiny block but reduces future authoring flexibility.

## Do Not Merge browse-results Or ailments-results Into herb-cards

Do not merge these:

```text
browse-results -> herb-cards
ailments-results -> herb-cards
```

Reason:

- `herb-cards` should remain a reusable herb card renderer for simple card sections.
- `browse-results` is a page-level listing experience with search/filter/pagination/empty states.
- `ailments-results` is a page-level ailment picker with URL preselect, ailment matching, guide steps, and result rendering.
- Merging them would make `herb-cards` an overly large "everything herbs" block and make debugging harder.

## Only Clean Optional Merge

The only relatively safe final reduction is:

```text
faq -> feature-cards (faq)
```

This would reduce the final count:

```text
20 -> 19
```

Use this only if the user strongly wants fewer blocks. It is optional, not required.

## Optional Phase 10: Merge faq Into feature-cards

Goal: remove the standalone `faq` block by adding a `feature-cards (faq)` variant.

Required behavior:

- Preserve FAQ accordion behavior.
- Only one question should remain open at a time.
- Preserve keyboard accessibility from the native `<details>` / `<summary>` pattern if currently used.
- Preserve original visual spacing and responsive behavior.
- Support da.live rows:
  - `Question`
  - `Answer`

Risk: Low to Medium.

Reason:

- FAQ is a simple content pattern.
- It does have interactive accordion behavior, so the merge should be done carefully.
- This is much safer than merging browse, ailments, cart, checkout, auth, or detail pages.

da.live change required:

Replace:

```text
| faq |
| Question | ... |
| Answer | ... |
```

With:

```text
| feature-cards (faq) |
| Question | Answer |
| ... | ... |
```

Safe delete condition:

- da.live no longer has any table titled `faq`.
- `feature-cards (faq)` renders the same FAQ accordion.
- Contact page FAQ works on desktop and mobile.
- Local search shows no remaining dependency on `blocks/faq`.

## Final Recommendation

Recommended final count:

```text
20 blocks
```

Optional minimum clean count:

```text
19 blocks
```

Do not push to 18 or 17 unless the user accepts higher complexity and harder maintenance.

## Prompt For Optional 20 To 19 Merge

Copy this prompt into another AI/chat if the user wants to try the optional FAQ merge:

```text
You are continuing HerbAtlas-EDS block reduction after the project reached 20 blocks.

Important:
- Source/reference project: herbatlas
- Target project: herbatlas-eds
- HerbAtlas source is read-only.
- Do not remove fragment.
- Do not merge browse-results or ailments-results into herb-cards.
- Do not merge cart, checkout-flow, login-auth, account-profile, addresses, orders, herb-detail, shop-detail, browse-results, ailments-results, shop-results, home-hero, header, or footer.

Task:
Implement only the optional final reduction:
Merge faq into feature-cards as feature-cards (faq).

Before changing files:
1. Inspect:
   - herbatlas-eds/blocks/faq/faq.js
   - herbatlas-eds/blocks/faq/faq.css
   - herbatlas-eds/blocks/feature-cards/feature-cards.js
   - herbatlas-eds/blocks/feature-cards/feature-cards.css
   - herbatlas contact page FAQ usage in DA_LIVE_TABLES.md
2. Ask the user for the current da.live Contact page FAQ table/screenshot if needed.

Implementation rules:
1. Add a feature-cards (faq) variant.
2. Preserve the FAQ accordion behavior.
3. Only one question should remain open at a time.
4. Preserve keyboard accessibility.
5. Preserve visual design and responsive behavior.
6. Do not change other feature-cards variants.
7. Do not change business logic.
8. Do not change localStorage/sessionStorage structures.
9. Provide the exact replacement da.live table.
10. Do not delete blocks/faq until the user confirms da.live no longer uses the faq table.

After implementation:
- Run lint if possible:
  node ./node_modules/eslint/bin/eslint.js .
  node ./node_modules/stylelint/bin/stylelint.mjs "blocks/**/*.css" "styles/*.css"
- Report files modified.
- Report da.live table changes.
- Report whether faq folder can be deleted or must wait for da.live update.
```
