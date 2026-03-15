/**
 * Constraint propagation engine for computing event date ranges.
 * Uses interval arithmetic and graph traversal to propagate temporal constraints.
 */

import type { TimeRange, Duration, TimePoint } from '../types/time.js';
import type { Constraint } from '../types/constraints.js';
import type { Event } from '../types/timeline.js';
import { ConstraintGraph } from './constraint-graph.js';
import { topologicalSort } from './graph-algorithms.js';
import * as interval from './interval.js';

/**
 * Result of a propagation operation
 */
export interface PropagationResult {
  /** Map of event ID to computed time range */
  ranges: Map<string, TimeRange>;
  /** Number of iterations performed */
  iterations: number;
  /** Whether the algorithm converged */
  converged: boolean;
  /** Any warnings or issues encountered */
  warnings: string[];
}

/**
 * Options for the propagation algorithm
 */
export interface PropagationOptions {
  /** Maximum number of iterations before giving up */
  maxIterations?: number;
  /** Theory ID to filter constraints by */
  theoryId?: string;
}

/**
 * Converts a TimePoint to days since epoch for arithmetic operations
 */
function timePointToDays(tp: TimePoint): number {
  return tp.year * 365 + ((tp.month ?? 1) - 1) * 30 + ((tp.day ?? 1) - 1);
}

/**
 * Converts days to a TimePoint
 */
function daysToTimePoint(days: number, precision: 'year' | 'month' | 'day'): TimePoint {
  const year = Math.floor(days / 365);
  const remainder = days - year * 365;
  const month = Math.floor(remainder / 30) + 1;
  const day = Math.floor(remainder % 30) + 1;

  const result: TimePoint = { year };

  if (precision !== 'year') {
    result.month = Math.max(1, Math.min(12, month));
  }

  if (precision === 'day') {
    result.day = Math.max(1, Math.min(31, day));
  }

  return result;
}

/**
 * Converts a Duration to days
 */
function durationToDays(duration: Duration): [number, number] {
  const multiplier = duration.unit === 'years' ? 365 : duration.unit === 'months' ? 30 : 1;

  if (typeof duration.value === 'number') {
    let days = duration.value * multiplier;
    // Add 20% margin for approximate durations
    if (duration.approximate) {
      const margin = days * 0.2;
      return [days - margin, days + margin];
    }
    return [days, days];
  } else {
    // Range duration
    let min = duration.value[0] * multiplier;
    let max = duration.value[1] * multiplier;
    // Add margin for approximate
    if (duration.approximate) {
      const margin = max * 0.2;
      min -= margin;
      max += margin;
    }
    return [min, max];
  }
}

/**
 * Initialize time ranges for all events.
 * Events with absolute constraints get their specified range.
 * All others get an infinite range that will be narrowed by propagation.
 */
function initializeRanges(graph: ConstraintGraph): Map<string, TimeRange> {
  const ranges = new Map<string, TimeRange>();
  const events = graph.getAllEvents();

  for (const event of events) {
    // Check for absolute constraint
    const absoluteConstraint = event.constraints.find((c) => c.type === 'absolute');

    if (absoluteConstraint && absoluteConstraint.absoluteRange) {
      // Use the absolute range directly
      ranges.set(event.id, { ...absoluteConstraint.absoluteRange });
    } else {
      // Initialize with very wide range (will be narrowed by constraints)
      // Use +/- 1 million years to avoid overflow when adding durations
      ranges.set(event.id, {
        min: { year: -1000000, month: 1, day: 1 },
        max: { year: 1000000, month: 12, day: 31 },
        precision: 'year',
        anchored: false,
      });
    }
  }

  return ranges;
}

/**
 * Apply a single constraint to narrow an event's range.
 *
 * @param referencedEventRange - The range of the event referenced in the constraint
 * @param currentEventRange - The range of the event being constrained
 * @param constraint - The constraint being applied
 * @param _currentEvent - The event being constrained (currently unused)
 * @returns The new constrained range or null if the constraint creates an empty interval
 *
 * Example: If event2 has constraint "after event1 + 10 years", then:
 *   - referencedEventRange is event1's range
 *   - currentEventRange is event2's range
 *   - constraint is the "after" constraint
 *   - Result: event2.min >= event1.max + 10 years
 */
