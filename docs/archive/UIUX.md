# UI/UX Structure — Milestone-Gated Crowdfunding Protocol (Revised)

---

## 1. List of Pages

1. Home / Explore
2. Create Campaign
3. Campaign Detail *(now includes Token Purchase inline)*
4. Milestone Submission *(new — for founders)*
5. Admin / Milestone Verification *(now access-gated)*
6. User Dashboard
7. Connect Wallet (Modal/Overlay — global component, not a page)

---

## 2. Detailed Page Breakdown

---

### Page 1: Home / Explore

**Purpose:** Entry point for all users. Allows supporters to discover and browse active startup campaigns.

**Main Sections / Components:**
- Global navigation bar (logo, nav links, wallet connect button)
- Hero banner with a brief platform value proposition
- Campaign grid/list — cards showing: project name, funding progress bar, token price, milestone count, status badge
- Filter and sort controls (by category, funding stage, newest, most funded)
- Featured / trending campaigns section
- Footer with platform info and links

**Key User Actions:**
- Browse and filter campaigns
- Click a campaign card to view its detail page
- Connect wallet
- Launch own campaign (CTA button to Create Campaign)

---

### Page 2: Create Campaign

**Purpose:** Allows a startup founder to configure and deploy a new fundraising campaign with token and milestone definitions.

**Main Sections / Components:**
- Step indicator / progress stepper (multi-step form)
- Step 1 — Project Info: project name, description, logo upload, website/social links
- Step 2 — Token Configuration: token name, token symbol, total supply, allocation breakdown (public sale %, team %, treasury %)
- Step 3 — Funding Goal: target amount, token price, sale duration
- Step 4 — Milestone Definition: add/edit/remove milestones, each with a description and the portion of funds it unlocks
- Step 5 — Review & Deploy: full summary of all inputs before submission
- Wallet connection prompt (if not already connected)
- Deploy/Submit button

**Key User Actions:**
- Fill in multi-step form fields
- Add, edit, reorder, or remove milestones
- Review full configuration summary
- Confirm and deploy campaign

---

### Page 3: Campaign Detail

**Purpose:** Central page for a specific campaign. Serves supporters researching and investing, and founders tracking progress. Token purchase now lives here as an inline panel rather than a separate page.

**Main Sections / Components:**
- Campaign header: name, logo, tagline, status badge
- Funding progress bar: amount raised vs. goal, percentage filled, time remaining
- Token info panel: token name, symbol, price, total supply, allocation chart
- Milestone tracker: ordered list of milestones with status indicators (pending / submitted / verified / funds released)
- Project description and team information
- **Token Purchase Panel (inline):**
  - Amount input (BNB to spend)
  - Calculated tokens to receive
  - Wallet balance display
  - Transaction summary with escrow notice
  - Confirm purchase button
  - Post-purchase inline confirmation message
- Social proof section: number of supporters, total tokens distributed
- Activity feed: recent purchases and milestone events
- **Founder-only action strip** *(visible only if connected wallet matches campaign owner):*
  - "Submit Milestone Completion" button → navigates to Milestone Submission page
  - Link to Admin / Verification Panel
- Share action

**Key User Actions:**
- Purchase tokens directly within the page
- View milestone progress
- Share campaign
- *(Founders only)* Navigate to milestone submission
- *(Founders only)* Navigate to admin panel

---

### Page 4: Milestone Submission *(New)*

**Purpose:** Allows the startup founder to formally submit proof of milestone completion, triggering the admin verification process. Only accessible to the campaign owner.

**Access Control:**
- Page is only reachable if the connected wallet matches the campaign's registered owner address
- If an unauthorized wallet attempts to access this route directly, they are redirected to the Campaign Detail page with an access-denied notice

**Main Sections / Components:**
- Campaign header (name, current funding status)
- Current milestone context panel: which milestone is being submitted, its description, and the unlock amount tied to it
- Submission form:
  - Milestone completion summary (text field)
  - Supporting evidence or notes (text field)
  - Optional link to external proof (URL field)
- Submission preview / review summary
- Submit for Verification button
- Submission status notice (e.g. "Awaiting admin review") after submission

**Key User Actions:**
- Review which milestone is up for submission
- Fill in completion details and evidence
- Submit milestone for admin review
- View confirmation that submission has been received

---

### Page 5: Admin / Milestone Verification

**Purpose:** Allows an authorized admin to review founder milestone submissions and approve fund releases. Strictly access-gated.

**Access Control:**
- Page is only surfaced in the UI (linked, visible in nav or campaign page) if the connected wallet matches a pre-defined admin address
- Unauthorized wallets attempting direct URL access are redirected to the Campaign Detail page with an access-denied notice
- The link to this page on the Campaign Detail page is conditionally rendered — it does not appear for non-admin wallets

