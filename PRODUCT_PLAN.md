# Timeline Builder — Product Plan

## Vision

A timeline tool designed for research and discovery where only limited or imprecise data is available. Supports plain-text data entry (Markwhen-inspired) with constraint-based reasoning to manage uncertainties and relationships between events.

## Core Problem

When researching historical events, genealogy, or biblical chronology, you often encounter:
- Dates with varying precision (year, month, day, decade)
- Uncertain dates ("circa 1920", "before 1925", "after Event X")
- Relative timing ("3 years after Y", "during Period Z")
- Need to capture these quickly while reading sources
- Need to visualize and reason about the constraints

## Key Use Case

**Reading & Capture Flow:**
1. User is reading a document (historical text, Bible passage, research paper)
2. Encounters a time reference (absolute date or relative relationship)
3. Quickly captures it in plain text with minimal syntax
4. Tool parses, validates constraints, and updates the timeline
5. User can visualize the timeline with all uncertainties represented
6. User can refine constraints as more information is discovered

---

## Core Concepts

### 1. Time Ranges
- Events can be points (single date) or ranges (start/end)
- Precision levels: **year, month, day** (initially)
  - Potentially: hour/minute (for modern events), decade, century (for ancient history)
  - **Question:** Should we support time-of-day, or just dates? (TBD based on use cases)
- Uncertainty types:
  - Circa/approximate: `~1920`
  - Range: `1918-1922`
  - Before/after: `<1925`, `>1920`
  - Relative: `[after Event X]`, `[3 years after Event Y]`

### 2. Events & Entities
- Events: things that happened at a point or over a period
- Each event has:
  - Unique ID (auto-generated or user-specified)
  - Label/description
  - Time constraint(s)
  - Optional: tags, sources/citations, notes
  - Optional: relationships to other events
  - Optional: group membership (for organizing related events)
  - Optional: theory/scenario tags (for alternative interpretations)

**Event states:**
- **Anchored:** connected (directly or transitively) to an absolute date
- **Unanchored:** only defined relative to other events, no absolute date
- **Unconstrained:** not yet linked to any other event (floating)

### 3. Constraints
Constraints form a graph that can be solved/validated. Multiple types:

**Absolute constraints:**
- "Event A happened in 1920"
- "Event B was between 1918-1922"

**Relative constraints (Gantt-style):**
- **After:** "Event B happened after Event A" (B.start > A.end)
- **Before:** "Event C happened before Event D" (C.end < D.start)
- **During:** "Event E happened during Period F" (F.start < E.start AND E.end < F.end)
- **Start-to-start:** "Event G started X years after Event H started" (G.start = H.start + X)
- **End-to-end:** "Event I ended X years after Event J ended" (I.end = J.end + X)
- **Start-to-end:** "Event K ended X years after Event L started" (K.end = L.start + X)

**Duration constraints:**
- "Event M lasted 3 years" (M.end - M.start = 3)
- "Event N lasted 2-4 years" (M.end - M.start ∈ [2, 4])

**Each constraint can have uncertainty/confidence:**
- Hard constraint: must be satisfied (e.g., explicit biblical statement)
- Soft constraint: preferred but can be violated (e.g., scholarly inference)
- Confidence levels: high/medium/low (for visualization/conflict resolution)

### 4. Plain-Text Syntax (Markwhen-inspired)
- Human-readable, version-controllable
- Quick capture with minimal ceremony
- Example syntax (TBD — see open questions):
  ```
  1920: Event A happened
  ~1922: Event B (circa)
  1918-1922: Period C
  [after Event A]: Event D
  [3 years after Event A]: Event E
  ```

---

## Open Questions

### A. Constraint Solving Strategy
**Question:** Should the tool automatically compute "tightest possible ranges" for uncertain events based on all constraints?

**Example:** If Event X is marked as "after 1920" AND "before 1925", should it automatically display as "1921-1924"?

**Options:**
1. Automatic constraint propagation — compute tightest bounds
2. Manual refinement — just validate consistency, let user narrow ranges
3. Hybrid — compute but allow user override

**Decision:** *Automatic constraint propagation (Option 1)* — The tool should compute tightest bounds based on all known constraints. This is essential for the research workflow where you're gradually refining knowledge.

**Key principle:** **Relative constraints are primary; absolute dates are optional anchors.**