function applyConstraint(
  referencedEventRange: TimeRange,
  currentEventRange: TimeRange,
  constraint: Constraint,
  _currentEvent: Event
): TimeRange | null {
  const precision = currentEventRange.precision;

  // Handle different constraint types
  switch (constraint.type) {
    case 'absolute':
      // Already handled in initialization
      return currentEventRange;

    case 'after': {
      // Current event starts after referenced event ends (+ optional duration)
      // current.min >= referenced.max + duration
      const referencedMaxDays = timePointToDays(referencedEventRange.max);
      const [durationMin] = constraint.duration ? durationToDays(constraint.duration) : [0, 0];

      const newMinDays = referencedMaxDays + durationMin;
      const newMin = daysToTimePoint(newMinDays, precision);

      let newRange: TimeRange = {
        ...currentEventRange,
        min: timePointToDays(newMin) > timePointToDays(currentEventRange.min) ? newMin : currentEventRange.min,
      };

      // If pushing min forward would create an empty interval, also extend max
      // This handles cases where the event has an unconstrained max that's too low
      if (interval.isEmpty(newRange)) {
        newRange = {
          ...newRange,
          max: newMin, // Extend max to at least match the new min
        };
      }

      return newRange;
    }

    case 'before': {
      // Current event ends before referenced event starts (- optional duration)
      // current.max <= referenced.min - duration
      const referencedMinDays = timePointToDays(referencedEventRange.min);
      const [durationMin] = constraint.duration ? durationToDays(constraint.duration) : [0, 0];

      const newMaxDays = referencedMinDays - durationMin;
      const newMax = daysToTimePoint(newMaxDays, precision);

      const newRange: TimeRange = {
        ...currentEventRange,
        max: timePointToDays(newMax) < timePointToDays(currentEventRange.max) ? newMax : currentEventRange.max,
      };

      return interval.isEmpty(newRange) ? null : newRange;
    }

    case 'start-after': {
      // Current event starts after referenced event starts (+ optional duration)
      // current.min >= referenced.min + duration
      const referencedMinDays = timePointToDays(referencedEventRange.min);
      const [durationMin] = constraint.duration ? durationToDays(constraint.duration) : [0, 0];

      const newMinDays = referencedMinDays + durationMin;
      const newMin = daysToTimePoint(newMinDays, precision);

      const newRange: TimeRange = {
        ...currentEventRange,
        min: timePointToDays(newMin) > timePointToDays(currentEventRange.min) ? newMin : currentEventRange.min,
      };

      return interval.isEmpty(newRange) ? null : newRange;
    }

    case 'end-after': {
      // Current event ends after referenced event ends (+ optional duration)
      // current.max >= referenced.max + duration (actually affects min for end times)
      const referencedMaxDays = timePointToDays(referencedEventRange.max);
      const [durationMin] = constraint.duration ? durationToDays(constraint.duration) : [0, 0];

      const newMinDays = referencedMaxDays + durationMin;
      const newMin = daysToTimePoint(newMinDays, precision);

      const newRange: TimeRange = {
        ...currentEventRange,
        min: timePointToDays(newMin) > timePointToDays(currentEventRange.min) ? newMin : currentEventRange.min,
      };

      return interval.isEmpty(newRange) ? null : newRange;
    }

    case 'start-before': {
      // Current event starts before referenced event starts (- optional duration)
      // current.min <= referenced.min - duration (actually affects max)
      const referencedMinDays = timePointToDays(referencedEventRange.min);
      const [durationMin] = constraint.duration ? durationToDays(constraint.duration) : [0, 0];

      const newMaxDays = referencedMinDays - durationMin;
      const newMax = daysToTimePoint(newMaxDays, precision);

      const newRange: TimeRange = {
        ...currentEventRange,
        max: timePointToDays(newMax) < timePointToDays(currentEventRange.max) ? newMax : currentEventRange.max,
      };

      return interval.isEmpty(newRange) ? null : newRange;
    }

    case 'end-before': {
      // Current event ends before referenced event ends (- optional duration)
      // current.max <= referenced.max - duration
      const referencedMaxDays = timePointToDays(referencedEventRange.max);
      const [durationMin] = constraint.duration ? durationToDays(constraint.duration) : [0, 0];

      const newMaxDays = referencedMaxDays - durationMin;
      const newMax = daysToTimePoint(newMaxDays, precision);

      const newRange: TimeRange = {
        ...currentEventRange,
        max: timePointToDays(newMax) < timePointToDays(currentEventRange.max) ? newMax : currentEventRange.max,
      };

      return interval.isEmpty(newRange) ? null : newRange;
    }

    case 'during': {
      // Current event is fully contained within referenced event
      // current.min >= referenced.min AND current.max <= referenced.max
      const containingRange: TimeRange = {
        min: referencedEventRange.min,
        max: referencedEventRange.max,
        precision: precision,
        anchored: referencedEventRange.anchored,
      };

      return interval.intersection(currentEventRange, containingRange);
    }

    default:
      return currentEventRange;
  }
}

