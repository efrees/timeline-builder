# Timeline Builder — Implementation Backlog

This document breaks down the implementation roadmap into concrete, actionable tasks organized by phase. Each task is specific, testable, and sized for 1-3 days of work.

## Task Format

Each task includes:
- **Task ID**: Unique identifier (e.g., `P1.1`, `P1.2`)
- **Description**: Clear, actionable description
- **Dependencies**: What must be done first (if any)
- **Size**: S (small, <1 day), M (medium, 1-2 days), L (large, 2-3 days)
- **Status**: Not Started, In Progress, Completed, Blocked

---

## Phase 0: Requirements & Design ✅ COMPLETED

**Goal:** Finalize design decisions and establish project foundation.

**Success Criteria:**
- ✅ All open questions from PRODUCT_PLAN.md answered
- ✅ Plain-text syntax fully designed with examples
- ✅ Tech stack chosen and documented
- ✅ Data model sketched
- ✅ Comparison with Markwhen completed

**Status:** All Phase 0 tasks completed as of 2026-02-28. See PRODUCT_PLAN.md and MARKWHEN_COMPARISON.md.

---

## Phase 1: CLI Parser + Data Model

**Goal:** Build a working parser that can read `.tl` files and output structured data. No constraint solving yet—just parse, validate syntax, and output JSON representation.

**Success Criteria:**
- Can parse basic events with absolute dates
- Can parse relative constraints (without solving them)
- Can parse groups, tags, properties, sources
- Can detect syntax errors and report useful messages
- CLI tool outputs valid JSON
- Comprehensive unit test coverage (>80%)

### Setup & Infrastructure

**P1.1: Initialize TypeScript project**
- Description: Set up TypeScript project with Vite build system, ESLint, Prettier
- Dependencies: None
- Size: S
- Status: Not Started
- Tasks:
  - Create `package.json` with dependencies (TypeScript, Vite, Vitest, ESLint, Prettier)
  - Configure `tsconfig.json` for strict mode
  - Set up Vite config for CLI and library builds
  - Configure ESLint and Prettier with project conventions
  - Create basic project structure: `src/`, `tests/`, `examples/`
  - Add npm scripts: `build`, `test`, `lint`, `format`
  - Create `.gitignore` for TypeScript/Node projects

**P1.2: Set up testing framework**
- Description: Configure Vitest for unit testing with good DX (fast, watch mode, coverage)
- Dependencies: P1.1
- Size: S
- Status: Not Started
- Tasks:
  - Install Vitest and related dependencies
  - Configure Vitest in `vite.config.ts`
  - Set up coverage reporting (Istanbul/c8)
  - Create example test to verify setup works
  - Add test scripts to `package.json`
  - Document testing conventions in README or CONTRIBUTING.md

**P1.3: Create project documentation structure**
- Description: Set up initial docs and examples folder
- Dependencies: P1.1
- Size: S
- Status: Not Started
- Tasks:
  - Create `examples/` directory with sample `.tl` files
  - Write `examples/basic.tl` (simple events with dates)
  - Write `examples/jacob.tl` (biblical chronology from PRODUCT_PLAN.md)
  - Write `examples/uncertain.tl` (showcasing uncertainty features)
  - Create `docs/` directory for detailed documentation
  - Write basic README.md with project overview and quick start

### Data Model

**P1.4: Define core data model classes**
- Description: Create TypeScript classes/interfaces for Event, Constraint, Timeline, and related types
- Dependencies: P1.1
- Size: M
- Status: Not Started
- Tasks:
  - Define `TimePoint` type (year/month/day with precision levels)
  - Define `TimeRange` type (start/end with optional uncertainty)
  - Define `Event` class with id, description, timeRange, tags, properties
  - Define constraint types: `AbsoluteConstraint`, `RelativeConstraint`, `DurationConstraint`
  - Define `ConstraintType` enum (after, before, start-after, end-after, during)
  - Define `ConfidenceLevel` enum (high, medium, low)
  - Define `Timeline` class to hold events, constraints, metadata
  - Define `Theory` class for scenario support
  - Write JSDoc comments for all types
  - Write unit tests for data model instantiation and basic methods

**P1.5: Implement interval arithmetic foundation**
- Description: Create utility functions for working with uncertain time ranges
- Dependencies: P1.4
- Size: M
- Status: Not Started
- Tasks:
  - Create `TimeInterval` class with min/max bounds
  - Implement addition: `interval + duration` (range propagation)
  - Implement subtraction: `interval - duration`
  - Handle uncertain durations: `interval + (13-15 years)` expands the range
  - Handle approximate durations: `interval + ~3 years` (define semantics)
  - Write comprehensive unit tests for all arithmetic operations
  - Document interval semantics in code comments

### Lexer/Tokenizer

**P1.6: Implement lexer for basic tokens**
- Description: Build lexer that converts raw text into tokens (ID, colon, date, keyword, etc.)
- Dependencies: P1.4
- Size: M
- Status: Not Started
- Tasks:
  - Define `Token` type with kind, value, position (line, column)
  - Implement tokenization for:
    - Whitespace and newlines (significant for indentation)
    - Event IDs (camelCase identifiers)
    - Colons, plus/minus, brackets
    - Keywords: `after`, `before`, `during`, `start-after`, etc.
    - Date literals (YYYY, YYYY-MM, YYYY-MM-DD)
    - Time units: `years`, `months`, `days`
    - Numbers (integers and ranges like `13-15`)
    - Strings (for descriptions, notes)
  - Handle approximate marker: `~`
  - Handle confidence markers: `[high]`, `[medium]`, `[low]`
  - Track line and column numbers for error reporting
  - Write unit tests for each token type
  - Write tests for edge cases (malformed input, special characters)

