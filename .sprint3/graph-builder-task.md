# Task: Constraint Graph Builder (P2.3)

**Developer:** graph-builder
**Sprint:** 3
**Size:** M (Medium)
**Dependencies:** None (can start immediately, parallel with interval-solver)

## Overview

You are building the ConstraintGraph data structure that represents events as nodes and constraints as edges. This graph will be used by the solver to propagate constraints and detect conflicts.

## Task P2.3: Build Constraint Graph Data Structure

### Goal
Create a graph data structure where events are nodes and constraints are directed edges with metadata.

**⚠️ IMPORTANT:** The parser already creates `Event` and `Constraint` objects (from `src/types/`). Your graph should work with these existing types, not create new ones. Review `src/parser/parser.ts` to see how Timeline objects are constructed.

### Files to Create
- `src/solver/constraint-graph.ts` - ConstraintGraph class implementation
- `tests/solver/constraint-graph.test.ts` - Comprehensive test suite

---

## Requirements

### 1. ConstraintGraph Class

```typescript
export class ConstraintGraph {
  // Core structure
  private nodes: Map<string, GraphNode>;
  private edges: Map<string, GraphEdge[]>;

  // Constructor
  constructor(timeline: Timeline) { ... }

  // Node operations
  addEvent(event: Event): void
  removeEvent(eventId: string): void
  hasEvent(eventId: string): boolean
  getEvent(eventId: string): Event | undefined
  getAllEvents(): Event[]

  // Edge operations
  addConstraint(constraint: Constraint): void
  removeConstraint(constraintId: string): void
  getConstraints(eventId: string): Constraint[]

  // Query operations
  getPredecessors(eventId: string): string[]  // Events that come before
  getSuccessors(eventId: string): string[]    // Events that come after
  getDependencies(eventId: string): string[]  // All events this depends on

  // Theory support
  filterByTheory(theoryId?: string): ConstraintGraph
  getActiveConstraints(theoryIds: string[]): Constraint[]
}
```

### 2. GraphNode and GraphEdge Types

```typescript
interface GraphNode {
  eventId: string;
  event: Event;
  incomingEdges: string[];  // Constraint IDs
  outgoingEdges: string[];  // Constraint IDs
}

interface GraphEdge {
  id: string;  // Unique constraint ID
  constraint: Constraint;
  sourceEventId: string;  // Event being constrained
  targetEventId: string;  // Event referenced in constraint
  theoryId?: string;
}
```

### 3. Key Behaviors

**Graph Construction:**
- Accept a `Timeline` object in constructor
- Build graph from `timeline.events` and `timeline.constraints`
- Handle both absolute constraints (no edges) and relative constraints (edges)

**Directed Edges:**
- Edge direction: constrained event → referenced event
- Example: "eventB after eventA" creates edge B → A
- This represents dependency: B depends on A's date

**Theory Awareness:**
- Track which constraints belong to which theory via `constraint.theoryId`
- `filterByTheory()` returns a new graph with only constraints from that theory
- Support base timeline (no theoryId) + optional theory overlays

---

## Implementation Guidelines

### Design Considerations

1. **Graph Representation**
   - Adjacency list is efficient for sparse graphs (recommended)
   - Store both incoming and outgoing edges for fast bidirectional queries
   - Consider using Map for O(1) lookups

2. **Constraint IDs**
   - Generate unique IDs for constraints (they don't have IDs in the model)
   - Could use: `${sourceEventId}-${constraintType}-${targetEventId}`
   - Or auto-increment counter

3. **Edge Direction Semantics**
   - "after: X" means this event depends on X (edge: this → X)
   - "before: Y" means Y depends on this event (edge: Y → this)
   - Be consistent throughout implementation

4. **Error Handling**
   - What if constraint references non-existent event?
   - Should we validate or just skip silently?
   - Consider adding validation method: `validateGraph()`

### Code Style
- Follow existing patterns from `src/types/`
- Use strict TypeScript with interfaces
- Add comprehensive JSDoc comments
- Export from `src/solver/index.ts`

---

## Testing Requirements

### Test Categories

1. **Graph Construction**
   - Build graph from timeline with events
   - Build graph with absolute constraints only (no edges)
   - Build graph with relative constraints (edges)
   - Empty timeline (edge case)

2. **Node Operations**
   - Add event, verify it's in graph
   - Remove event, verify it's gone and edges are cleaned up
   - Get event by ID
   - Get all events

3. **Edge Operations**
   - Add constraint, verify edge created
   - Remove constraint, verify edge removed
   - Get all constraints for an event

4. **Query Operations**
   - Get predecessors (events referenced by constraints)
   - Get successors (events that reference this one)
   - Test with complex graph (multiple dependencies)

5. **Theory Support**
   - Filter graph by theory ID
   - Get active constraints for multiple theories
   - Test base timeline + theory overlay

6. **Edge Cases**
   - Self-referencing constraint (A after A) - should detect
   - Constraint referencing non-existent event
   - Multiple constraints between same events
   - Remove event with constraints attached

### Coverage Target
- Aim for >80% code coverage
- Use `npm run test:coverage` to verify

---

## Example Usage

```typescript
// Create graph from timeline
const timeline = parse(tlFileContent);
const graph = new ConstraintGraph(timeline);

// Query dependencies
const preds = graph.getPredecessors('eventB');
// ['eventA'] if "eventB after eventA"

// Filter by theory
const earlyExodusGraph = graph.filterByTheory('earlyExodus');
const events = earlyExodusGraph.getAllEvents();
```

---

## Deliverables Checklist

- [ ] `src/solver/constraint-graph.ts` created with ConstraintGraph class
- [ ] Node operations (add, remove, get) implemented
- [ ] Edge operations (add, remove, get) implemented
- [ ] Query operations (predecessors, successors) implemented
- [ ] Theory filtering implemented
- [ ] `tests/solver/constraint-graph.test.ts` with comprehensive tests
- [ ] All tests passing: `npm test`
- [ ] Coverage >80%: `npm run test:coverage`
- [ ] Code committed with message: "Implement constraint graph data structure (P2.3)"
- [ ] Include Co-Authored-By tag in commit

---

## Integration Points

- Uses `Timeline`, `Event`, `Constraint` from `src/types/`
- Will be used by graph-algorithms (P2.4) for traversal
- Will be used by solver (future) for constraint propagation

---

## Questions or Blockers?

- If unclear on edge direction semantics, ask sprint-lead
- If blocked on types/interfaces, coordinate with team
- If performance concerns arise, document for discussion

## Success Criteria

✅ Graph correctly represents event dependencies
✅ Theory-aware filtering works correctly
✅ All query operations efficient (O(1) or O(n))
✅ Test coverage >80%
✅ Code is well-documented
✅ Work is committed atomically
