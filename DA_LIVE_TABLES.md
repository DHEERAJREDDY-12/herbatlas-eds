# HerbAtlas-EDS da.live Table Inventory

This file captures the known da.live tables from the HerbAtlas-EDS migration work.

Important: da.live content is remote through `fstab.yaml`, so this file may not be complete. Before deleting or renaming a block, ask the user for the current da.live page screenshot/table.

All tables below are written in copy-friendly Markdown code blocks.

## Global Navigation

Page/location: nav document or header fragment.

```text
| Text      | Link      |
|-----------|-----------|
| HerbAtlas | /         |
| Home      | /         |
| Browse    | /browse   |
| Ailments  | /ailments |
| Shop      | /shop     |
| About Us  | /about    |
```

## Global Footer

Page/location: footer document or footer fragment.

```text
| Section | Text        | Link                                             |
|---------|-------------|--------------------------------------------------|
| Brand   | HerbAtlas   |                                                  |
| Brand   | Documenting the world's medicinal herbs for curious minds and wellness seekers. | |
| Brand   | For educational purposes only. Not medical advice. | |
| Explore | Home        | /                                                |
| Explore | Browse      | /browse                                          |
| Explore | Ailments    | /ailments                                        |
| Explore | About Us    | /about                                           |
| Shop    | All Products| /shop                                            |
| Shop    | Cart        | /cart                                            |
| Account | My Account  | /profile                                         |
| Account | Login       | /login                                           |
| Account | Sign Up     | /login?tab=register                              |
| Account | Contact Us  | /contact                                         |
| Social  | Instagram   | https://www.instagram.com/_herbatlas?igsh=OXhicWx4bmowZzlx |
| Social  | Facebook    | https://www.facebook.com/share/1BPQ3Z8bna/       |
| Social  | Twitter     | https://x.com/_dheeraj__reddy                    |
| Bottom  | 2026 HerbAtlas |                                               |
| Bottom  | Always consult a healthcare professional. |                  |
```

## Home Page

### Home Hero

Page: `/`

```text
| home-hero | | | | | | | | | |
| Eyebrow | The World's Herb Encyclopedia |
| Title | Nature's oldest<br><em>pharmacy,</em><br>documented. |
| Description | Explore {herbCount}+ medicinal herbs from around the world. Discover ancient remedies, practical uses and buy premium quality herbs. |
| Stat | {herbCount} | Herbs |
| Stat | 8 | Regions |
| Stat | 500+ | Orders |
| Slide | HERB OF THE WEEK | /images/ui/hero-slide-1.webp | Tulsi - Holy Basil | Tulsi &mdash; Holy Basil | Ocimum tenuiflorum &middot; South Asia | Immunity &middot; Stress relief &middot; Respiratory health | View Herb | /herb-detail?id=2 |
| Slide | FIND YOUR REMEDY | /images/ui/hero-slide-2.webp | Find your remedy | What's bothering you? | Tell us your concern | Stress &middot; Sleep &middot; Immunity &middot; Digestion | Find My Herb | /ailments |
| Slide | PURE QUALITY | /images/shop/ashwagandha-product.webp | Organic ashwagandha powder product | 100% Organic Powder | No fillers &middot; No additives | Certified &middot; Tested &middot; Trusted | Shop Now | /shop |
| Slide | BESTSELLER | /images/ui/hero-slide-4.webp | Ashwagandha powder pack | Ashwagandha Powder | Starting at &#8377;399 | Trusted for 3000+ years | Buy Now | /shop-detail?id=1 |
| Slide | FREE DELIVERY | /images/ui/hero-slide-5.webp | Herbs ready to ship | Order above &#8377;999 | Pan India delivery | Shipped in 2 to 3 business days | Browse Shop | /shop |
| Slide | SPECIAL OFFER | /images/shop/turmeric-product.webp | Special offer on herb products | Use code HERB10 | Get 10% off your order | On all herb powder products | Claim Offer | /shop | HERB10 |
```

### Category Strip

Page: `/`

```text
| category-strip | |
| Label | Browse by |
| Pill | Stress | /ailments?ailment=Stress+%26+Anxiety |
| Pill | Sleep | /ailments?ailment=Sleep+Issues |
| Pill | Immunity | /ailments?ailment=Low+Immunity |
| Pill | Digestion | /ailments?ailment=Digestion |
| Pill | Skin | /ailments?ailment=Skin+Problems |
| Pill | Energy | /ailments?ailment=Low+Energy |
| Pill | Joint Pain | /ailments?ailment=Joint+Pain |
| Pill | Hormonal | /ailments?ailment=Hormonal+Balance |
```

### Recommended Herbs

Current page: `/`

Future final block should be `herb-cards (recommended)`.

