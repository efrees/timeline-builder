/**
 * Constraint graph data structure for representing temporal relationships
 * between events in a timeline.
 */

import type { Timeline, Event } from '../types/timeline.js';
import type { Constraint } from '../types/constraints.js';

/**
 * ConstraintGraph represents temporal relationships between events.
 *
 * Nodes: Events
 * Edges: Constraints (directed based on dependency)
 *
 * Edge direction convention: "eventB after eventA" creates edge B → A
 * (B depends on A, so edge points from dependent to dependency)
 */
export class ConstraintGraph {
  /** Map of event ID to Event object */
  private events: Map<string, Event>;

  /** Map of event ID to its constraints */
  private constraints: Map<string, Constraint[]>;

  /** Map of event ID to IDs of events that depend on it (successors) */
  private successors: Map<string, Set<string>>;

  /** Map of event ID to IDs of events it depends on (predecessors) */
  private predecessors: Map<string, Set<string>>;

  /**
   * Construct a constraint graph from a Timeline
   */
  constructor(timeline: Timeline) {
    this.events = new Map();
    this.constraints = new Map();
    this.successors = new Map();
    this.predecessors = new Map();

    // Add all events
    for (const [id, event] of timeline.events) {
      this.addEvent(event);
    }
  }

  /**
   * Add an event to the graph
   */
  addEvent(event: Event): void {
    this.events.set(event.id, event);

    if (!this.constraints.has(event.id)) {
      this.constraints.set(event.id, []);
    }

    if (!this.successors.has(event.id)) {
      this.successors.set(event.id, new Set());
    }

    if (!this.predecessors.has(event.id)) {
      this.predecessors.set(event.id, new Set());
    }

    // Add constraints from this event
    for (const constraint of event.constraints) {
      this.addConstraint(constraint);
    }
  }

  /**
   * Remove an event from the graph
   */
  removeEvent(eventId: string): void {
    if (!this.events.has(eventId)) {
      return;
    }

    // Remove all constraints associated with this event
    const constraintsToRemove = this.constraints.get(eventId) || [];
    for (const constraint of constraintsToRemove) {
      this.removeConstraintInternal(eventId, constraint);
    }

    // Remove this event from successors of its predecessors
    const preds = this.predecessors.get(eventId) || new Set();
    for (const predId of preds) {
      this.successors.get(predId)?.delete(eventId);
    }

    // Remove this event from predecessors of its successors
    const succs = this.successors.get(eventId) || new Set();
    for (const succId of succs) {
      this.predecessors.get(succId)?.delete(eventId);
    }

    // Delete from all maps
    this.events.delete(eventId);
    this.constraints.delete(eventId);
    this.successors.delete(eventId);
    this.predecessors.delete(eventId);
  }

  /**
   * Check if an event exists in the graph
   */
  hasEvent(eventId: string): boolean {
    return this.events.has(eventId);
  }

  /**
   * Get an event by ID
   */
  getEvent(eventId: string): Event | undefined {
    return this.events.get(eventId);
  }

  /**
   * Get all events in the graph
   */
  getAllEvents(): Event[] {
    return Array.from(this.events.values());
  }

  /**
   * Add a constraint to the graph
   * The constraint is added to the source event (the one that owns the constraint)
   * and creates edges in the graph based on the constraint type.
   *
   * @param constraint The constraint to add
   * @param sourceEventId Optional source event ID if not adding from event's constraints array
   */
  addConstraint(constraint: Constraint, sourceEventId?: string): void {
    // Determine the source event (the event that has this constraint)
    let sourceId = sourceEventId;

    if (!sourceId) {
      // Find which event has this constraint
      for (const [eventId, event] of this.events) {
        if (event.constraints.includes(constraint)) {
          sourceId = eventId;
          break;
        }
      }
    }

    if (!sourceId) {
      // Cannot add constraint without knowing the source event
      return;
    }

    // Add constraint to the source event's constraint list
    const constraintList = this.constraints.get(sourceId);
    if (constraintList && !constraintList.includes(constraint)) {
      constraintList.push(constraint);
    }

    // Create edges based on constraint type
    // Edge direction: dependent → dependency
    // "eventB after eventA" means B depends on A, so edge B → A

    const targetId = constraint.targetEventId;

    // Skip absolute constraints (no target event)
    if (constraint.type === 'absolute' || !targetId || targetId === '') {
      return;
    }

    // Only create edges if target event exists
    if (!this.events.has(targetId)) {
      return;
    }

    // For all relative constraints, source depends on target
    // So add edge: source → target
    this.predecessors.get(sourceId)?.add(targetId);
    this.successors.get(targetId)?.add(sourceId);
  }

  /**
   * Remove a constraint from the graph
   * @param constraintId A unique identifier for the constraint (not implemented yet)
   */
  removeConstraint(constraintId: string): void {
    // Note: Constraints don't have IDs in the current type system
    // This would require enhancing the Constraint type to include an id field
    // For now, this is a placeholder that doesn't do anything

    // TODO: Once Constraint type has an id field, implement this properly
  }

  /**
   * Internal method to remove a constraint given the source event and constraint object
   */
  private removeConstraintInternal(sourceEventId: string, constraint: Constraint): void {
    // Remove from constraint list
    const constraintList = this.constraints.get(sourceEventId);
    if (constraintList) {
      const index = constraintList.indexOf(constraint);
      if (index > -1) {
        constraintList.splice(index, 1);
      }
    }

    // Remove edges
    const targetId = constraint.targetEventId;
    if (constraint.type !== 'absolute' && targetId && targetId !== '') {
      this.predecessors.get(sourceEventId)?.delete(targetId);
      this.successors.get(targetId)?.delete(sourceEventId);
    }
  }

  /**
   * Get all constraints for an event
   */
  getConstraints(eventId: string): Constraint[] {
    return this.constraints.get(eventId) || [];
  }

  /**
   * Get predecessor event IDs (events this event depends on)
   */
  getPredecessors(eventId: string): string[] {
    const preds = this.predecessors.get(eventId);
    return preds ? Array.from(preds) : [];
  }

  /**
   * Get successor event IDs (events that depend on this event)
   */
  getSuccessors(eventId: string): string[] {
    const succs = this.successors.get(eventId);
    return succs ? Array.from(succs) : [];
  }

  /**
   * Filter the graph to include only events and constraints from a specific theory.
   * If theoryId is undefined, returns events not associated with any theory.
   *
   * @param theoryId Optional theory ID to filter by
   * @returns A new ConstraintGraph containing only filtered events
   */
  filterByTheory(theoryId?: string): ConstraintGraph {
    // Create an empty timeline for the filtered graph
    const filteredTimeline: Timeline = {
      metadata: {},
      events: new Map(),
      groups: [],
      theories: [],
    };

    // Filter events by theory
    for (const [id, event] of this.events) {
      if (theoryId === undefined) {
        // Include events with no theory
        if (!event.theoryId) {
          filteredTimeline.events.set(id, event);
        }
      } else {
        // Include events with matching theory
        if (event.theoryId === theoryId) {
          filteredTimeline.events.set(id, event);
        }
      }
    }

    // Create new graph from filtered timeline
    return new ConstraintGraph(filteredTimeline);
  }
}
