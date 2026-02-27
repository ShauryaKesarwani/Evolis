# Prompt for Developing Page 1 (Home / Explore)

**Role:** Expert Frontend Developer and UI/UX Designer

**Context:** 
You are tasked with building the "Home / Explore" page (Page 1) for a milestone-gated tokenized crowdfunding platform built on BNB Chain. The application is built using Next.js and Tailwind CSS.

**Design System & Aesthetics (Based on Reference - Light Mode Focus):**
- **Typography:** Use `Martian Mono` (or a similar modern monospaced font) for headings, buttons, and key UI accents to give a Web3-native, slightly brutalist feel. For body copy, use a highly readable sans-serif like `Inter`.
- **Color Palette (Light Mode):**
  - **Background:** Cream White (`#FCFAF6` or `#F9F6EE`) for main surfaces to give it a warmer, softer feel compared to harsh pure white. Card elements can use a slightly lighter cream (`#FFFFFF` with low opacity or a single step lighter) for subtle contrast.
  - **Text & Dark Elements:** Near black/charcoal (`#111111` or `#191314`) for sharp contrast and clear typography.
  - **Primary Accent:** Lime-Leaf Green (`#c6f022` or `#b5e315`). This is slightly darker and less glaring than blinding neon, while retaining sharp vibrance.
- **Styling Specs:** Use rounded corners (e.g., `rounded-2xl` or `rounded-3xl` for large cards/images, `rounded-full` for buttons) and clean, flat designs with high contrast. No heavy drop-shadows; prefer solid distinct borders (e.g., `border-[#111111]/10`).

---

## 🚫 Critical Architectural & Styling Constraints 
**CRITICAL: You must adhere to these rules to prevent layout and routing framework failures.**
1. **Never use manual CSS wildcard resets.** Do NOT add rules like `* { margin: 0; padding: 0 }` to `globals.css`. This overrides Tailwind CSS's built-in Preflight system and will destroy all utility layout classes (like `mx-auto` and `gap`). Rely solely on Tailwind's defaults.
2. **Constrain Typography Scaling.** Do not oversize Hero headers beyond `text-7xl` or they will overflow the `.max-w-7xl` centered grid column bounds.
3. **Next.js `src` Directory Discipline.** When placing the app in `src/app/`, ensure any default `app/` directory at the project root is deleted to prevent routing collisions. Ensure `tsconfig.json` paths resolve to `"@/*": ["./src/*"]`.

---

## 🏗️ Compartmentalized Execution Plan

Please build the page by dividing the UI into the following distinct, modular components. Follow the specifications for each part exactly.

### Part 1: Global Navigation Bar (`<Navbar />`)
- **Layout:** Fixed at the top, solid cream (`bg-[#FCFAF6]`) with a subtle bottom border (`border-b border-[#111111]/10`).
- **Left:** The platform Logo/Brand Name (e.g., "Evolis" or brand icon) using the dark charcoal (`#111111`) and bold `Martian Mono` typography.
- **Center:** Navigation links ("Explore", "Create Campaign", "Dashboard"). These should have subtle hover states (e.g., bolding or color shift).
- **Right:** A "Connect Wallet" button. 
  - **Style:** Pill-shaped (`rounded-full`), background `#111111`, text `#FCFAF6`.

### Part 2: Hero Layout (`<HeroSection />`)
- **Layout:** A two-column split layout with generous padding (`py-24` to `py-32`), resting on the cream background (`bg-[#FCFAF6]`).
- **Left Column (Copy & CTA):**
  - **Headline:** Very large, bold `Martian Mono` text in charcoal (`#111111`). Example: "Fund the Future, Milestone by Milestone."
  - **Subheadline:** Slightly smaller, readable sans-serif text explaining the value proposition.
  - **CTAs:** 
    - A primary CTA button: "Explore Campaigns ↗". **Style:** Pill-shaped, background vibrant green (`bg-[#b5e315]`), dark text, slight hover lift.
    - A secondary CTA button: "Launch a Project". **Style:** Outlined pill shape, dark text (`border-[#111111] bg-transparent`).
- **Right Column (Visual / Graphic):**
  - A large, rounded container box with the vibrant green (`#b5e315`) background.
  - Inside this container, position a mockup graphic or an abstract UI card that represents "Project Funding Progress" or "Milestone Escrow" (similar to the iPhone mockup in the ZenCrypto reference but tailored to our platform).

### Part 3: Filtering & Sorting Controls (`<CampaignFilters />`)
- **Layout:** A horizontal bar placed below the hero section and above the campaign grid, using the main cream background.
- **Elements:**
  - Pill toggles for **Categories** (e.g., DeFi, Gaming, Infra).
  - Toggles for **Funding Stage** (e.g., Upcoming, Active, Funded).
  - A "Sort By" selector (Newest, Most Funded, Ending Soon).
- **Style:** Clean, minimalistic pill buttons. Active states should be highlighted by the vibrant green accent or a bold dark outline with charcoal text. Backgrounds for inactive pills can be white (`bg-white`) for a slight pop against the cream base.

### Part 4: Featured / Trending Campaigns & Grid (`<CampaignGrid />` & `<CampaignCard />`)
- **Layout:** A responsive CSS grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
- **Section Heading:** "Active Campaigns" or "Trending Projects" in bold, large typography.
- **`<CampaignCard />` Component Specs:**
  - **Card Container:** Pure White (`bg-white`) or a very slightly lighter cream, high border radius (`rounded-3xl`), solid distinct border (`border border-[#111111]/10`). 
  - **Hover Effect:** Smooth shadow appearing (`hover:shadow-lg`) and a slight upward translation (`hover:-translate-y-1`), perhaps intensifying the border color (`hover:border-[#111111]/30`).
  - **Header:** Project Logo (avatar) + Project Name.
  - **Status Badge:** A small pill in the top right (e.g., "Funding", "Milestone 1/4") using the vibrant green accent (`bg-[#b5e315]`).
  - **Progress Bar:** A horizontal bar showing the current funding progress toward the goal. The track is light gray/cream (`bg-[#FCFAF6] border border-[#111111]/5`), filled portion is charcoal (`bg-[#111111]`).
  - **Metrics Row:** Small text indicating "Token Price" and "Total Raised".
  - **Action:** Full card clickability mapping to the Campaign Detail page.

### Part 5: Footer (`<Footer />`)
- **Layout:** Clean, multi-column layout at the bottom.
- **Content:** Platform name, copyright, and standard links (Terms, Privacy, About, Documentation).
- **Style:** Background matching the cream base (`bg-[#FCFAF6]`) with a top border (`border-t border-[#111111]/10`) and dark charcoal text for high readability and a clean finish.

---

**Execution Instructions:**
Output the React/Next.js code for this page, ensuring you break down the code into these distinct functional components before assembling them into `page.tsx`. Use Tailwind CSS utility classes (e.g. `bg-[#FCFAF6]`) to achieve the specified styling.