**Main Sections / Components:**
- Campaign header with current escrow balance displayed
- Milestone list with status for each (pending / submitted / verified / released)
- Selected milestone detail view:
  - Milestone description
  - Founder's submitted proof and notes
  - External proof link (if provided)
  - Unlock amount
  - Current status
- Approve / Reject action controls
- Rejection reason input field (shown if rejecting)
- Funds release confirmation prompt (shown after approval)
- Verification history log: past decisions with wallet address and timestamps

**Key User Actions:**
- Select a submitted milestone to review
- Review founder-submitted proof
- Approve or reject a milestone
- Provide a rejection reason for the founder
- Trigger fund release after approval
- View full verification audit history

---

### Page 6: User Dashboard

**Purpose:** Personal hub for any connected user — both supporters tracking investments and founders tracking campaigns.

**Main Sections / Components:**
- Profile header: wallet address, total invested, campaigns supported
- "My Investments" tab: list of campaigns invested in, tokens held per campaign, current milestone status per campaign
- "My Campaigns" tab (for founders): list of campaigns created, funding status, pending milestone actions, quick link to submit a milestone
- Token portfolio summary: all tokens held across campaigns
- Quick-action links to each campaign's detail page, milestone submission page, or admin panel

**Key User Actions:**
- Switch between supporter and founder views
- Navigate to a specific campaign
- Track milestone progress across all investments
- Navigate directly to Milestone Submission from a campaign row

---

### Global Component: Connect Wallet (Modal / Overlay)

**Purpose:** Prompts the user to connect their crypto wallet before performing any on-chain action. This is a global UI component, not a page — it can be triggered from anywhere in the application without navigating away.

**Main Sections / Components:**
- Modal overlay
- Brief explanation of why connection is needed
- Wallet option list
- Cancel / close option

**Key User Actions:**
- Select and connect a wallet
- Dismiss modal and return to current page

---

## 3. Navigation Flow Diagram

```
[Home / Explore]
        |
        |─────────────────────────────────────────┐
        ↓                                         ↓
[Campaign Detail] ◄──────────────────── [Create Campaign]
        |                                         |
        |── (supporter) ──────────────────────────|
        |   Token Purchase Panel (inline)          |
        |   → Inline confirmation                  ↓
        |                               [Deploy → Campaign Detail]
        |── (founder only) ──────────────────────────────────┐
        |   ↓                                                 |
        [Milestone Submission]                                |
              |                                              |
              ↓                                              |
        [Admin / Milestone Verification] ◄───────────────────┘
        (access-gated: admin wallet only)
              |
              ↓
        [Fund Release Confirmed → Campaign Detail updated]


[User Dashboard]
        |
        |── "My Investments" → [Campaign Detail]
        |── "My Campaigns"   → [Campaign Detail]
        |                    → [Milestone Submission]
        |                    → [Admin Panel] (if admin wallet)


[Connect Wallet Modal]
↑ Triggered from: any page requiring a wallet action
↓ On success: returns user to the originating page and action — no redirect
```

**Key Navigation Principles:**
- Unauthorized direct URL access to gated pages redirects to Campaign Detail, not a blank error screen, keeping the user in a useful state.
- After campaign creation, founders land directly on their new Campaign Detail page.
- The Connect Wallet modal never triggers a page navigation — it always resolves in place.

---

## 4. AI Prompt Generation Framework (Meta-Prompt)

This section acts as a master blueprint for generating development prompts for the remaining pages. **When prompted to generate a development instruction set (e.g. `PromptCampaign.md`), the AI MUST use the following strict template.**

### Generation Command Definition
To generate a prompt for a new page, the user will issue a command like:
> "Generate a development prompt for [Page X] using the AI framework defined in UIUX.md. Output it to a markdown file."

### Required Output Template
The AI must generate a prompt following this exact structure:

```markdown
# Prompt for Developing [Page Name]

**Role:** Expert Frontend Developer and UI/UX Designer

**Context:**
You are building the [Page Name] for a milestone-gated tokenized crowdfunding platform built on BNB Chain using Next.js and Tailwind CSS.

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

---

## 🏗️ Compartmentalized Execution Plan
Please build the page by dividing the UI into distinct, modular React components.
*(The generator must now break down the UI into logical parts. E.g., `Part 1: HeaderBar`, `Part 2: SubmissionForm`)*

### Part 1: [Component Name] (`<ComponentName />`)
- **Layout:** [Describe the structure, e.g., grid, flex row, margins]
- **Elements:** [Detailed list of text fields, buttons, interactive elements]
- **Style:** [Specific Tailwind classes utilizing the defined color palette]

### Part [N]: ...

---

**Execution Instructions:**
Output the React/Next.js code for this page, ensuring you break down the code into these distinct functional components before assembling them. Use Tailwind CSS utility classes to achieve the specified styling.
```