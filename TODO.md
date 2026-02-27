# 📋 Evolis Project TODO

## 🚀 Priority Tasks
- [ ] **Smooth Scrolling**: Integrate [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling across the application.
- [ ] **Hero Section Animation**: Update the "Fund the future" text in `HeroSection.tsx` to cycle through:
    - `Fund the future`
    - `Build the future`
    - `Scale the future`
- [ ] **Text Transition Effect**: Use a "hacker text" or "scrambled text" transition for the above text changes (inspired by [React Bits](https://www.reactbits.dev/text-animations/scrambled-text) or similar).

## 🎨 UI/UX Refinements
- [ ] Implement global scroll progress indicators if needed.
- [ ] Refine micro-animations for buttons and cards.

## 🛠 Backend & Contracts
- [ ] (Pending status of contracts and backend integration)

## 🔮 Later (Unique UI Quirks & Code Refinements)
### Code Fixes & Refinements
- [ ] **Interactive States**: Add `active:translate-y-0 active:shadow-none` to brutalist buttons (e.g., in `HeroSection.tsx`) and cards (`CampaignCard.tsx`) so they physically "press down" when clicked, completing the brutalist feedback loop.
- [ ] **Typography Clipping Check**: Verify that `leading-[0.9]` on the massive hero headings doesn't clip ascenders on smaller Safari/mobile viewports.
- [ ] **Routing / Accessibility**: Ensure placeholder links like `href="#"` or `#explore` (in `Footer.tsx` and `HeroSection.tsx`) are mapped to actual section IDs once the page grows to avoid confusing screen-readers and focus jumps.

### Unique Brutalist UI Quirks
- [ ] **Global SVG Noise Overlay**: Take the noise texture isolated in the Hero mockup (`noise.svg`) and apply it globally as a fixed, screen-covering overlay (`opacity-[0.03] pointer-events-none mix-blend-overlay`). This gives the entire "Cream White" interface a coherent, tactile "analog paper" feel.
- [ ] **Custom Geometric Cursor**: Replace the default cursor with a sharp charcoal dot or crosshair that expands, inverts, or snaps tightly to interactive elements (cards, buttons).
- [ ] **Live Action Marquee Banner**: Add an infinitely scrolling marquee block right beneath the Navbar or Hero reading out recent simulated activity: *"⚡ ZenCrypto unlocked Milestone 1 // Lumina DEX reached 100% funding // Nebula Protocol initiated refund phase..."*.
- [ ] **Hover Interactions**: On `CampaignCard.tsx`, make the project Avatar (the block with the first letter) rapidly scramble/glitch characters before settling, or sharply invert its colors upon card hover.
