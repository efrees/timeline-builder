/**
 * Constraint types for timeline relationships
 */

import { Duration } from './time.js';

/**
 * Types of temporal constraints between events
 */
export type ConstraintType =
  | 'after' // Start after target's end (default)
  | 'before' // End before target's start (default)
  | 'start-after' // Start after target's start
  | 'end-after' // End after target's end
  | 'start-before' // Start before target's start
  | 'end-before' // End before target's end
  | 'during'; // Contained within target

/**
 * Confidence level for constraints
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Anchor point on an event (start or end)
 */
export type AnchorPoint = 'start' | 'end';

/**
 * A temporal constraint between events
 */
export interface Constraint {
  /** Type of constraint */
  type: ConstraintType;
  /** ID of the target event being referenced */
  targetEventId: string;
  /** Optional duration offset (e.g., "+ 3 years") */
  duration?: Duration;
  /** Confidence level of this constraint */
  confidence: ConfidenceLevel;
  /** Explicit anchor point (overrides defaults) */
  anchorPoint?: AnchorPoint;
  /** Theory this constraint belongs to (for alternative interpretations) */
  theoryId?: string;
}

/**
 * A duration constraint on an event
 */
export interface DurationConstraint {
  /** Duration specification */
  duration: Duration;
  /** Confidence level */
  confidence: ConfidenceLevel;
}
