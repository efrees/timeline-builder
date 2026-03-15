/**
 * Tests for constraint propagation engine
 */

import { describe, it, expect } from 'vitest';
import { propagate } from '../../src/solver/propagator.js';
import { ConstraintGraph } from '../../src/solver/constraint-graph.js';
import type { Timeline, Event } from '../../src/types/timeline.js';
import type { Constraint } from '../../src/types/constraints.js';
import type { TimeRange } from '../../src/types/time.js';

/**
 * Helper to create a basic timeline for testing
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
 * Helper to create an event
 */
function createEvent(id: string, description: string, constraints: Constraint[] = []): Event {
  return {
    id,
    description,
    constraints,
    tags: [],
    properties: {},
  };
}

/**
 * Helper to create an absolute constraint
 */
function createAbsoluteConstraint(year: number): Constraint {
  return {
    type: 'absolute',
    targetEventId: '',
    confidence: 'high',
    absoluteRange: {
      min: { year, month: 1, day: 1 },
      max: { year, month: 12, day: 31 },
      precision: 'year',
      anchored: true,
    },
  };
}

/**
 * Helper to create an 'after' constraint
 */
function createAfterConstraint(targetId: string, years?: number): Constraint {
  return {
    type: 'after',
    targetEventId: targetId,
    confidence: 'high',
    duration: years
      ? { value: years, unit: 'years', approximate: false }
      : undefined,
  };
}

/**
 * Helper to create a 'before' constraint
 */
function createBeforeConstraint(targetId: string, years?: number): Constraint {
  return {
    type: 'before',
    targetEventId: targetId,
    confidence: 'high',
    duration: years
      ? { value: years, unit: 'years', approximate: false }
      : undefined,
  };
}

/**
 * Helper to create a 'during' constraint
 */
function createDuringConstraint(targetId: string): Constraint {
  return {
    type: 'during',
    targetEventId: targetId,
    confidence: 'high',
  };
}

