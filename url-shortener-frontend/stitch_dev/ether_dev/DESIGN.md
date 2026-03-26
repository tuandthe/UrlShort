```markdown
# Design System Specification

## 1. Overview & Creative North Star: "The Luminescent Terminal"
This design system is engineered to move beyond the generic "SaaS Dashboard" look. Our Creative North Star is **The Luminescent Terminal**—a high-fidelity environment that pairs the raw, high-contrast utility of a developer’s IDE with the sophisticated, airy composition of a premium editorial magazine. 

We reject the "boxed-in" layout. Instead of rigid grids and 1px borders, we utilize **intentional asymmetry**, **tonal depth**, and **light-emissive accents** to guide the eye. The interface should feel like it is floating in a deep, pressurized void, where depth is communicated through light and blur rather than physical lines.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep midnight tones (`surface: #0c1322`), punctuated by high-energy violet and indigo pulses.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through background shifts. For example, a sidebar should use `surface-container-low` against a `surface` main content area. If you feel the need for a line, use a spacing increment (e.g., `spacing-16`) or a subtle tonal transition instead.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of obsidian glass. Use the hierarchy below to define importance:
*   **Deepest:** `surface-container-lowest` (#070e1d) – Used for the furthest background layers or inset code blocks.
*   **Base:** `surface` (#0c1322) – The standard canvas.
*   **Raised:** `surface-container` (#191f2f) – Standard card backgrounds.
*   **Highest:** `surface-container-highest` (#2e3545) – Floating modals or active state containers.

### The "Glass & Gradient" Rule
To achieve a "production-ready" premium feel, floating elements (Dropdowns, Hover Cards) must utilize **Glassmorphism**. Use a semi-transparent `surface-variant` with a `backdrop-blur` of 12px–20px. 

**Signature Textures:** Main CTAs should not be flat. Apply a linear gradient from `primary` (#d0bcff) to `primary-container` (#a078ff) at a 135-degree angle. This adds a "glow" that feels emissive rather than printed.

---

## 3. Typography: Editorial Authority
We use **Inter** exclusively, but we treat it with editorial intent. The goal is a high-contrast scale where headers feel monumental and body text feels precise.

*   **Display Scales (`display-lg` to `display-sm`):** Reserved for hero sections and key data points. Use `letter-spacing: -0.02em` to create a "tight," premium feel.
*   **Headline & Title:** Used to anchor sections. Ensure ample whitespace (using `spacing-12` or `16`) above headlines to let them breathe.
*   **Body & Labels:** `body-md` is your workhorse. Use `on-surface-variant` (#cbc3d7) for secondary body text to reduce visual noise and maintain the dark-mode hierarchy.

**Visual Identity Tip:** Use `label-sm` in uppercase with `letter-spacing: 0.1em` for categories or "Overlines" to create a technical, metadata-inspired aesthetic.

---

## 4. Elevation & Depth
In this design system, shadows and borders are secondary to **Tonal Layering**.

### The Layering Principle
Depth is achieved by stacking tiers. A `surface-container-low` card placed on a `surface-container-lowest` background creates a "natural lift." This is the preferred method of containment.

### Ambient Shadows
When an element must "float" (e.g., a primary modal), use **Ambient Shadows**:
*   **Blur:** 40px–60px.
*   **Opacity:** 4%–8%.
*   **Color:** Use a tinted version of `on-surface` rather than pure black to simulate light reflecting off the deep blue surfaces.

### The "Ghost Border" Fallback
If a border is required for accessibility, use a **Ghost Border**. Set the stroke to `outline-variant` (#494454) and reduce the layer opacity to **10%–20%**. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary-container`). `rounded-md` (0.75rem). No border. On hover, add a `primary` drop-shadow with a 15px blur to simulate a "glow" state.
*   **Secondary:** `surface-container-high` background with a Ghost Border. Text color: `primary`.
*   **Tertiary:** Ghost style. No background/border. Use `on-surface` text.

### Input Fields
*   **Style:** `surface-container-low` background. No bottom line.
*   **Active State:** Transition the Ghost Border from 10% opacity to 40% using the `secondary` token. Add a subtle 2px outer glow.

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Implementation:** Separate list items using `spacing-2` and a background shift on hover (`surface-container-high`).
*   **Cards:** Use `rounded-lg` (1rem). Ensure internal padding is generous (minimum `spacing-6`).

### Chips
*   **Action Chips:** High-contrast. `secondary-container` background with `on-secondary-container` text. Use `rounded-full` for a pill shape.

### Interactive Code Blocks (Contextual Component)
Given the developer focus, code blocks should use `surface-container-lowest` with a thin `outline-variant` Ghost Border at 10%. Use the `tertiary` (#ffb0cd) color for syntax highlighting accents to provide a "pop" against the cool-toned background.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins to create an editorial feel (e.g., a wider left margin for headlines).
*   **Do** use `backdrop-blur` on all sticky navigation bars to keep the "Glass" theme consistent.
*   **Do** leverage `primary-fixed-dim` for text links within body copy to ensure readability against dark backgrounds.

### Don'ts
*   **Don't** use pure `#000000`. It kills the depth provided by our `surface` tokens.
*   **Don't** use 100% opaque borders. They create "visual friction" and break the liquid feel of the system.
*   **Don't** crowd elements. If a layout feels "busy," double the spacing using the `spacing` scale.
*   **Don't** use standard "drop shadows" on cards. Use background color shifts instead.