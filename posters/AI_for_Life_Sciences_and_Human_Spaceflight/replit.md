# Space Exploration Information Website

## Overview

This is a space-themed informative website built as a single-page application featuring "A Hippocratic Oath for Medical AI Agents in Deep-Space Missions". The application presents information about space exploration, AI technology in medicine, and medical ethics through visually engaging sections with animations and interactive components. The site uses a purple/aqua/lime color scheme with a "horizon green" hero background and smooth scroll animations.

## Latest Updates (November 2025)

### Design Refresh
- **New Color Palette**: Transitioned from cyan/teal/green to purple/aqua/lime theme
  - Primary: #6E37A6 (Brand Purple) - used for buttons and highlights
  - Accent: #68F5D5 (Aqua) - used for borders and accents
  - Secondary: #48358C (Indigo) - used for secondary elements
  - Accent Lime: #B8F952 - available for future use
  - Background: #160A26 (Deep Purple Base)
  - Surface/Card: #261E59 (Purple Surface)

### Hero Section Redesign
- **New Logo Placement**: AI Poster Logo displayed at top with mix-blend-mode: multiply effect
- **Vertical Layout**: Logo → Title → Team Member Buttons (centered alignment)
- **Enhanced Animations**: Logo fade-in with scale, title slide-up, staggered button animations

### Comparative Analysis Enhancements
- **AI Assistant Card**: 
  - Shows Bot icon before expansion
  - Initial view displays one sentence summary
  - Expansion reveals: same sentence + 5 bullet points + closure text about astronaut health support
- **AI Agent Card**: 
  - Shows Sparkles icon before expansion
  - Maintains original expandable detail cards structure
- **Icon Integration**: Both cards display relevant icons in collapsed state

### Hippocratic Oath Button Redesign
- **Circular Design**: 256x256px circular button with logo image
- **Visual Effects**: Aqua border with animated pulsing glow (shadow animation)
- **Interactive Animations**: Scale on hover, catching opening effect for dialog
- **Updated Content**: Modern Hippocratic Oath adapted for AI agents in space

### New Interactive Demo Section
- **Circular Dice Button**: Rotating dice icon to generate random case studies
- **Case Study Bank**: 5 medical ethics scenarios for deep-space missions
- **Progressive Reveal**: Question → "How would an AI Agent do it?" → Response → Restart
- **Real-world Scenarios**: Covers emergency medical decisions, resource allocation, autonomy vs. safety, psychological care, and medical data disclosure

### Introduction Section Update (November 10, 2025)
- **Right-Aligned Layout**: Text content now right-aligned with 3/4 width
- **Accent Line Position**: Moved accent line from left to right side of text
- **Expandable Button**: Added circular button in 1/4 space that expands on hover to show communication delay information
- **No Layout Shifts**: Hover expansion uses transform-based scaling to prevent layout shifts

### References Section Enhancement (November 10, 2025)
- **Numbered List Format**: Converted to numbered list (1-6) for better academic citation structure
- **Citation System**: Created Citation component for superscript links that scroll to references
- **Academic Content**: Six references covering medical ethics, AI healthcare, and space medicine
- **Compact Design**: Smaller title (text-2xl) and body text (text-base)

### Hippocratic Oath Dialog Formatting (November 10, 2025)
- **Structured Content**: Dialog now uses whitespace-pre-line to preserve content structure
- **Typography Hierarchy**: Proper font sizes and spacing for different content sections
- **Aqua Accents**: Enhanced with aqua border and glow effects matching the color palette

### ISU Logo Section (November 10, 2025)
- **New Section**: Added International Space University logo section after References
- **Centered Display**: White ISU logo centered on dark background
- **Asset**: Uses Logo ISU white_1762742785016.png

### Color Palette Consistency (November 10, 2025)
- **Cyan Removal**: Replaced all cyan colors (cyan-400, cyan-500, cyan-100, cyan-300) with palette tokens
- **Consistent Colors**: Updated AbstractSection, ContentSection, DemoSection, and footer with:
  - `accent` for aqua highlights and borders
  - `foreground/80` for secondary text
  - `foreground/60` for tertiary text
- **Purple/Aqua/Lime**: Ensured consistent use of the established color palette throughout

### Audio Player for Closing Statement (November 11, 2025)
- **New Feature**: Added audio player button in Hippocratic Oath dialog after the Closing Statement
- **Audio File**: "Combined AI Voices_1762853557116.MP3" - audio recording of the closing oath statement
- **Interactive Controls**: 
  - Play/Pause toggle button with lucide-react icons
  - Button displays "Play Closing Statement" (with Play icon) or "Pause Audio" (with Pause icon)
  - Aqua border and glowing shadow effects matching the color palette
- **Server Configuration**: Express server configured to serve attached_assets folder as static files
- **Location**: Appears at the end of the Hippocratic Oath dialog content, after section "6. Closing statement"

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, chosen for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (alternative to React Router)
- Single-page application architecture with route-based code splitting

**UI Component System**
- Shadcn UI component library (New York style variant) providing accessible, customizable components built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom theme extensions for space-themed colors (cyan accents, dark backgrounds)
- Custom CSS variables for consistent theming across light/dark modes
- Framer Motion for declarative animations (scroll-triggered reveals, parallax effects, transitions)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod resolvers for form validation
- Local component state via React hooks for UI interactions

