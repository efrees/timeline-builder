/**
 * Conflict detection and resolution for constraint solving.
 * Identifies unsatisfiable constraints and provides explanations.
 */

import type { Conflict } from '../types/timeline.js';
import type { Constraint } from '../types/constraints.js';
import type { TimeRange } from '../types/time.js';
import { ConstraintGraph } from './constraint-graph.js';
import { detectCycles } from './graph-algorithms.js';
import { isEmpty } from './interval.js';

/**
 * Result of conflict detection
 */
export interface ConflictDetectionResult {
  /** List of detected conflicts */
  conflicts: Conflict[];
  /** Whether the timeline has any conflicts */
  hasConflicts: boolean;
  /** Warnings or additional information */
  warnings: string[];
}

/**
 * Detect all conflicts in a constraint graph and computed ranges.
 */
export function detectConflicts(
  graph: ConstraintGraph,
  ranges: Map<string, TimeRange>
): ConflictDetectionResult {
  const conflicts: Conflict[] = [];
  const warnings: string[] = [];

  // 1. Detect cycles (circular dependencies)
  const cycles = detectCycles(graph);
  if (cycles) {
    for (const cycle of cycles) {
      conflicts.push(createCycleConflict(cycle, graph));
    }
  }

  // 2. Detect empty intervals (impossible ranges)
  for (const [eventId, range] of ranges.entries()) {
    if (isEmpty(range)) {
      const conflict = createEmptyIntervalConflict(eventId, range, graph);
      if (conflict) {
        conflicts.push(conflict);
      }
    }
  }

  // 3. Detect direct constraint conflicts
  const directConflicts = detectDirectConflicts(graph, ranges);
  conflicts.push(...directConflicts);

  return {
    conflicts,
    hasConflicts: conflicts.length > 0,
    warnings,
  };
}

/**
 * Create a conflict object for a circular dependency
 */
function createCycleConflict(cycle: string[], graph: ConstraintGraph): Conflict {
  const eventIds = cycle;
  const constraints: Constraint[] = [];

  // Collect constraints that form the cycle
  for (let i = 0; i < cycle.length; i++) {
    const eventId = cycle[i];
    const nextEventId = cycle[(i + 1) % cycle.length];

    if (!eventId || !nextEventId) continue;

    const event = graph.getEvent(eventId);
    if (event) {
      const constraintToNext = event.constraints.find(
        (c) => c.targetEventId === nextEventId
      );
      if (constraintToNext) {
        constraints.push(constraintToNext);
      }
    }
  }

  const cycleDescription = cycle.join(' → ') + ' → ' + cycle[0];

  return {
    type: 'circular-dependency',
    eventIds,
    constraints,
    message: `Circular dependency detected: ${cycleDescription}. Events cannot depend on themselves through a chain of constraints.`,
    suggestion: `Remove or modify one of the constraints to break the cycle. Consider constraints with lower confidence levels as candidates for removal.`,
  };
}

/**
 * Create a conflict object for an empty interval
 */
function createEmptyIntervalConflict(
  eventId: string,
  _range: TimeRange,
  graph: ConstraintGraph
): Conflict | null {
  const event = graph.getEvent(eventId);
  if (!event) return null;

  // Get all constraints that contributed to this event's range
  const constraints = event.constraints;

  return {
    type: 'impossible-range',
    eventIds: [eventId],
    constraints,
    message: `Event "${eventId}" has an impossible date range (min > max). The constraints cannot be simultaneously satisfied.`,
    suggestion: `Check the constraints for this event. One or more may be incorrect. Consider the confidence levels - constraints with lower confidence may be the source of the conflict.`,
  };
}

/**
 * Detect direct conflicts between constraints
 */