**P1.7: Extend lexer for frontmatter and groups**
- Description: Add tokenization for YAML frontmatter, group blocks, theory blocks
- Dependencies: P1.6
- Size: S
- Status: Not Started
- Tasks:
  - Tokenize YAML frontmatter delimiters (`---`)
  - Tokenize group markers: `#group`, `#endgroup`
  - Tokenize theory markers: `#theory`, `#endtheory`
  - Tokenize tags: `#tagName`
  - Tokenize comment syntax (decide on `//` or `#` if not tag)
  - Write tests for nested groups and frontmatter parsing

### Parser

**P1.8: Implement parser for basic events with absolute dates**
- Description: Parse simple events with absolute date constraints
- Dependencies: P1.6
- Size: M
- Status: Not Started
- Tasks:
  - Implement recursive descent parser structure
  - Parse event declaration: `eventId: Event description`
  - Parse absolute date property: `date: 1920`
  - Parse date ranges: `date: 1918-1922`
  - Parse approximate dates: `date: ~1920`
  - Parse EDTF-style dates: `1984?`, `1985~` (research EDTF library or implement basic support)
  - Validate event IDs are unique
  - Generate AST nodes for events with absolute dates
  - Write unit tests for each syntax variant
  - Write tests for syntax error detection

**P1.9: Implement parser for relative constraints**
- Description: Parse relative constraints (after/before/during) without solving them
- Dependencies: P1.8
- Size: M
- Status: Not Started
- Tasks:
  - Parse `after: eventId + duration` syntax
  - Parse `before: eventId - duration` syntax
  - Parse `start-after:`, `end-after:`, `end-before:` variants
  - Parse `during: eventId` syntax
  - Parse duration literals: `3 years`, `5 months`, `10 days`
  - Parse uncertain durations: `13-15 years`, `~3 years`
  - Parse explicit anchor points: `after: eventId.start`, `before: eventId.end`
  - Support multiple constraints per event
  - Generate AST nodes for relative constraints
  - Write unit tests for all constraint types
  - Write tests for invalid constraint references

**P1.10: Implement parser for event properties and metadata**
- Description: Parse tags, properties, sources, notes, confidence levels
- Dependencies: P1.8
- Size: S
- Status: Not Started
- Tasks:
  - Parse tags: `tags: #family #travel`
  - Parse confidence levels on constraints: `after: X [high]`
  - Parse `source:` property with citation text
  - Parse `note:` property with researcher notes
  - Parse multi-line properties (using YAML-like indentation or `|` syntax)
  - Parse generic properties: `key: value`
  - Store properties in Event data model
  - Write unit tests for property parsing

**P1.11: Implement parser for duration constraints**
- Description: Parse duration constraints on events
- Dependencies: P1.8
- Size: S
- Status: Not Started
- Tasks:
  - Parse `duration: 5 years` syntax
  - Parse uncertain durations: `duration: 5-10 years`
  - Add duration to event data model
  - Write unit tests for duration parsing

**P1.12: Implement parser for groups and sections**
- Description: Parse hierarchical groups for organizing events
- Dependencies: P1.8
- Size: M
- Status: Not Started
- Tasks:
  - Parse `#group GroupName` ... `#endgroup` blocks
  - Support nested groups
  - Track group membership for each event
  - Parse group properties (if any, like display style)
  - Generate AST with group structure preserved
  - Write unit tests for nested groups and malformed groups

**P1.13: Implement parser for theory blocks**
- Description: Parse theory/scenario blocks for alternative interpretations
- Dependencies: P1.8
- Size: M
- Status: Not Started
- Tasks:
  - Parse `#theory TheoryName` ... `#endtheory` blocks
  - Support events and constraints within theory blocks
  - Handle shared events across theories (same event ID in multiple theories)
  - Track which constraints belong to which theory
  - Generate AST with theory associations
  - Write unit tests for theory parsing and conflicts

**P1.14: Implement parser for YAML frontmatter**
- Description: Parse file metadata (title, reference point, tag colors, etc.)
- Dependencies: P1.8
- Size: S
- Status: Not Started
- Tasks:
  - Parse YAML frontmatter between `---` delimiters
  - Extract `title:`, `reference:`, `description:` fields
  - Extract tag color definitions: `#tagName: color`
  - Store metadata in Timeline data model
  - Use existing YAML library (e.g., `js-yaml`) or implement minimal parser
  - Write unit tests for frontmatter parsing

**P1.15: Implement comprehensive error reporting**
- Description: Provide helpful error messages with line/column numbers
- Dependencies: P1.8, P1.9
- Size: M
- Status: Not Started
- Tasks:
  - Create `ParseError` class with position, message, suggestion
  - Report syntax errors with context (show the problematic line)
  - Detect common mistakes (missing colon, undefined event reference, etc.)
  - Provide helpful suggestions ("Did you mean X?")
  - Write unit tests for error detection and messages
  - Ensure errors include file, line, and column information

### CLI Tool

**P1.16: Build CLI tool to parse .tl files**
- Description: Create command-line tool that reads `.tl` files and outputs JSON
- Dependencies: P1.8, P1.9, P1.10, P1.12, P1.13, P1.14
- Size: M
- Status: Not Started
- Tasks:
  - Create CLI entry point: `src/cli.ts`
  - Use a CLI framework (e.g., Commander.js or yargs) for argument parsing
  - Accept file path as input: `tl-parse examples/jacob.tl`
  - Read file from disk
  - Invoke parser
  - Output JSON representation of Timeline to stdout
  - Support `--output` flag to write to file
  - Support `--pretty` flag for formatted JSON
  - Handle file read errors gracefully
  - Write integration tests for CLI

