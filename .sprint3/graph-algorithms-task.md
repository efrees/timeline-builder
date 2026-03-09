# Task: Graph Algorithms (P2.4)

**Developer:** graph-algorithms
**Sprint:** 3
**Size:** M (Medium)
**Dependencies:** P2.3 (ConstraintGraph must be complete)

## Overview

You are implementing graph traversal and analysis algorithms that will be used by the constraint solver. These algorithms enable dependency ordering, cycle detection, and component analysis.

## Task P2.4: Implement Graph Traversal Utilities

### Goal
Create a library of graph algorithms that work with ConstraintGraph to analyze and traverse event dependencies.

### Files to Create
- `src/solver/graph-algorithms.ts` - Algorithm implementations
- `tests/solver/graph-algorithms.test.ts` - Comprehensive test suite

---

## Requirements

### 1. Topological Sort

**Purpose:** Determine the order to process events during constraint propagation (dependencies first).

```typescript
export function topologicalSort(graph: ConstraintGraph): string[]
```

**Algorithm:** Kahn's algorithm or DFS-based
- Returns array of event IDs in dependency order
- Events with no dependencies come first
- Events that depend on others come after their dependencies
- Throws error if cycle detected (impossible to sort)

**Example:**
```
eventA (no constraints) → [eventA, ...]
eventB after eventA → [eventA, eventB]
eventC after eventB → [eventA, eventB, eventC]
```

---

### 2. Cycle Detection

**Purpose:** Detect circular dependencies that make the timeline unsolvable.

```typescript
export function detectCycles(graph: ConstraintGraph): string[][] | null
```

**Algorithm:** DFS with visited tracking
- Returns array of cycles (each cycle is array of event IDs)
- Returns null if no cycles found
- Each cycle should be a minimal cycle (no extra nodes)

**Example Cycles:**
```
eventA after eventB, eventB after eventA → [[eventA, eventB, eventA]]
eventA after eventB, eventB after eventC, eventC after eventA → [[eventA, eventB, eventC, eventA]]
```

---

### 3. Connected Components

**Purpose:** Identify independent subgraphs (anchored vs unanchored groups).

```typescript
export function findConnectedComponents(graph: ConstraintGraph): string[][]
```

**Algorithm:** Union-find or DFS
- Returns array of components (each component is array of event IDs)
- Events in same component are transitively connected
- Used to identify which events can be solved independently

**Usage:**
- Component with absolute date = anchored subgraph (can solve)
- Component without absolute date = unanchored (needs reference point)

---

### 4. Breadth-First Search (BFS)

**Purpose:** Find shortest path between events, explore graph level-by-level.

```typescript
export function bfs(
  graph: ConstraintGraph,
  startEventId: string,
  visitFn: (eventId: string, depth: number) => void
): void
```

**Algorithm:** Standard BFS with queue
- Visit all events reachable from start
- Call visitFn for each event with its depth
- Used for propagating constraints outward from anchors

---

### 5. Depth-First Search (DFS)

**Purpose:** Explore graph deeply, useful for cycle detection and traversal.

```typescript
export function dfs(
  graph: ConstraintGraph,
  startEventId: string,
  visitFn: (eventId: string) => void
): void
```

**Algorithm:** Standard DFS with recursion or stack
- Visit all events reachable from start
- Call visitFn for each event
- Used as building block for other algorithms

---

### 6. Find Anchored Events

**Purpose:** Identify events with absolute dates (starting points for propagation).

```typescript
export function findAnchoredEvents(graph: ConstraintGraph): string[]
```

**Implementation:**
- Check each event for absolute date constraint
- Return array of event IDs with absolute dates
- These are the "roots" for constraint propagation

---

## Implementation Guidelines

### Algorithm Choices
- **Topological Sort:** Kahn's algorithm is easier to understand, DFS is more elegant
- **Cycle Detection:** DFS with color marking (white/gray/black) is standard
- **Connected Components:** DFS or Union-Find both work well
- Choose based on clarity and testability

