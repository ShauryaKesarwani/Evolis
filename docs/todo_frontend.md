# 📋 Evolis Frontend TODO

## 🚀 Priority Tasks
- [ ] Implement global scroll progress indicators if needed.
- [ ] Refine micro-animations for buttons and cards.

## 🛠 Backend & Contracts

## 🔮 Later (Unique UI Quirks & Code Refinements)

### Unique Brutalist UI Quirks
- [ ] **Global SVG Noise Overlay**: Take the noise texture isolated in the Hero mockup (`noise.svg`) and apply it globally as a fixed, screen-covering overlay (`opacity-[0.03] pointer-events-none mix-blend-overlay`). This gives the entire "Cream White" interface a coherent, tactile "analog paper" feel.
- [ ] **Custom Geometric Cursor**: Replace the default cursor with a sharp charcoal dot or crosshair that expands, inverts, or snaps tightly to interactive elements (cards, buttons).
- [ ] **Live Action Marquee Banner**: Add an infinitely scrolling marquee block right beneath the Navbar or Hero reading out recent simulated activity: *"⚡ ZenCrypto unlocked Milestone 1 // Lumina DEX reached 100% funding // Nebula Protocol initiated refund phase..."*.
- [ ] **Hover Interactions**: On `CampaignCard.tsx`, make the project Avatar (the block with the first letter) rapidly scramble/glitch characters before settling, or sharply invert its colors upon card hover.

## 🏗 Frontend Functionality & Layout Fixes
- [ ] **Status Filters**: The Upcoming and Funded categories are not functional and need to be implemented.
- [ ] **Sorting Dropdown**: The sorting dropdown doesn't work and requires logic integration.

## 🐛 Fresh Errors
- [ ] **Massive Days Remaining Bug**: The "days remaining" calculation on the campaign page is returning an exponent value (e.g. `1.5e+43 days remaining`).
- [ ] **Zero Target/Progress**: Total raised showing `0 BNB` and `0% of 0 BNB goal` - investigate if this is a data parsing or mathematical bug.
- [ ] **Address Hash Tooltip**: On the campaign page, hovering upon the creator box hash should show the full address in a very small window (tooltip).