function detectDirectConflicts(
  graph: ConstraintGraph,
  ranges: Map<string, TimeRange>
): Conflict[] {
  const conflicts: Conflict[] = [];

  // Look for events with conflicting absolute constraints
  for (const event of graph.getAllEvents()) {
    const absoluteConstraints = event.constraints.filter((c) => c.type === 'absolute');

    if (absoluteConstraints.length > 1) {
      // Multiple absolute constraints - check if they overlap
      const ranges = absoluteConstraints
        .map((c) => c.absoluteRange)
        .filter((r): r is TimeRange => r !== undefined);

      if (ranges.length > 1) {
        // Check if all ranges overlap
        let hasConflict = false;
        for (let i = 0; i < ranges.length - 1; i++) {
          for (let j = i + 1; j < ranges.length; j++) {
            const rangeI = ranges[i];
            const rangeJ = ranges[j];
            if (!rangeI || !rangeJ) continue;

            const overlap = rangesOverlap(rangeI, rangeJ);
            if (!overlap) {
              hasConflict = true;
              break;
            }
          }
          if (hasConflict) break;
        }

        if (hasConflict) {
          conflicts.push({
            type: 'impossible-range',
            eventIds: [event.id],
            constraints: absoluteConstraints,
            message: `Event "${event.id}" has multiple absolute date constraints that do not overlap.`,
            suggestion: `Remove one of the absolute date constraints or adjust them to have overlapping ranges.`,
          });
        }
      }
    }

    // Check for obviously conflicting before/after constraints
    const afterConstraints = event.constraints.filter((c) => c.type === 'after');
    const beforeConstraints = event.constraints.filter((c) => c.type === 'before');

    for (const after of afterConstraints) {
      for (const before of beforeConstraints) {
        // If both reference the same event, check for conflict
        if (after.targetEventId === before.targetEventId) {
          const targetRange = ranges.get(after.targetEventId);
          if (targetRange) {
            // This event must be both after and before the same event - likely a conflict
            // (unless there are durations that make it possible)
            const afterDuration = getDurationInDays(after.duration);
            const beforeDuration = getDurationInDays(before.duration);

            if (afterDuration + beforeDuration > 0) {
              conflicts.push({
                type: 'impossible-range',
                eventIds: [event.id, after.targetEventId],
                constraints: [after, before],
                message: `Event "${event.id}" has conflicting constraints: must be both after and before "${after.targetEventId}".`,
                suggestion: `Review the "after" and "before" constraints. One may be incorrect or the durations may be incompatible.`,
              });
            }
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Check if two time ranges overlap
 */
function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  const aMinDays = timePointToDays(a.min);
  const aMaxDays = timePointToDays(a.max);
  const bMinDays = timePointToDays(b.min);
  const bMaxDays = timePointToDays(b.max);

  return !(aMaxDays < bMinDays || bMaxDays < aMinDays);
}

/**
 * Convert TimePoint to days
 */
function timePointToDays(tp: { year: number; month?: number; day?: number }): number {
  return tp.year * 365 + ((tp.month ?? 1) - 1) * 30 + ((tp.day ?? 1) - 1);
}

/**
 * Get duration in days (minimum value)
 */
function getDurationInDays(duration?: { value: number | [number, number]; unit: string }): number {
  if (!duration) return 0;

  const multiplier = duration.unit === 'years' ? 365 : duration.unit === 'months' ? 30 : 1;
  const value = typeof duration.value === 'number' ? duration.value : duration.value[0];

  return value * multiplier;
}

/**
 * Find the constraint chain leading to a conflict.
 * Useful for explaining transitive conflicts.
 */
export function traceConflictChain(
  eventId: string,
  graph: ConstraintGraph
): { path: string[]; constraints: Constraint[] } {
  const path: string[] = [eventId];
  const constraints: Constraint[] = [];
  const visited = new Set<string>();

  let current = eventId;

  while (true) {
    visited.add(current);

    const event = graph.getEvent(current);
    if (!event) break;

    // Follow the first constraint
    const constraint = event.constraints[0];
    if (!constraint || constraint.type === 'absolute') break;

    const next = constraint.targetEventId;
    if (!next || visited.has(next)) break;

    path.push(next);
    constraints.push(constraint);
    current = next;
  }

  return { path, constraints };
}

/**
 * Suggest resolutions for a conflict based on confidence levels
 */
export function suggestResolution(conflict: Conflict, _graph: ConstraintGraph): string[] {
  const suggestions: string[] = [];

  // Sort constraints by confidence level (low confidence first)
  const constraintsByConfidence = [...conflict.constraints].sort((a, b) => {
    const confidenceOrder = { low: 0, medium: 1, high: 2 };
    return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
  });

  // Suggest removing or adjusting low-confidence constraints
  const lowConfidence = constraintsByConfidence.filter((c) => c.confidence === 'low');
  if (lowConfidence.length > 0) {
    suggestions.push(
      `Consider removing or adjusting these low-confidence constraints: ${lowConfidence
        .map((c) => `${c.type} constraint`)
        .join(', ')}`
    );
  }

  // For cycles, suggest breaking at the weakest link
  if (conflict.type === 'circular-dependency' && constraintsByConfidence.length > 0) {
    const weakest = constraintsByConfidence[0];
    if (weakest) {
      suggestions.push(
        `To break the cycle, consider removing the ${weakest.type} constraint with ${weakest.confidence} confidence.`
      );
    }
  }

  // For impossible ranges, suggest checking the source
  if (conflict.type === 'impossible-range') {
    suggestions.push(
      `Review the source citations for these constraints. One may be based on incorrect historical data.`
    );
  }

  return suggestions;
}
