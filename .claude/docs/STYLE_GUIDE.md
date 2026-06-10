# Style Guide

Visual and UI patterns established in this project.

---

## Color Palette

Custom tokens defined in `src/index.css` via `@theme inline`:

| Token | Hex | Usage |
|-------|-----|-------|
| `baltic-blue` | `#156390` | Primary brand color, deep blue |
| `fresh-sky` | `#54a8d0` | Secondary, mid-range blue |
| `pale-sky` | `#cbe0ea` | Muted backgrounds, borders |
| `white-smoke` | `#f2f2f2` | App background |
| `honeydew` | `#cde2d7` | Soft green accent |
| `mint-leaf` | `#5bb286` | Green accent, success states |

Semantic aliases in `:root`:

| CSS var | Maps to |
|---------|---------|
| `--primary` | `baltic-blue` |
| `--secondary` | `fresh-sky` |
| `--accent` | `mint-leaf` |
| `--muted` | `pale-sky` |
| `--background` | `white-smoke` |
| `--foreground` | `#1a2e3f` |

---

## Typography

- **Font family**: Figtree Variable (`--font-sans`) — used for all text including headings
- **Heading style**: Bold, tight tracking (`tracking-tight`), large scale on hero
- **Hero headline**: `text-[2.8rem]` → `xl:text-[3.75rem]` → `2xl:text-[4.5rem]`, `leading-[1.05]`, `tracking-tight`
- **Body text**: `text-base` / `text-sm`, `leading-relaxed`
- **Labels / tags**: `text-[11px]`, `tracking-[0.15em]`, `font-semibold`

---

## Gradients

### Brand background gradient
Used on the hero section background:
```
linear-gradient(135deg, #156390 0%, #54a8d0 55%, #cbe0ea 100%)
```

### Navbar background gradients
- Desktop pill: `bg-linear-to-r from-blue-950/70 to-baltic-blue/50`
- Mobile header: `bg-linear-to-r from-baltic-blue/90 to-fresh-sky/80`

### CTA button gradient (see Button variant `gradient`)
`from-teal-600 to-baltic-blue` direction `to-tr`

### Animated text gradient
Used via `<GradientText>` component with colors `['#ffffff', '#cde2d7', '#5bb286', '#cde2d7', '#ffffff']`.

### Logo ring gradients
- Outer ring: `conic-gradient(from 0deg, #5bb286, #54a8d0, #cbe0ea, #5bb286)`
- Inner ring: `conic-gradient(from 0deg, #5bb286, #54a8d0, #ffffff, #cde2d7, #5bb286)`

---

## Button Variants

Defined in `src/components/ui/button-variants.ts`.

| Variant | Appearance | Use case |
|---------|-----------|----------|
| `default` | Solid `baltic-blue` | Standard primary actions |
| `gradient` | `teal-600 → baltic-blue` diagonal gradient, white text | CTAs on hero / navbar |
| `secondary` | Solid `fresh-sky` | Secondary actions |
| `outline` | Transparent, white text, no border fill | Ghost actions on dark backgrounds |
| `ghost` | No background until hover | Tertiary / nav items |
| `destructive` | Red-tinted | Destructive actions |
| `link` | Underline on hover | Inline text links |

### CTA button sizing
- Hero "Request a Quote": `size="xxxl"` (`h-14 px-8`)
- Navbar desktop "Book Now": `size="sm"` (`h-8 px-3`)
- Navbar mobile "Book Now": `size="lg"` (`h-10 px-4`) + `w-full`

---

## Glassmorphism / Overlay Patterns

Used extensively on the navbar and decorative elements:

- `backdrop-blur-md` — navbar blur
- `bg-white/10` to `bg-white/15` — frosted glass fill
- `border border-white/20` — subtle light border
- `shadow-lg shadow-black/15` — drop shadow

---

## Layout Patterns

### Navbar
- **Desktop**: fixed floating pill, `top-5`, centered via `left-1/2 -translate-x-1/2`, `h-13`, `rounded-full`
- **Mobile**: fixed full-width header, `top-0`, `h-14`, collapsible nav drawer with `max-h` transition

### Hero section
- `min-h-dvh`, two-column grid on `lg+` (`flex-col` → `lg:flex-row`)
- Content max width: `max-w-7xl`, padding `px-6 lg:px-12 xl:px-16`
- Wave divider at bottom via `<WaveDivider fill="#f2f2f2" />`

---

## Decorative Components

| Component | Location | Description |
|-----------|----------|-------------|
| `FloatingBubble` | `src/components/decorative/FloatingBubble.tsx` | Animated circle, supports `filled`/`outline` variant, custom size/color/opacity/position |
| `WaveDivider` | `src/components/decorative/WaveDivider.tsx` | SVG wave at section bottom, `fill` prop matches next section background |
| `GradientText` | `src/components/ui/GradientText.tsx` | Animated shimmer text, accepts `colors` array and `animationSpeed` |

### FloatingBubble usage pattern
Bubbles layer behind content (`z-10` on content grid). Vary size 45–220px, opacity 0.06–0.30, stagger `animationDelay` 0–3s, `animationDuration` 5–9s for organic feel.

---

## Animations

Keyframes defined inline in `HeroSection.tsx`:

- `bubble-float`: `translateY(0 → -18px) scale(1 → 1.04)`, used by `FloatingBubble`
- `logo-float`: `translateY(0 → -12px → 0)`, 5s ease-in-out infinite on logo circle

---

## Spacing & Radius

- Default border radius: `--radius: 0.625rem` → `rounded-lg`
- Buttons: `rounded-4xl` (pill shape)
- Navbar desktop: `rounded-full`
- Section padding: `pt-24 pb-24 lg:pb-40`
