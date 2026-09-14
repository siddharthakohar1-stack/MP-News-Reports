---
name: Dynamic News Media Portal
colors:
  surface: '#fff8f6'
  surface-dim: '#edd5cb'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1eb'
  surface-container: '#ffeae0'
  surface-container-high: '#fce3d9'
  surface-container-highest: '#f6ded3'
  on-surface: '#251913'
  on-surface-variant: '#584237'
  inverse-surface: '#3c2d26'
  inverse-on-surface: '#ffede6'
  outline: '#8c7164'
  outline-variant: '#e0c0b1'
  surface-tint: '#9d4300'
  primary: '#9d4300'
  on-primary: '#ffffff'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#ffb690'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006398'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a2f4'
  on-tertiary-container: '#003554'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#cde5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#004b74'
  background: '#fff8f6'
  on-background: '#251913'
  surface-variant: '#f6ded3'
  brand-vermilion: '#EA580C'
  brand-saffron: '#FF8400'
  breaking-red: '#DC2626'
  politics-red: '#B91C1C'
  sports-blue: '#0284C7'
  bollywood-pink: '#E11D48'
  business-green: '#059669'
  lifestyle-purple: '#7C3AED'
  neutral-surface: '#F8FAFC'
  neutral-canvas: '#FFFFFF'
  neutral-border: '#E2E8F0'
  neutral-subtle: '#64748B'
  neutral-ink: '#0F172A'
  video-pill-bg: rgba(15, 23, 42, 0.75)
typography:
  headline-xl:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Noto Sans
    fontSize: 22px
    fontWeight: '800'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Noto Sans
    fontSize: 17px
    fontWeight: '700'
    lineHeight: 24px
  headline-sm:
    fontFamily: Noto Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.25rem
  space-2xl: 1.5rem
  space-3xl: 2rem
  feed-gutter-desktop: 1.5rem
  feed-gutter-mobile: 0.75rem
  card-padding-compact: 0.625rem
---

## Brand & Style

This design system delivers an ultra-high-density, authoritative vernacular and general news media experience inspired by India’s leading mass-market news powerhouses. Built around immediacy, credibility, and scan-friendly clarity, the system balances hyper-dense textual feeds with vivid color accents that direct user attention in fractions of a second.

The visual style blends **High-Contrast / Bold** media publishing with **Structured Corporate Journalism**:
- Crisp, hairline separators delineate continuous feeds without adding heavy layout bloat.
- High-chroma categorical colors instantly signal topical shifts across endless vertical feeds (from breaking political exposes to sports, Bollywood glamour, and markets).
- Micro-interaction badges, live ticker strips, and media pills (video durations, photo counts) communicate instant context without obscuring imagery or text hierarchy.
- Devanagari and Latin multi-script typographic hierarchy is engineered for optimal vertical rhythm, avoiding clipping of conjuncts, matras, and diacritics while preserving compact baseline density.

## Colors

The color architecture is calibrated for high daylight readability, high scan speed, and prominent categorical organization:

- **Primary News Identity (`#F97316` / `#EA580C` / `#FF8400`)**: Used for the primary masthead indicators, active channel tabs, high-importance live markers, and breaking ticker badges.
- **Ink Secondary (`#0F172A`)**: The supreme reading color for headlines, top navigation chrome, and high-impact typographic focal points. Replaces pure black with an authoritative deep slate that reduces glare in high-density listings.
- **Categorical Chromas**:
  - `breaking-red` (`#DC2626`) & `politics-red` (`#B91C1C`): Breaking news chyrons, developing political updates, and urgent alerts.
  - `sports-blue` (`#0284C7`): Cricket scorecards, match roundups, and athletics headers.
  - `bollywood-pink` (`#E11D48`): Entertainment gossip, celebrity reels, and cinema reviews.
  - `business-green` (`#059669`): Sensex/Nifty indices, market updates, and economy tracking.
  - `lifestyle-purple` (`#7C3AED`): Astrology, health, and editorial columns.
- **Surface & Separators**: Canvas base starts at crisp pure white (`#FFFFFF`), backed by structural neutral containers in `#F8FAFC` and razor-thin borders in `#E2E8F0`.

## Typography

The type system is configured to support dual-script high-density layouts (Devanagari alongside Latin alphanumeric data). Noto Sans provides uniform x-height, clear matra rendering, and distinct weights that avoid ink traps even on compact mobile views.

Key typographic rules:
- **Leading & Line Heights**: Devanagari requires a 1.35x to 1.5x line-height ratio to prevent upper vowel modifiers and lower viramas/matras from colliding with neighboring lines.
- **Colored Key Phrases in Headlines**: Major lead titles often colorize the core action phrase (e.g. bolded orange or crimson lead-in followed by slate text).
- **Metadata and Timestamps**: Rendered using crisp, legible numbers from Inter (`label-md` and `label-sm`), ensuring elapsed time ("2 घंटे पहले"), comment counts, and share indicators stay compact yet sharp.

## Layout & Spacing

