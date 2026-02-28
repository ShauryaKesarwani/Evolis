# 📋 Evolis Frontend TODO

## 🚀 Priority Tasks
- [x] **Smooth Scrolling**: Integrate [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling across the application.
- [x] **Hero Section Animation**: Update the "Fund the future" text in `HeroSection.tsx` to cycle through:
    - `Fund the future`
    - `Build the future`
    - `Scale the future`
- [x] **Text Transition Effect**: The scrambled text currently works on hover; update it so it automatically cycles through the different text phrases ("Fund...", "Build...", "Scale...") using the text scramble transition.

## 🎨 UI/UX Refinements
- [ ] Implement global scroll progress indicators if needed.
- [ ] Refine micro-animations for buttons and cards.

## 🛠 Backend & Contracts
- [x] **Backend & Contracts Integration**: Initial integration of Viem/Wagmi and resolving connection plan errors between frontend and backend.

## 🔮 Later (Unique UI Quirks & Code Refinements)
### Code Fixes & Refinements
- [x] **Interactive States**: Add `active:translate-y-0 active:shadow-none` to brutalist buttons (e.g., in `HeroSection.tsx`) and cards (`CampaignCard.tsx`) so they physically "press down" when clicked, completing the brutalist feedback loop.
- [ ] **Typography Clipping Check**: Verify that `leading-[0.9]` on the massive hero headings doesn't clip ascenders on smaller Safari/mobile viewports.
- [x] **Routing / Accessibility**: Ensure placeholder links like `href="#"` or `#explore` (in `Footer.tsx` and `HeroSection.tsx`) are mapped to actual section IDs once the page grows to avoid confusing screen-readers and focus jumps.

### Unique Brutalist UI Quirks
- [ ] **Global SVG Noise Overlay**: Take the noise texture isolated in the Hero mockup (`noise.svg`) and apply it globally as a fixed, screen-covering overlay (`opacity-[0.03] pointer-events-none mix-blend-overlay`). This gives the entire "Cream White" interface a coherent, tactile "analog paper" feel.
- [ ] **Custom Geometric Cursor**: Replace the default cursor with a sharp charcoal dot or crosshair that expands, inverts, or snaps tightly to interactive elements (cards, buttons).
- [ ] **Live Action Marquee Banner**: Add an infinitely scrolling marquee block right beneath the Navbar or Hero reading out recent simulated activity: *"⚡ ZenCrypto unlocked Milestone 1 // Lumina DEX reached 100% funding // Nebula Protocol initiated refund phase..."*.
- [ ] **Hover Interactions**: On `CampaignCard.tsx`, make the project Avatar (the block with the first letter) rapidly scramble/glitch characters before settling, or sharply invert its colors upon card hover.

## 🏗 Frontend Functionality & Layout Fixes
- [ ] **Dummy Data**: Dummy data needs to be improved; we need more comprehensive and diverse dummy data instead of repeating identical entries.
- [ ] **Category Filters**: The frontend categories for DeFi, Gaming, Infra, and Social currently don't work and need to be wired up.
- [ ] **Status Filters**: The Upcoming and Funded categories are not functional and need to be implemented.
- [ ] **Sorting Dropdown**: The sorting dropdown doesn't work and requires logic integration.
- [x] **Home Page Structure Redesign**: 
  - The main page should serve as the home page and act as an outline of how it works. 
  - Restructure the main page layout to the following order:
    1. Header Hero
    2. How it works section
    3. Explore campaigns section
    4. Footer
- [x] **Explore Campaigns Navigation**: The "Explore Campaigns" links/buttons should redirect smoothly to the "Explore Campaigns" section just below "How it works", utilizing a smooth scroll effect that travels all the way down to it.
