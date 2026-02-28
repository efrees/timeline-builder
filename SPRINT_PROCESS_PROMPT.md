# Sprint Process Prompt for AI Agents

Created on 2026-02-15

## Process to Follow

Execute a full cycle of the sprint process defined below. You are the lead agent and are accountable for the results of the cycle.

### Important Files

**ROADMAP.md** is a listing of triaged features and priorities that should drive sprint planning.
**CHANGES.md** is a record of notable features and bugfixes to concisely track what has been completed.
**docs/SPRINT_LETTER_{N}.md** (Example: docs/SPRINT_LETTER_04.md) are summaries of functionality and major technical decisions from each sprint, with screenshots, written for easy human review of the sprint.
**FEEDBACK.md** is a place to collect feedback, especially during sprint review, to be triaged and

### 1. Review Corrections and Feedback from Last Sprint

- Locate the latest ROADMAP or PLAN file in the root directory.
- Check for a FEEDBACK.md file.
- Any items marked CRITICAL or pointing out bugs that will impact upcoming work should be triaged and handled first in the cycle. (Move to top of BACKLOG.)
- Any items that suggest tool or process improvements should be cleaned up and used to update to CLAUDE.md.
- Leave non-critical items in the FEEDBACK file for the Product Owner to review later.

### 2. Sprint Plan (Leader)

- Determine the next sprint number, based on which sprint was completed last.
- Select 1-5 features from near the top of the backlog that can be tacked by a small team of 3-5 agents.
- Focus on the top priority items, but it's OK to cherry-pick items that are well-defined and efficient to work alongside the main sprint goal.
- Spin up the needed agent team according to the work to be done. There should always be at least one developer and one reviewer/documenter.

### 3a. Update ROADMAP (Product Owner)

- Spawn a product owner teammate to review remaining items in FEEDBACK.md
- The product owner should align features to the product vision and add them to the ROADMAP in appropriate priority order.
- This can happen during the sprint, since we've already considered critical items during sprint planning.

### 3b. Execute sprint (Dev Agents)

- Allocate each task to an agent, attempting to balance the workload and avoid conflicts in work.
- Each developer agent should implement its task(s), coordinating with others as necessary and responding to reviewer feedback.
  - If a task uncovers more questions or required follow-up work that won't fit in the sprint, log it in FEEDBACK.md
  - For any major technical decisions, especially where there were multiple alternatives considered, capture a decision summary for the sprint review.
- Do not count a task as done until it's been successfully validated by the reviewer.

### 3c. Review and test all work (Reviewers)

- One reviewer should create the sprint review letter, sequenced with the current sprint number, and add to it as each story is completed.
  - Write a short summary of each completed feature.
  - Capture screenshots, when relevant, to illustrate the features.
  - Focus on making the letter easy for a human to consume and understand, so that I can provide meaningful oversight and make the most of the delivered value.
- When issues are found during testing, communicate with the dev agent responsible, asking for a fix.
- Use sub-agents or Playwright scripts to minimize context impact for repeated testing.

**Sprint Review Letter Format**

```
# Sprint {N}

[toc]

## Features completed
- Feature 1 Title
- Feature 2 Title

## Details

### Feature 1
[Summary of feature 1 in 1-3 paragraphs, with screenshots, were applicable]

### Feature 2
[Summary of feature 2 in 1-3 paragraphs, with screenshots, were applicable]

### Smaller Items
[Briefly describe smaller features or bugfixes that would impact users]

## Technical Decisions

### ADR 1
[Brief record of architectural decision, including alternatives considered and why a particular option was chosen]
```

### 4. Sprint cleanup (Leader)

- Verify that the sprint letter exists for the current sprint.
- Confirm all agents report successful completion of tasks, or else have logged issues as FEEDBACK.
- Gather more information to clarify any unclear feedback items.
- Spin down the team and get ready for the next sprint.