Events should be definable purely by their relationships to other events:
- "Event B happened 3 years after Event A"
- "Event C happened sometime between 13-15 years after Event D"

**Implications:**
1. Events can exist without absolute dates — they're positioned relative to each other
2. When an event is "anchored" to an absolute date, propagate that through all relationships
3. Unanchored timelines are valid — visualization can use a named reference point (e.g., "Jacob's birth") as the origin
4. Timeline labels can show relative time ("10 years after Jacob's birth") when no absolute anchor exists

**Uncertainty in relationships:**
- Relationships themselves can have uncertain durations (e.g., "between 13-15 years after X")
- This compounds with date ranges in the primitives themselves
- The solver must handle interval arithmetic and propagate ranges through the constraint graph

### B. Visualization Priorities
**Questions:**
- Start with horizontal linear timeline?
- Support concurrent tracks/lanes (gantt-style) for different storylines/people?
- How important is zooming (centuries → years → days)?
- Should uncertain ranges be visualized differently (e.g., shaded regions)?
- Interactive editing via visualization (drag to adjust, connect events)?

**Decisions:**

**Must-have (Phase 3):**
- Horizontal linear timeline with zoom/pan
- Uncertain ranges shown as shaded regions or error bars
- Explorable: hover for details, click to see constraints
- Visual distinction for anchored vs. unanchored events
- Show unconstrained events in separate area or with indicators

**Should-have (Phase 4):**
- Interactive editing: drag to adjust ranges, click to add relationships
- Concurrent tracks/lanes for organizing events (by person, location, theme)
- Toggle visibility of event groups
- **Theory/scenario switching:** UI to toggle between alternative constraint sets
  - Example: "Theory A: Exodus in 1446 BC" vs. "Theory B: Exodus in 1270 BC"
  - Each theory is a named set of constraints that can be activated/deactivated
  - Visualization updates to show how timeline changes under each theory

**Nice-to-have (Phase 5):**
- Multiple visualization modes (timeline, graph view, table view)
- Export visualization as image/PDF
- Collaborative cursors for shared editing

### C. Plain Text Format Design
**Questions:**
- Design our own syntax or start Markwhen-compatible?
- Inline sources/citations? Format: `1920: Event [Source: Bible X:Y]` or similar?
- How to express relative constraints clearly?
- How to handle multi-line event descriptions?
- File format: single `.md` file, or multiple files with imports?

**Decision:** **Custom syntax, Markwhen-inspired** — Take the good parts (clean, minimal, markdown-like) but extend for our needs (uncertain relationships, constraint types, confidence levels).

## Draft Syntax

### Basic Event Syntax
```
EventID: Event description
```

### Absolute Dates
```
exodus: The Exodus from Egypt
  date: 1446 BC

josephBorn: Joseph is born
  date: ~1915 BC        # circa/approximate

floodPeriod: The great flood
  date: 2400-2300 BC    # date range
```

### Relative Constraints
```
# Basic offset (implicit start-to-start)
arrival: Jacob arrives in Haran
  after: jacobBorn + 20 years

# With uncertainty in the offset
departure: Jacob departs Haran
  after: arrival + 13-15 years    # range: between 13 and 15 years after

# Approximate offset
josephBorn: Joseph is born
  before: departure - ~1 year     # approximately 1 year before
```

### Constraint Types (Gantt-style)
```
# Default "after": start-to-end (most intuitive)
eventB: Event B
  after: eventA + 5 years           # B starts 5 years after A ends

# Default "before": end-to-start (most intuitive)
eventC: Event C
  before: eventD - 3 years          # C ends 3 years before D starts

# Start-to-start (explicit)
eventE: Event E
  start-after: eventA + 5 years     # E starts 5 years after A starts
  # OR
  after: eventA.start + 5 years     # explicit anchor point

# End-to-end (explicit)
eventF: Event F
  end-before: eventD - 3 years      # F ends 3 years before D ends
  # OR
  before: eventD.end - 3 years      # explicit anchor point

# End-to-end with "after"
eventG: Event G
  end-after: eventA + 10 years      # G ends 10 years after A ends

# During
ministry: Jesus' ministry
  during: romanEmpire               # ministry happened during the Roman Empire period
```

**Constraint defaults:**
- `after: X` → my start is after X's **end** (start-to-end)
- `before: X` → my end is before X's **start** (end-to-start)

