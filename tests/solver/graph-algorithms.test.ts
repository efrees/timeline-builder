/**
 * Tests for graph traversal algorithms
 */

import { describe, it, expect } from 'vitest';
import { ConstraintGraph } from '../../src/solver/constraint-graph.js';
import {
  topologicalSort,
  detectCycles,
  findConnectedComponents,
  bfs,
  dfs,
} from '../../src/solver/graph-algorithms.js';
import type { Timeline, Event } from '../../src/types/timeline.js';

/**
 * Helper function to create a timeline with events
 */
function createTimeline(events: Event[]): Timeline {
  const timeline: Timeline = {
    metadata: {},
    events: new Map(),
    groups: [],
    theories: [],
  };

  for (const event of events) {
    timeline.events.set(event.id, event);
  }

  return timeline;
}

/**
 * Helper to create a graph with cycle by manually adding constraints
 */
function createGraphWithCycle(eventIds: string[]): ConstraintGraph {
  // Create events without constraints first
  const events: Event[] = eventIds.map(id => ({
    id,
    label: `Event ${id}`,
    constraints: [],
  }));

  const timeline = createTimeline(events);
  const graph = new ConstraintGraph(timeline);

  // Add constraints to create cycle: each event depends on the next
  // Last event depends on first (completing the cycle)
  for (let i = 0; i < eventIds.length; i++) {
    const currentId = eventIds[i];
    const nextId = eventIds[(i + 1) % eventIds.length];
    const constraint = { type: 'after' as const, targetEventId: nextId };
    graph.addConstraint(constraint, currentId);
  }

  return graph;
}

describe('topologicalSort', () => {
  it('should sort a simple linear dependency chain', () => {
    // A → B → C
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [
          { type: 'after', targetEventId: 'B' },
        ],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);
    const sorted = topologicalSort(graph);

    expect(sorted).toEqual(['A', 'B', 'C']);
  });

  it('should handle multiple dependencies', () => {
    // A → C
    // B → C
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [
          { type: 'after', targetEventId: 'A' },
          { type: 'after', targetEventId: 'B' },
        ],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);
    const sorted = topologicalSort(graph);

    // Both A and B should come before C
    const indexA = sorted.indexOf('A');
    const indexB = sorted.indexOf('B');
    const indexC = sorted.indexOf('C');

    expect(indexA).toBeLessThan(indexC);
    expect(indexB).toBeLessThan(indexC);
  });

  it('should handle empty graph', () => {
    const timeline = createTimeline([]);
    const graph = new ConstraintGraph(timeline);
    const sorted = topologicalSort(graph);

    expect(sorted).toEqual([]);
  });

  it('should handle single node', () => {
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);
    const sorted = topologicalSort(graph);

    expect(sorted).toEqual(['A']);
  });

  it('should throw error on cycle', () => {
    // A → B → A (cycle)
    const graph = createGraphWithCycle(['A', 'B']);

    expect(() => topologicalSort(graph)).toThrow('cycle');
  });

  it('should handle disconnected components', () => {
    // A → B (disconnected from C → D)
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [],
      },
      {
        id: 'D',
        label: 'Event D',
        constraints: [
          { type: 'after', targetEventId: 'C' },
        ],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);
    const sorted = topologicalSort(graph);

    // All events should be included
    expect(sorted).toHaveLength(4);
    expect(sorted).toContain('A');
    expect(sorted).toContain('B');
    expect(sorted).toContain('C');
    expect(sorted).toContain('D');

    // Dependencies should be respected
    expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('B'));
    expect(sorted.indexOf('C')).toBeLessThan(sorted.indexOf('D'));
  });
});

describe('detectCycles', () => {
  it('should return null for acyclic graph', () => {
    // A → B → C
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [
          { type: 'after', targetEventId: 'B' },
        ],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);
    const cycles = detectCycles(graph);

    expect(cycles).toBeNull();
  });

  it('should detect simple two-node cycle', () => {
    // A → B → A
    const graph = createGraphWithCycle(['A', 'B']);
    const cycles = detectCycles(graph);

    expect(cycles).not.toBeNull();
    expect(cycles).toHaveLength(1);
    expect(cycles![0]).toHaveLength(2);
    expect(cycles![0]).toContain('A');
    expect(cycles![0]).toContain('B');
  });

  it('should detect three-node cycle', () => {
    // A → B → C → A
    const graph = createGraphWithCycle(['A', 'B', 'C']);
    const cycles = detectCycles(graph);

    expect(cycles).not.toBeNull();
    expect(cycles).toHaveLength(1);
    expect(cycles![0]).toHaveLength(3);
  });

  it('should handle self-loop', () => {
    // A → A
    const graph = createGraphWithCycle(['A']);
    const cycles = detectCycles(graph);

    expect(cycles).not.toBeNull();
    expect(cycles).toHaveLength(1);
  });

  it('should return null for empty graph', () => {
    const timeline = createTimeline([]);
    const graph = new ConstraintGraph(timeline);
    const cycles = detectCycles(graph);

    expect(cycles).toBeNull();
  });

  it('should return null for single node without self-loop', () => {
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);
    const cycles = detectCycles(graph);

    expect(cycles).toBeNull();
  });
});