```text
| herb-cards (recommended) |
| Eyebrow | Based on Your Profile |
| Title | Recommended Herbs |
| CTA Text | Update profile |
| CTA Link | /account |
| Mode | recommended |
| Data | /data/herbs.json |
| Detail Base | /herb-detail |
| Limit | 4 |
| Show Empty | yes |
```

### Recently Added Herbs

Current page: `/`

```text
| herb-cards |
| Eyebrow | Explore the Collection |
| Title | Recently <em>Added</em> |
| CTA Text | View all herbs |
| CTA Link | /browse |
| Mode | recent |
| Limit | 4 |
| Detail Base | /herb-detail |
```

### Featured Products

Current page: `/`

Future final block should be `shop-results (featured)`.

```text
| shop-results (featured) |
| Eyebrow | Shop Now |
| Title | Bestselling <em>Products</em> |
| CTA Text | View all products |
| CTA Link | /shop |
| Mode | featured |
| Product IDs | 1, 2, 3, 7 |
| Badges | Bestseller, Top Rated, Most Popular, Staff Pick |
| Detail Base | /shop-detail |
| Button Text | View Product |
```

### Home Reviews

Page: `/`

```text
| reviews-grid |
| Eyebrow | What Customers Say |
| Title | User <em>Reviews</em> |
| CTA Text | Browse shop |
| CTA Link | /shop |
| Name | Ananya R. |
| Rating | 5 |
| Review | Excellent quality herbs and quick delivery. |
| Name | Rohit M. |
| Rating | 5 |
| Review | The Tulsi powder feels fresh and pure. |
| Name | Priya S. |
| Rating | 4 |
| Review | Helpful herb details and nice product packaging. |
```

### How It Works

Current page: `/`

Future final block should be `feature-cards (steps)` or `feature-cards (process)`.

```text
| process-steps |
| Simple and Intuitive |
| How <em>HerbAtlas</em> Works |
| 01 | Search or Browse | Find herbs by name with our powerful system. |
| 02 | Read the Full Profile | Every herb has a complete page with uses, dosage, warnings and recipes. |
| 03 | Order Premium Quality | Buy certified organic herbs sourced from trusted farms worldwide. |
```

## Browse Page

Page: `/browse`

```text
| hero (simple, dark) |
| Eyebrow | Explore the Collection |
| Title | All <em>Herbs</em> |
| Description | Explore our complete collection of 40 medicinal herbs from around the world |
```

```text
| browse-results |
| Herbs Data | /data/herbs.json |
| Detail Base | /herb-detail |
| Page Size | 8 |
| Filter Label | Filter |
| All Text | All |
| Safe Text | Generally Safe |
| Caution Text | Use with Caution |
| Empty Title | No herbs found |
| Empty Text | Try a different safety filter. |
```

## Ailments Page

Page: `/ailments`

```text
| hero (simple, dark) |
| Eyebrow | Find Your Remedy |
| Title | Browse by <em>Ailment</em> |
| Description | Choose a concern and discover herbs traditionally used for support. |
```

```text
| ailments-results |
| Ailments Data | /data/ailments.json |
| Herbs Data | /data/herbs.json |
| Detail Base | /herb-detail |
| Page Size | 4 |
| Results Title Prefix | Herbs for |
| Clear Text | Clear |
| Empty Title | No herbs found |
| Empty Text | No herbs are mapped to this concern yet. |
| Guide | 1 | Choose a concern | Start with the symptom or wellness goal you care about most. |
| Guide | 2 | Compare herbs | Review best-for labels and safety status before opening details. |
| Guide | 3 | Save your profile | Use Account for personal recommendations on the home page. |
```

## Shop Page

Page: `/shop`

```text
| hero (commerce, dark) |
| Eyebrow | Shop Premium Herbs |
| Title | Organic Herb <em>Products</em> |
| Description | Buy premium quality herb powders sourced from trusted farms. |
```

```text
| shop-results |
| Products Data | /data/herbs.json |
| Detail Base | /shop-detail |
| Page Size | 8 |
| Filter Label | Filter |
| Add Text | Add to Cart |
| View Text | View Product |
| Empty Title | No products found |
| Empty Text | Try a different filter or search. |
```

## About Page

Page: `/about`

```text
| hero (image-right, dark) |
| Eyebrow | Our Story |
| Title | We believe nature has an answer for everything. |
| Description | HerbAtlas was born from a passion for ancient herbal wisdom and a mission to make pure medicinal herbs accessible to everyone. |
| Image | /images/about/about-hero.webp |
| Image Alt | HerbAtlas herb products |
```