The layout is built for high information density, rapid continuous scrolling, and modular editorial stacking.

### Grid & Breakpoints
- **Mobile (< 768px)**: 1-column continuous river layout with fixed 12px outer safe margins. Horizontal snap-carousels for Web Stories, Visual Reels, and state-specific tabs.
- **Tablet (768px - 1024px)**: 8-column layout. 2-column feed splitting (Main stories 5 cols, local city feed 3 cols).
- **Desktop (1025px - 1280px)**: 12-column fixed grid with max-width `1280px`. 
  - Left Rail (2 cols): Section shortcuts, local edition switcher.
  - Central Stream (7 cols): Primary headline cards, video modules, and categorical blocks.
  - Right Rail (3 cols): Breaking updates, trending widgets, market ticker, and native ad units.

### Spacing Rhythm
Every unit uses an ultra-tight 4px base module (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 12px, `space-lg` = 16px). News item list units keep internal padding at 10px–12px to allow 4 to 5 headline items to appear comfortably above the mobile fold.

## Elevation & Depth

This system avoids heavy, atmospheric shadows to maintain editorial speed and high content density. Instead, depth is achieved through **flat structural separation and low-contrast borders**:

- **Surface Levels**:
  - `Surface 0 (Base Canvas)`: `#F8FAFC` for page framing, gutters, and site body.
  - `Surface 1 (Content Cards)`: `#FFFFFF` for headline cards, article containers, and pinned bars.
  - `Surface 2 (Elevated Overlays)`: Pure `#0F172A` with `90%` opacity or `#FFFFFF` with hairline shadow `0 2px 8px rgba(15, 23, 42, 0.08)` for breaking tickers, search dropdowns, and context menus.
- **Hairline Dividers**: Every consecutive story in a stream is separated by a 1px solid rule in `#E2E8F0`.
- **Media Badges**: Video timestamps, live badges, and gallery counts float over imagery using `video-pill-bg` (`rgba(15, 23, 42, 0.75)`) with a 4px backdrop blur to ensure high contrast against any thumbnail background.

## Shapes

The design uses a **Soft (`1`)** shape language that keeps lines clean, newspaper-crisp, and editorial:

- **Thumbnails & Media Containers**: Standard radius of `4px` (`rounded-sm`), preserving the rectangular authority of print-influenced media.
- **Category Chips & Video Duration Pills**: Rounded at `4px` (`rounded-sm`) or full pill-capsules (`rounded-full`) exclusively for live tags and reel circular thumbnails.
- **Action Buttons & Local City Dropdowns**: Soft `4px` corners ensure buttons sit neatly inline with tight text rows without creating jarring gaps.

## Components

### 1. News Story Cards
- **Compact Horizontal List Card (Feed Standard)**:
  - Layout: Left side contains headline (2 to 3 lines max), category chip, elapsed time, and share/bookmark icons; right side holds a 16:9 or 1:1 thumbnail (88px × 66px on mobile, 120px × 80px on desktop).
  - Borders: 1px bottom border `#E2E8F0` with no external card margin.
- **Hero Lead Card**:
  - Full-width 16:9 thumbnail with an embedded play icon or photo count pill on bottom-right.
  - Bold headline (`headline-lg` / `headline-xl-mobile`) with initial keyword highlighted in `brand-vermilion` or `breaking-red`.

### 2. Category Badges & Live Chyrons
- **Live / Breaking Pill**: Solid `breaking-red` (`#DC2626`) fill, white uppercase text (`label-sm`), pulsing 6px white dot on the left.
- **Topic Badge**: Pill or subtle square badge with 2px left border matching the topic color (e.g., `#0284C7` for Sports, `#E11D48` for Bollywood). Background tint at 8% opacity of the topic color.

### 3. Media Pills (Video Duration & Gallery Counter)
- Positioned absolute at bottom-right of video thumbnails: 6px from edge.
- Background `video-pill-bg`, font color `#FFFFFF`, text `label-sm`, icon size 10px.

### 4. Breaking News Ticker Strip
- Full-bleed or container-bound horizontal ribbon.
- Left block: Solid `brand-vermilion` with high-contrast white text labeled "ब्रेकिंग न्यूज़ / BREAKING".
- Right track: Subtle `#FFF7ED` or `#0F172A` background displaying a scrolling or fading headline stream with high-contrast text.

### 5. Buttons & Navigation Chips
- **Primary Action Button**: Solid `#F97316` background, `#FFFFFF` text, bold weight, 4px corner radius.
- **Sub-category Pills (Horizontal River Navigation)**: Light grey outline (`#E2E8F0`), `#0F172A` text. On active state: Solid `#0F172A` background with `#FFFFFF` text, or filled `#EA580C` with sharp white label.

### 6. Interactive Actions & Social Row
- Share, WhatsApp, and bookmark icons use subtle outline icons (`#64748B`), expanding to `#0F172A` on hover/press.
- WhatsApp sharing button features dedicated `#22C55E` brand accent on micro-interaction.