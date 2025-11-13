# Space-Themed Informative Website Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from NASA, SpaceX, and modern space exploration platforms - combining cosmic aesthetics with clean information architecture. Focus on immersive visual storytelling with scientific credibility.

## Core Design Elements

### Typography
- **Primary Font**: Space Grotesk (bold, futuristic) via Google Fonts for headings
- **Secondary Font**: Inter (clean, readable) for body text
- **Hierarchy**: 
  - Hero titles: 4xl-6xl, bold weight
  - Section headers: 2xl-3xl, semibold
  - Body text: base-lg, regular weight
  - Captions/metadata: sm, light weight

### Layout System
**Spacing Primitives**: Use Tailwind units of 4, 8, 12, and 16 consistently
- Section padding: py-16 to py-24
- Component spacing: gap-8 between major elements
- Card padding: p-8
- Grid gaps: gap-6 for content grids

### Images & Visual Assets

**Large Hero Image**: Yes - cosmic deep space scene with nebulae, stars, and distant galaxies
- Full-width, 70vh height
- Subtle parallax scroll effect
- Overlay gradient (transparent to dark) for text readability

**Section Images**:
- Comparative sections: Split-screen planetary/satellite imagery
- Detail grids: 4 high-quality space object images (planets, moons, spacecraft, telescopes)
- Background treatments: Subtle star fields, particle effects throughout

**Icons**: Use Font Awesome via CDN for space-related icons (rocket, satellite, planet, star)

## Component Library

### Navigation
- Fixed transparent header with blur-on-scroll effect
- Smooth scroll anchor navigation to sections
- Floating "back to top" button (space shuttle icon)

### Hero Section
- Full-width cosmic background image with animated floating particles
- Centered title with glow effect
- Team member cards with subtle hover lift animation
- Downward scroll indicator (pulsing chevron)

### Introduction Section
- Max-width prose container (max-w-4xl)
- Fade-in on scroll animation
- Large introductory paragraph with cosmic accent border

### Comparative Sections (Comparativa 1 & 2)
- Two-column grid layout (grid-cols-2)
- Content cards with glass-morphism effect (semi-transparent with backdrop blur)
- Hover animation: subtle scale and glow
- Click to expand to detailed 4-item grid below

### Expandable Detail Sections
- Accordion-style expansion with smooth height transition
- 4-item grid (grid-cols-2 lg:grid-cols-4)
- Each item: image, title, description
- Staggered fade-in animation when expanded

### Proposed Text Example Section
- Centered content block with cosmic border accent
- Text reveal animation on scroll
- Supporting imagery on alternating sides

### Conclusions Section
- Full-width with cosmic gradient background
- Summary cards in responsive grid
- Closing statement with call-to-action styling

## Animation Specifications

**Page Load**: Staggered fade-in of hero elements (particles → title → team cards)

**Scroll Animations**:
- Parallax effect on hero background (slower scroll rate)
- Fade-in + slide-up for sections as they enter viewport
- Progressive reveal for comparison cards

**Interactive Animations**:
- Card hover: translate-y-2, shadow increase, subtle glow
- Accordion expand: smooth max-height transition with easing
- Button interactions: scale pulse on hover
- Floating space objects: gentle perpetual drift using CSS keyframes

**Transition Timing**: Use 300-500ms for most interactions, 800ms for section reveals

## Visual Treatment

### Color Philosophy
Deep space color scheme without specific color values:
- Dark cosmic backgrounds
- Bright accent treatments for interactive elements
- Gradient overlays for depth
- Glass-morphism for modern floating cards

### Effects & Atmosphere
- Subtle animated star field background throughout
- Floating particle effects (random drift patterns)
- Soft glow effects on interactive elements
- Cosmic gradient dividers between major sections
- Blur effects for depth layers (background elements softer than foreground)

### Depth & Layering
- Multi-layer parallax: background stars, mid-ground content, foreground UI
- Z-index hierarchy: floating particles < content cards < navigation < modals
- Shadow intensity increases with interaction importance

## Accessibility & Polish

- Maintain WCAG AA contrast ratios despite dark theme
- Smooth scroll behavior with reduced-motion media query fallback
- Clear focus states for keyboard navigation with cosmic accent rings
- Prefers-reduced-motion: disable particle animations, use simpler transitions
- Semantic HTML structure with proper heading hierarchy
- Alt text for all space imagery describing celestial objects

## Responsive Behavior

- Hero: 70vh desktop, 50vh mobile
- Grids: 4 columns → 2 columns (tablet) → 1 column (mobile)
- Navigation: hamburger menu for mobile with slide-in drawer
- Reduce animation complexity on mobile for performance
- Stack comparison sections vertically on small screens

**Key Design Principle**: Create an immersive cosmic experience that educates while captivating - balance scientific credibility with visual wonder through smooth, purposeful animations and rich space imagery.