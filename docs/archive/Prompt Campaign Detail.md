# Prompt for Developing Campaign Detail Page

**Role:** Expert Frontend Developer and UI/UX Designer

**Context:**
You are building the Campaign Detail Page (Page 3) for a milestone-gated tokenized crowdfunding platform built on BNB Chain using Next.js and Tailwind CSS.
This is the central page for a specific campaign. It serves supporters researching and investing, and founders tracking progress. Token purchase lives here as an inline panel rather than a separate page.

**Design System & Aesthetics:**
- **Typography:** `Martian Mono` for headings/accents. `Inter` for body copy.
- **Palette:** Cream White (`#FCFAF6`), Dark Charcoal (`#111111`), Lime-Leaf Green (`#b5e315`).
- **Styling Specs:** Flat design, high contrast, solid dark borders (`border-[#111111]/10`), and rounded corners.

---

## 🚫 Critical Architectural & Styling Constraints
**CRITICAL: You must adhere to these rules to prevent layout and routing framework failures.**
1. **Never use manual CSS wildcard resets.** Do NOT add rules like `* { margin: 0; padding: 0 }` to `globals.css`. Rely solely on Tailwind's Preflight engine.
2. **Constrain Typography Scaling.** Do not oversize main headers beyond `text-7xl` to prevent overflowing `.max-w-7xl` centralized containers.
3. **Next.js `src` Directory Discipline.** When placing the app in `src/app/`, ensure any default `app/` directory at the project root is deleted to prevent routing collisions. Ensure `tsconfig.json` paths resolve to `"@/*": ["./src/*"]`.

### 🛡️ Smart Contract Data Integration
The page MUST accurately reflect the project state as it would be read from the smart contract on the BNB Chain:
- `name` & `description`: Project identity
- `symbol` & `totalSupply`: Token metrics
- `fundingGoal` & `amountRaised`: Campaign progress in BNB
- `deadline`: Time remaining indicator
- `milestones` (`Milestone[]`): A dynamic array displaying each milestone's `description`, `unlockAmount` in BNB, and its current `status` (e.g., Pending, Submitted, Verified, Released).
- **User Interactions:**
  - **Supporter:** Input BNB amount to calculate tokens received, then complete purchase.
  - **Founder:** Action to submit a specific milestone for completion verification.

---

## 🏗️ Compartmentalized Execution Plan
Please build the page by dividing the UI into distinct, modular React components.
*Note: You do not need to wire up the actual wagmi contract calls yet, just the React state and the interactive UI/UX components.*

### Part 1: Page Layout & Header (`<CampaignDetailLayout />` & `<CampaignHeader />`)
- **Layout:** A responsive max-width container (`max-w-6xl mx-auto py-12 px-4`). A two-column grid on desktop (main content on the left, sticky purchase panel on the right) and stacked on mobile.
- **Elements:**
  - Campaign name, logo, tagline, and a prominent dynamic status badge (e.g., "Active", "Goal Reached", "Refunds Enabled").
  - Share action button.
- **Style:** Headers use `Martian Mono`. Clean card-based separation resting on `#FCFAF6` background.

### Part 2: Funding Progress & Token Info (`<FundingProgress />` & `<TokenInfoPanel />`)
- **Layout:** Clean data presentation blocks within the main content column.
- **Elements:**
  - Progress bar showing amount raised (BNB) vs. funding goal, percentage filled, and time remaining.
  - Token details: token name, symbol, implied token price (fixed sale price), total supply, and a visual allocation chart (Public Sale vs. Team vs. Treasury).
- **Style:** High contrast progress bars using `#111111` track and `#b5e315` fill. Emphasize data points with bold brutalist text.

### Part 3: Inline Token Purchase Panel (`<TokenPurchasePanel />`)
- **Layout:** A sticky sidebar panel on desktop, floating or stacked block on mobile. Emphasized visual container.
- **Elements:**
  - Input for "Amount" (BNB to spend) and a read-only calculated output "Tokens to receive".
  - Connected wallet balance display.
  - Transaction summary with a clear escrow notice emphasizing that funds are securely locked and milestone-gated.
  - Primary "Confirm Purchase" CTA. 
  - Post-purchase inline confirmation message (mock).
- **Style:** The panel should feel prominent and solid, elevated with a strong shadow block (`shadow-[4px_4px_0px_#111111]`) and absolute border `#111111`. High-contrast vibrant green for the CTA button.

### Part 4: Milestone Tracker (`<MilestoneTracker />`)
- **Layout:** A vertical timeline or ordered list.
- **Elements:**
  - Ordered milestones displaying their description, unlock amount in BNB, and status indicators (pending / submitted / verified / funds released).
- **Style:** Distinct visual nodes for the timeline. Use color coding for status (e.g., `#b5e315` for verified/released, `#111111` for pending).

### Part 5: Project Details & Social Proof (`<ProjectDescription />`, `<ActivityFeed />`)
- **Layout:** Main column content blocks underneath the progress/token panels.
- **Elements:**
  - Extended project description, vision, and team information.
  - Social proof stats (supporter count, total tokens distributed).
  - Activity feed simulating recent mock purchases and milestone events.
- **Style:** Clean typography, generous line-height (`leading-relaxed`) for readability. Sections boxed in `<div className="border border-[#111111]/10 rounded-2xl p-6 bg-white">`.

### Part 6: Founder Action Strip (`<FounderActionStrip />`)
- **Layout:** A conditional banner or sticky header appearing only if connected wallet matches campaign owner.
- **Elements:**
  - "Submit Milestone Completion" button (navigates to Milestone Submission page).
  - Link/button to the gated Admin / Verification Panel.
- **Style:** Inverse high-contrast styling (e.g., dark charcoal background `#111111` with cream white text `#FCFAF6` and lime green accents `<svg>`) to distinctly separate founder administrative actions from public supporter views.

---

**Execution Instructions:**
Output the React/Next.js code for this page (`src/app/campaign/[id]/page.tsx` and accompanying components).
Ensure you break down the code into these distinct functional components before assembling them. Setup the main page to hold the mock React state for the view and pass it down to the individual child components. Use Tailwind CSS utility classes to achieve the specified styling. Include responsive design considerations so the two-column layout works smoothly on mobile.
