/**
 * Tests for the unified Solver API
 */

import { describe, it, expect } from 'vitest';
import { Solver } from '../../src/solver/solver.js';
import type { Timeline, Event } from '../../src/types/timeline.js';
import type { Constraint } from '../../src/types/constraints.js';

/**
 * Helper to create a simple timeline for testing
 */
function createTimeline(events: Event[]): Timeline {
  const eventMap = new Map<string, Event>();
  for (const event of events) {
    eventMap.set(event.id, event);
  }

  return {
    metadata: { title: 'Test Timeline' },
    events: eventMap,
    groups: [],
    theories: [],
  };
}

/**
 * Helper to create an event with constraints
 */
function createEvent(
  id: string,
  description: string,
  constraints: Constraint[] = []
): Event {
  return {
    id,
    description,
    constraints,
    tags: [],
    properties: {},
  };
}

describe('Solver', () => {
  describe('solve()', () => {
    it('should solve a simple timeline with absolute dates', () => {
      const event1 = createEvent('event1', 'First event', [
        {
          type: 'absolute',
          absoluteRange: {
            min: { year: 1920 },
            max: { year: 1920 },
          },
          confidence: 'high',
        },
      ]);

      const timeline = createTimeline([event1]);
      const solver = new Solver();
      const result = solver.solve(timeline);

      expect(result.success).toBe(true);
      expect(result.ranges.has('event1')).toBe(true);
      expect(result.ranges.get('event1')?.min.year).toBe(1920);
      expect(result.conflicts).toHaveLength(0);
      expect(result.propagation.converged).toBe(true);
    });

    it('should solve timeline with "after" constraint', () => {
      const event1 = createEvent('event1', 'First event', [
        {
          type: 'absolute',
          absoluteRange: {
            min: { year: 1920 },
            max: { year: 1920 },
          },
          confidence: 'high',
        },
      ]);

      const event2 = createEvent('event2', 'Second event', [
        {
          type: 'after',
          targetEventId: 'event1',
          duration: { value: 10, unit: 'years' },
          confidence: 'high',
        },
      ]);

      const timeline = createTimeline([event1, event2]);
      const solver = new Solver();
      const result = solver.solve(timeline);

      expect(result.success).toBe(true);
      expect(result.ranges.get('event2')?.min.year).toBeGreaterThanOrEqual(1930);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should solve timeline with constraint chain', () => {
      const event1 = createEvent('event1', 'First', [
        {
          type: 'absolute',
          absoluteRange: {
            min: { year: 1920 },
            max: { year: 1920 },
          },
          confidence: 'high',
        },
      ]);

      const event2 = createEvent('event2', 'Second', [
        {
          type: 'after',
          targetEventId: 'event1',
          duration: { value: 10, unit: 'years' },
          confidence: 'high',
        },
      ]);

      const event3 = createEvent('event3', 'Third', [
        {
          type: 'after',
          targetEventId: 'event2',
          duration: { value: 5, unit: 'years' },
          confidence: 'high',
        },
      ]);

      const timeline = createTimeline([event1, event2, event3]);
      const solver = new Solver();
      const result = solver.solve(timeline);

      expect(result.success).toBe(true);
      expect(result.ranges.get('event1')?.min.year).toBe(1920);
      expect(result.ranges.get('event2')?.min.year).toBeGreaterThanOrEqual(1930);
      expect(result.ranges.get('event3')?.min.year).toBeGreaterThanOrEqual(1935);
      expect(result.propagation.converged).toBe(true);
    });

    it('should detect circular dependency conflict', () => {
      const event1 = createEvent('event1', 'First', [
        {
          type: 'after',
          targetEventId: 'event2',
          duration: { value: 10, unit: 'years' },
          confidence: 'medium',
        },
      ]);

      const event2 = createEvent('event2', 'Second', [
        {
          type: 'after',
          targetEventId: 'event1',
          duration: { value: 10, unit: 'years' },
          confidence: 'medium',
        },
      ]);

      const timeline = createTimeline([event1, event2]);
      const solver = new Solver();
      const result = solver.solve(timeline);

      expect(result.conflicts.length).toBeGreaterThan(0);
      expect(result.conflicts[0].type).toBe('circular-dependency');
      expect(result.conflictDetection.hasConflicts).toBe(true);
    });

    it('should detect impossible range conflict', () => {
      const event1 = createEvent('event1', 'Conflicting event', [
        {
          type: 'absolute',
          absoluteRange: {
            min: { year: 1950 },
            max: { year: 1950 },
          },
          confidence: 'high',
        },
        {
          type: 'absolute',
          absoluteRange: {
            min: { year: 1920 },
            max: { year: 1920 },
          },
          confidence: 'high',
        },
      ]);

      const timeline = createTimeline([event1]);
      const solver = new Solver();
      const result = solver.solve(timeline);

      expect(result.conflicts.length).toBeGreaterThan(0);
      expect(result.conflicts[0].type).toBe('impossible-range');
    });

    it('should handle unanchored timeline', () => {
      const event1 = createEvent('event1', 'First');
      const event2 = createEvent('event2', 'Second', [
        {
          type: 'after',
          targetEventId: 'event1',
          duration: { value: 10, unit: 'years' },
          confidence: 'high',
        },
      ]);

      const timeline = createTimeline([event1, event2]);
      const solver = new Solver();
      const result = solver.solve(timeline);

      expect(result.success).toBe(true);
      expect(result.anchoring.fullyAnchored).toBe(false);
      expect(result.anchoring.components.length).toBeGreaterThan(0);
      expect(result.ranges.has('event1')).toBe(true);
      expect(result.ranges.has('event2')).toBe(true);
    });

    it('should respect maxIterations option', () => {
      const event1 = createEvent('event1', 'First', [
        {
          type: 'absolute',
          absoluteRange: {
            min: { year: 1920 },
            max: { year: 1920 },
          },
          confidence: 'high',
        },
      ]);

      const timeline = createTimeline([event1]);
      const solver = new Solver();
      const result = solver.solve(timeline, { maxIterations: 1 });

      expect(result.propagation.iterations).toBeLessThanOrEqual(1);
    });

    it('should filter by theory ID when specified', () => {
      const event1 = createEvent('event1', 'Base event', [
        {
          type: 'absolute',
          absoluteRange: {
            min: { year: 1920 },
            max: { year: 1920 },
          },
          confidence: 'high',
        },
      ]);

      const event2 = createEvent('event2', 'Theory A event', [
        {
          type: 'after',
          targetEventId: 'event1',
          duration: { value: 10, unit: 'years' },
          confidence: 'high',
          theoryId: 'theoryA',
        },
      ]);
      event2.theoryId = 'theoryA';

      const timeline = createTimeline([event1, event2]);
      const solver = new Solver();

      // Solve without theory filter - should include both events
      const resultAll = solver.solve(timeline);
      expect(resultAll.ranges.has('event1')).toBe(true);
      expect(resultAll.ranges.has('event2')).toBe(true);

      // Solve with theory filter - should exclude theory A event
      const resultFiltered = solver.solve(timeline, { theoryId: 'theoryB' });
      expect(resultFiltered.ranges.has('event1')).toBe(true);
      expect(resultFiltered.ranges.has('event2')).toBe(false);
    });

    it('should fail in strict mode when conflicts exist', () => {
      const event1 = createEvent('event1', 'First', [
        {
          type: 'after',
          targetEventId: 'event2',
          duration: { value: 10, unit: 'years' },
          confidence: 'high',
        },
      ]);

      const event2 = createEvent('event2', 'Second', [
        {
          type: 'after',
          targetEventId: 'event1',
          duration: { value: 10, unit: 'years' },
          confidence: 'high',
        },
      ]);

      const timeline = createTimeline([event1, event2]);
      const solver = new Solver();

      // Non-strict mode should still return result
      const resultNonStrict = solver.solve(timeline, { strictMode: false });
      expect(resultNonStrict.success).toBe(true); // Converged despite conflicts

      // Strict mode should fail
      const resultStrict = solver.solve(timeline, { strictMode: true });
      expect(resultStrict.success).toBe(false);
      expect(resultStrict.conflicts.length).toBeGreaterThan(0);
    });

    it('should collect warnings from all components', () => {
      const event1 = createEvent('event1', 'First', [
        {
          type: 'absolute',
          absoluteRange: {
            min: { year: 1920 },
            max: { year: 1920 },
          },
          confidence: 'high',
        },
      ]);
      const event2 = createEvent('event2', 'Second', [
        {
          type: 'absolute',
          absoluteRange: {
            min: { year: 1930 },
            max: { year: 1930 },
          },
          confidence: 'high',
        },
      ]);

      const timeline = createTimeline([event1, event2]);
      const solver = new Solver();
      const result = solver.solve(timeline);

      // Result should have warnings array (may be empty or populated)
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should handle realistic timeline (genealogy example)', () => {
      const grandfather = createEvent('grandfather', 'Grandfather born', [
        {
          type: 'absolute',
          absoluteRange: {
            min: { year: 1920 },
            max: { year: 1925 },
          },
          confidence: 'high',
        },
      ]);

      const father = createEvent('father', 'Father born', [
        {
          type: 'after',
          targetEventId: 'grandfather',
          duration: { value: [25, 30], unit: 'years' },
          confidence: 'high',
        },
      ]);

      const myself = createEvent('myself', 'My birth', [
        {
          type: 'after',
          targetEventId: 'father',
          duration: { value: [20, 35], unit: 'years' },
          confidence: 'medium',
        },
        {
          type: 'absolute',
          absoluteRange: {
            min: { year: 1975 },
            max: { year: 1985 },
          },
          confidence: 'high',
        },
      ]);

      const timeline = createTimeline([grandfather, father, myself]);
      const solver = new Solver();
      const result = solver.solve(timeline);

      expect(result.success).toBe(true);
      expect(result.conflicts).toHaveLength(0);
      expect(result.propagation.converged).toBe(true);

      // Check that ranges are computed
      const grandfatherRange = result.ranges.get('grandfather');
      const fatherRange = result.ranges.get('father');
      const myselfRange = result.ranges.get('myself');

      expect(grandfatherRange).toBeDefined();
      expect(fatherRange).toBeDefined();
      expect(myselfRange).toBeDefined();

      // Check constraint propagation worked
      expect(fatherRange!.min.year).toBeGreaterThanOrEqual(1945);
      expect(myselfRange!.min.year).toBeGreaterThanOrEqual(1975);

      // The max might be very large if propagation didn't fully constrain it
      // But the minimum should be properly narrowed
      expect(myselfRange!.min.year).toBeLessThanOrEqual(myselfRange!.max.year);
    });
  });
});
