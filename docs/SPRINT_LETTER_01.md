# Sprint 1: Project Foundation

**Sprint Date:** 2026-02-28
**Sprint Goal:** Initialize the timeline-builder project with TypeScript infrastructure, core data model, and lexer foundation.

## Table of Contents
- [Features Completed](#features-completed)
- [Details](#details)
- [Technical Decisions](#technical-decisions)
- [Test Results](#test-results)
- [Next Steps](#next-steps)

---

## Features Completed

- TypeScript project setup with build tooling
- Testing framework with comprehensive test suite
- Core data model type definitions
- Lexer/tokenizer for .tl files
- Example timeline files

---

## Details

### 1. TypeScript Project Infrastructure (P1.1)

Successfully initialized a TypeScript project with modern tooling and strict configuration.

**What was implemented:**
- Package configuration with all necessary dependencies (TypeScript, Vite, Vitest, ESLint, Prettier)
- TypeScript configured in strict mode for maximum type safety
- Vite build system for both CLI and library builds
- ESLint and Prettier for code quality and formatting
- Proper `.gitignore` for TypeScript/Node projects
- Directory structure following the architecture guidelines:
  ```
  src/
    ├── parser/     # Lexer and parser components
    ├── solver/     # Constraint solving (future)
    ├── visualizer/ # Timeline rendering (future)
    ├── types/      # Shared type definitions
    ├── utils/      # Utility functions (future)
    └── cli/        # Command-line interface
  tests/
    ├── parser/     # Parser tests
    ├── types/      # Type tests
    └── example.test.ts
  examples/         # Sample .tl files
  docs/            # Documentation
  ```

**NPM Scripts:**
- `npm run build` - Build the project
- `npm test` - Run test suite
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Type checking without emit

**Build output:**
- Successfully builds to `dist/` directory
- Creates both CLI entry point and library exports
- All type checking passes with strict mode

---

### 2. Testing Framework (P1.2)

Set up Vitest as the testing framework with excellent developer experience.

**Configuration:**
- Vitest configured in `vite.config.ts`
- Coverage reporting with v8 provider
- Fast watch mode for development
- 45 tests implemented and passing

**Test organization:**
- Tests mirror source structure
- Unit tests for types and lexer
- Example test demonstrates testing setup
- Coverage reporting configured (text, JSON, HTML)

**Coverage expectations:**
- Parser/Solver: >80% (will be tracked in future sprints)
- Visualizer: >70% (future sprint)
- Current coverage: 100% on implemented code (types and lexer)

---

### 3. Core Data Model (P1.4)

Defined comprehensive TypeScript types for the entire timeline system following the architecture from PRODUCT_PLAN.md.

**Type files created:**

1. **`types/time.ts`** - Time representation types:
   - `TimePoint` - A specific point in time with year/month/day precision
   - `TimeRange` - A range with min/max bounds (for uncertainty)
   - `Duration` - Time duration with support for ranges (e.g., 13-15 years)
   - `Era`, `Precision`, `TimeUnit` - Supporting enums/types

2. **`types/constraints.ts`** - Constraint types:
   - `Constraint` - Temporal relationships between events
   - `ConstraintType` - Enum for constraint types (after, before, during, etc.)
   - `ConfidenceLevel` - high/medium/low confidence
   - `DurationConstraint` - Duration constraints on events
   - `AnchorPoint` - start/end anchor points

3. **`types/timeline.ts`** - Core timeline types:
   - `Event` - Events with constraints, tags, properties
   - `Timeline` - Complete timeline with events, groups, theories
   - `Group` - Event grouping for organization
   - `Theory` - Alternative interpretations/scenarios
   - `Metadata` - Timeline metadata (title, reference, etc.)
   - `SolvedTimeline` - Timeline with computed ranges (for solver output)
   - `Conflict` - Detected conflicts during solving
   - `SolveMetadata` - Solver execution metadata

**Design principles:**
- **Separation of concerns:** Types are independent of implementation
- **Strict typing:** All types use strict TypeScript features
- **Well-documented:** JSDoc comments on all types
- **Extensible:** Properties use `Record<string, unknown>` for flexibility

**Test coverage:**
- 14 tests covering all data model types
- Tests verify:
  - Type instantiation and structure
  - Different precision levels (year, month, day)
  - Uncertain durations (ranges and approximate values)
  - Constraint types and confidence levels
  - Event creation with properties
  - Timeline construction with events

---

### 4. Lexer/Tokenizer (P1.6)

Implemented a complete lexer for tokenizing `.tl` timeline files.

**Token types supported:**

1. **Identifiers and literals:**
   - Event IDs (camelCase identifiers)
   - Strings (single and double quoted)
   - Numbers
   - Dates (YYYY, YYYY-MM, YYYY-MM-DD)

2. **Keywords:**
   - Constraint keywords: `after`, `before`, `during`, `start-after`, `end-after`, `start-before`, `end-before`
   - Property keywords: `date`, `duration`, `source`, `note`, `tags`
   - Time units: `years`, `months`, `days` (singular and plural)

3. **Confidence levels:**
   - `[high]`, `[medium]`, `[low]`

4. **Symbols:**
   - `:` (colon), `+` (plus), `-` (minus), `~` (tilde/approximate)
   - `.` (dot for event.start/event.end), `#` (hash for tags/groups)
   - `[`, `]` (brackets), `|` (pipe for multi-line strings)

5. **Group/Theory markers:**
   - `#group`, `#endgroup`, `#theory`, `#endtheory`
   - `#tagName` (custom tags)

6. **Frontmatter:**
   - `---` (YAML frontmatter delimiters)

7. **Structural:**
   - Newlines (significant for line-based parsing)
   - EOF (end of file)

**Features:**
- **Position tracking:** Every token includes line, column, and offset
- **Comment support:** Line comments with `//`
- **Whitespace handling:** Skips spaces and tabs, preserves newlines
- **Error handling:** Unknown characters marked as `UNKNOWN` tokens
- **String parsing:** Supports both single and double quotes

**Test coverage:**
- 29 tests covering all lexer functionality
- Tests organized by category:
  - Basic tokens (identifiers, numbers, strings)
  - Date tokens (year, year-month, full dates)
  - Keywords (constraints, properties, time units)
  - Symbols (operators, delimiters)
  - Confidence levels
  - Groups and tags
  - Frontmatter
  - Whitespace and comments
  - Complex examples (complete events)
  - Position tracking

**Examples tokenized:**

```
eventId: Event description
```
Tokens: `ID`, `COLON`, `ID`, `ID`, `EOF`

```
after: eventA + 3 years
```
Tokens: `AFTER`, `COLON`, `ID`, `PLUS`, `NUMBER`, `YEARS`, `EOF`

```
date: ~1920
```
Tokens: `DATE_KW`, `COLON`, `TILDE`, `NUMBER`, `EOF`

---

### 5. Example Timeline Files (P1.3)

Created three example `.tl` files to demonstrate syntax and serve as test fixtures.

**1. `examples/basic.tl`** - Simple absolute dates:
```timeline
---
title: Basic Timeline Example
reference: eventA
description: Simple timeline demonstrating basic absolute dates
---

eventA: Event A happened
  date: 1920

eventB: Event B occurred (circa)
  date: ~1922

periodC: Period C
  date: 1918-1922
```

**2. `examples/jacob.tl`** - Biblical chronology with relative constraints:
```timeline
---
title: Timeline of Jacob's Life
reference: jacobBorn
description: Exploring the chronology of Jacob from Genesis
---

#group Jacob's Early Life

jacobBorn: Jacob is born
  note: Reference point for this timeline

jacobFlees: Jacob flees to Haran
  after: jacobBorn + 77 years
  source: Traditional chronology

#endgroup

#group Jacob's Time in Haran

josephBorn: Joseph is born
  after: jacobArrival + 13-15 years
  source: Genesis 30:22-24
  note: Uncertain exact timing during service to Laban

#endgroup
```

**3. `examples/uncertain.tl`** - Showcasing uncertainty features:
```timeline
---
title: Timeline with Uncertainty Features
description: Demonstrates various uncertainty representations
---

approximateEvent: Approximately 1920
  date: ~1920
  confidence: [medium]

relativeUncertain: Event with uncertain offset
  after: anchoredEvent + 13-15 years
  note: Between 13 and 15 years after anchor

durationEvent: Event with duration
  after: approximateRelative + 2 years
  duration: 5 years
  note: Lasted exactly 5 years
```

**Purpose:**
- Demonstrate syntax features
- Serve as test fixtures for parser development (Sprint 2)
- Provide real-world examples for documentation
- Validate design decisions

---

### 6. CLI Skeleton (P1.1)

Created a basic CLI tool structure with Commander.js.

**Current functionality:**
- Entry point at `src/cli/index.ts`
- Command structure defined: `tl-parse <file>`
- Options: `--output`, `--pretty`
- Version flag: `--version`
- Help text: `--help`

**Current behavior:**
```bash
$ tl-parse parse examples/jacob.tl
Parsing file: examples/jacob.tl
Parser not yet implemented (Sprint 1 - foundation only)
```

**Next sprint:** Integrate actual parser once implemented in P1.8-P1.15.

---

## Technical Decisions

### ADR 1: TypeScript Strict Mode

**Decision:** Use TypeScript in strict mode with all strictness flags enabled.

**Reasoning:**
- Catches bugs at compile time rather than runtime
- Better IDE support and autocomplete
- Enforces good practices (no implicit any, null checks, etc.)
- Makes refactoring safer
- Aligns with project principle of well-tested, high-quality code

**Configuration flags enabled:**
- `strict: true` (enables all strict checks)
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `noImplicitReturns: true`
- `noImplicitOverride: true`

**Trade-offs:**
- Requires more type annotations
- Slower initial development (more upfront thinking)
- Benefits: Fewer bugs, easier refactoring, better maintainability

---

### ADR 2: Vite as Build Tool

**Decision:** Use Vite for building both CLI and library outputs.

**Alternatives considered:**
- **tsc only:** Simpler but no bundling
- **Webpack:** More established but slower and more complex
- **Rollup:** Similar to Vite but Vite has better DX
- **esbuild:** Faster but less features

**Reasoning:**
- Fast development with HMR (for visualizer in future sprints)
- Good TypeScript support out of the box
- Can build both library and CLI from same config
- Modern ES modules by default
- Good for both development and production builds
- Will work well for web visualization phase

**Configuration:**
- Library mode for main exports (`src/index.ts`)
- Separate entry for CLI (`src/cli/index.ts`)
- External dependencies (commander) not bundled in library

---

### ADR 3: Vitest over Jest

**Decision:** Use Vitest as the testing framework.

**Alternatives considered:**
- **Jest:** More established, larger ecosystem
- **Mocha/Chai:** Classic choice, more manual setup
- **Node test runner:** Native but minimal features

**Reasoning:**
- Vite-compatible (same config, faster execution)
- Modern ESM support out of the box
- Fast watch mode with HMR
- Better TypeScript integration
- UI mode for interactive testing (`npm run test:ui`)
- Coverage built-in with v8 provider
- Compatible with Jest API (easy migration if needed)

**Developer experience benefits:**
- Instant test startup (uses Vite's transformation)
- File watching without polling
- Clear, colored output
- Coverage reports in multiple formats

---

### ADR 4: Data Model as Plain Interfaces (Not Classes)

**Decision:** Define data model as TypeScript interfaces rather than classes.

**Reasoning:**
- **Plain data:** Timeline data is fundamentally just data, not behavior
- **Serialization:** Easy to serialize to/from JSON
- **Immutability:** Encourages functional programming style
- **Type safety:** TypeScript interfaces provide full type checking
- **Flexibility:** Easy to create objects with object literals
- **Testing:** Simpler to mock and test
- **Performance:** No runtime overhead (interfaces are compile-time only)

**When to use classes:**
- Parser (has methods for tokenization)
- Solver (has methods for constraint propagation)
- Visualizer components (React/Svelte components)

**Examples:**
```typescript
// Interface (data)
interface Event {
  id: string;
  description: string;
  constraints: Constraint[];
}

// Class (behavior)
class Lexer {
  tokenize(): Token[] { ... }
}
```

---

### ADR 5: Position Tracking in Tokens

**Decision:** Include line, column, and offset in every token.

**Reasoning:**
- Essential for error reporting (show user where syntax error occurred)
- Helps with debugging parser issues
- Enables source maps for better developer experience
- Small memory overhead but huge usability benefit
- Standard practice in language tooling

**Token position structure:**
```typescript
interface Position {
  line: number;     // 1-indexed
  column: number;   // 1-indexed
  offset: number;   // 0-indexed from start of input
}

interface Token {
  type: TokenType;
  value: string;
  start: Position;
  end: Position;
}
```

**Usage in error messages (future):**
```
Parse error at line 15, column 23:
  after: jacobBorn + years
                     ^^^^^
Expected a number before 'years'
```

---

## Test Results

### Test Summary

```
Test Files  3 passed (3)
     Tests  45 passed (45)
  Duration  427ms
```

**Test breakdown:**
- `tests/example.test.ts` - 2 tests (basic setup verification)
- `tests/types/data-model.test.ts` - 14 tests (data model types)
- `tests/parser/lexer.test.ts` - 29 tests (lexer functionality)

### Coverage

Current coverage: **100%** on all implemented code

**Files covered:**
- `src/types/time.ts` - 100%
- `src/types/constraints.ts` - 100%
- `src/types/timeline.ts` - 100%
- `src/parser/tokens.ts` - 100%
- `src/parser/lexer.ts` - 100%

**Coverage goals for future sprints:**
- Parser (P1.8-P1.15): >80%
- Solver (Phase 2): >80%
- Visualizer (Phase 3): >70%

### Build Verification

```
✓ TypeScript compilation: No errors
✓ Vite build: Success (dist/cli.js, dist/index.js)
✓ Type checking: Passes in strict mode
✓ ESLint: No errors
✓ Prettier: Code formatted consistently
```

---

## Next Steps

### Sprint 2 Planning (Recommended)

Based on the BACKLOG.md, the logical next tasks are:

**Core parser implementation:**
1. **P1.8:** Implement parser for basic events with absolute dates (M)
2. **P1.9:** Implement parser for relative constraints (M)
3. **P1.10:** Implement parser for event properties and metadata (S)
4. **P1.11:** Implement parser for duration constraints (S)

**Estimated Sprint 2 duration:** 1-2 weeks with focused team

**Why these tasks:**
- P1.8 is the foundation for all parsing (must come first)
- P1.9 adds relative constraints (core feature)
- P1.10 and P1.11 complete event parsing
- Together they enable parsing of the example files

**Future sprint scope:**
- Sprint 3: Groups, theories, frontmatter, error handling (P1.12-P1.15)
- Sprint 4: CLI integration, validation, testing (P1.16-P1.19)
- Sprint 5: Complete Phase 1, start Phase 2 (solver)

### Immediate Actions

**1. Update BACKLOG.md:**
- Mark P1.1, P1.2, P1.3, P1.4, P1.6 as "Completed"
- Update status fields with completion date

**2. Create git commit:**
- Commit all Sprint 1 work with message referencing sprint letter
- Tag as `v0.1.0-sprint1` or similar

**3. Review and feedback:**
- Review sprint letter for accuracy
- Add any feedback to FEEDBACK.md for next sprint
- Consider if any tasks were harder/easier than expected (update estimates)

---

## Sprint Retrospective

### What Went Well

1. **Clear architecture:** Having PRODUCT_PLAN.md with detailed architecture guidelines made implementation straightforward
2. **Strong foundation:** TypeScript strict mode caught several potential bugs during development
3. **Comprehensive testing:** 45 tests provide confidence in the foundation
4. **Good examples:** The example `.tl` files are excellent for understanding the syntax
5. **Documentation:** Types are well-documented with JSDoc comments

### Challenges Encountered

1. **TypeScript configuration:** Initial tsconfig had `allowImportingTsExtensions` which doesn't work with `tsc` emit (fixed by removing it)
2. **Type exports:** Had to use `export type` for re-exporting types due to `isolatedModules` flag (minor fix)

### Lessons Learned

1. **Start with strict mode:** TypeScript strict mode from the beginning catches bugs early
2. **Test as you go:** Writing tests alongside implementation is more efficient than writing them later
3. **Examples are valuable:** Creating example files early helps validate syntax design decisions

### Improvements for Next Sprint

1. **More incremental commits:** Make smaller, more frequent commits during implementation
2. **Documentation as we go:** Update docs/ with usage guides as features are implemented
3. **Performance benchmarks:** Consider adding benchmarks for lexer performance (especially for large files)

---

## Appendix: File Inventory

### Source Files Created (13 files)

```
src/
  index.ts                      # Main entry point (exports)
  cli/
    index.ts                    # CLI skeleton
  parser/
    tokens.ts                   # Token types and definitions
    lexer.ts                    # Lexer implementation
  types/
    time.ts                     # Time-related types
    constraints.ts              # Constraint types
    timeline.ts                 # Timeline types
    index.ts                    # Type exports
```

### Test Files Created (3 files)

```
tests/
  example.test.ts               # Basic test setup
  types/
    data-model.test.ts          # Data model tests (14 tests)
  parser/
    lexer.test.ts               # Lexer tests (29 tests)
```

### Example Files Created (3 files)

```
examples/
  basic.tl                      # Basic timeline with absolute dates
  jacob.tl                      # Biblical chronology example
  uncertain.tl                  # Uncertainty features demo
```

### Configuration Files Created (7 files)

```
package.json                    # NPM dependencies and scripts
tsconfig.json                   # TypeScript configuration
vite.config.ts                  # Vite build configuration
.eslintrc.json                  # ESLint rules
.prettierrc.json                # Prettier formatting rules
.gitignore                      # Git ignore patterns
```

### Documentation Updated

```
CHANGES.md                      # Added Sprint 1 entry
docs/
  SPRINT_LETTER_01.md          # This document
```

### Total Lines of Code (Approximate)

- Source code: ~900 lines
- Test code: ~600 lines
- Configuration: ~150 lines
- Documentation: ~800 lines (this letter)
- **Total: ~2,450 lines**

---

**Sprint 1 Status: ✅ COMPLETE**

All planned tasks completed successfully. Foundation is solid for parser implementation in Sprint 2.