describe('findConnectedComponents', () => {
  it('should find single component in fully connected graph', () => {
    // A → B → C
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [
          { type: 'after', targetEventId: 'B' },
        ],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);
    const components = findConnectedComponents(graph);

    expect(components).toHaveLength(1);
    expect(components[0]).toHaveLength(3);
    expect(components[0]).toContain('A');
    expect(components[0]).toContain('B');
    expect(components[0]).toContain('C');
  });

  it('should find multiple disconnected components', () => {
    // A → B (disconnected from C → D)
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [],
      },
      {
        id: 'D',
        label: 'Event D',
        constraints: [
          { type: 'after', targetEventId: 'C' },
        ],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);
    const components = findConnectedComponents(graph);

    expect(components).toHaveLength(2);

    // Find which component contains A
    const componentWithA = components.find(c => c.includes('A'));
    const componentWithC = components.find(c => c.includes('C'));

    expect(componentWithA).toHaveLength(2);
    expect(componentWithA).toContain('A');
    expect(componentWithA).toContain('B');

    expect(componentWithC).toHaveLength(2);
    expect(componentWithC).toContain('C');
    expect(componentWithC).toContain('D');
  });

  it('should handle empty graph', () => {
    const timeline = createTimeline([]);
    const graph = new ConstraintGraph(timeline);
    const components = findConnectedComponents(graph);

    expect(components).toEqual([]);
  });

  it('should handle isolated nodes', () => {
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);
    const components = findConnectedComponents(graph);

    expect(components).toHaveLength(3);
    expect(components[0]).toHaveLength(1);
    expect(components[1]).toHaveLength(1);
    expect(components[2]).toHaveLength(1);
  });

  it('should handle cycle as single component', () => {
    // A → B → C → A (cycle)
    const graph = createGraphWithCycle(['A', 'B', 'C']);
    const components = findConnectedComponents(graph);

    expect(components).toHaveLength(1);
    expect(components[0]).toHaveLength(3);
  });
});

describe('bfs', () => {
  it('should visit nodes in breadth-first order', () => {
    // A → B → D
    // A → C
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'D',
        label: 'Event D',
        constraints: [
          { type: 'after', targetEventId: 'B' },
        ],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);

    const visited: Array<{ id: string; depth: number }> = [];
    bfs(graph, 'A', (id, depth) => {
      visited.push({ id, depth });
    });

    // Should visit A first (depth 0), then B and C (depth 1), then D (depth 2)
    expect(visited[0]).toEqual({ id: 'A', depth: 0 });
    expect(visited[1].depth).toBe(1);
    expect(visited[2].depth).toBe(1);
    expect(visited[3]).toEqual({ id: 'D', depth: 2 });

    // B and C should both be at depth 1 (order may vary)
    const depthOneIds = [visited[1].id, visited[2].id].sort();
    expect(depthOneIds).toEqual(['B', 'C']);
  });

  it('should handle single node', () => {
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);

    const visited: string[] = [];
    bfs(graph, 'A', (id) => {
      visited.push(id);
    });

    expect(visited).toEqual(['A']);
  });

  it('should not revisit nodes', () => {
    // A → B → D
    // A → C → D
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'D',
        label: 'Event D',
        constraints: [
          { type: 'after', targetEventId: 'B' },
          { type: 'after', targetEventId: 'C' },
        ],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);

    const visited: string[] = [];
    bfs(graph, 'A', (id) => {
      visited.push(id);
    });

    // D should be visited only once, even though it has two paths from A
    expect(visited).toHaveLength(4);
    expect(visited.filter(id => id === 'D')).toHaveLength(1);
  });

  it('should throw error for non-existent start node', () => {
    const timeline = createTimeline([]);
    const graph = new ConstraintGraph(timeline);

    expect(() => {
      bfs(graph, 'INVALID', () => {});
    }).toThrow('not found');
  });
});

describe('dfs', () => {
  it('should visit nodes in depth-first order', () => {
    // A → B → D
    // A → C
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'D',
        label: 'Event D',
        constraints: [
          { type: 'after', targetEventId: 'B' },
        ],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);

    const visited: string[] = [];
    dfs(graph, 'A', (id) => {
      visited.push(id);
    });

    // Should visit A first, then go deep (either B→D or C)
    expect(visited[0]).toBe('A');
    expect(visited).toHaveLength(4);
    expect(visited).toContain('A');
    expect(visited).toContain('B');
    expect(visited).toContain('C');
    expect(visited).toContain('D');
  });

  it('should handle single node', () => {
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);

    const visited: string[] = [];
    dfs(graph, 'A', (id) => {
      visited.push(id);
    });

    expect(visited).toEqual(['A']);
  });

  it('should not revisit nodes', () => {
    // A → B → D
    // A → C → D
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'D',
        label: 'Event D',
        constraints: [
          { type: 'after', targetEventId: 'B' },
          { type: 'after', targetEventId: 'C' },
        ],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);

    const visited: string[] = [];
    dfs(graph, 'A', (id) => {
      visited.push(id);
    });

    // D should be visited only once
    expect(visited).toHaveLength(4);
    expect(visited.filter(id => id === 'D')).toHaveLength(1);
  });

  it('should throw error for non-existent start node', () => {
    const timeline = createTimeline([]);
    const graph = new ConstraintGraph(timeline);

    expect(() => {
      dfs(graph, 'INVALID', () => {});
    }).toThrow('not found');
  });

  it('should handle linear chain', () => {
    // A → B → C → D
    const events: Event[] = [
      {
        id: 'A',
        label: 'Event A',
        constraints: [],
      },
      {
        id: 'B',
        label: 'Event B',
        constraints: [
          { type: 'after', targetEventId: 'A' },
        ],
      },
      {
        id: 'C',
        label: 'Event C',
        constraints: [
          { type: 'after', targetEventId: 'B' },
        ],
      },
      {
        id: 'D',
        label: 'Event D',
        constraints: [
          { type: 'after', targetEventId: 'C' },
        ],
      },
    ];

    const timeline = createTimeline(events);
    const graph = new ConstraintGraph(timeline);

    const visited: string[] = [];
    dfs(graph, 'A', (id) => {
      visited.push(id);
    });

    expect(visited).toEqual(['A', 'B', 'C', 'D']);
  });
});