```text
| hero (image-left) |
| Image | images/ui/about-bg2.webp |
| Image Alt | Premium HerbAtlas herb powders arranged on a wooden surface |
| Eyebrow | Brand Story |
| Title | How HerbAtlas Started |
| Description | HerbAtlas began with a simple question - why are the most powerful medicinal herbs in the world so hard to find in their pure form? |
| Description | We spent years researching ancient Ayurvedic texts, traditional Chinese medicine and herbal traditions from across the world. What we found was extraordinary - nature had already solved most of our modern health problems thousands of years ago. |
| Description | Today HerbAtlas brings you 40+ of the world's most powerful medicinal herbs in pure powder form. No fillers. No additives. Just nature at its finest. |
| CTA Text | Explore Our Herbs |
| CTA Link | /browse |
```

```text
| feature-cards |
| ORG | 100% Organic | Every herb certified organic from source to shelf |
| LAB | Lab Tested | Every batch tested for purity and potency |
| GLB | Globally Sourced | Direct from certified organic farms worldwide |
| PWR | Pure Powder Form | No fillers no additives just the herb itself |
| DLV | Free Delivery | Free shipping on all orders above Rs 999 |
| EXP | Expert Knowledge | Each herb documented with traditional and modern research |
```

```text
| stats-band |
| 40+ | Herbs in Collection |
| 500+ | Orders Delivered |
| 6 | Regions Worldwide |
| 100% | Organic Certified |
| 3000+ | Years of Tradition |
```

```text
| process-list |
| 01 | Farm Selection | We carefully select certified organic farms worldwide |
| 02 | Harvest at Peak | Herbs harvested at peak potency for maximum benefit |
| 03 | Lab Testing | Every batch independently tested for purity and safety |
| 04 | Careful Packing | Sealed in kraft pouches to preserve freshness |
| 05 | Fast Delivery | Delivered to your door in 2 to 3 business days |
```

```text
| team-cards |
| Image | Name | Role | Description | Link |
```

```text
| disclaimer-callout |
| Eyebrow | Educational Use |
| Title | Always consult a healthcare professional |
| Body | HerbAtlas content is for educational purposes only and is not medical advice. |
```

## Contact Page

Page: `/contact`

```text
| hero (simple, dark) |
| Eyebrow | Contact Us |
| Title | We are here to <em>help</em> |
| Description | Reach out for support, questions, or product help. |
```

```text
| feature-cards |
| Email | Email Support | Send us a message anytime | /contact |
| Orders | Order Help | Get help with your herb product orders | /orders |
| FAQ | Common Questions | Browse answers to frequent questions | /contact |
```

```text
| contact-form |
| Title | Send us a message |
| Name Label | Name |
| Email Label | Email |
| Subject Label | Subject |
| Message Label | Message |
| Button Text | Send Message |
| Success Text | Thank you. Your message has been saved. |
```

```text
| faq |
| Question | How long does delivery take? |
| Answer | Orders usually ship in 2 to 3 business days. |
| Question | Are the products organic? |
| Answer | HerbAtlas products are sourced from trusted farms and tested for quality. |
| Question | Is HerbAtlas medical advice? |
| Answer | No. HerbAtlas is for educational purposes only. Always consult a healthcare professional. |
```

## Cart Page

Page: `/cart`

```text
| hero (simple, dark) |
| Eyebrow | Your Selection |
| Title | Shopping <em>Cart</em> |
| Description | Review your selected herb products before checkout. |
```

```text
| cart |
| Shop Link | /shop |
| Checkout Link | /checkout |
| Empty Title | Your cart is empty |
| Empty Text | Browse the shop to add herb products. |
| Empty CTA Text | Browse Shop |
| Coupon Code | HERB10 |
```

## Checkout Page

Page: `/checkout`

```text
| hero (simple, dark) |
| Eyebrow | Secure Checkout |
| Title | Complete Your <em>Order</em> |
| Description | Choose your address and payment method. |
```

```text
| checkout-flow |
| Require Login | yes |
| Login Path | /login |
| Cart Path | /cart |
| Addresses Path | /addresses |
| Success Path | /order-success |
| Coupon Code | HERB10 |
```

## Login Page

Page: `/login`

```text
| login-auth |
| Login Title | Welcome back |
| Login Text | Sign in to continue to HerbAtlas. |
| Register Title | Create your account |
| Register Text | Save addresses, orders, and herb preferences. |
| Minimum Password Length | 6 |
| Redirect Default | /profile |
```

## Account Page

Page: `/account`

```text
| hero (simple, dark) |
| Eyebrow | Personal Herb Profile |
| Title | Your Wellness <em>Profile</em> |
| Description | Save your goals and preferences for personalized herb recommendations. |
```

```text
| account-profile |
| Require Login | yes |
| Login Path | /login |
| Recommendations Link | / |
| Save Button Text | Save Profile |
```

## Profile Page

Page: `/profile`

```text
| hero (simple, dark) |
| Eyebrow | Your Account |
| Title | Hello, <em>there</em> |
| Description | Manage your HerbAtlas account, orders, addresses, and herb profile. |
```

