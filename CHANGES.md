# Timeline Builder — Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Sprint 4 — 2026-03-15

#### Added
- Complete constraint propagation engine (P2.5)
  - Forward propagation: propagate constraints from dependencies to dependents
  - Backward propagation: tighten bounds using successor constraints
  - Fixed-point iteration: repeat until convergence or max iterations
  - Support for all constraint types: after, before, start-after, end-after, end-before, during
  - Duration constraint handling
  - Auto-extend max bound when min pushes past it (handles unconstrained events)
  - Theory-specific propagation support (foundation for Phase 4)
- Conflict detection and resolution system (P2.6)
  - Cycle detection using existing graph algorithms
  - Empty interval detection (unsatisfiable constraints)
  - Direct conflict detection (multiple absolute dates, conflicting before/after)
  - Conflict chain tracing with full dependency paths
  - Resolution suggestions based on confidence levels
  - Structured Conflict objects with type, events, constraints, and explanations
- Anchoring system (P2.7)
  - Identify anchored events (events with absolute date constraints)
  - Connected component analysis for anchoring status
  - Reference event selection for unanchored components
  - Relative time conversion (years since reference)
  - Support for fully anchored, partially anchored, and unanchored timelines
  - Multiple anchor handling with warnings
  - Strongest anchor identification for propagation
- Test suites for constraint solving (48 new tests)
  - 17 tests for propagation engine (86.07% coverage)
  - 11 tests for conflict detection (92.07% coverage)
  - 20 tests for anchoring system (98.34% coverage)

#### Changed
- Initial bounds for unconstrained events increased to [-1,000,000, +1,000,000] years
  - Prevents overflow when adding large durations
  - Wide enough for any realistic timeline
- Propagation parameter naming improved for clarity
  - `referencedEventRange` and `currentEventRange` instead of `sourceRange`/`targetRange`
  - Self-documenting code with clear semantics

#### Fixed
- Parameter naming confusion in `applyConstraint` function
- Empty interval handling for unconstrained events during propagation
- Vitest watch mode hanging in CI (use `vitest run` instead of `npm test`)
- Backward propagation logic for different constraint types

#### Technical
- Solver coverage: 92.74% (exceeds >80% target)
- Total tests: 251 passing (48 new in Sprint 4)
- Fixed-point iteration typically converges in 2-5 iterations
- All commits include Co-Authored-By tags
- Complete Phase 2: Constraint solver fully functional
- Integration: propagator + conflict detector + anchoring work together seamlessly
- Uses Sprint 3 foundation: interval arithmetic, constraint graph, graph algorithms

### Sprint 3 — 2026-03-09

#### Added
- Comprehensive interval arithmetic library for constraint propagation (P2.1)
  - Interval operations: `intersection`, `union`, `widen`, `narrow`
  - Helper functions: `isEmpty`, `isPoint`, `width`
  - Internal utilities for time conversion and duration handling
  - Handles uncertain durations and approximate dates with margin
- Time range comparison operations (P2.2)
  - Comparison functions: `isBefore`, `isAfter`, `overlaps`, `contains`
  - Proper handling of empty intervals and edge cases
- Constraint graph data structure (P2.3)
  - `ConstraintGraph` class for representing temporal dependencies
  - Node operations: add/remove events, query by ID
  - Edge operations: automatic constraint-to-edge conversion
  - Query operations: predecessors, successors, constraints
  - Theory filtering for alternative chronologies
- Graph traversal algorithms (P2.4)
  - Topological sort using Kahn's algorithm (for dependency ordering)
  - Cycle detection using DFS (identifies circular dependencies)
  - Connected components analysis (finds anchored/unanchored subgraphs)
  - BFS and DFS traversal functions
  - Error handling for invalid graph states
- Test suites for solver infrastructure (105 new tests)
  - 54 tests for interval arithmetic (100% statement coverage)
  - 25 tests for constraint graph (89% statement coverage)
  - 26 tests for graph algorithms (100% statement coverage)

