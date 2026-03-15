/**
 * Unified Solver API that coordinates constraint propagation, conflict detection,
 * and anchoring analysis into a single, easy-to-use interface.
 */

import type { Timeline, Conflict } from '../types/timeline.js';
import type { TimeRange } from '../types/time.js';
import { ConstraintGraph } from './constraint-graph.js';
import { propagate, type PropagationOptions, type PropagationResult } from './propagator.js';
import { detectConflicts, type ConflictDetectionResult } from './conflict-detector.js';
import { analyzeAnchoring, type AnchoringResult } from './anchoring.js';

/**
 * Options for the solver
 */
export interface SolverOptions {
  /** Maximum number of propagation iterations before giving up */
  maxIterations?: number;
  /** Theory ID to filter constraints by */
  theoryId?: string;
  /** Strict mode: fail on conflicts vs. return best-effort result */
  strictMode?: boolean;
}

/**
 * Result of a solve operation
 */
export interface SolverResult {
  /** Original timeline */
  timeline: Timeline;
  /** Computed date ranges for all events */
  ranges: Map<string, TimeRange>;
  /** Detected conflicts (may be empty) */
  conflicts: Conflict[];
  /** Anchoring analysis */
  anchoring: AnchoringResult;
  /** Propagation metadata */
  propagation: PropagationResult;
  /** Conflict detection result */
  conflictDetection: ConflictDetectionResult;
  /** Overall success (false if conflicts exist in strict mode) */
  success: boolean;
  /** All warnings from all components */
  warnings: string[];
}

/**
 * Main solver class that coordinates all solving components
 */
export class Solver {
  /**
   * Solve a timeline by propagating constraints and detecting conflicts.
   *
   * @param timeline The timeline to solve
   * @param options Solver options
   * @returns Complete solver result with ranges, conflicts, and metadata
   *
   * @example
   * ```typescript
   * const solver = new Solver();
   * const result = solver.solve(timeline);
   *
   * if (result.success) {
   *   console.log('Solved successfully!');
   *   for (const [eventId, range] of result.ranges) {
   *     console.log(`${eventId}: ${range.min.year} - ${range.max.year}`);
   *   }
   * } else {
   *   console.log('Conflicts detected:', result.conflicts);
   * }
   * ```
   */
  solve(timeline: Timeline, options: SolverOptions = {}): SolverResult {
    const warnings: string[] = [];

    // Step 1: Build constraint graph from timeline
    const graph = this.buildGraph(timeline, options.theoryId);

    // Step 2: Run anchoring analysis
    const anchoring = analyzeAnchoring(graph, timeline.metadata);
    warnings.push(...anchoring.warnings);

    // Step 3: Run constraint propagation
    const propagationOptions: PropagationOptions = {};
    if (options.maxIterations !== undefined) {
      propagationOptions.maxIterations = options.maxIterations;
    }
    if (options.theoryId !== undefined) {
      propagationOptions.theoryId = options.theoryId;
    }
    const propagation = propagate(graph, propagationOptions);
    warnings.push(...propagation.warnings);

    // Step 4: Detect conflicts
    const conflictDetection = detectConflicts(graph, propagation.ranges);
    warnings.push(...conflictDetection.warnings);

    // Step 5: Determine overall success
    const hasConflicts = conflictDetection.hasConflicts;
    const success = options.strictMode ? !hasConflicts : propagation.converged;

    return {
      timeline,
      ranges: propagation.ranges,
      conflicts: conflictDetection.conflicts,
      anchoring,
      propagation,
      conflictDetection,
      success,
      warnings,
    };
  }

  /**
   * Build a constraint graph from a timeline.
   * Optionally filter constraints by theory ID.
   */
  private buildGraph(timeline: Timeline, theoryId?: string): ConstraintGraph {
    // If no theory filtering, use timeline directly
    if (!theoryId) {
      return new ConstraintGraph(timeline);
    }

    // Filter timeline for specific theory
    const filteredEvents = new Map();

    for (const [id, event] of timeline.events) {
      // Skip events from other theories if theory filtering is enabled
      if (event.theoryId && event.theoryId !== theoryId) {
        continue;
      }

      // Filter constraints by theory
      const filteredConstraints = event.constraints.filter(
        (c: any) => !c.theoryId || c.theoryId === theoryId
      );

      const filteredEvent = {
        ...event,
        constraints: filteredConstraints,
      };

      filteredEvents.set(id, filteredEvent);
    }

    // Create filtered timeline
    const filteredTimeline = {
      ...timeline,
      events: filteredEvents,
    };

    return new ConstraintGraph(filteredTimeline as Timeline);
  }
}