/**
 * Apply duration constraint to narrow an event's range
 */
function applyDurationConstraint(range: TimeRange, event: Event): TimeRange | null {
  if (!event.durationConstraint) {
    return range;
  }

  const [, durationMax] = durationToDays(event.durationConstraint.duration);

  // Duration constraint: max = min + duration
  const minDays = timePointToDays(range.min);
  const maxDaysFromDuration = minDays + durationMax;
  const maxDaysFromRange = timePointToDays(range.max);

  // Use the tighter bound
  const newMaxDays = Math.min(maxDaysFromDuration, maxDaysFromRange);
  const newMax = daysToTimePoint(newMaxDays, range.precision);

  const newRange: TimeRange = {
    ...range,
    max: newMax,
  };

  return interval.isEmpty(newRange) ? null : newRange;
}

/**
 * Forward propagation: propagate constraints from dependencies to dependents
 */
function forwardPropagate(
  graph: ConstraintGraph,
  ranges: Map<string, TimeRange>
): { changed: boolean; warnings: string[] } {
  let changed = false;
  const warnings: string[] = [];

  try {
    // Process events in topological order (dependencies first)
    const order = topologicalSort(graph);

    for (const eventId of order) {
      const event = graph.getEvent(eventId);
      if (!event) continue;

      const currentRange = ranges.get(eventId);
      if (!currentRange) continue;

      let newRange = { ...currentRange };

      // Apply each constraint
      for (const constraint of event.constraints) {
        if (constraint.type === 'absolute') continue;

        const targetEvent = graph.getEvent(constraint.targetEventId);
        if (!targetEvent) {
          warnings.push(`Event ${eventId}: target event ${constraint.targetEventId} not found`);
          continue;
        }

        const targetRange = ranges.get(constraint.targetEventId);
        if (!targetRange) continue;

        // Apply the constraint (note: we're constraining eventId based on targetEventId)
        const constrainedRange = applyConstraint(targetRange, newRange, constraint, event);

        if (constrainedRange === null) {
          warnings.push(`Event ${eventId}: constraint to ${constraint.targetEventId} creates empty interval`);
          continue;
        }

        newRange = constrainedRange;
      }

      // Apply duration constraint if present
      const withDuration = applyDurationConstraint(newRange, event);
      if (withDuration) {
        newRange = withDuration;
      }

      // Check if range changed
      if (!rangesEqual(currentRange, newRange)) {
        ranges.set(eventId, newRange);
        changed = true;
      }
    }
  } catch (error) {
    // Topological sort throws on cycles - this will be caught by conflict detector
    warnings.push(`Cycle detected during forward propagation: ${error}`);
  }

  return { changed, warnings };
}

/**
 * Backward propagation: tighten bounds using successor constraints
 */
function backwardPropagate(
  graph: ConstraintGraph,
  ranges: Map<string, TimeRange>
): { changed: boolean; warnings: string[] } {
  let changed = false;
  const warnings: string[] = [];

  try {
    // Process events in reverse topological order
    const order = topologicalSort(graph).reverse();

    for (const eventId of order) {
      const event = graph.getEvent(eventId);
      if (!event) continue;

      const currentRange = ranges.get(eventId);
      if (!currentRange) continue;

      // For backward propagation, we need to look at successors
      // who have constraints that reference this event
      const successors = graph.getSuccessors(eventId);

      let newRange = { ...currentRange };

      for (const successorId of successors) {
        const successor = graph.getEvent(successorId);
        if (!successor) continue;

        const successorRange = ranges.get(successorId);
        if (!successorRange) continue;

        // Find constraints in successor that reference this event
        for (const constraint of successor.constraints) {
          if (constraint.targetEventId !== eventId) continue;

          // Apply constraint backward (tighten this event based on successor)
          const tightened = applyConstraintBackward(
            newRange,
            successorRange,
            constraint,
            successor
          );

          if (tightened) {
            newRange = tightened;
          }
        }
      }

      // Check if range changed
      if (!rangesEqual(currentRange, newRange)) {
        ranges.set(eventId, newRange);
        changed = true;
      }
    }
  } catch (error) {
    warnings.push(`Error during backward propagation: ${error}`);
  }

  return { changed, warnings };
}

