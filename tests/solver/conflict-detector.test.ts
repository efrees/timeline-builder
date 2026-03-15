/**
 * Tests for conflict detection
 */

import { describe, it, expect } from 'vitest';
import { detectConflicts, traceConflictChain, suggestResolution } from '../../src/solver/conflict-detector.js';
import { ConstraintGraph } from '../../src/solver/constraint-graph.js';
import { propagate } from '../../src/solver/propagator.js';
import type { Timeline, Event } from '../../src/types/timeline.js';
import type { Constraint } from '../../src/types/constraints.js';

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

describe('Conflict Detection', () => {
  describe('Cycle Detection', () => {
    it('should detect simple two-event cycle', () => {
      const events = [
        createEvent('a', 'Event A', [
          { type: 'after', targetEventId: 'b', confidence: 'high' },
        ]),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      const conflicts = detectConflicts(graph, result.ranges);

      expect(conflicts.hasConflicts).toBe(true);
      expect(conflicts.conflicts.length).toBeGreaterThan(0);
      expect(conflicts.conflicts[0].type).toBe('circular-dependency');
      expect(conflicts.conflicts[0].eventIds).toContain('a');
      expect(conflicts.conflicts[0].eventIds).toContain('b');
    });

    it('should detect three-event cycle', () => {
      const events = [
        createEvent('a', 'Event A', [
          { type: 'after', targetEventId: 'b', confidence: 'high' },
        ]),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'c', confidence: 'high' },
        ]),
        createEvent('c', 'Event C', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      const conflicts = detectConflicts(graph, result.ranges);

      expect(conflicts.hasConflicts).toBe(true);
      expect(conflicts.conflicts[0].type).toBe('circular-dependency');
    });

    it('should not detect cycles in acyclic graph', () => {
      const events = [
        createEvent('a', 'Event A', [
          { type: 'absolute', targetEventId: '', confidence: 'high', absoluteRange: {
            min: { year: 1900 },
            max: { year: 1900 },
            precision: 'year',
            anchored: true,
          }},
        ]),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
        createEvent('c', 'Event C', [
          { type: 'after', targetEventId: 'b', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      const conflicts = detectConflicts(graph, result.ranges);

      // Should not have cycle conflicts (might have other conflicts)
      const cycleConflicts = conflicts.conflicts.filter(c => c.type === 'circular-dependency');
      expect(cycleConflicts.length).toBe(0);
    });
  });

  describe('Empty Interval Detection', () => {
    it('should detect conflicting absolute dates', () => {
      const events = [
        createEvent('a', 'Event A', [
          { type: 'absolute', targetEventId: '', confidence: 'high', absoluteRange: {
            min: { year: 1950 },
            max: { year: 1950 },
            precision: 'year',
            anchored: true,
          }},
          { type: 'absolute', targetEventId: '', confidence: 'medium', absoluteRange: {
            min: { year: 1920 },
            max: { year: 1920 },
            precision: 'year',
            anchored: true,
          }},
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      const conflicts = detectConflicts(graph, result.ranges);

      expect(conflicts.hasConflicts).toBe(true);
      expect(conflicts.conflicts.some(c => c.type === 'impossible-range')).toBe(true);
    });

    it('should detect impossible "after" and "before" combination', () => {
      const events = [
        createEvent('ref', 'Reference Event', [
          { type: 'absolute', targetEventId: '', confidence: 'high', absoluteRange: {
            min: { year: 1920 },
            max: { year: 1920 },
            precision: 'year',
            anchored: true,
          }},
        ]),
        createEvent('conflict', 'Conflicting Event', [
          { type: 'after', targetEventId: 'ref', confidence: 'high', duration: {
            value: 10, unit: 'years', approximate: false,
          }},
          { type: 'before', targetEventId: 'ref', confidence: 'high', duration: {
            value: 5, unit: 'years', approximate: false,
          }},
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      const conflicts = detectConflicts(graph, result.ranges);

      expect(conflicts.hasConflicts).toBe(true);
      // Should detect that event must be both after 1920 and before 1920
      const impossibleConflicts = conflicts.conflicts.filter(c => c.type === 'impossible-range');
      expect(impossibleConflicts.length).toBeGreaterThan(0);
    });
  });

  describe('Conflict Tracing', () => {
    it('should trace constraint chain for an event', () => {
      const events = [
        createEvent('start', 'Start', [
          { type: 'absolute', targetEventId: '', confidence: 'high', absoluteRange: {
            min: { year: 1900 },
            max: { year: 1900 },
            precision: 'year',
            anchored: true,
          }},
        ]),
        createEvent('middle', 'Middle', [
          { type: 'after', targetEventId: 'start', confidence: 'high' },
        ]),
        createEvent('end', 'End', [
          { type: 'after', targetEventId: 'middle', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const chain = traceConflictChain('end', graph);

      expect(chain.path.length).toBeGreaterThan(1);
      expect(chain.path[0]).toBe('end');
      expect(chain.constraints.length).toBeGreaterThan(0);
    });
  });

  describe('Conflict Resolution Suggestions', () => {
    it('should suggest removing low-confidence constraints', () => {
      const conflict = {
        type: 'impossible-range' as const,
        eventIds: ['a'],
        constraints: [
          { type: 'after' as const, targetEventId: 'b', confidence: 'low' as const },
          { type: 'before' as const, targetEventId: 'c', confidence: 'high' as const },
        ],
        message: 'Test conflict',
      };

      const events = [
        createEvent('a', 'Event A'),
        createEvent('b', 'Event B'),
        createEvent('c', 'Event C'),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const suggestions = suggestResolution(conflict, graph);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('low-confidence'))).toBe(true);
    });

    it('should suggest breaking cycles at weakest link', () => {
      const conflict = {
        type: 'circular-dependency' as const,
        eventIds: ['a', 'b'],
        constraints: [
          { type: 'after' as const, targetEventId: 'b', confidence: 'low' as const },
          { type: 'after' as const, targetEventId: 'a', confidence: 'high' as const },
        ],
        message: 'Cycle detected',
      };

      const events = [
        createEvent('a', 'Event A'),
        createEvent('b', 'Event B'),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const suggestions = suggestResolution(conflict, graph);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('cycle'))).toBe(true);
    });
  });

  describe('No Conflicts', () => {
    it('should return empty conflicts for valid timeline', () => {
      const events = [
        createEvent('a', 'Event A', [
          { type: 'absolute', targetEventId: '', confidence: 'high', absoluteRange: {
            min: { year: 1900 },
            max: { year: 1900 },
            precision: 'year',
            anchored: true,
          }},
        ]),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high', duration: {
            value: 10, unit: 'years', approximate: false,
          }},
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      const conflicts = detectConflicts(graph, result.ranges);

      expect(conflicts.hasConflicts).toBe(false);
      expect(conflicts.conflicts.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty timeline', () => {
      const timeline = createTimeline([]);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      const conflicts = detectConflicts(graph, result.ranges);

      expect(conflicts.hasConflicts).toBe(false);
      expect(conflicts.conflicts.length).toBe(0);
    });

    it('should handle single event with no constraints', () => {
      const events = [createEvent('a', 'Event A')];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      const conflicts = detectConflicts(graph, result.ranges);

      expect(conflicts.hasConflicts).toBe(false);
    });
  });
});
