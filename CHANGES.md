# Timeline Builder — Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Planning Phase

#### 2026-02-27 — Initial project setup
- Created PRODUCT_PLAN.md with core requirements and design decisions
- Completed Markwhen comparison analysis (MARKWHEN_COMPARISON.md)
- Defined custom syntax with support for:
  - Uncertain relationships (`after: X + 13-15 years`)
  - Multiple constraints per event
  - Confidence levels (`[high]`, `[medium]`, `[low]`)
  - Theory/scenario toggling
  - Unanchored timelines with named reference points
- Decided on tech stack: TypeScript, web-first, Vite + React/Svelte
- Established architecture: Parser → Solver → Visualizer (decoupled modules)

#### 2026-02-28 — Implementation planning
- Created agent guidelines in `.claude/CLAUDE.md`
- Created comprehensive BACKLOG.md with detailed task breakdown for Phases 1-5
  - Phase 1: CLI Parser + Data Model (21 tasks)
  - Phase 2: Constraint Solver (16 tasks)
  - Phase 3: Basic Visualization (16 tasks)
  - Phase 4: Interactive Editing (13 tasks)
  - Phase 5: Advanced Features (13 tasks)
- Each task includes: ID, description, dependencies, size estimate, and status
- Total estimated duration: 18-26 weeks (4-6 months)
- Added "Architecture Guidelines" section to PRODUCT_PLAN.md with:
  - Module structure and responsibilities (Parser, Solver, Visualizer)
  - Detailed data model specifications (Event, Constraint, TimeRange, Timeline, Theory)
  - Key algorithms (interval arithmetic, constraint propagation, conflict detection, topological sorting)
  - Error handling strategies (parser errors, solver conflicts, user-facing vs developer-facing)
  - Testing strategy with coverage expectations (>80% for parser/solver, >70% for visualizer)
  - Recommended code organization and directory structure

---

## Template for Future Entries

### [Version] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes to existing functionality

#### Deprecated
- Soon-to-be removed features

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Vulnerability fixes
