# Timeline Builder — Agent Guidelines

You are working on **timeline-builder**, a research-focused timeline tool for managing events with uncertain dates and complex constraints.

## Key Documents

Read and reference these documents when applicable during work. Follow the rules for each.

1. **PRODUCT_PLAN.md** — Core vision, requirements, decisions, and architecture
   - Read this first to understand the project goals and design decisions
   - Contains syntax specifications, tech stack choices, and roadmap

2. **BACKLOG.md** — Implementation backlog and phase tracking
   - Current work items organized by phase
   - Task priorities and dependencies
   - Update this as work progresses to refine new ideas (See also sprint process doc.)

3. **CHANGES.md** — Change log for significant updates
   - List features and changes by release number
   - Document major architectural decisions
   - Track API/syntax changes
   - Note breaking changes

## Project Principles

1. **Plain text is source of truth** — `.tl` files are version-controlled, human-readable
2. **Relative constraints are primary** — Events can exist without absolute dates
3. **Separation of concerns** — Parser, solver, and visualizer are independent modules
4. **Research-first design** — Support uncertain data, multiple theories, confidence levels
5. **Well-tested** — Parser must be thoroughly unit tested

## Architecture Overview

```
.tl file → Parser → Data Model → Constraint Solver → Visualization
                         ↓
                    Unit tests
```

**Key modules:**

- **Parser** (TypeScript): `.tl` files → structured AST/objects
- **Solver** (TypeScript): Constraint propagation and interval arithmetic
- **Visualizer** (React/Svelte + D3.js): Timeline rendering

## Syntax Quick Reference

See PRODUCT_PLAN.md for full syntax specification. Key features:

```timeline
---
title: Jacob's Life
reference: jacobBorn
---

jacobBorn: Jacob is born [reference]

arrival: Jacob arrives in Haran
  after: jacobBorn + 20 years

departure: Jacob departs Haran
  after: arrival + 13-15 years    # Uncertain duration
  source: Genesis 31
  note: Served 7 years for each wife
```

**Constraint types:**

- `after: X` → my start after X's end (start-to-end, default)
- `before: X` → my end before X's start (end-to-start, default)
- `start-after: X` → start-to-start
- `end-after: X` → end-to-end
- `during: X` → contained within X

**Uncertainty:**

- Date ranges: `1918-1922`
- Approximate: `~1920`
- Uncertain relationships: `after: X + 13-15 years`
- Confidence: `[high]`, `[medium]`, `[low]`

## Working on This Project

**Before starting a task:**

1. Read PRODUCT_PLAN.md to understand context
2. Check BACKLOG.md for current phase and priorities
3. Review MARKWHEN_COMPARISON.md if working on syntax/features

**When implementing:**

- Follow TypeScript best practices
- Write unit tests for parser and solver
- Keep modules decoupled (parser ≠ solver ≠ visualizer)
- Document any syntax changes in PRODUCT_PLAN.md
- Update BACKLOG.md as tasks complete

**When making significant changes:**

- Add entry to CHANGES.md
- Update relevant documentation
- Notify if breaking changes affect syntax or API

## Current Phase

See BACKLOG.md for the current phase of work. We're following a progressive approach:

**Phase 1:** CLI parser + basic data model
**Phase 2:** Constraint solver with interval arithmetic
**Phase 3:** Web-based visualization
**Phase 4:** Interactive editing and theory toggling

## Questions?

If requirements are unclear, check PRODUCT_PLAN.md first. If still uncertain, ask the user for clarification rather than guessing.