#### Changed
- Interval arithmetic uses simplified day-based approximation
  - 1 year = 365 days (no leap years)
  - 1 month = 30 days (fixed length)
  - Good enough for historical/archaeological timelines

#### Fixed
- Union operation adjacency detection (simplified from complex day-based logic to direct year comparison)
- Overlaps function now correctly handles empty intervals (returns false)
- Cycle detection in graph algorithms (now correctly identifies and returns cycle paths)
- Topological sort error handling (now throws on cycles as expected)

#### Technical
- Solver coverage: 96.20% (exceeds >80% target)
- Edge direction convention: B after A → edge B → A (dependent → dependency)
- All commits include Co-Authored-By tags
- Clean separation: three independent modules (interval, graph, algorithms)
- Complete constraint solver foundation ready for propagation algorithms

### Sprint 2 — 2026-02-28

#### Added
- Complete parser implementation for `.tl` timeline files
  - Parser for basic events with absolute dates (P1.8)
  - Parser for relative constraints (after/before/during with offsets) (P1.9)
  - Parser for event properties (source, note, tags) (P1.10)
  - Parser for duration constraints (P1.11)
  - Parser for groups and theories (P1.12)
- Comprehensive parser test suite (53 tests, 100% passing)
- `Parser` class with recursive descent parsing
- `ParseError` class with line/column information
- `parse()` convenience function
- Support for:
  - Absolute dates: year, year-month, year-month-day formats
  - Date ranges: `1918-1922`
  - Approximate dates: `~1920`
  - Confidence levels: `[high]`, `[medium]`, `[low]`
  - Relative constraints with duration offsets: `after: eventA + 3 years`
  - Uncertain durations: `after: eventA + 13-15 years`
  - Approximate durations: `after: eventA + ~3 years`
  - Explicit anchor points: `after: eventA.start`
  - Multiple time units: years, months, days
  - Event properties: source, note, tags
  - Duration constraints: `duration: 5 years`
  - Groups with nested events: `#group ... #endgroup`
  - Theories for alternative interpretations: `#theory ... #endtheory`
  - YAML frontmatter for timeline metadata

#### Changed
- Extended `ConstraintType` to include `'absolute'` for absolute date constraints
- Added `absoluteRange` field to `Constraint` interface
- Improved constraint type definitions to support both absolute and relative constraints

#### Technical
- Parser coverage: 93.32% (exceeds >80% target)
- Property detection using keyword matching (more robust than indentation)
- Text reconstruction for multi-word property values
- Instance-based timeline state for simplified nested parsing

### Sprint 1 — 2026-02-28

#### Added
- TypeScript project infrastructure with Vite build system
- Testing framework with Vitest (45 tests passing, 100% coverage on implemented code)
- Core data model types: `TimePoint`, `TimeRange`, `Duration`, `Constraint`, `Event`, `Timeline`, `Theory`
- Lexer/tokenizer for `.tl` files with support for:
  - Event IDs, strings, numbers, dates (YYYY, YYYY-MM, YYYY-MM-DD)
  - Keywords: `after`, `before`, `during`, `start-after`, `end-after`, etc.
  - Time units: `years`, `months`, `days`
  - Confidence levels: `[high]`, `[medium]`, `[low]`
  - Group/theory markers: `#group`, `#theory`, `#tag`
  - Frontmatter delimiters: `---`
  - Symbols: `:`, `+`, `-`, `~`, `.`
  - Line comments: `//`
- Example `.tl` files: `basic.tl`, `jacob.tl`, `uncertain.tl`
- CLI skeleton with `tl-parse` command (parser implementation pending)
- Comprehensive test suite for data model and lexer (45 tests, all passing)

#### Technical
- ESLint and Prettier configured for code quality
- Strict TypeScript configuration with full type safety
- Vite configured for both CLI and library builds
- Directory structure: `src/{parser,solver,visualizer,types,utils,cli}`, `tests/`, `examples/`

## [Planning Phase]

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