/**
 * Apply a constraint backward to tighten the referenced event's range.
 *
 * In backward propagation, we use successor constraints to tighten bounds.
 * Example: If event2 has "after event1 + 10", then we know event1.max <= event2.min - 10
 *
 * @param referencedEventRange - The range of the event being tightened (the one referenced in constraint)
 * @param successorEventRange - The range of the successor event (the one with the constraint)
 * @param constraint - The constraint from successor to referenced
 * @param _successorEvent - The successor event (currently unused)
 */
function applyConstraintBackward(
  referencedEventRange: TimeRange,
  successorEventRange: TimeRange,
  constraint: Constraint,
  _successorEvent: Event
): TimeRange | null {
  const precision = referencedEventRange.precision;

  switch (constraint.type) {
    case 'after': {
      // Successor is after referenced: referenced.max <= successor.min - duration
      const successorMinDays = timePointToDays(successorEventRange.min);
      const [durationMin] = constraint.duration ? durationToDays(constraint.duration) : [0, 0];

      const newMaxDays = successorMinDays - durationMin;
      const newMax = daysToTimePoint(newMaxDays, precision);

      const newRange: TimeRange = {
        ...referencedEventRange,
        max: timePointToDays(newMax) < timePointToDays(referencedEventRange.max) ? newMax : referencedEventRange.max,
      };

      return interval.isEmpty(newRange) ? null : newRange;
    }

    case 'before': {
      // Successor is before referenced: referenced.min >= successor.max + duration
      const successorMaxDays = timePointToDays(successorEventRange.max);
      const [durationMin] = constraint.duration ? durationToDays(constraint.duration) : [0, 0];

      const newMinDays = successorMaxDays + durationMin;
      const newMin = daysToTimePoint(newMinDays, precision);

      const newRange: TimeRange = {
        ...referencedEventRange,
        min: timePointToDays(newMin) > timePointToDays(referencedEventRange.min) ? newMin : referencedEventRange.min,
      };

      return interval.isEmpty(newRange) ? null : newRange;
    }

    // For other constraint types, backward propagation is similar
    // For brevity, we handle the most common cases above
    default:
      return referencedEventRange;
  }
}

/**
 * Check if two time ranges are equal
 */
function rangesEqual(a: TimeRange, b: TimeRange): boolean {
  return (
    timePointToDays(a.min) === timePointToDays(b.min) &&
    timePointToDays(a.max) === timePointToDays(b.max)
  );
}

/**
 * Propagate constraints through the graph using fixed-point iteration.
 * Performs forward and backward propagation until convergence or max iterations.
 */
export function propagate(
  graph: ConstraintGraph,
  options: PropagationOptions = {}
): PropagationResult {
  const maxIterations = options.maxIterations ?? 100;
  const warnings: string[] = [];

  // Initialize ranges for all events
  const ranges = initializeRanges(graph);

  let iterations = 0;
  let converged = false;

  // Fixed-point iteration
  while (iterations < maxIterations) {
    iterations++;

    // Forward propagation
    const forwardResult = forwardPropagate(graph, ranges);
    warnings.push(...forwardResult.warnings);

    // Backward propagation
    const backwardResult = backwardPropagate(graph, ranges);
    warnings.push(...backwardResult.warnings);

    // Check for convergence (no changes in this iteration)
    if (!forwardResult.changed && !backwardResult.changed) {
      converged = true;
      break;
    }
  }

  if (!converged) {
    warnings.push(
      `Propagation did not converge after ${maxIterations} iterations. Results may be incomplete.`
    );
  }

  return {
    ranges,
    iterations,
    converged,
    warnings,
  };
}
