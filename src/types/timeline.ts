/**
 * Core timeline data model types
 */

import { Constraint, DurationConstraint } from './constraints.js';
import { TimeRange } from './time.js';

/**
 * An event in the timeline
 */
export interface Event {
  /** Unique identifier for this event */
  id: string;
  /** Human-readable description */
  description: string;
  /** All temporal constraints on this event */
  constraints: Constraint[];
  /** Optional duration constraint */
  durationConstraint?: DurationConstraint;
  /** Tags for categorization (e.g., ["family", "travel"]) */
  tags: string[];
  /** Arbitrary properties (source, note, etc.) */
  properties: Record<string, unknown>;
  /** Optional group membership */
  group?: string;
  /** Optional theory association */
  theoryId?: string;
}

/**
 * A group of related events
 */
export interface Group {
  /** Unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** IDs of events in this group */
  eventIds: Set<string>;
  /** Optional parent group (for nested groups) */
  parentGroupId?: string;
  /** Optional properties */
  properties?: Record<string, unknown>;
}

/**
 * A theory representing an alternative interpretation
 */
export interface Theory {
  /** Unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** IDs of events specific to this theory */
  eventIds: Set<string>;
  /** Optional description */
  description?: string;
}

/**
 * Metadata for a timeline
 */
export interface Metadata {
  /** Timeline title */
  title?: string;
  /** Reference event ID (for unanchored timelines) */
  reference?: string;
  /** Description of the timeline */
  description?: string;
  /** Tag color definitions */
  tagColors?: Record<string, string>;
  /** Other arbitrary metadata */
  [key: string]: unknown;
}

/**
 * A complete timeline with events, constraints, and metadata
 */
export interface Timeline {
  /** Timeline metadata from frontmatter */
  metadata: Metadata;
  /** Map of event ID to Event object */
  events: Map<string, Event>;
  /** Groups of events */
  groups: Group[];
  /** Alternative theories/scenarios */
  theories: Theory[];
}

/**
 * A conflict detected during constraint solving
 */
export interface Conflict {
  /** Type of conflict */
  type: 'impossible-range' | 'circular-dependency' | 'theory-conflict';
  /** Event IDs involved in the conflict */
  eventIds: string[];
  /** Constraints involved in the conflict */
  constraints: Constraint[];
  /** Human-readable explanation */
  message: string;
  /** Optional suggestion for resolution */
  suggestion?: string;
}

/**
 * Metadata from the solver
 */
export interface SolveMetadata {
  /** Number of propagation iterations performed */
  iterations: number;
  /** Whether the solver converged */
  converged: boolean;
  /** Active theories during solving */
  activeTheories: string[];
  /** Timestamp when solved */
  solvedAt: Date;
}

/**
 * A timeline with solved constraints and computed ranges
 */
export interface SolvedTimeline {
  /** Original timeline */
  timeline: Timeline;
  /** Map of event ID to computed time range */
  ranges: Map<string, TimeRange>;
  /** Detected conflicts (may be empty) */
  conflicts: Conflict[];
  /** Solver metadata */
  metadata: SolveMetadata;
}
