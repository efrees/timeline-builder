# Sprint 3: Constraint Solver Foundation - Execution Plan

**Sprint Lead:** sprint-lead
**Sprint Date:** 2026-03-09
**Sprint Goal:** Implement interval arithmetic and constraint graph infrastructure for constraint solver

---

## Sprint Context

### Previous Sprints
- **Sprint 1:** TypeScript setup, data model, lexer (45 tests, 100% coverage)
- **Sprint 2:** Complete parser for .tl files (98 tests, 93% coverage)

### Current Sprint
Implementing Phase 2 tasks P2.1-P2.4 from BACKLOG.md:
- P2.1: Interval arithmetic for constraint propagation
- P2.2: Time range comparison and ordering
- P2.3: Constraint graph data structure
- P2.4: Graph traversal utilities

---

## Team Structure

### Developers (3)

1. **interval-solver**
   - Tasks: P2.1 + P2.2
   - Focus: Interval arithmetic library
   - Size: Medium + Small
   - Dependencies: None (can start immediately)
   - Deliverable: `src/solver/interval.ts` + tests

2. **graph-builder**
   - Task: P2.3
   - Focus: ConstraintGraph data structure
   - Size: Medium
   - Dependencies: None (can start immediately)
   - Deliverable: `src/solver/constraint-graph.ts` + tests

3. **graph-algorithms**
   - Task: P2.4
   - Focus: Graph traversal algorithms
   - Size: Medium
   - Dependencies: P2.3 (must wait for graph-builder)
   - Deliverable: `src/solver/graph-algorithms.ts` + tests

### Reviewer (1)

4. **sprint-reviewer**
   - Responsibilities: Code review, testing, documentation
   - Focus: Quality assurance, Sprint Letter 03
   - Dependencies: Reviews all developer work
   - Deliverable: `docs/SPRINT_LETTER_03.md`

---

## Task Breakdown

### P2.1: Interval Arithmetic (interval-solver)

**Goal:** Implement time interval operations for constraint propagation

**Files:**
- `src/solver/interval.ts`
- `tests/solver/interval.test.ts`

**Key Operations:**
- `intersection(a, b)` - Find overlap between intervals
- `union(a, b)` - Merge intervals
- `widen(interval, duration)` - Expand by uncertain duration
- `narrow(interval, constraint)` - Tighten with constraint

**Testing Focus:**
- Overlapping, adjacent, disjoint intervals
- Uncertain durations (ranges like 13-15 years)
- Edge cases: empty, point, infinite intervals
- Target: >80% coverage

---

### P2.2: Time Range Comparisons (interval-solver)

**Goal:** Add comparison operations for temporal relationships

**Implementation:** Add to `src/solver/interval.ts`

**Key Operations:**
- `isBefore(a, b)` - a completely before b
- `isAfter(a, b)` - a completely after b
- `overlaps(a, b)` - ranges have overlap
- `contains(a, b)` - a fully contains b

**Testing Focus:**
- All comparison combinations
- Point intervals
- Reflexive/symmetric properties
- Target: >80% coverage

---

### P2.3: Constraint Graph (graph-builder)

**Goal:** Build graph representation of event dependencies

**Files:**
- `src/solver/constraint-graph.ts`
- `tests/solver/constraint-graph.test.ts`

**Key Components:**
- `ConstraintGraph` class
- Events as nodes, constraints as directed edges
- Add/remove operations
- Query predecessors/successors
- Theory-aware filtering

**Testing Focus:**
- Graph construction from Timeline
- Node/edge operations
- Dependency queries
- Theory filtering
- Target: >80% coverage

---

### P2.4: Graph Algorithms (graph-algorithms)

**Goal:** Implement traversal and analysis algorithms

**Files:**
- `src/solver/graph-algorithms.ts`
- `tests/solver/graph-algorithms.test.ts`

**Key Algorithms:**
- `topologicalSort()` - Dependency ordering
- `detectCycles()` - Find circular dependencies
- `findConnectedComponents()` - Identify subgraphs
- `bfs()` - Breadth-first search
- `dfs()` - Depth-first search
- `findAnchoredEvents()` - Find events with absolute dates

**Testing Focus:**
- All algorithms with various graph structures
- Cycle detection edge cases
- Performance notes
- Target: >80% coverage

---

## Execution Timeline

### Phase 1: Parallel Development (Days 1-2)

