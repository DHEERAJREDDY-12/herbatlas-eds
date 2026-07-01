# HerbAtlas-EDS Block Reduction Plan

Goal: reduce the current 37 blocks to a final target of 23 blocks without losing functionality.

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