**P1.17: Validate parsed output structure**
- Description: Add validation layer to ensure parsed data is well-formed
- Dependencies: P1.16
- Size: S
- Status: Not Started
- Tasks:
  - Validate all event IDs referenced in constraints exist
  - Validate constraint references are not circular (basic check, not full cycle detection)
  - Validate time ranges are well-formed (start <= end)
  - Validate theory blocks don't have conflicting event definitions
  - Report validation errors with helpful messages
  - Write unit tests for validation rules

**P1.18: Add JSON schema for output**
- Description: Define and document JSON schema for parser output
- Dependencies: P1.16
- Size: S
- Status: Not Started
- Tasks:
  - Write JSON schema file for Timeline output format
  - Document schema in `docs/schema.md`
  - Add schema validation as optional CLI flag: `--validate-schema`
  - Write tests comparing parser output to schema

### Testing & Documentation

**P1.19: Write comprehensive parser tests**
- Description: Ensure high test coverage for all parser functionality
- Dependencies: P1.8–P1.17
- Size: L
- Status: Not Started
- Tasks:
  - Write tests for all example `.tl` files in `examples/`
  - Test error cases: malformed syntax, missing references, etc.
  - Test edge cases: empty files, whitespace handling, Unicode
  - Achieve >80% code coverage
  - Add tests for regression prevention
  - Document test organization and conventions

**P1.20: Document Phase 1 deliverables**
- Description: Write user-facing documentation for the parser and CLI
- Dependencies: P1.16
- Size: M
- Status: Not Started
- Tasks:
  - Write `docs/syntax.md` with full syntax reference
  - Write `docs/cli.md` with CLI usage guide
  - Write `docs/parser-api.md` for programmatic usage
  - Update README.md with installation and quick start
  - Write migration guide from other formats (if relevant)
  - Add code examples to documentation

**P1.21: Phase 1 integration and polish**
- Description: Final cleanup, optimization, and release preparation
- Dependencies: All other P1 tasks
- Size: M
- Status: Not Started
- Tasks:
  - Run full test suite and fix any failing tests
  - Profile parser performance on large files
  - Optimize hot paths if needed
  - Clean up TODOs and debug code
  - Review and improve error messages
  - Prepare release notes for Phase 1 completion
  - Tag Phase 1 release in git

---

## Phase 2: Constraint Solver

**Goal:** Implement constraint propagation and automatic computation of tightest possible date ranges for all events. This is the core "intelligence" of the system.

**Success Criteria:**
- Can propagate constraints through dependency graph
- Can compute tightest bounds for events with multiple constraints
- Can detect conflicting constraints
- Can handle interval arithmetic with uncertain durations
- Can solve both anchored and unanchored timelines
- Theory-aware solving (activate/deactivate constraint sets)
- Comprehensive test coverage including complex scenarios

### Interval Arithmetic Library

**P2.1: Extend interval arithmetic for constraint propagation**
- Description: Build full interval arithmetic library for time ranges
- Dependencies: P1.5
- Size: M
- Status: Not Started
- Tasks:
  - Implement intersection of intervals: `A ∩ B`
  - Implement union of intervals: `A ∪ B`
  - Implement interval comparison: `A < B`, `A > B`, `A overlaps B`
  - Handle open vs. closed intervals (if needed for "before" vs "at or before")
  - Implement widening for uncertain durations (e.g., `[1920, 1925] + [13, 15] years = [1933, 1940]`)
  - Implement narrowing for intersecting constraints
  - Write comprehensive unit tests for all operations
  - Document interval semantics and edge cases

**P2.2: Implement time range comparison and ordering**
- Description: Define ordering and comparison operations for time ranges
- Dependencies: P2.1
- Size: S
- Status: Not Started
- Tasks:
  - Implement `isBefore(A, B)`: true if A.max < B.min
  - Implement `isAfter(A, B)`: true if A.min > B.max
  - Implement `overlaps(A, B)`: true if ranges overlap
  - Implement `contains(A, B)`: true if A fully contains B
  - Handle edge cases (point events, infinite ranges)
  - Write unit tests for all comparison operations

### Constraint Graph

**P2.3: Build constraint graph data structure**
- Description: Represent events and constraints as a directed graph
- Dependencies: P1.4
- Size: M
- Status: Not Started
- Tasks:
  - Create `ConstraintGraph` class
  - Represent events as nodes
  - Represent constraints as directed edges with metadata (type, duration, confidence)
  - Support adding/removing events and constraints
  - Support querying neighbors (predecessors, successors)
  - Track which constraints belong to which theory
  - Write unit tests for graph construction and queries

**P2.4: Implement graph traversal utilities**
- Description: Utility functions for traversing and analyzing the constraint graph
- Dependencies: P2.3
- Size: M
- Status: Not Started
- Tasks:
  - Implement topological sort (for processing events in dependency order)
  - Implement cycle detection (detect circular dependencies)
  - Implement connected components (find anchored vs unanchored subgraphs)
  - Implement breadth-first and depth-first traversal
  - Write unit tests for all traversal algorithms

**P2.5: Detect conflicting constraints**
- Description: Find constraints that cannot be simultaneously satisfied
- Dependencies: P2.3, P2.4
- Size: M
- Status: Not Started
- Tasks:
  - Implement basic conflict detection: `after 1920` AND `before 1915` (impossible)
  - Detect transitive conflicts through dependency chains
  - Report conflicts with full constraint chain for debugging
  - Suggest which constraints might be wrong (heuristic based on confidence levels)
  - Write unit tests for various conflict scenarios
  - Write tests for edge cases (soft constraints, low-confidence data)

### Propagation Algorithm