**interval-solver:**
- Implement P2.1 (interval arithmetic)
- Implement P2.2 (comparisons)
- Write comprehensive tests
- Commit when complete

**graph-builder:**
- Implement P2.3 (ConstraintGraph)
- Write comprehensive tests
- Commit when complete

**sprint-reviewer:**
- Set up Sprint Letter 03 document
- Review completed tasks as they arrive
- Run tests and verify coverage

### Phase 2: Sequential Development (Day 3)

**graph-algorithms:**
- Wait for P2.3 completion confirmation
- Implement P2.4 (graph algorithms)
- Write comprehensive tests
- Commit when complete

**sprint-reviewer:**
- Review P2.4
- Integration testing (all modules together)
- Document technical decisions

### Phase 3: Sprint Closeout (Day 4)

**sprint-reviewer:**
- Complete Sprint Letter 03
- Update BACKLOG.md (mark P2.1-P2.4 complete)
- Update CHANGES.md (Sprint 3 entry)
- Final commit with all documentation
- Report to sprint-lead

**sprint-lead:**
- Verify all commits
- Final sprint review
- Archive sprint artifacts
- Prepare for Sprint 4 planning

---

## Quality Standards

### Code Quality
- TypeScript strict mode compliance
- JSDoc comments on all public APIs
- Follows existing code style (see `src/types/`, `src/parser/`)
- Proper error handling
- No debug code (console.log, etc.)

### Testing Requirements
- >80% code coverage per module
- Test happy path, edge cases, errors
- Clear test descriptions
- Fast execution (<1s per test file)

### Documentation
- JSDoc with examples
- Technical decisions documented
- Sprint letter comprehensive
- README updated if needed

### Git Standards
- Atomic commits per completed task
- Descriptive commit messages
- Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
- No uncommitted work at sprint end

---

## Communication Protocol

### Developer → Sprint-Reviewer
- "Completed [task] - ready for review"
- Share commit hash
- Note any design decisions made

### Sprint-Reviewer → Developer
- "Reviewing [task]..."
- "Found issues: [list]" or "Review passed ✅"
- Request fixes if needed

### Developer → Sprint-Lead
- Report blockers immediately
- Ask clarifying questions
- Coordinate on design decisions

### Sprint-Reviewer → Sprint-Lead
- Progress updates
- Issue escalation
- Final sprint report

---

## Task Files Reference

All detailed specifications in `.sprint3/` directory:
- `interval-solver-task.md` - P2.1 + P2.2 specification
- `graph-builder-task.md` - P2.3 specification
- `graph-algorithms-task.md` - P2.4 specification
- `sprint-reviewer-task.md` - Review responsibilities

---

## Success Criteria

**Technical:**
- ✅ All 4 tasks (P2.1-P2.4) implemented
- ✅ All tests passing (100% pass rate)
- ✅ Coverage >80% per module
- ✅ No TypeScript errors
- ✅ Build succeeds

**Process:**
- ✅ Sprint letter complete and detailed
- ✅ All work committed atomically
- ✅ BACKLOG.md updated
- ✅ CHANGES.md updated
- ✅ Technical decisions documented

**Quality:**
- ✅ Code follows project standards
- ✅ APIs well-documented
- ✅ Tests comprehensive
- ✅ No known bugs

---

## Risk Mitigation

**Risk: Dependencies block progress**
- Mitigation: P2.1-P2.3 can run in parallel, only P2.4 waits

**Risk: Low test coverage**
- Mitigation: Coverage checked per commit, not at end

**Risk: Unclear requirements**
- Mitigation: Detailed task files provide specifications

**Risk: Integration issues**
- Mitigation: Integration tests in Phase 3

**Risk: Time overrun**
- Mitigation: Can defer P2.4 to Sprint 4 if needed (P2.1-P2.3 provide value alone)

---

## Next Sprint Preview

**Sprint 4 Candidates (Phase 2 continued):**
- P2.5: Conflict detection
- P2.6: Forward constraint propagation
- P2.7: Backward constraint propagation
- P2.8: Iterative propagation (fixed-point)

Or:
- P1.13-P1.21: Complete Phase 1 remaining tasks (theories, frontmatter, CLI integration)

**Decision:** Based on Sprint 3 velocity and stakeholder priorities

---

## Appendix: Development Commands

```bash
# Run tests
npm test

# Run specific test
npm test -- interval.test.ts

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build

# Format
npm run format
```

---

**Status: READY FOR EXECUTION**

All planning complete. Team can begin work immediately.