describe('Constraint Propagation Engine', () => {
  describe('Basic Propagation', () => {
    it('should handle a single event with absolute date', () => {
      const events = [
        createEvent('event1', 'Event 1', [createAbsoluteConstraint(1920)]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);
      expect(result.ranges.size).toBe(1);

      const range = result.ranges.get('event1');
      expect(range).toBeDefined();
      expect(range?.min.year).toBe(1920);
      expect(range?.max.year).toBe(1920);
    });

    it('should propagate "after" constraint forward', () => {
      const events = [
        createEvent('event1', 'Event 1', [createAbsoluteConstraint(1920)]),
        createEvent('event2', 'Event 2', [createAfterConstraint('event1')]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);

      const event1Range = result.ranges.get('event1');
      const event2Range = result.ranges.get('event2');

      expect(event1Range?.min.year).toBe(1920);
      expect(event2Range?.min.year).toBeGreaterThanOrEqual(1920);
    });

    it('should propagate "after" constraint with duration', () => {
      const events = [
        createEvent('event1', 'Event 1', [createAbsoluteConstraint(1920)]),
        createEvent('event2', 'Event 2', [createAfterConstraint('event1', 5)]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);

      const event2Range = result.ranges.get('event2');
      // Event2 should be at least 5 years after event1's max (1920)
      expect(event2Range?.min.year).toBeGreaterThanOrEqual(1925);
    });

    it('should propagate "before" constraint forward', () => {
      const events = [
        createEvent('event1', 'Event 1', [createAbsoluteConstraint(1920)]),
        createEvent('event2', 'Event 2', [createBeforeConstraint('event1')]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);

      const event2Range = result.ranges.get('event2');
      // Event2 should end before event1 starts (1920)
      expect(event2Range?.max.year).toBeLessThanOrEqual(1920);
    });

    it('should handle "during" constraint', () => {
      const events = [
        createEvent('parent', 'Parent Event', [createAbsoluteConstraint(1920)]),
        createEvent('child', 'Child Event', [createDuringConstraint('parent')]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);

      const parentRange = result.ranges.get('parent');
      const childRange = result.ranges.get('child');

      // Child should be contained within parent
      expect(childRange?.min.year).toBeGreaterThanOrEqual(parentRange?.min.year ?? 0);
      expect(childRange?.max.year).toBeLessThanOrEqual(parentRange?.max.year ?? 0);
    });
  });

  describe('Chain Propagation', () => {
    it('should propagate through a chain of events', () => {
      const events = [
        createEvent('event1', 'Event 1', [createAbsoluteConstraint(1900)]),
        createEvent('event2', 'Event 2', [createAfterConstraint('event1', 10)]),
        createEvent('event3', 'Event 3', [createAfterConstraint('event2', 5)]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);

      const event1Range = result.ranges.get('event1');
      const event2Range = result.ranges.get('event2');
      const event3Range = result.ranges.get('event3');

      expect(event1Range?.min.year).toBe(1900);
      expect(event2Range?.min.year).toBeGreaterThanOrEqual(1910);
      expect(event3Range?.min.year).toBeGreaterThanOrEqual(1915);
    });

    it('should handle complex constraint chains', () => {
      const events = [
        createEvent('start', 'Start Event', [createAbsoluteConstraint(1900)]),
        createEvent('end', 'End Event', [createAbsoluteConstraint(1950)]),
        createEvent('middle', 'Middle Event', [
          createAfterConstraint('start', 10),
          createBeforeConstraint('end', 10),
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);

      const middleRange = result.ranges.get('middle');

      // Middle should be after start + 10 (>= 1910)
      expect(middleRange?.min.year).toBeGreaterThanOrEqual(1910);
      // Middle should be before end - 10 (<= 1940)
      expect(middleRange?.max.year).toBeLessThanOrEqual(1940);
    });
  });

  describe('Backward Propagation', () => {
    it('should tighten bounds using backward propagation', () => {
      const events = [
        createEvent('event1', 'Event 1', [createAbsoluteConstraint(1900)]),
        createEvent('event2', 'Event 2', [
          createAfterConstraint('event1', 10),
          createBeforeConstraint('event1', 50),
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);

      const event2Range = result.ranges.get('event2');

      // Forward: event2.min >= 1910
      // Backward: event2.max <= 1850 (before 1900 - 50)
      // But this creates a conflict, so range might be empty or warning issued
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Convergence', () => {
    it('should converge for simple timelines', () => {
      const events = [
        createEvent('event1', 'Event 1', [createAbsoluteConstraint(1920)]),
        createEvent('event2', 'Event 2', [createAfterConstraint('event1')]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);
      expect(result.iterations).toBeGreaterThan(0);
      expect(result.iterations).toBeLessThan(10);
    });

    it('should respect max iterations', () => {
      const events = [
        createEvent('event1', 'Event 1', [createAbsoluteConstraint(1920)]),
        createEvent('event2', 'Event 2', [createAfterConstraint('event1')]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph, { maxIterations: 1 });

      expect(result.iterations).toBeLessThanOrEqual(1);
    });
  });

  describe('Duration Constraints', () => {
    it('should apply duration constraint to event', () => {
      const event = createEvent('event1', 'Event 1', [createAbsoluteConstraint(1920)]);
      event.durationConstraint = {
        duration: { value: 10, unit: 'years', approximate: false },
        confidence: 'high',
      };

      const timeline = createTimeline([event]);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);

      const range = result.ranges.get('event1');
      // Duration constraint: max = min + 10 years
      expect(range?.max.year).toBeLessThanOrEqual(range?.min.year ?? 0 + 10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty timeline', () => {
      const timeline = createTimeline([]);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);
      expect(result.ranges.size).toBe(0);
      expect(result.iterations).toBeGreaterThan(0);
    });

    it('should handle single event with no constraints', () => {
      const events = [createEvent('event1', 'Event 1', [])];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);
      expect(result.ranges.size).toBe(1);

      const range = result.ranges.get('event1');
      // Should have infinite range (no constraints)
      expect(range).toBeDefined();
    });

    it('should handle missing target event', () => {
      const events = [
        createEvent('event1', 'Event 1', [createAfterConstraint('nonexistent')]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      // Should complete with warnings
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('not found');
    });
  });

  describe('Multiple Constraints', () => {
    it('should narrow range with multiple constraints', () => {
      const events = [
        createEvent('anchor1', 'Anchor 1', [createAbsoluteConstraint(1900)]),
        createEvent('anchor2', 'Anchor 2', [createAbsoluteConstraint(1950)]),
        createEvent('middle', 'Middle Event', [
          createAfterConstraint('anchor1'),
          createBeforeConstraint('anchor2'),
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);

      const middleRange = result.ranges.get('middle');

      // Should be narrowed by both constraints
      expect(middleRange?.min.year).toBeGreaterThanOrEqual(1900);
      expect(middleRange?.max.year).toBeLessThanOrEqual(1950);
    });
  });

  describe('Precision Handling', () => {
    it('should preserve precision from absolute constraints', () => {
      const events = [
        createEvent('event1', 'Event 1', [
          {
            type: 'absolute',
            targetEventId: '',
            confidence: 'high',
            absoluteRange: {
              min: { year: 1920, month: 6, day: 15 },
              max: { year: 1920, month: 6, day: 15 },
              precision: 'day',
              anchored: true,
            },
          },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      const range = result.ranges.get('event1');
      expect(range?.precision).toBe('day');
      expect(range?.min.month).toBe(6);
      expect(range?.min.day).toBe(15);
    });
  });

  describe('Integration Tests', () => {
    it('should solve a realistic genealogy timeline', () => {
      const events = [
        createEvent('jacobBorn', 'Jacob born', [createAbsoluteConstraint(1920)]),
        createEvent('josephBorn', 'Joseph born', [
          createAfterConstraint('jacobBorn', 30),
        ]),
        createEvent('josephSold', 'Joseph sold into slavery', [
          createAfterConstraint('josephBorn', 17),
        ]),
        createEvent('famine', 'Seven years of famine', [
          createAfterConstraint('josephSold', 13),
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      expect(result.converged).toBe(true);
      expect(result.warnings.length).toBe(0);

      // Verify the chain propagated correctly
      const jacobRange = result.ranges.get('jacobBorn');
      const josephBornRange = result.ranges.get('josephBorn');
      const josephSoldRange = result.ranges.get('josephSold');
      const famineRange = result.ranges.get('famine');

      expect(jacobRange?.min.year).toBe(1920);
      expect(josephBornRange?.min.year).toBeGreaterThanOrEqual(1950);
      expect(josephSoldRange?.min.year).toBeGreaterThanOrEqual(1967);
      expect(famineRange?.min.year).toBeGreaterThanOrEqual(1980);
    });
  });
});