**P2.6: Implement forward constraint propagation**
- Description: Propagate constraints from anchored events forward through the graph
- Dependencies: P2.1, P2.3, P2.4
- Size: L
- Status: Not Started
- Tasks:
  - Start from events with absolute dates (anchors)
  - Traverse graph in topological order
  - For each event, compute bounds based on predecessor constraints
  - Apply `after` constraints: `E.min = max(E.min, Pred.max + duration.min)`
  - Apply `before` constraints: `E.max = min(E.max, Succ.min - duration.min)`
  - Apply `during` constraints: `E.min >= Parent.min AND E.max <= Parent.max`
  - Handle duration constraints: `E.max = E.min + duration`
  - Propagate uncertainty through interval arithmetic
  - Write unit tests for forward propagation
  - Test with multiple constraint types

**P2.7: Implement backward constraint propagation**
- Description: Propagate constraints backward to tighten bounds further
- Dependencies: P2.6
- Size: M
- Status: Not Started
- Tasks:
  - After forward pass, traverse graph in reverse topological order
  - For each event, refine bounds based on successor constraints
  - Apply `before` constraints backward: `E.max = min(E.max, Succ.min - duration.min)`
  - Apply `after` constraints backward: `Pred.max = min(Pred.max, E.min - duration.min)`
  - Handle complex constraint chains
  - Write unit tests for backward propagation
  - Write tests for combined forward + backward propagation

**P2.8: Implement iterative constraint propagation (fixed-point)**
- Description: Repeatedly propagate until no more refinement is possible
- Dependencies: P2.6, P2.7
- Size: M
- Status: Not Started
- Tasks:
  - Implement fixed-point iteration: propagate until bounds stop changing
  - Set maximum iteration limit to prevent infinite loops
  - Detect convergence (no bounds changed in last iteration)
  - Optimize by tracking which events need re-propagation (work queue)
  - Write unit tests for complex graphs requiring multiple iterations
  - Test for performance on large graphs

