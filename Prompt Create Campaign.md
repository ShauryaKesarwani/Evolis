# Prompt for Developing Create Campaign Page

**Role:** Expert Frontend Developer and UI/UX Designer

**Context:**
You are building the "Create Campaign" (Page 2) for a milestone-gated tokenized crowdfunding platform built on BNB Chain using Next.js and Tailwind CSS.
This page acts as a multi-step form allowing a startup founder to configure and deploy a new fundraising campaign, complete with token and milestone definitions.

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

### 🛡️ Smart Contract Data Requirements
The multi-step form MUST ultimately collect the following data to satisfy the `ProjectFactory.createProject()` contract call on the BNB Chain:
- `name` (string): Project name
- `symbol` (string): Project token symbol
- `totalSupply` (uint256): Fixed total supply of the utility token
- `fundingGoal` (uint256): Funding goal in BNB
- `deadline` (uint256): Campaign deadline timestamp
- `milestones` (Milestone[]): A dynamic array of structs containing a `description` (string) and an `unlockAmount` (uint256) for each Phase.

---

## 🏗️ Compartmentalized Execution Plan
Please build the page by dividing the UI into distinct, modular React components.
*Note: You do not need to wire up the actual wagmi contract calls yet, just the React state and the interactive UI/UX components.*

### Part 1: Page Layout & Stepper (`<CreateCampaignLayout />` & `<StepIndicator />`)
- **Layout:** A max-width centered container (`max-w-4xl mx-auto py-24`) resting on the cream background (`bg-[#FCFAF6]`).
- **Elements:**
  - A prominent header: "Launch a Campaign".
  - A horizontal or vertical `<StepIndicator />` showing progress across the 5 stages (Project Info, Token Config, Funding Goal, Milestones, Review).
- **Style:** The stepper nodes should use the charcoal (`#111111`) and lime-leaf green (`#b5e315`) scheme to indicate active vs. completed steps.

### Part 2: Step 1 - Project Information (`<StepProjectInfo />`)
- **Layout:** Standard vertical form group.
- **Elements:** Inputs for "Project Name", "Tagline/Description" (textarea), "Logo/Avatar URL", and "Website URL".
- **Style:** Form inputs must be flat, with solid charcoal borders, rounded corners (`rounded-xl`), and white or transparent cream backgrounds. Focus states should highlight the border or add a subtle shadow.

### Part 3: Step 2 - Token Configuration (`<StepTokenConfig />`)
- **Layout:** Standard vertical form group.
- **Elements:** Inputs for "Token Name", "Token Symbol" (e.g., $EVO), and "Total Supply". Include a visual chart or inputs representing the distribution (Public Sale %, Team %, Treasury %).
- **Style:** Clean data entry fields.

### Part 4: Step 3 - Funding Goal (`<StepFundingGoal />`)
- **Layout:** Standard vertical form group.
- **Elements:** Inputs for "Funding Goal (BNB)" and "Sale Duration (Days)" or a Deadline string. Include a read-only calculated field showing the implied fixed Token Price (Funding Goal / Public Sale Allocation).
- **Style:** Emphasize the BNB input with a larger font or a dedicated currency suffix.

### Part 5: Step 4 - Milestone Definition (`<StepMilestones />`)
- **Layout:** A dynamic container that allows adding multiple cards/rows.
- **Elements:**
  - A dynamic array of Milestone forms. Each milestone needs a "Description" input and an "Unlock Amount (BNB)" input.
  - A button to "+ Add Milestone".
  - A running tally showing if the sum of all Milestone `unlockAmount`s equals the total `fundingGoal` (a requirement for the smart contract).
- **Style:** Each milestone should be enclosed in a distinct card (`bg-white rounded-2xl border border-[#111111]/10 p-6`).

### Part 6: Step 5 - Review & Deploy (`<StepReviewDeploy />`)
- **Layout:** A consolidated summary panel.
- **Elements:** A clean, read-only representation of all the data gathered in the previous steps.
- **Actions:**
  - A primary CTA button: "Deploy Smart Contracts".
  - **Conditional Logic:** If no wallet is connected, the button should instead say "Connect Wallet to Deploy" and open the Connect Wallet modal context.
- **Style:** The Deploy button should be prominently styled with the vibrant green accent (`bg-[#b5e315] hover:-translate-y-1 shadow-[4px_4px_0px_#111111]`).

---

**Execution Instructions:**
Output the React/Next.js code for this page (`src/app/create/page.tsx` and accompanying components).
Ensure you break down the code into these distinct functional components before assembling them. Setup the main page to hold the React state for the form data and pass it down to the individual step components. Use Tailwind CSS utility classes to achieve the specified "Cream White" brutalist styling.