### Edge Cases to Handle
1. **Empty Graph:** All functions should handle empty input gracefully
2. **Single Node:** Functions should work with single-event graphs
3. **Disconnected Graph:** Components should identify all separate groups
4. **Self-Loops:** Consider whether "eventA after eventA" is valid (likely not)

### Performance Considerations
- These are O(V+E) algorithms (vertices + edges)
- For timeline-builder, V and E will be small-medium (10-1000 events)
- Correctness > optimization at this stage
- Document complexity in JSDoc

### Code Style
- Use TypeScript strict mode
- Add comprehensive JSDoc with examples
- Export all functions from `src/solver/index.ts`
- Use descriptive variable names (not `u, v` for nodes)

---

## Testing Requirements

### Test Categories

1. **Topological Sort**
   - Linear chain: A → B → C
   - DAG with multiple paths
   - Graph with multiple roots (parallel chains)
   - Should throw on cyclic graph
   - Empty graph

2. **Cycle Detection**
   - No cycles (should return null)
   - Simple cycle: A → B → A
   - Longer cycle: A → B → C → A
   - Multiple cycles in one graph
   - Self-loop: A → A

3. **Connected Components**
   - Single component (all connected)
   - Multiple components (disconnected subgraphs)
   - Each event in its own component (no edges)
   - Empty graph

4. **BFS/DFS**
   - Verify visit order is correct
   - Verify all reachable nodes are visited
   - Verify depth calculation (BFS)
   - Test with cycles (should handle gracefully)

5. **Find Anchored Events**
   - Timeline with multiple absolute dates
   - Timeline with no absolute dates
   - Timeline with only relative constraints

6. **Integration Tests**
   - Use real timeline examples from `examples/jacob.tl`
   - Verify algorithms work with actual constraint graphs

### Coverage Target
- Aim for >80% code coverage
- Test all edge cases mentioned above

---

## Example Usage

```typescript
import { ConstraintGraph } from './constraint-graph.js';
import { topologicalSort, detectCycles, findConnectedComponents } from './graph-algorithms.js';

// Build graph
const graph = new ConstraintGraph(timeline);

// Check for cycles
const cycles = detectCycles(graph);
if (cycles) {
  throw new Error(`Circular dependencies detected: ${cycles}`);
}

// Get processing order
const order = topologicalSort(graph);
// Process events in this order for constraint propagation

// Find independent subgraphs
const components = findConnectedComponents(graph);
// Solve each component independently
```

---

## Deliverables Checklist

- [ ] `src/solver/graph-algorithms.ts` created
- [ ] Topological sort implemented and tested
- [ ] Cycle detection implemented and tested
- [ ] Connected components implemented and tested
- [ ] BFS implemented and tested
- [ ] DFS implemented and tested
- [ ] Find anchored events implemented and tested
- [ ] `tests/solver/graph-algorithms.test.ts` with comprehensive tests
- [ ] All tests passing: `npm test`
- [ ] Coverage >80%: `npm run test:coverage`
- [ ] Code committed with message: "Implement graph traversal algorithms (P2.4)"
- [ ] Include Co-Authored-By tag in commit

---

## Coordination

**Wait for:** graph-builder to complete P2.3 before starting
- You need ConstraintGraph class to test against
- Check with sprint-lead when P2.3 is ready
- Can review P2.3 code while waiting

**Coordinate with:** sprint-reviewer for testing
- Sprint-reviewer will run full test suite
- Report when task is complete for review

---

## Questions or Blockers?

- If ConstraintGraph API is unclear, coordinate with graph-builder
- If algorithm choice is uncertain, ask sprint-lead
- If test cases are ambiguous, reference existing test patterns

## Success Criteria

✅ All algorithms correctly analyze ConstraintGraph
✅ Cycle detection catches all circular dependencies
✅ Topological sort produces valid ordering
✅ Connected components correctly identifies subgraphs
✅ Test coverage >80%
✅ Code is well-documented with examples
✅ Work is committed atomically