```text
| feature-cards (nav, four-column) |
| Icon | Title | Description | Link |
| 📦 | My Orders | Track and view your order history | /orders |
| 🏠 | My Addresses | Manage your delivery addresses | /addresses |
| 🌿 | Herb Profile | Your wellness goals and herb recommendations | /account |
| ✉ | Contact Us | Read common answers and reach HerbAtlas support | /contact |
| 🚪 | Sign Out | Sign out of your HerbAtlas account | sign-out |
```

## Addresses Page

Page: `/addresses`

```text
| hero (simple, dark) |
| Eyebrow | Saved Delivery |
| Title | My <em>Addresses</em> |
| Description | Manage your saved delivery addresses. |
```

```text
| addresses |
| Require Login | yes |
| Login Path | /login |
| Checkout Path | /checkout |
| Empty Text | No saved addresses yet. Add your first delivery address. |
```

## Orders Page

Page: `/orders`

```text
| hero (simple, dark) |
| Eyebrow | Order History |
| Title | My <em>Orders</em> |
| Description | Track your HerbAtlas purchases. |
```

```text
| orders |
| Require Login | yes |
| Login Path | /login |
| Empty Title | No orders yet |
| Empty Text | Your completed orders will appear here. |
| Shop Link | /shop |
```

## Order Success Page

Page: `/order-success`

```text
| order-success |
| Orders Link | /orders |
| Shop Link | /shop |
| Missing Title | Order not found |
| Missing Text | We could not find that order confirmation. |
```

## Herb Detail Page

Page: `/herb-detail?id=2`

```text
| herb-detail |
| Herbs Data | /data/herbs.json |
| Browse Link | /browse |
| Shop Detail Base | /shop-detail |
| Cart Key | cart |
| Related Count | 4 |
```

## Shop Detail Page

Page: `/shop-detail?id=1`

```text
| shop-detail |
| Products Data | /data/herbs.json |
| Reviews Data | /data/reviews.json |
| Shop Link | /shop |
| Checkout Link | /checkout |
| Herb Detail Base | /herb-detail |
| Related Count | 4 |
```

## Reduction Replacement Tables

These are the future table names after reducing to 23 blocks.

### Replace stats-band

```text
| feature-cards (stats) |
| Number | Label | Description |
| 40+ | Herbs in Collection | |
| 500+ | Orders Delivered | |
| 6 | Regions Worldwide | |
| 100% | Organic Certified | |
| 3000+ | Years of Tradition | |
```

### Replace process-list

```text
| feature-cards (process) |
| Step | Title | Description |
| 01 | Farm Selection | We carefully select certified organic farms worldwide |
| 02 | Harvest at Peak | Herbs harvested at peak potency for maximum benefit |
| 03 | Lab Testing | Every batch independently tested for purity and safety |
| 04 | Careful Packing | Sealed in kraft pouches to preserve freshness |
| 05 | Fast Delivery | Delivered to your door in 2 to 3 business days |
```

### Replace process-steps

```text
| feature-cards (steps) |
| Eyebrow | Simple and Intuitive |
| Title | How <em>HerbAtlas</em> Works |
| Step | Title | Description |
| 01 | Search or Browse | Find herbs by name with our powerful system. |
| 02 | Read the Full Profile | Every herb has a complete page with uses, dosage, warnings and recipes. |
| 03 | Order Premium Quality | Buy certified organic herbs sourced from trusted farms worldwide. |
```

### Replace team-cards

```text
| feature-cards (team) |
| Image | Title | Description | Link |
```

### Replace disclaimer-callout

```text
| feature-cards (callout) |
| Icon | Title | Description | Link |
| ! | Always consult a healthcare professional | HerbAtlas content is for educational purposes only and is not medical advice. | |
```

### Replace recommended-herbs

```text
| herb-cards (recommended) |
| Eyebrow | Based on Your Profile |
| Title | Recommended <em>Herbs</em> |
| CTA Text | Update profile |
| CTA Link | /account |
| Herbs Data | /data/herbs.json |
| Detail Base | /herb-detail |
| Limit | 4 |
| Empty Label | Personalized Suggestions |
| Empty Title | Create your personal herb profile |
| Empty Text | Save your wellness goals and preferences to view herb recommendations tailored to your needs. |
| Empty CTA Text | Go to Personal Herb Profile |
```

### Replace product-cards

```text
| shop-results (featured) |
| Eyebrow | Shop Now |
| Title | Bestselling <em>Products</em> |
| CTA Text | View all products |
| CTA Link | /shop |
| Mode | featured |
| Product IDs | 1, 2, 3, 7 |
| Badges | Bestseller, Top Rated, Most Popular, Staff Pick |
| Detail Base | /shop-detail |
| Button Text | View Product |
```
