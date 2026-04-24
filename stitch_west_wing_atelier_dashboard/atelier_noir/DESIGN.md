---
name: Atelier Noir
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c7c6c6'
  on-secondary: '#2f3031'
  secondary-container: '#464747'
  on-secondary-container: '#b5b5b5'
  tertiary: '#ffffff'
  on-tertiary: '#303030'
  tertiary-container: '#e4e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  button-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
spacing:
  unit: 8px
  touch-target: 48px
  gutter-desktop: 32px
  gutter-mobile: 16px
  margin-edge: 40px
  container-max: 1440px
---

## Brand & Style
The design system is rooted in the intersection of industrial precision and high-end artisanal luxury. It caters to a dual environment: the refined digital boutique and the high-contrast requirements of a physical workshop. 

The aesthetic is ultra-minimalist and monochromatic, stripping away all non-essential ornamentation to let the craftsmanship of the furniture take center stage. By utilizing a "boutique" editorial approach—characterized by expansive whitespace, architectural alignment, and rigorous typography—this design system evokes a sense of permanence, authority, and meticulous detail. The emotional response is one of calm, professional confidence and "silent luxury."

## Colors
The palette is strictly monochromatic to ensure maximum focus on form and material. 

- **Primary White (#FFFFFF):** Reserved for core interactive elements, primary headings, and critical information. It provides the highest contrast against the deep charcoal base.
- **Deep Charcoal (#121212):** The foundational surface color. It reduces eye strain in industrial settings and provides a sophisticated, "infinite" depth for product photography.
- **Subtle Greys (#2A2A2A, #8E8E8E):** Used for secondary UI elements, borders, and disabled states. These shades create a clear visual hierarchy without introducing hue-based distractions.
- **High Contrast Utility:** All interactive elements must maintain a minimum contrast ratio of 7:1 to ensure legibility in high-glare or low-light workshop environments.

## Typography
This design system utilizes **Inter** exclusively to achieve a technical yet sophisticated look. 

The typographic rhythm is built on extreme scale shifts. Headlines are large and tightly spaced to feel impactful and structural. Body copy is optimized for readability with generous line heights. Labels and auxiliary information use uppercase styling with increased letter spacing (tracking) to emulate high-end fashion and architectural labeling. This contrast between massive headers and tiny, tracked-out labels is the hallmark of the atelier's digital identity.

## Layout & Spacing
The layout follows a strict 12-column fixed grid for desktop, transitioning to a fluid single-column layout for mobile. 

A core requirement is **Utility in Motion**: 
- All interactive zones (buttons, inputs, toggles) adhere to a minimum **48px touch target**, regardless of their visual size.
- Spacing is aggressive; we favor "over-spacing" to prevent accidental taps in industrial environments. 
- Gutters are wide to create clear separation between distinct furniture pieces and technical specifications.
- Use an 8px base unit for all padding and margins to maintain mathematical harmony.

## Elevation & Depth
In alignment with the ultra-minimalist philosophy, this design system avoids traditional drop shadows and blurs. 

Depth is communicated through **Bold Borders** and **Tonal Layers**:
- **Layer 0 (Background):** #121212.
- **Layer 1 (Containers/Cards):** A 1px solid border of #2A2A2A.
- **Layer 2 (Active/Hover):** A 1px solid border of #FFFFFF or a subtle fill shift to #1A1A1A.
- **Focus States:** High-visibility 2px white borders for keyboard or high-precision navigation.

This approach creates a "blueprint" feel, where every element is clearly bounded by sharp, structural lines rather than soft gradients.

## Shapes
The shape language is strictly **Sharp (0px radius)**. 

Every UI element—from buttons and input fields to image containers—utilizes 90-degree angles. This reflects the structural integrity of furniture framing and the precision of industrial design. Circles are only permitted for functional iconography or specific status indicators to ensure they stand out as distinct from the layout's structural containers.

## Components
Consistent styling across components ensures the system remains professional and utilitarian.

- **Buttons:** Primary buttons are solid White (#FFFFFF) with Black (#000000) text. Secondary buttons are outlined (1px White) with no fill. All buttons use the `button-lg` type style.
- **Input Fields:** Bottom-border only (1px #8E8E8E) in resting state. Shifts to a full 1px White border on focus. Labels sit above the field in `label-caps`.
- **Cards:** No shadows. Defined by a 1px #2A2A2A border. Padding inside cards should be at least 32px to maintain the high-end boutique feel.
- **Lists:** Separated by 1px horizontal dividers (#2A2A2A). Each list item must have a minimum height of 64px for mobile utility.
- **Checkboxes/Radios:** Square (0px radius) with a 1px white border. Checked state is a solid white fill with a black inner "X" or "Check."
- **Additional Elements:** Technical "Spec Labels" (e.g., dimensions, wood type) should use the `label-caps` style for an engineered, industrial look.