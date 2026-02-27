# Prompt for Developing Admin Verification (Page 5) and User Dashboard (Page 6)

**Role:** Expert Frontend Developer and UI/UX Designer

**Context:**
You are building the Admin / Milestone Verification (Page 5) and User Dashboard (Page 6) for a milestone-gated tokenized crowdfunding platform built on BNB Chain using Next.js and Tailwind CSS.
These pages act as the central hubs for platform administration and personalized user tracking. The User Dashboard serves both Startup Founders and Supporters. The Admin page serves as a verification interface for milestone completions.

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

### 🛡️ Smart Contract Data Simulation
For the purpose of this Next.js UI build (demo mode), do not wire up strict `wagmi` authentication or actual contract calls. Instead, use comprehensive mock data and React state to simulate the following flow:
- **Admin Flow (Page 5):** Simulate viewing a specific project's pending milestone (containing `project_id`, `description`, `unlock_amount`, and `verification_notes`), and trigger mock UI state changes for "Approve" (releasing funds) or "Reject".
- **Dashboard Data (Page 6):** Set up mock states to distinguish between a "Supporter" view (showing tokens held, invested campaigns) and a "Founder" view (showing created campaigns, milestone status).

---

## 🏗️ Compartmentalized Execution Plan for Page 5 (Admin Verification)
Please build the page by dividing the UI into distinct, modular React components.
*Access Constraint Note: For this demo, just build the UI assuming the user has Admin rights. Include a mock conditional render structure that logs "Checking Admin access..." before resolving to the page.*

### Part 1: Page Layout & Header (`<AdminLayout />` & `<AdminHeader />`)
- **Layout:** A max-width centered container (`max-w-6xl mx-auto py-12 px-4`). A two-column grid on desktop (list of milestones to review on left, detail view on right) and stacked on mobile.
- **Elements:**
  - A prominent header: "Platform Admin: Milestone Verification".
  - Display the connected admin wallet address and current global platform escrow balance (mock data: e.g., 24,500 BNB).
- **Style:** Headers use `Martian Mono`. Clean card-based separation resting on the `#FCFAF6` background.

### Part 2: Milestone Review List (`<MilestoneReviewList />`)
- **Layout:** A vertical scrollable column on the left side of the grid.
- **Elements:**
  - A list of cards representing `Milestone` objects submitted for review.
  - Each item shows: Project Name, Milestone Description excerpt, and an "Awaiting Review" badge.
  - Interactive selection (clicking a card updates the detail view).
- **Style:** Cards with solid dark borders (`border-[#111111]/10`), rounded corners (`rounded-xl`). The active/selected card should have a solid `#111111` border or subtle `Lime-Leaf` highlight.

### Part 3: Selected Milestone Detail Panel (`<AdminMilestoneDetail />`)
- **Layout:** The main content area on the right side of the grid.
- **Elements:**
  - Detailed view of the selected milestone: Project Name, Stage/Milestone Description, Unlock Amount (BNB).
  - Explicit section showing "Founder's Submitted Proof" (mock text and a mock external URL link).
- **Style:** Clean typography, `Inter` for data reading. Data blocks boxed in `<div className="border border-[#111111]/10 rounded-2xl p-6 bg-white">`.

### Part 4: Verification Actions (`<VerificationControlStrip />`)
- **Layout:** Action button row anchored at the bottom of the detail panel.
- **Elements:**
  - "Approve & Release Funds" button.
  - "Reject Submission" button.
  - (Conditional) A text input for "Rejection Reason" if 'Reject' is clicked.
- **Style:** Approve button uses high-contrast `bg-[#b5e315]` with dark text and a strong shadow block (`shadow-[4px_4px_0px_#111111]`). Reject uses a distinct style (e.g., outline or muted red) to prevent accidental clicks.

---

## 🏗️ Compartmentalized Execution Plan for Page 6 (User Dashboard)
Please build the page by dividing the UI into distinct, modular React components.
*Note: Include a simple toggle in the UI (or standard React state) to flip between "Supporter Only" (empty states for campaigns) and "Founder" (shows deployed campaigns) for demo purposes.*

### Part 5: Dashboard Profile Header (`<DashboardProfile />`)
- **Layout:** A wide banner stretching across the top of the max-width container (`max-w-6xl mx-auto`).
- **Elements:**
  - User wallet address / ENS mock name.
  - Global stats: "Total Invested (BNB)" and "Projects Backed".
- **Style:** Dark Charcoal background (`bg-[#111111]`) with Cream White text (`text-[#FCFAF6]`) and Lime-Leaf Green accents for numerical values.

### Part 6: Dashboard Navigation Tabs (`<DashboardTabs />`)
- **Layout:** Horizontal navigation row below the profile header.
- **Elements:**
  - Tabs: "My Investments", "My Campaigns", "Token Portfolio".
- **Style:** Underlined active tab or pill-shaped buttons with solid borders (`border-[#111111]/20`). 

### Part 7: "My Investments" View (`<InvestmentsGrid />`)
- **Layout:** Responsive grid (1 col mobile, 2-3 cols desktop).
- **Elements:**
  - Cards for campaigns invested in. Shows: Project Logo/Name, Tokens held by user in this project, and the project's current overall funding/milestone progress.
  - Quick-action link: "View Campaign".
- **Style:** Standard platform card style (`bg-white rounded-2xl border border-[#111111]/10 p-6`).

### Part 8: "My Campaigns" Founder View (`<FounderCampaignsGrid />`)
- **Layout:** Responsive grid.
- **Elements:**
  - **Empty State (Crucial):** If the mock data array for `myCampaigns` is empty (i.e., user is just a supporter), display a visually appealing empty state with text "You haven't launched any projects yet" and a prominent CTA button mapping to `/create` ("Launch a Campaign").
  - **Populated State:** Cards for created campaigns showing: Funding Status (Goal vs Raised), Current active phase, and a "Submit Milestone" action button if a phase is ready.
- **Style:** Emphasize the empty state CTA with standard platform button styling (lime background, dark shadow).

---

**Execution Instructions:**
Output the React/Next.js code for these pages (`src/app/admin/page.tsx`, `src/app/dashboard/page.tsx` and accompanying components).
Ensure you break down the code into these distinct functional components before assembling them. Setup the main page components to hold the mock React state (including the toggle for Founder vs Supporter empty states and mock Admin interaction) and pass it down to the child components. Use Tailwind CSS utility classes to achieve the specified "Cream White" brutalist styling.
