# UI Context

## Theme

Dark only. No light mode. The visual language is a dark institutional terminal — near-black
backgrounds, muted surfaces, and amber/gold (#FABF2C) as the primary accent color.

Raw hex values are used throughout (the project predates a full CSS custom property migration).
New components should prefer the existing hex palette to stay consistent.

## Color Palette

| Role              | Hex          | Usage                                    |
| ----------------- | ------------ | ---------------------------------------- |
| Page background   | `#050505`    | `bg-[#050505]`                           |
| Surface           | `#0a0a0a`    | Cards, panels                            |
| Elevated surface  | `#080808`    | Sidebar, elevated sections               |
| Default border    | `#1a1a1a`    | All dividers and card borders            |
| Primary text      | `#ffffff`    | Headlines, key values                    |
| Secondary text    | `#ccc`       | Body copy                                |
| Muted text        | `#888`       | Descriptions, captions                   |
| Faint text        | `#555`       | Labels, section headers, separators      |
| Brand accent      | `#FABF2C`    | CTA buttons, hover states, highlights    |
| Positive/green    | `#00d672`    | Live indicators, positive change         |
| Negative/red      | `#ff4d4f`    | Error states, negative change            |
| Neutral           | `#888`       | Zero-change, neutral indicators          |

## Typography

- **Font**: Geist Sans (loaded via `next/font/google`), applied on `<html>`.
- **Mono**: Geist Mono for labels, timestamps, data values, and codes.
- Headings use `font-black uppercase tracking-tighter` for the terminal aesthetic.
- Section labels use `text-[10px] font-black uppercase tracking-[0.4em] text-[#555]`.

## Border Radius

Raw Tailwind classes are used (no custom scale):
- `rounded` / `rounded-sm` — inline/small elements
- `rounded-xl` — small cards, buttons
- `rounded-2xl` — data cards
- `rounded-3xl` — modals, overlays (newer pages)

Legacy data pages use square corners (`no rounded` or `border` only).

## Data Dashboard Layout

All data pages share `src/app/data/layout.tsx`:
- Fixed left sidebar (`DataSidebar`, `w-72`)
- Content area: `lg:pl-72`, max-width `1400px`, padded `px-4 lg:px-8 py-8`
- `DataBreadcrumb` at the top of every data page
- `FreshnessBadge` injected via the layout (default `ttlSeconds={300}`)

## Homepage Layout

- 12-column grid: 8 cols main content + 4 cols sidebar
- Hero article: large title + `aspect-[21/9]` image
- "Proprietary Research" section: 3-col article grid with `FreshnessBadge`
- Empty state: animated skeleton cards (3 × `animate-pulse` article placeholders)
- Right sidebar: Intelligence Wire (AINewsFeed) + Market Pulse wire
- Bottom: Airdrop Radar, Global Events, Global Market Feed (4-col card grid)

## Loading / Empty States

- Use animated skeleton markup (`animate-pulse`) that matches the surrounding design language.
- For data pages: `PageSkeleton` (`src/app/data/_components/PageSkeleton.tsx`) and
  `ChartSkeleton` (`src/app/data/_components/ChartSkeleton.tsx`) are the standard.
- Never show raw "Archive Synchronizing..." or other static placeholder strings.

## FreshnessBadge

Component: `src/components/common/FreshnessBadge.tsx`

```tsx
<FreshnessBadge ttlSeconds={300} />
<FreshnessBadge ttlSeconds={1800} label="Live — blockchain.info + mempool.space" />
```

- Present on every data dashboard page (injected via `data/layout.tsx`).
- Present on the homepage "Proprietary Research" section.
- Uses amber pulse dot to indicate live data.

## Icons

Lucide React. Stroke-based icons only. Sizes: `h-4 w-4` inline, `h-5 w-5` buttons,
`h-6 w-6` or `h-8 w-8` feature/empty-state icons.

## Component Conventions

- `src/components/ui/` — base UI primitives (Skeleton, AppImage, etc.). Do not modify.
- `src/components/common/` — shared cross-feature components (FreshnessBadge, etc.).
- `src/components/news/` — news-specific components (AINewsFeed, CointelegraphCard, etc.).
- `src/app/data/_components/` — data dashboard shared components (PageSkeleton, ChartSkeleton,
  DataSidebar, DataBreadcrumb, etc.).
- Client components (`"use client"`) only when browser interactivity or real-time state is needed.