**Design System**
- Space Grotesk font for headings (bold, futuristic aesthetic)
- Inter font for body text (clean readability)
- Purple/Aqua/Lime color palette (November 2025 redesign)
  - Primary: #6E37A6 (270° 50% 43%) - Brand Purple
  - Accent: #68F5D5 (166° 87% 68%) - Aqua highlights
  - Secondary: #48358C (253° 45% 38%) - Indigo
  - Background: #160A26 (260° 58% 9%) - Deep Purple Base
  - Card: #261E59 (248° 50% 23%) - Purple Surface
- Consistent spacing primitives using Tailwind's 4/8/12/16 unit system
- Hover/active state elevations with backdrop blur effects
- Custom animations: scale on hover, fade-in on scroll, pulsing glows, rotating icons

**Interactive Features**
- Clickable team member buttons in hero section that open dialogs with detailed information:
  - Contribution (team member's role in the project)
  - Profession (their professional title)
  - Contact (email address)
- Expandable comparative cards for AI Assistant and AI Agent:
  - AI Assistant: Shows Bot icon, short description → expands to bullets + closure
  - AI Agent: Shows Sparkles icon, description → expands to detail cards
- Circular Hippocratic Oath button (256x256px) with logo and pulsing aqua glow
- Interactive Demo Section:
  - Circular dice button with rotating animation
  - Random case study generator (5 scenarios)
  - Progressive reveal: Question → AI Response → Restart

**Page Sections**
- Hero: Logo at top → Title → Team member buttons (all centered vertically)
- Abstract: Two-column layout with AI poster logo on left, title and content on right, accent line on left
- Introduction: Right-aligned text (3/4 width) with accent line on right, expandable circular button (1/4 space) showing communication delay info on hover
- Comparative Analysis: Expandable cards with icons comparing AI Assistant and AI Agent
- Medical AI Ethics: Discussion of ethical considerations
- Hippocratic Oath: Circular button (256x256px) with logo opening structured dialog with modern AI oath
- Demo: Interactive case studies with random question generator and AI responses
- References: Numbered list (1-6) of academic citations with superscript citation links throughout site
- ISU Logo: Centered white International Space University logo section

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server
- TypeScript for type safety across the full stack
- ESM module system for modern JavaScript features
- Session-based architecture prepared (connect-pg-simple middleware)

**Development & Production Setup**
- Vite middleware mode in development for seamless SSR-ready architecture
- Separate build outputs: client assets to `dist/public`, server bundle to `dist`
- esbuild for server-side bundling (faster than webpack)
- Request logging middleware for API routes with response capture

**Storage Layer**
- In-memory storage implementation (MemStorage class) as the current data layer
- Interface-based design (IStorage) allowing easy swapping to database implementations
- Prepared for Drizzle ORM integration with PostgreSQL schema defined

### Data Storage Solutions

**Database Schema (Prepared)**
- Drizzle ORM configured for PostgreSQL with Neon serverless driver
- Schema defined in `shared/schema.ts` for code sharing between client/server
- User table with UUID primary keys, username/password fields
- Zod schemas generated from Drizzle for runtime validation

**Current Implementation**
- Temporary in-memory Map-based storage for users
- CRUD interface pattern (getUser, getUserByUsername, createUser)
- Ready to swap to database-backed implementation without changing route logic

**Migration Strategy**
- Drizzle Kit configured for schema migrations
- Migration files output to `./migrations` directory
- `db:push` script for syncing schema to database

### External Dependencies

**UI & Interaction Libraries**
- Radix UI primitives: 20+ component packages for accessible UI patterns (dialogs, dropdowns, tooltips, etc.)
- Framer Motion: Animation library for scroll-triggered and gesture-based animations
- Embla Carousel: Touch-friendly carousel component
- cmdk: Command palette component
- Lucide React: Icon system
- date-fns: Date manipulation and formatting

**Development Tools**
- TypeScript compiler for type checking
- PostCSS with Tailwind CSS and Autoprefixer
- TSX for running TypeScript in development
- Replit-specific plugins: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner

**Database & Backend**
- @neondatabase/serverless: PostgreSQL client for serverless environments
- drizzle-orm & drizzle-zod: ORM with Zod schema generation
- connect-pg-simple: PostgreSQL session store for Express

**Fonts & Assets**
- Google Fonts API: Space Grotesk and Inter font families
- Generated space-themed images stored in `attached_assets/generated_images/`
- Hero background: "horizon green" image (`attached_assets/horizon green_1762478563215.png`)
- Current logo: AI Poster Logo (2) (`attached_assets/AI Poster Logo (2)_1762704396121.png`)
  - Displayed in Hero section at top with mix-blend-mode: multiply
  - Displayed in circular Hippocratic Oath button
- Old logo: AI Poster Logo (1) (`attached_assets/AI Poster Logo (1)_1762478460895.png`) displayed in Abstract section
- ISU Logo: Logo ISU white (`attached_assets/Logo ISU white_1762742785016.png`) displayed in ISU Logo section

**Path Aliases**
- `@/`: Maps to `client/src/` for component imports
- `@shared/`: Maps to `shared/` for shared types/schemas
- `@assets/`: Maps to `attached_assets/` for images