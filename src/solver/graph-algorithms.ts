/**
 * Graph traversal algorithms for constraint graphs.
 * These algorithms are used to analyze dependencies, detect cycles,
 * and traverse the constraint graph in various ways.
 */

import type { ConstraintGraph } from './constraint-graph.js';

/**
 * Topological sort using Kahn's algorithm.
 * Returns event IDs in dependency order (dependencies first).
 *
 * @param graph The constraint graph to sort
 * @returns Array of event IDs in topological order
 * @throws Error if the graph contains a cycle
 */
export function topologicalSort(graph: ConstraintGraph): string[] {
  const events = graph.getAllEvents();
  const result: string[] = [];

  // Calculate in-degree for each node
  const inDegree = new Map<string, number>();
  for (const event of events) {
    inDegree.set(event.id, graph.getPredecessors(event.id).length);
  }

  // Queue of nodes with in-degree 0
  const queue: string[] = [];
  for (const event of events) {
    if (inDegree.get(event.id) === 0) {
      queue.push(event.id);
    }
  }

  // Process nodes
  while (queue.length > 0) {
    const eventId = queue.shift()!;
    result.push(eventId);

    // Reduce in-degree of successors
    const successors = graph.getSuccessors(eventId);
    for (const succId of successors) {
      const newInDegree = (inDegree.get(succId) || 0) - 1;
      inDegree.set(succId, newInDegree);

      if (newInDegree === 0) {
        queue.push(succId);
      }
    }
  }

  // If not all nodes were processed, there's a cycle
  if (result.length !== events.length) {
    throw new Error('Graph contains a cycle - topological sort not possible');
  }

  return result;
}

/**
 * Detect cycles in the constraint graph using DFS.
 * Returns an array of cycles, where each cycle is an array of event IDs.
 *
 * @param graph The constraint graph to check
 * @returns Array of cycles (each cycle is array of event IDs), or null if no cycles
 */
export function detectCycles(graph: ConstraintGraph): string[][] | null {
  const events = graph.getAllEvents();
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[][] = [];
  const path: string[] = [];

  function dfsVisit(eventId: string): boolean {
    visited.add(eventId);
    recursionStack.add(eventId);
    path.push(eventId);

    // Follow predecessors (dependencies) to detect cycles
    // If A depends on B, we go from A to B
    const predecessors = graph.getPredecessors(eventId);
    for (const predId of predecessors) {
      if (!visited.has(predId)) {
        if (dfsVisit(predId)) {
          return true;
        }
      } else if (recursionStack.has(predId)) {
        // Found a cycle - extract it from the path
        const cycleStartIndex = path.indexOf(predId);
        const cycle = path.slice(cycleStartIndex);
        cycles.push(cycle);
        return true;
      }
    }

    recursionStack.delete(eventId);
    path.pop();
    return false;
  }

  // Check each unvisited node
  for (const event of events) {
    if (!visited.has(event.id)) {
      dfsVisit(event.id);
    }
  }

  return cycles.length > 0 ? cycles : null;
}

/**
 * Find connected components in the constraint graph.
 * Returns an array of components, where each component is an array of event IDs.
 * This is useful for identifying anchored vs unanchored subgraphs.
 *
 * @param graph The constraint graph to analyze
 * @returns Array of components (each component is array of event IDs)
 */
export function findConnectedComponents(graph: ConstraintGraph): string[][] {
  const events = graph.getAllEvents();
  const visited = new Set<string>();
  const components: string[][] = [];

  function dfsComponent(eventId: string, component: string[]): void {
    visited.add(eventId);
    component.push(eventId);

    // Visit both predecessors and successors (treat as undirected)
    const neighbors = [
      ...graph.getPredecessors(eventId),
      ...graph.getSuccessors(eventId),
    ];

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        dfsComponent(neighborId, component);
      }
    }
  }

  // Find each connected component
  for (const event of events) {
    if (!visited.has(event.id)) {
      const component: string[] = [];
      dfsComponent(event.id, component);
      components.push(component);
    }
  }

  return components;
}

/**
 * Breadth-First Search traversal of the constraint graph.
 * Calls visitFn for each event visited, with the event ID and depth.
 *
 * @param graph The constraint graph to traverse
 * @param startEventId The ID of the event to start from
 * @param visitFn Function to call for each visited event
 */
export function bfs(
  graph: ConstraintGraph,
  startEventId: string,
  visitFn: (eventId: string, depth: number) => void
): void {
  if (!graph.hasEvent(startEventId)) {
    throw new Error(`Event ${startEventId} not found in graph`);
  }

  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [];

  queue.push({ id: startEventId, depth: 0 });
  visited.add(startEventId);

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    visitFn(id, depth);

    // Visit successors (events that depend on this one)
    const successors = graph.getSuccessors(id);
    for (const succId of successors) {
      if (!visited.has(succId)) {
        visited.add(succId);
        queue.push({ id: succId, depth: depth + 1 });
      }
    }
  }
}

/**
 * Depth-First Search traversal of the constraint graph.
 * Calls visitFn for each event visited.
 *
 * @param graph The constraint graph to traverse
 * @param startEventId The ID of the event to start from
 * @param visitFn Function to call for each visited event
 */
export function dfs(
  graph: ConstraintGraph,
  startEventId: string,
  visitFn: (eventId: string) => void
): void {
  if (!graph.hasEvent(startEventId)) {
    throw new Error(`Event ${startEventId} not found in graph`);
  }

  const visited = new Set<string>();

  function dfsVisit(eventId: string): void {
    visited.add(eventId);
    visitFn(eventId);

    // Visit successors (events that depend on this one)
    const successors = graph.getSuccessors(eventId);
    for (const succId of successors) {
      if (!visited.has(succId)) {
        dfsVisit(succId);
      }
    }
  }

  dfsVisit(startEventId);
}