**Special keywords for other cases:**
- `start-after: X` → my start is after X's start (start-to-start)
- `end-after: X` → my end is after X's end (end-to-end)
- `start-before: X` → my start is before X's start (start-to-start)
- `end-before: X` → my end is before X's end (end-to-end)

**Explicit anchor points (alternative syntax):**
- `after: X.start` → measure from X's start
- `after: X.end` → measure from X's end (redundant with default)
- `before: X.start` → measure from X's start (redundant with default)
- `before: X.end` → measure from X's end

### Duration Constraints
```
exile: Babylonian exile
  duration: 70 years

solomon: Solomon's reign
  duration: 40 years
  after: davidDeath [end]

uncertainty: Some uncertain period
  duration: 5-10 years              # lasted between 5 and 10 years
```

### Confidence Levels
```
exodus: The Exodus
  date: 1446 BC [high]              # high confidence

alternateTheory: Alternative dating
  date: 1270 BC [low]               # low confidence / soft constraint
```

### Sources/Citations
```
josephBorn: Joseph is born
  after: jacobArrival + 13 years
  source: Genesis 30:22-24
  note: Calculated based on Jacob's service to Laban
```

### Groups and Theories
```
#group Jacob's Life
jacobBorn: Jacob is born [reference]
arrival: Jacob arrives in Haran
  after: jacobBorn + 20 years
departure: Jacob departs Haran
  after: arrival + 14 years
#endgroup

#theory Early Exodus
exodus: The Exodus
  date: 1446 BC
#endtheory

#theory Late Exodus
exodus: The Exodus
  date: 1270 BC
#endtheory
```

### File Metadata (YAML frontmatter)
```
---
title: Timeline of Jacob's Life
reference: jacobBorn
description: Exploring the chronology of Jacob from Genesis
---

jacobBorn: Jacob is born [reference]
...
```

### Multi-line Descriptions
```
exodus: The Exodus from Egypt
  date: 1446 BC
  description: |
    The Israelites leave Egypt under Moses' leadership.
    Marked by the ten plagues and crossing of the Red Sea.
  source: Exodus 12-14
```

**Open questions on syntax:**
- Should we use indentation (YAML-style) or some other delimiter?
- How to handle event IDs — enforce camelCase, allow spaces with quotes?
- Should ranges use `-` or `..` or `to`? (e.g., `13-15` vs `13..15` vs `13 to 15`)
- Default units (years assumed, or require explicit `years`/`months`/`days`)?

### D. Tech Stack
**Questions:**
- Web app (easier visualization) or desktop/CLI first?
- Language/framework preferences?
  - Web: JS/TypeScript + React/Svelte/Vue?
  - Desktop: Electron, Tauri, native?
  - Backend/CLI: Python, Rust, Node?
- Constraint solver: build our own or use existing library?

**Decision:** **Web-first with progressive enhancement**

**Rationale:**
- Best visualization libraries (D3.js, vis-timeline, etc.)
- Easier iteration on UI/UX
- Can embed in VS Code extension (webviews)
- Can package as desktop app later (Electron/Tauri) if needed
- Browser dev tools for debugging

**Architecture: Progressive approach**

1. **Phase 1: CLI parser + web viewer**
   - TypeScript/Node CLI tool that parses `.tl` files → JSON
   - Separate web app that visualizes the JSON
   - User workflow: edit plain text → run parser → open in browser

2. **Phase 2: Integrated web app**
   - Parser runs client-side (browser)
   - Live editing with instant preview
   - Local file access via File System API

3. **Phase 3: VS Code extension** (optional future)
   - Syntax highlighting for `.tl` files
   - Live preview panel
   - Reuses parser and visualization code

**Core Technologies:**

**Parser/Data Model:**
- TypeScript (runs in both Node and browser)
- Parser: Start with hand-written recursive descent (simple, flexible)
  - Alternative: PEG.js or Chevrotain if grammar gets complex
- Data structures: Plain objects/classes for events, constraints

**Visualization:**
- Framework: React or Svelte (Svelte for lighter bundle)
- Timeline rendering: D3.js for custom timeline
  - Alternative: vis-timeline library as starting point (gantt-like features)
- Styling: CSS modules or Tailwind