**P2.9: Handle unanchored timelines**
- Description: Support timelines with no absolute dates, only relative constraints
- Dependencies: P2.6
- Size: M
- Status: Not Started
- Tasks:
  - Identify connected components with no absolute anchor
  - Choose a reference event (from file metadata: `reference: jacobBorn`)
  - Compute all dates relative to reference event (set reference to time 0)
  - Represent unanchored events with relative time ranges
  - Propagate constraints using relative time
  - Write unit tests for fully unanchored timelines
  - Write tests for partially anchored timelines (some events have dates, others don't)

**P2.10: Implement theory-aware constraint solving**
- Description: Activate/deactivate constraint sets based on selected theories
- Dependencies: P2.6
- Size: M
- Status: Not Started
- Tasks:
  - Filter constraint graph to only include constraints from active theories
  - Merge shared events across theories (base event + theory-specific constraints)
  - Solve for each theory independently
  - Compute difference in outcomes between theories
  - Write unit tests for theory toggling
  - Test with complex scenarios (multiple theories, overlapping constraints)

### Solver Integration

**P2.11: Build solver API**
- Description: Create high-level API for constraint solving
- Dependencies: P2.6–P2.10
- Size: M
- Status: Not Started
- Tasks:
  - Create `Solver` class with `solve(timeline, options)` method
  - Accept options: active theories, conflict resolution strategy, max iterations
  - Return solved timeline with computed bounds for all events
  - Return metadata: convergence status, conflicts detected, iterations used
  - Write unit tests for solver API
  - Write integration tests with real timeline examples

**P2.12: Optimize solver performance**
- Description: Profile and optimize solver for large timelines
- Dependencies: P2.11
- Size: M
- Status: Not Started
- Tasks:
  - Profile solver on large timelines (1000+ events)
  - Identify performance bottlenecks
  - Optimize hot paths (interval arithmetic, graph traversal)
  - Implement caching for repeated computations
  - Use efficient data structures (e.g., priority queue for work queue)
  - Write performance benchmarks
  - Document performance characteristics (time complexity)

**P2.13: Extend CLI to include solver**
- Description: Update CLI tool to solve constraints and output computed ranges
- Dependencies: P2.11
- Size: S
- Status: Not Started
- Tasks:
  - Add `--solve` flag to CLI
  - Run solver on parsed timeline
  - Output JSON with computed date ranges for each event
  - Add `--theory <name>` flag to activate specific theory
  - Show conflicts and warnings in output
  - Write integration tests for CLI with solver

### Testing & Documentation

**P2.14: Write comprehensive solver tests**
- Description: Test all solver functionality with complex scenarios
- Dependencies: P2.6–P2.11
- Size: L
- Status: Not Started
- Tasks:
  - Test basic forward/backward propagation
  - Test uncertain durations and range propagation
  - Test conflict detection and reporting
  - Test unanchored timelines
  - Test theory toggling
  - Test edge cases: cycles, disconnected graphs, conflicting constraints
  - Achieve >80% code coverage
  - Write regression tests for bugs found during testing

**P2.15: Document solver algorithms and design**
- Description: Write technical documentation for solver internals
- Dependencies: P2.11
- Size: M
- Status: Not Started
- Tasks:
  - Write `docs/solver.md` explaining algorithms and approach
  - Document interval arithmetic semantics
  - Document constraint propagation algorithm (with diagrams if helpful)
  - Document conflict detection strategy
  - Write examples of complex solving scenarios
  - Document performance characteristics and scalability

**P2.16: Phase 2 integration and polish**
- Description: Final cleanup and release preparation
- Dependencies: All other P2 tasks
- Size: M
- Status: Not Started
- Tasks:
  - Run full test suite (parser + solver)
  - Test with all example `.tl` files
  - Fix any bugs discovered during integration testing
  - Clean up code and remove debug logging
  - Review and improve error messages
  - Prepare release notes for Phase 2 completion
  - Tag Phase 2 release in git

---

## Phase 3: Basic Visualization

**Goal:** Build web-based visualization for timelines, showing events with uncertainty, zoom/pan, and basic interactivity.

**Success Criteria:**
- Horizontal timeline view with zoom and pan
- Events rendered as points or ranges
- Uncertainty displayed (shaded regions, error bars)
- Hover for event details
- Visual distinction for anchored vs. unanchored events
- Responsive layout
- Can load timeline JSON from parser/solver

### Visualization Setup

**P3.1: Set up web visualization project**
- Description: Create web app project with React/Svelte and D3.js
- Dependencies: P2.16 (completed Phase 2)
- Size: M
- Status: Not Started
- Tasks:
  - Create new Vite project for web app (`packages/viz` or similar)
  - Choose framework: React or Svelte (recommend Svelte for lighter bundle)
  - Install D3.js and TypeScript types
  - Set up Tailwind CSS or CSS modules for styling
  - Configure hot module replacement for development
  - Create basic app shell with header and timeline container
  - Write README for visualization package

**P3.2: Design timeline layout and scales**
- Description: Implement D3 scales for time-to-pixel mapping
- Dependencies: P3.1
- Size: M
- Status: Not Started
- Tasks:
  - Create D3 scale for x-axis (time → pixels)
  - Handle different precision levels (year, month, day) in scale
  - Implement zoom transform (scale factor and translation)
  - Create pan/zoom behavior with mouse and touch
  - Define viewport dimensions and margins
  - Handle responsive sizing (resize on window change)
  - Write unit tests for scale functions
  - Write visual regression tests (if using visual testing tool)

**P3.3: Implement timeline axis**
- Description: Render x-axis with time labels
- Dependencies: P3.2
- Size: S
- Status: Not Started
- Tasks:
  - Use D3 axis generator for x-axis
  - Format tick labels based on zoom level (centuries → years → months)
  - Handle unanchored timelines (label as "Years after Reference")
  - Style axis with CSS
  - Update axis on zoom/pan
  - Write tests for axis rendering

### Event Rendering

**P3.4: Render events as points or ranges**
- Description: Draw events on timeline based on their date ranges
- Dependencies: P3.2
- Size: M
- Status: Not Started
- Tasks:
  - Render point events (single date) as circles or markers
  - Render range events (date range) as horizontal bars
  - Use D3 data binding for events
  - Position events vertically (y-axis) based on track/lane assignment (initially single track)
  - Handle event overlap (stagger vertically if needed)
  - Style events with colors (based on tags)
  - Write tests for event rendering logic

**P3.5: Visualize uncertainty**
- Description: Show uncertainty in dates as shaded regions or error bars
- Dependencies: P3.4
- Size: M
- Status: Not Started
- Tasks:
  - For uncertain ranges, render outer bounds as shaded region
  - Render most likely range (if applicable) as solid bar
  - Use transparency/opacity to indicate uncertainty
  - Add error bars for point events with uncertainty
  - Style uncertainty regions distinctly from certain dates
  - Write tests for uncertainty visualization

**P3.6: Render event labels and descriptions**
- Description: Display event names and descriptions on timeline
- Dependencies: P3.4
- Size: S
- Status: Not Started
- Tasks:
  - Render event labels above or beside event markers
  - Truncate long labels and add ellipsis
  - Handle label overlap (hide some labels based on zoom level)
  - Show full label on hover (tooltip)
  - Style labels with CSS
  - Write tests for label rendering

**P3.7: Implement hover tooltips**
- Description: Show event details on hover
- Dependencies: P3.4
- Size: M
- Status: Not Started
- Tasks:
  - Create tooltip component (HTML overlay or SVG)
  - Show event description, date range, tags, source on hover
  - Position tooltip near cursor
  - Handle edge cases (tooltip goes off screen)
  - Style tooltip with CSS
  - Add smooth fade-in/fade-out animations
  - Write tests for tooltip behavior

**P3.8: Visual indicators for anchored vs. unanchored events**
- Description: Distinguish events with absolute dates from relative-only events
- Dependencies: P3.4
- Size: S
- Status: Not Started
- Tasks:
  - Use different colors or shapes for anchored vs. unanchored events
  - Add legend to explain visual distinctions
  - Show indicator if event is part of unanchored subgraph
  - Style indicators with CSS
  - Write tests for visual distinctions

### Interactivity

**P3.9: Implement zoom and pan controls**
- Description: Allow user to zoom and pan timeline with mouse/touch
- Dependencies: P3.2
- Size: M
- Status: Not Started
- Tasks:
  - Use D3 zoom behavior for mouse wheel zoom
  - Implement pan by dragging background
  - Add zoom buttons (+/-) for accessibility
  - Add "reset view" button to return to default zoom
  - Constrain zoom limits (min/max scale)
  - Update axis and events on zoom/pan
  - Write tests for zoom/pan behavior

**P3.10: Implement event click and selection**
- Description: Allow user to click events to see full details
- Dependencies: P3.4, P3.7
- Size: S
- Status: Not Started
- Tasks:
  - Add click handler to events
  - Highlight selected event (change color/border)
  - Show detailed panel with all event information (tags, properties, constraints, etc.)
  - Allow deselecting event (click background or close button)
  - Write tests for click and selection

**P3.11: Add keyboard navigation**
- Description: Support keyboard shortcuts for accessibility
- Dependencies: P3.9, P3.10
- Size: S
- Status: Not Started
- Tasks:
  - Arrow keys to pan timeline
  - +/- keys to zoom
  - Tab to navigate between events
  - Enter to select event
  - Escape to deselect event
  - Document keyboard shortcuts in UI
  - Write tests for keyboard navigation

### Data Loading

**P3.12: Load timeline JSON into visualization**
- Description: Parse solved timeline JSON and render it
- Dependencies: P3.1, P3.4
- Size: M
- Status: Not Started
- Tasks:
  - Create data loader to read JSON from file or API
  - Parse JSON into internal data structures
  - Validate JSON structure (use schema from P1.18)
  - Handle loading errors gracefully
  - Show loading state while data is being fetched
  - Write tests for data loading and parsing

**P3.13: Support drag-and-drop file loading**
- Description: Allow user to drag `.tl` or `.json` files onto page
- Dependencies: P3.12
- Size: S
- Status: Not Started
- Tasks:
  - Add drag-and-drop event handlers
  - Read file content from dropped file
  - Parse `.tl` files (using parser from Phase 1)
  - Parse `.json` files (solved timeline)
  - Show error if file format is invalid
  - Write tests for file loading

### Testing & Documentation

**P3.14: Write comprehensive visualization tests**
- Description: Test all visualization functionality
- Dependencies: P3.4–P3.13
- Size: L
- Status: Not Started
- Tasks:
  - Write unit tests for rendering logic
  - Write integration tests for zoom/pan/click behavior
  - Test with various timeline examples
  - Test edge cases (empty timeline, single event, thousands of events)
  - Test responsive layout on different screen sizes
  - Use visual regression testing if possible (e.g., Percy, Chromatic)
  - Achieve >70% code coverage (visualization has more UI, harder to test)

**P3.15: Document visualization usage**
- Description: Write user guide for visualization
- Dependencies: P3.1–P3.13
- Size: M
- Status: Not Started
- Tasks:
  - Write `docs/visualization.md` with usage guide
  - Document keyboard shortcuts and mouse controls
  - Write guide for loading and viewing timelines
  - Include screenshots of visualization
  - Document customization options (colors, styles)
  - Write troubleshooting guide

**P3.16: Phase 3 integration and polish**
- Description: Final cleanup and release preparation
- Dependencies: All other P3 tasks
- Size: M
- Status: Not Started
- Tasks:
  - Test full pipeline: `.tl` file → parser → solver → visualization
  - Fix any bugs discovered during integration testing
  - Optimize rendering performance (large timelines)
  - Polish UI/UX (spacing, colors, animations)
  - Add loading states and error messages
  - Prepare release notes for Phase 3 completion
  - Tag Phase 3 release in git

---

## Phase 4: Interactive Editing

**Goal:** Enable users to edit timelines interactively through the UI (drag events, add constraints, toggle theories).

**Success Criteria:**
- Drag events to adjust date ranges
- Add new events via UI
- Edit constraints via UI
- Toggle between theories and see timeline update
- Real-time constraint solving as edits are made
- Undo/redo support
- Export edited timeline to `.tl` format

### Interactive Editing

**P4.1: Implement drag-to-adjust event ranges**
- Description: Allow dragging event markers to change dates
- Dependencies: P3.16 (completed Phase 3)
- Size: L
- Status: Not Started
- Tasks:
  - Add drag behavior to event markers
  - Update event date range as user drags
  - Re-run solver on drag end to propagate changes
  - Show preview of changes during drag (before committing)
  - Handle constrained dragging (can't violate hard constraints)
  - Show visual feedback if drag would create conflict
  - Write tests for drag behavior

**P4.2: Add UI for creating new events**
- Description: UI to add events to timeline
- Dependencies: P3.16
- Size: M
- Status: Not Started
- Tasks:
  - Add "New Event" button in toolbar
  - Show form to enter event ID, description, date
  - Validate event ID is unique
  - Add event to timeline data model
  - Re-render timeline with new event
  - Write tests for event creation

**P4.3: Add UI for editing event properties**
- Description: Edit event details (description, tags, source, notes)
- Dependencies: P3.10 (event selection)
- Size: M
- Status: Not Started
- Tasks:
  - Show editable form when event is selected
  - Allow editing description, tags, source, notes
  - Validate input (e.g., tag names)
  - Update timeline data model on save
  - Re-render timeline with changes
  - Write tests for property editing

**P4.4: Add UI for creating and editing constraints**
- Description: UI to add/edit constraints between events
- Dependencies: P4.2, P4.3
- Size: L
- Status: Not Started
- Tasks:
  - Show list of constraints for selected event
  - Add "New Constraint" button
  - Form to create constraint: type (after/before/during), target event, duration, confidence
  - Allow editing existing constraints
  - Allow deleting constraints
  - Validate constraint (no circular dependencies)
  - Re-run solver after constraint changes
  - Show conflicts if constraint is invalid
  - Write tests for constraint editing

**P4.5: Implement theory toggling UI**
- Description: UI to switch between theories and see timeline update
- Dependencies: P2.10 (theory-aware solving)
- Size: M
- Status: Not Started
- Tasks:
  - Show list of available theories in sidebar or toolbar
  - Allow selecting active theory (radio buttons or dropdown)
  - Re-solve timeline when theory changes
  - Update visualization to show new computed ranges
  - Highlight which constraints are active (grayed out if from inactive theory)
  - Allow comparing theories side-by-side (split view or overlay)
  - Write tests for theory toggling

**P4.6: Add multi-track/lane support**
- Description: Organize events into parallel tracks (gantt-style)
- Dependencies: P3.16
- Size: L
- Status: Not Started
- Tasks:
  - Allow assigning events to tracks (e.g., by person, location, theme)
  - Render events in separate horizontal lanes
  - Show track labels on left side
  - Allow collapsing/expanding tracks
  - Allow reordering tracks (drag and drop)
  - Allow creating new tracks
  - Write tests for multi-track rendering

### Undo/Redo and State Management

**P4.7: Implement undo/redo system**
- Description: Support undo/redo for all edits
- Dependencies: P4.1–P4.4
- Size: M
- Status: Not Started
- Tasks:
  - Implement command pattern for all edit operations
  - Maintain undo/redo stacks
  - Add undo/redo buttons in toolbar
  - Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo)
  - Limit undo stack size (e.g., last 50 operations)
  - Write tests for undo/redo

**P4.8: Implement state persistence**
- Description: Save timeline state to browser storage
- Dependencies: P4.7
- Size: S
- Status: Not Started
- Tasks:
  - Save timeline data to localStorage or IndexedDB
  - Auto-save on edits (debounced)
  - Restore timeline on page reload
  - Show notification if state is restored
  - Allow clearing saved state
  - Write tests for persistence

### Export and Sync

**P4.9: Export timeline to .tl format**
- Description: Generate `.tl` file from edited timeline
- Dependencies: P4.3, P4.4
- Size: M
- Status: Not Started
- Tasks:
  - Implement serializer to convert data model back to `.tl` syntax
  - Preserve formatting where possible (comments, blank lines)
  - Generate well-formatted `.tl` file
  - Add "Export" button to download file
  - Write tests for serialization (round-trip: parse → edit → serialize → parse)

**P4.10: Sync changes back to file**
- Description: Watch `.tl` file for external changes and reload
- Dependencies: P4.9
- Size: M
- Status: Not Started
- Tasks:
  - Use File System API (if available) to watch file for changes
  - Reload timeline if file is modified externally
  - Detect merge conflicts (user edited in UI and file changed)
  - Show conflict resolution UI (keep UI changes or reload from file)
  - Write tests for file watching and conflict detection

### Testing & Documentation

**P4.11: Write comprehensive interactive editing tests**
- Description: Test all interactive editing features
- Dependencies: P4.1–P4.10
- Size: L
- Status: Not Started
- Tasks:
  - Test drag-to-adjust events
  - Test creating/editing events and constraints
  - Test theory toggling
  - Test undo/redo
  - Test export/import round-trip
  - Test edge cases (conflicts, validation errors)
  - Write integration tests for full editing workflow
  - Achieve >70% code coverage

**P4.12: Document interactive editing features**
- Description: Write user guide for editing
- Dependencies: P4.1–P4.10
- Size: M
- Status: Not Started
- Tasks:
  - Write `docs/editing.md` with editing guide
  - Document drag-to-adjust, create/edit events, constraints
  - Document theory toggling
  - Document undo/redo and keyboard shortcuts
  - Document export workflow
  - Include video demos or GIFs of key features

**P4.13: Phase 4 integration and polish**
- Description: Final cleanup and release preparation
- Dependencies: All other P4 tasks
- Size: M
- Status: Not Started
- Tasks:
  - Test full editing workflow end-to-end
  - Fix any bugs discovered during testing
  - Polish UI/UX for editing features
  - Optimize performance (real-time solving on edits)
  - Add helpful error messages and validation
  - Prepare release notes for Phase 4 completion
  - Tag Phase 4 release in git

---

## Phase 5: Advanced Features

**Goal:** Add advanced features for power users and researchers (multi-file support, citations, collaboration, exports).

**Success Criteria:**
- Multi-file timelines with imports
- Citation and source management
- Search and filtering
- Export to PDF, PNG, JSON
- Collaboration features (optional)

### Multi-File Support

**P5.1: Support importing other .tl files**
- Description: Allow timeline files to import/reference other files
- Dependencies: P1.16 (parser)
- Size: L
- Status: Not Started
- Tasks:
  - Add `import: path/to/file.tl` syntax to frontmatter
  - Resolve relative file paths
  - Parse imported files recursively
  - Merge events and constraints from imported files
  - Detect circular imports
  - Handle conflicts (duplicate event IDs across files)
  - Write tests for multi-file parsing

**P5.2: Namespace support for imported files**
- Description: Avoid ID collisions by namespacing imported events
- Dependencies: P5.1
- Size: M
- Status: Not Started
- Tasks:
  - Add namespace syntax: `import: timeline.tl as ns`
  - Reference imported events: `after: ns.eventId`
  - Validate namespaces are unique
  - Update solver to handle namespaced references
  - Write tests for namespacing

### Citations and Sources

**P5.3: Build citation manager**
- Description: Centralized management of sources and citations
- Dependencies: P1.10 (parser for sources)
- Size: M
- Status: Not Started
- Tasks:
  - Define citation format (e.g., BibTeX-like or custom)
  - Allow defining citations in frontmatter or separate file
  - Reference citations from events: `source: [1]` or `source: @citation-key`
  - Show full citation in event details
  - Write tests for citation parsing and rendering

**P5.4: Export citations to bibliography**
- Description: Generate bibliography from timeline sources
- Dependencies: P5.3
- Size: S
- Status: Not Started
- Tasks:
  - Collect all citations used in timeline
  - Format as bibliography (e.g., APA, MLA, Chicago)
  - Export as separate file (`.bib`, `.md`, `.txt`)
  - Write tests for bibliography generation

### Search and Filtering

**P5.5: Implement search functionality**
- Description: Search events by description, tags, properties
- Dependencies: P3.16 (visualization)
- Size: M
- Status: Not Started
- Tasks:
  - Add search bar in UI
  - Search event descriptions (case-insensitive, fuzzy match)
  - Search tags and properties
  - Highlight matching events in timeline
  - Show search results in sidebar
  - Write tests for search

**P5.6: Implement filtering by tags and properties**
- Description: Filter timeline to show only certain events
- Dependencies: P5.5
- Size: M
- Status: Not Started
- Tasks:
  - Add filter UI (checkboxes for tags)
  - Allow filtering by tag, group, date range
  - Hide non-matching events in visualization
  - Show active filters in UI
  - Allow saving filter presets
  - Write tests for filtering

### Export Formats

**P5.7: Export timeline as PNG/SVG image**
- Description: Generate static image of timeline
- Dependencies: P3.16
- Size: M
- Status: Not Started
- Tasks:
  - Render timeline to canvas or SVG
  - Export as PNG or SVG file
  - Add "Export Image" button
  - Allow customizing export (resolution, size, colors)
  - Write tests for image export

**P5.8: Export timeline as PDF**
- Description: Generate PDF report with timeline and event details
- Dependencies: P5.7
- Size: L
- Status: Not Started
- Tasks:
  - Use PDF library (e.g., jsPDF, pdfkit)
  - Generate multi-page PDF with:
    - Timeline visualization
    - Event details table
    - Citations/bibliography
  - Allow customizing PDF layout and styling
  - Add "Export PDF" button
  - Write tests for PDF generation

**P5.9: Export timeline to other formats (iCal, CSV, etc.)**
- Description: Support exporting to standard formats
- Dependencies: P2.16 (solved timeline)
- Size: M
- Status: Not Started
- Tasks:
  - Export to iCal format (for calendar apps)
  - Export to CSV (for spreadsheets)
  - Export to Markdown (for static sites)
  - Export to JSON (already supported)
  - Write tests for each export format

### Collaboration (Optional)

**P5.10: Add collaboration features**
- Description: Allow multiple users to work on same timeline
- Dependencies: P4.13 (completed Phase 4)
- Size: L
- Status: Not Started
- Tasks:
  - Research collaboration approach (operational transforms, CRDTs, simple locking)
  - Implement backend service for shared timelines (if needed)
  - Add user authentication (if needed)
  - Show live cursors and edits from other users
  - Handle merge conflicts
  - Write tests for collaboration features
  - **Note:** This is a stretch goal and may be deferred

### Testing & Documentation

**P5.11: Write comprehensive tests for advanced features**
- Description: Test all Phase 5 functionality
- Dependencies: P5.1–P5.10
- Size: L
- Status: Not Started
- Tasks:
  - Test multi-file imports
  - Test citation management
  - Test search and filtering
  - Test all export formats
  - Test edge cases and error handling
  - Achieve >70% code coverage

**P5.12: Document advanced features**
- Description: Write user guides for advanced features
- Dependencies: P5.1–P5.10
- Size: M
- Status: Not Started
- Tasks:
  - Write `docs/advanced.md` with advanced features guide
  - Document multi-file imports and namespaces
  - Document citation management
  - Document search, filtering, exports
  - Document collaboration features (if implemented)
  - Include examples and best practices

**P5.13: Phase 5 integration and polish**
- Description: Final cleanup and release preparation
- Dependencies: All other P5 tasks
- Size: M
- Status: Not Started
- Tasks:
  - Test all features end-to-end
  - Fix any bugs discovered during testing
  - Polish UI/UX for advanced features
  - Optimize performance
  - Prepare final release notes
  - Tag Phase 5 release in git

---

## Future Considerations (Post-Phase 5)

These are ideas for future enhancements, not currently prioritized:

### VS Code Extension
- Syntax highlighting for `.tl` files
- Live preview panel
- Auto-completion for event IDs
- Linting and error checking

### Desktop App
- Package web app as Electron or Tauri app
- Better file system integration
- Offline support

### Mobile App
- Touch-optimized timeline viewer
- Read-only or limited editing on mobile

### API and Plugins
- REST API for timeline data
- Plugin system for custom visualizations
- Integration with other tools (Zotero, Obsidian, etc.)

### Performance Optimizations
- Lazy loading for large timelines
- Virtual scrolling for event lists
- WebAssembly for constraint solving (if performance is critical)

### Accessibility
- Screen reader support
- High-contrast themes
- Keyboard-only navigation
- ARIA labels and roles

---

## Summary of Phases

| Phase | Focus | Key Deliverables | Estimated Duration |
|-------|-------|------------------|-------------------|
| **Phase 0** | Requirements & Design | PRODUCT_PLAN.md, syntax design, tech stack | ✅ Complete |
| **Phase 1** | CLI Parser + Data Model | `.tl` parser, JSON output, CLI tool, tests | 4-6 weeks |
| **Phase 2** | Constraint Solver | Interval arithmetic, graph solver, theory support | 4-6 weeks |
| **Phase 3** | Basic Visualization | Web timeline viewer, zoom/pan, uncertainty viz | 3-4 weeks |
| **Phase 4** | Interactive Editing | Drag-to-edit, constraint editing, theory toggle | 3-4 weeks |
| **Phase 5** | Advanced Features | Multi-file, citations, search, exports | 4-6 weeks |

**Total Estimated Duration:** 18-26 weeks (4-6 months)

---

## Using This Backlog

1. **Start with Phase 1**: Complete all P1 tasks in order (respecting dependencies)
2. **Update task status**: Mark tasks as "In Progress" when starting, "Completed" when done
3. **Add notes**: If you encounter issues or make changes, add notes to tasks
4. **Review regularly**: Revisit this backlog weekly to track progress and adjust priorities
5. **Celebrate milestones**: When a phase is complete, update CHANGES.md and tag a release

**Questions or blockers?** Refer to PRODUCT_PLAN.md or ask for clarification before proceeding.
