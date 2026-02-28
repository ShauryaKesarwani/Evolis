# README Overhaul Prompt

*Instructions: Copy the text below and provide it to the LLM to generate your final README and Mermaid diagrams.*

---

**PROMPT:**

You are an expert technical writer and developer advocate, tasked with overhauling the repository's `README.md` for a high-stakes BNB Chain hackathon submission.

Using your understanding of the Evolis protocol, create a highly structured, professional, and compelling `README.md` that strictly adheres to the BNB Chain hackathon judging criteria.

### IMPORTANT: Diagram Generation
Before writing the README, you must **generate the code for two detailed Mermaid diagrams**:
1. A **User Journey diagram** (showing both Supporter and Founder flows)
2. A **System Architecture diagram** (showing Next.js, Bun, Hono, SQLite, and the EVM Smart Contracts)

I will copy this Mermaid code into mermaid.live to generate images for the final README. Output the Mermaid code blocks clearly, and use `[Insert User Journey Image Here]` and `[Insert Architecture Image Here]` placeholders in the README text where they belong.

### Required README Sections
Your output `README.md` must clearly include the following specific sections:
- **User Journey** (include the placeholder for the Mermaid diagram)
- **System Architecture Diagram** (include the placeholder for the Mermaid diagram)
- **Clear setup + run instructions**
- **Value Proposition**
- **Problem → Solution clarity**
- **Target users**
- **Business / token model**
- **GTM strategy**
- **Roadmap**

Make sure these are distinct headings or prominent subheadings in the document.

### Hackathon Judging Pillars to Emphasize
While writing the required sections above, weave in narrative elements that hit these five pillars:

#### 1. DESIGN & USABILITY
*How the project feels and functions for users.*
- Goal: Use the User Journey section to clearly demonstrate the interactions and how the UX improves upon existing crowdfunding or token launch tools.

#### 2. TECHNICAL IMPLEMENTATION & CODE QUALITY
*Build for users, not just judges. Write clean, transparent, open-source code.*
- Goal: Use the System Architecture section to provide a complete, labeled architecture breakdown that shows modules, data flow, and tech stack. Explain the role of the `EvolisFactory`, `EvolisPool`, and `LiquidityController`.

#### 3. BNB CHAIN INTEGRATION & ECOSYSTEM FIT
*How the project connects to and strengthens the BNB Chain ecosystem.*
- Goal: Create a prominent section highlighting our on-chain footprint. List the verified smart contract addresses on BscScan Testnet with clickable links. Detail our functional integration of BNB infrastructure (ethers.js / wagmi).

#### 4. INNOVATION & CREATIVITY
*What makes the idea stand out. Bring fresh ideas or new technical approaches.*
- Goal: Lead the README with strong Problem → Solution clarity. Explicitly detail our technical novelty (Bonding Curve + Milestone Escrow + Progressive Liquidity Unlock + IL Protection). Highlight this as a first-of-its-kind approach on BNB Chain.

#### 5. SUSTAINABILITY & MARKET POTENTIAL
*Have a roadmap that extends beyond the hackathon.*
- Goal: Make the Roadmap section realistic and ambitious. Show what has been achieved during the hackathon (MVP, testnet deployment) and outline the future trajectory (Mainnet launch, Governance/DAO, Automated epoch triggering, AI-themed templates).

---

**Output Formatting Requirements:**
1. First, output the two Mermaid code blocks.
2. Second, output the complete `README.md` content ensuring all required sections are present.
3. Use GitHub-style alerts (e.g., `> [!NOTE]`) for critical info if applicable.
4. Make it visually striking but scannable for judges who have limited time.