**Constraint Solver:**
- Custom interval arithmetic library (likely need to build this)
- Graph algorithms for constraint propagation
- Research: Look for existing constraint satisfaction libraries in JS/TS (likely won't find perfect match)

**Build/Dev:**
- Vite for fast dev and bundling
- TypeScript throughout
- Jest or Vitest for testing

### E. Data Model & Storage
**Questions:**
- How is parsed data stored internally? (JSON, SQLite, graph database?)
- Should the plain-text file be the source of truth, or should there be a separate database?
- How to handle IDs for events (auto-generated vs. user-specified)?
- Versioning/history support?

**Decision:** **Plain text as source of truth, with structured in-memory representation**

**Rationale:**
- Plain text is version-controllable (git-friendly)
- Human-readable and editable
- No database sync issues
- Portable across tools

**Architecture:**
- **Source of truth:** `.tl` plain text files
- **In-memory:** Structured objects/classes (Event, Constraint, Timeline)
- **Separation of concerns:** Parser module is independent of visualization
  - Parser: `.tl` file → structured data model (AST/objects)
  - Solver: structured data → computed ranges/constraint graph
  - Visualizer: structured data + solved constraints → rendered timeline
  - Benefits: unit testable parser, reusable in other tools (CLI, VS Code extension, etc.)

**Data flow:**
```
.tl file → Parser → Data Model → Constraint Solver → Visualization
                         ↓
                    Unit tests
```

**Event IDs:**
- User-specified in text (e.g., `jacobBorn:`)
- Must be unique within a file
- Format: camelCase recommended, validated by parser

**Versioning:**
- Use git for version control of `.tl` files
- No separate history mechanism needed initially

---

## Architecture Guidelines

This section provides actionable guidance for implementing the timeline-builder system. These guidelines ensure consistency, maintainability, and alignment with the project's core principles.

### 1. Module Structure

The system is organized into three independent, loosely-coupled modules:

**Parser Module**
- **Responsibility:** Convert `.tl` plain text files into structured data (AST/objects)
- **Input:** Raw text string from `.tl` file
- **Output:** `Timeline` object containing events, constraints, groups, theories, and metadata
- **Key interfaces:**
  - `parse(text: string): Timeline` — Main entry point
  - `parseEvent(tokens: Token[]): Event` — Parse individual event
  - `parseConstraint(tokens: Token[]): Constraint` — Parse constraint syntax
  - `parseMetadata(yamlText: string): Metadata` — Parse YAML frontmatter
- **Error handling:** Throw `ParseError` with line/column information
- **Independence:** Parser has zero dependencies on solver or visualizer
- **Testing:** Unit testable with example `.tl` strings

**Solver Module**
- **Responsibility:** Compute tightest possible date ranges for all events based on constraints
- **Input:** `Timeline` object from parser (unsolved)
- **Output:** `SolvedTimeline` object with computed `TimeRange` for each event
- **Key interfaces:**
  - `solve(timeline: Timeline, options: SolveOptions): SolvedTimeline` — Main entry point
  - `propagateConstraints(graph: ConstraintGraph): void` — Core algorithm
  - `detectConflicts(graph: ConstraintGraph): Conflict[]` — Find impossible constraints
  - `computeBounds(event: Event): TimeRange` — Compute bounds for single event
- **Error handling:** Return conflicts in `SolvedTimeline.conflicts` array (non-throwing)
- **Independence:** Solver has zero dependencies on parser or visualizer
- **Testing:** Unit testable with programmatically-created `Timeline` objects

**Visualizer Module**
- **Responsibility:** Render timeline to interactive web UI
- **Input:** `SolvedTimeline` object from solver
- **Output:** Interactive D3.js/SVG visualization
- **Key interfaces:**
  - `renderTimeline(timeline: SolvedTimeline, container: HTMLElement): Visualization` — Main entry point
  - `updateVisualization(viz: Visualization, timeline: SolvedTimeline): void` — Update existing viz
  - `exportImage(viz: Visualization): Promise<Blob>` — Export as PNG/SVG
- **Error handling:** Display user-friendly error messages in UI
- **Independence:** Visualizer has zero dependencies on parser or solver internals
- **Testing:** Integration tests with example timelines; visual regression tests

**Communication Between Modules**
- Modules communicate exclusively through well-defined data structures (`Timeline`, `SolvedTimeline`)
- No tight coupling: parser doesn't call solver, solver doesn't call visualizer
- Data flow is unidirectional: Parser → Solver → Visualizer
- Each module can be used independently (e.g., parser in CLI tool, solver in backend, visualizer in web app)

### 2. Data Model Details

Core data structures representing timelines, events, and constraints:

**Event Class/Interface**
```typescript
interface Event {
  id: string;                    // Unique identifier (e.g., "jacobBorn")
  description: string;           // Human-readable description
  constraints: Constraint[];     // All constraints on this event
  duration?: DurationConstraint; // Optional duration constraint
  tags: string[];                // Tags for categorization (e.g., "#family")
  properties: Record<string, any>; // Arbitrary properties (source, note, etc.)
  group?: string;                // Optional group membership
  theoryId?: string;             // Optional theory association
}
```

**Constraint Class/Interface**
```typescript
type ConstraintType =
  | 'after'        // Start after target's end (default)
  | 'before'       // End before target's start (default)
  | 'start-after'  // Start after target's start
  | 'end-after'    // End after target's end
  | 'start-before' // Start before target's start
  | 'end-before'   // End before target's end
  | 'during';      // Contained within target

interface Constraint {
  type: ConstraintType;
  targetEventId: string;         // Event ID being referenced
  duration?: Duration;           // Optional offset (e.g., "+ 3 years")
  confidence: ConfidenceLevel;   // high, medium, low
  anchorPoint?: 'start' | 'end'; // Explicit anchor (e.g., "X.start")
  theoryId?: string;             // Theory this constraint belongs to
}
```

**Duration Class/Interface**
```typescript
interface Duration {
  value: number | [number, number]; // Single value or range [min, max]
  unit: 'years' | 'months' | 'days';
  approximate: boolean;             // True for "~3 years"
}
```

**TimeRange Class/Interface**
```typescript
interface TimeRange {
  min: TimePoint;  // Earliest possible date
  max: TimePoint;  // Latest possible date
  precision: 'year' | 'month' | 'day'; // Precision level
  anchored: boolean; // True if connected to absolute date
}
```

**TimePoint Class/Interface**
```typescript
interface TimePoint {
  year: number;
  month?: number;  // 1-12 (optional)
  day?: number;    // 1-31 (optional)
  era?: 'BC' | 'AD'; // Optional for historical dates
}
```

**Timeline Class/Interface**
```typescript
interface Timeline {
  metadata: Metadata;        // Frontmatter (title, reference, etc.)
  events: Map<string, Event>; // Event ID → Event object
  groups: Group[];           // Event groups
  theories: Theory[];        // Alternative constraint sets
}
```

**Theory Class/Interface**
```typescript
interface Theory {
  id: string;           // Unique identifier
  name: string;         // Human-readable name
  eventIds: Set<string>; // Events specific to this theory
  description?: string; // Optional description
}
```

**SolvedTimeline Class/Interface**
```typescript
interface SolvedTimeline {
  timeline: Timeline;    // Original timeline
  ranges: Map<string, TimeRange>; // Event ID → computed range
  conflicts: Conflict[]; // Detected conflicts
  metadata: SolveMetadata; // Solver metadata (iterations, convergence)
}
```

### 3. Key Algorithms

**Interval Arithmetic**

Purpose: Add/subtract durations to/from time ranges, propagating uncertainty.

Key operations:
- `add(range: TimeRange, duration: Duration): TimeRange`
  - If duration is certain: `[min, max] + d = [min + d, max + d]`
  - If duration is range: `[min, max] + [d1, d2] = [min + d1, max + d2]`
  - If approximate (~d): expand range by ±tolerance (e.g., ±10%)

- `subtract(range: TimeRange, duration: Duration): TimeRange`
  - Similar to add, but subtracts duration

- `intersect(range1: TimeRange, range2: TimeRange): TimeRange | null`
  - Returns overlap if ranges intersect, null if disjoint
  - `[a, b] ∩ [c, d] = [max(a, c), min(b, d)]` (if max ≤ min)

- `compare(range1: TimeRange, range2: TimeRange): 'before' | 'after' | 'overlaps' | 'unknown'`
  - Determines relationship between ranges

**Constraint Propagation**

Purpose: Compute tightest possible bounds for all events based on constraints.

Algorithm (simplified):
1. Build constraint graph (events as nodes, constraints as directed edges)
2. Identify anchored events (those with absolute dates)
3. Run topological sort to determine processing order
4. Forward pass: propagate from anchors to dependents
   - For each event in topological order:
     - Compute bounds based on predecessor constraints
     - Apply interval arithmetic to propagate ranges
5. Backward pass: refine bounds from successors to predecessors
6. Repeat steps 4-5 until convergence (fixed-point iteration)
7. Return computed bounds for all events

Example:
```
Event A: 1920 (anchored)
Event B: after A + 3 years
  → B.min = A.max + 3 = 1920 + 3 = 1923
  → B.max = ∞ (no upper bound yet)

Event C: before B - 1 year
  → C.max = B.min - 1 = 1923 - 1 = 1922
  (backward propagation refines B.max)
```

**Conflict Detection**

Purpose: Identify constraints that cannot be simultaneously satisfied.

Algorithm:
1. After propagation, check if any event has `min > max` (impossible range)
2. Trace back through constraint graph to identify conflicting constraints
3. Report full constraint chain: "A after 1920" → "B after A + 10 years" → "B before 1925" (conflict!)
4. Use confidence levels to suggest which constraint might be wrong
5. Return conflicts as structured data (don't throw errors)

**Topological Sorting**

Purpose: Determine order for processing events during constraint propagation.

Algorithm: Standard topological sort (Kahn's algorithm or DFS-based)
- Handle cycles: detect and report as conflicts
- For unanchored graphs: choose reference event as root
- Return processing order or null if cycles detected

### 4. Error Handling

**Parser Errors (Syntax & Semantic)**

Syntax errors:
- Missing colon after event ID: `eventId Event description` → `ParseError: Expected ':' after event ID`
- Invalid date format: `date: 20-01-1920` → `ParseError: Invalid date format (expected YYYY, YYYY-MM, or YYYY-MM-DD)`
- Unclosed group: `#group MyGroup` with no `#endgroup` → `ParseError: Unclosed group 'MyGroup'`

Semantic errors:
- Undefined event reference: `after: nonexistentEvent` → `ParseError: Undefined event 'nonexistentEvent'`
- Duplicate event IDs: `jacobBorn:` appears twice → `ParseError: Duplicate event ID 'jacobBorn'`
- Invalid confidence level: `[invalid]` → `ParseError: Invalid confidence level (expected high, medium, or low)`

Error format:
```typescript
class ParseError extends Error {
  line: number;
  column: number;
  suggestion?: string; // Optional suggestion ("Did you mean 'jacobBorn'?")
}
```

All parser errors should include:
- Line and column number
- Context (show the problematic line)
- Helpful message (what went wrong and how to fix it)

**Solver Errors (Conflicts & Cycles)**

Conflicts:
- Impossible date ranges: Event has `min > max` after propagation
- Circular dependencies: Event A depends on B, B depends on A
- Theory conflicts: Constraints within a theory are inconsistent

Error format:
```typescript
interface Conflict {
  type: 'impossible-range' | 'circular-dependency' | 'theory-conflict';
  eventIds: string[];       // Events involved in conflict
  constraints: Constraint[]; // Conflicting constraints
  message: string;          // Human-readable explanation
  suggestion?: string;      // Optional suggestion for resolution
}
```

Solver returns conflicts in `SolvedTimeline.conflicts` array (does not throw exceptions).
User-facing tools should display conflicts clearly and allow users to resolve them.

**User-Facing vs. Developer-Facing Errors**

User-facing (shown in UI/CLI):
- Clear, jargon-free language
- Context and suggestions
- Example: "The date range for 'josephBorn' is impossible (starts after it ends). Check the constraints on this event."

Developer-facing (shown in tests/logs):
- Technical details, stack traces
- Full error context for debugging
- Example: `ParseError: Unexpected token 'years' at line 15, column 23. Expected 'year', 'month', or 'day'.`

### 5. Testing Strategy

**Parser Testing**

Unit tests for each syntax feature:
- Test basic event parsing: `eventId: description`
- Test absolute dates: `date: 1920`, `date: ~1920`, `date: 1918-1922`
- Test relative constraints: `after: X + 3 years`, `before: Y - 2 months`
- Test duration constraints: `duration: 5 years`, `duration: 5-10 years`
- Test groups: `#group ... #endgroup`, nested groups
- Test theories: `#theory ... #endtheory`
- Test frontmatter: YAML parsing
- Test error cases: invalid syntax, undefined references, duplicate IDs

Property-based tests (optional but recommended):
- Generate random valid `.tl` files and ensure parser doesn't crash
- Round-trip test: parse → serialize → parse should yield same result

Coverage expectations: >80%

**Solver Testing**

Unit tests for interval arithmetic:
- Test add/subtract with certain durations: `[1920, 1925] + 3 years = [1923, 1928]`
- Test add/subtract with uncertain durations: `[1920, 1925] + [3, 5] years = [1923, 1930]`
- Test intersect: `[1920, 1925] ∩ [1923, 1928] = [1923, 1925]`
- Test comparison: `isBefore([1920, 1922], [1925, 1928]) = true`

Property-based tests for constraint propagation:
- Transitivity: If A before B and B before C, then A before C
- Monotonicity: Adding constraints should never expand ranges (only narrow them)
- Consistency: Solving twice should yield same result (deterministic)
- No false conflicts: If constraints are satisfiable, solver should find solution

Integration tests with example timelines:
- Test with biblical chronology examples (from PRODUCT_PLAN.md)
- Test with anchored and unanchored timelines
- Test with multiple theories
- Test conflict detection and reporting

Coverage expectations: >80%

**Visualization Testing**

Unit tests for rendering logic:
- Test scale functions: time → pixels mapping
- Test event positioning: ranges render at correct x-coordinates
- Test uncertainty rendering: shaded regions for uncertain ranges

Integration tests:
- Load example timelines and verify rendering (no crashes)
- Test zoom/pan interactions
- Test hover tooltips and event selection
- Test responsive layout (different screen sizes)

Visual regression tests (recommended):
- Use tool like Percy or Chromatic
- Capture screenshots of example timelines
- Detect unintended visual changes

Coverage expectations: >70% (UI code is harder to test, acceptable lower threshold)

**End-to-End Testing**

Full pipeline tests:
- `.tl` file → parser → solver → visualization
- Test with all example files in `examples/` directory
- Test error handling: malformed files, conflicts, missing data
- Test theory toggling: activate different theories and verify output changes

Performance tests:
- Large timelines (1000+ events)
- Complex constraint graphs (deep dependencies)
- Ensure solver completes in reasonable time (<1s for typical timelines)

### 6. Code Organization

Recommended directory structure:

```
timeline-builder/
├── src/
│   ├── parser/
│   │   ├── lexer.ts          # Tokenization
│   │   ├── parser.ts         # Recursive descent parser
│   │   ├── ast.ts            # AST node definitions
│   │   └── errors.ts         # ParseError class
│   │
│   ├── solver/
│   │   ├── solver.ts         # Main solver API
│   │   ├── interval.ts       # Interval arithmetic
│   │   ├── graph.ts          # Constraint graph
│   │   ├── propagate.ts      # Propagation algorithm
│   │   ├── conflicts.ts      # Conflict detection
│   │   └── topological.ts    # Topological sort utilities
│   │
│   ├── visualizer/
│   │   ├── timeline.tsx      # Main timeline component
│   │   ├── scales.ts         # D3 scale utilities
│   │   ├── events.tsx        # Event rendering
│   │   ├── axis.tsx          # Axis rendering
│   │   ├── tooltip.tsx       # Tooltip component
│   │   └── styles.css        # Visualization styles
│   │
│   ├── types/
│   │   ├── timeline.ts       # Timeline, Event, Constraint types
│   │   ├── time.ts           # TimeRange, TimePoint types
│   │   ├── solver.ts         # SolvedTimeline, Conflict types
│   │   └── index.ts          # Re-export all types
│   │
│   ├── utils/
│   │   ├── time.ts           # Time utility functions
│   │   ├── validation.ts     # Validation helpers
│   │   └── formatting.ts     # Display formatting
│   │
│   └── cli/
│       ├── index.ts          # CLI entry point
│       ├── commands.ts       # CLI commands (parse, solve, export)
│       └── output.ts         # JSON output formatting
│
├── tests/
│   ├── parser/               # Parser unit tests
│   ├── solver/               # Solver unit tests
│   ├── visualizer/           # Visualizer tests
│   ├── integration/          # End-to-end tests
│   └── fixtures/             # Test data (.tl files, JSON)
│
├── examples/                 # Example .tl files
│   ├── basic.tl
│   ├── jacob.tl
│   ├── uncertain.tl
│   └── theories.tl
│
├── docs/                     # Documentation
│   ├── syntax.md
│   ├── solver.md
│   ├── visualization.md
│   └── api.md
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

Key principles:
- **Separation by module:** parser/, solver/, visualizer/ are independent
- **Shared types:** types/ contains all shared interfaces (no circular dependencies)
- **Utilities:** utils/ contains pure functions (no side effects)
- **Tests mirror source:** tests/ structure matches src/
- **Examples as documentation:** examples/ provides real-world usage

---

## Roadmap (Tentative)

### Phase 0: Requirements & Design
- [ ] Finalize answers to open questions A-E
- [ ] Design plain-text syntax (with examples)
- [ ] Sketch data model (events, constraints, relationships)
- [ ] Choose tech stack

### Phase 1: Minimal Parser & Model
- [ ] Implement plain-text parser for basic syntax
- [ ] Build internal data model (events + time ranges)
- [ ] Basic constraint validation (detect conflicts)
- [ ] CLI tool to parse and output JSON

### Phase 2: Constraint Solver
- [ ] Implement constraint propagation (compute tightest ranges)
- [ ] Handle relative constraints (before/after/during)
- [ ] Duration arithmetic (X years after Y)
- [ ] Cycle detection and error reporting

### Phase 3: Basic Visualization
- [ ] Horizontal timeline view
- [ ] Render events as points or ranges
- [ ] Display uncertainty (shading, error bars, etc.)
- [ ] Zooming and panning

### Phase 4: Interactive Editing
- [ ] Edit events via UI (drag, resize ranges)
- [ ] Add new events and constraints interactively
- [ ] Sync changes back to plain text (or keep separate model)

### Phase 5: Advanced Features
- [ ] Multiple tracks/lanes (gantt-style)
- [ ] Tags, filtering, search
- [ ] Source/citation management
- [ ] Export (PDF, PNG, JSON, etc.)
- [ ] Collaboration/sharing

---

## Example: Jacob's Timeline

**Motivating scenario:** Researching the life of Jacob from biblical text.

**Starting point:** No absolute dates, only relationships
- Define "Jacob's birth" as the implicit reference point (Year 0 in this timeline)
- File metadata could specify: `reference: Jacob's birth`

**Gradual knowledge capture:**
```
Jacob's birth [reference point]
Jacob arrives in Haran: [20 years after Jacob's birth]
Jacob departs Haran: [13-15 years after arrival in Haran]
  // Note: uncertain duration — we know it's between 13-15 years
Joseph is born: [~1 year before departure from Haran]
  // Note: approximately, not exact
```

**As research continues:**
- Add more events and relationships
- Refine uncertainty (e.g., narrow "13-15 years" to "14 years" if new source found)
- Optionally add absolute anchor later: "Jacob's birth: ~1900 BC"
  - This would propagate through all events, showing absolute dates

**Visualization implications:**
- Timeline x-axis labeled as "Years after Jacob's birth" (when unanchored)
- Events show as ranges when uncertainty exists
- Range widths grow as uncertainties compound through relationships

---

## Notes & Ideas

- Consider integration with citation managers (Zotero, etc.)
- **Scenarios/theories:** Support multiple competing interpretations
  - Each theory is a named set of constraints (some shared, some theory-specific)
  - User can toggle between theories to see how timeline changes
  - Example: different scholarly datings of biblical events
- **Confidence levels** for constraints (high/medium/low certainty) — already decided to include
- Accessibility: ensure keyboard navigation, screen reader support
- Timeline reference points: allow user to declare a named event as "Year 0" for display purposes
- Support for file-level metadata (research topic, reference point, default precision)
- **Grouping:** Events can belong to groups (e.g., "Jacob's life", "Egyptian dynasties")
  - Groups can be shown/hidden in visualization
  - Groups can have their own color coding or visual styling
- **Unconstrained events:** Events not yet linked to anything should be visible but visually distinct
  - Could show in a separate "parking lot" area
  - Or show with a special indicator on the main timeline

---

## Next Steps

1. Answer open questions A-E
2. Create example timeline scenarios (biblical chronology, historical research, genealogy)
3. Draft plain-text syntax with comprehensive examples
4. Prototype parser and data model
