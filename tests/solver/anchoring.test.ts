/**
 * Tests for anchoring system
 */

import { describe, it, expect } from 'vitest';
import {
  findAnchors,
  analyzeComponents,
  chooseReferenceEvent,
  analyzeAnchoring,
  toRelativeTime,
  isEventAnchored,
  getStrongestAnchor,
} from '../../src/solver/anchoring.js';
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

/**
 * Helper to create absolute constraint
 */
function createAbsoluteConstraint(year: number, confidence: 'high' | 'medium' | 'low' = 'high'): Constraint {
  return {
    type: 'absolute',
    targetEventId: '',
    confidence,
    absoluteRange: {
      min: { year, month: 1, day: 1 },
      max: { year, month: 12, day: 31 },
      precision: 'year',
      anchored: true,
    },
  };
}

describe('Anchoring System', () => {
  describe('Finding Anchors', () => {
    it('should find anchored events', () => {
      const events = [
        createEvent('a', 'Event A', [createAbsoluteConstraint(1920)]),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const anchors = findAnchors(graph);

      expect(anchors.length).toBe(1);
      expect(anchors[0].eventId).toBe('a');
      expect(anchors[0].range.min.year).toBe(1920);
      expect(anchors[0].confidence).toBe('high');
    });

    it('should find multiple anchors', () => {
      const events = [
        createEvent('a', 'Event A', [createAbsoluteConstraint(1920)]),
        createEvent('b', 'Event B', [createAbsoluteConstraint(1950)]),
        createEvent('c', 'Event C', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const anchors = findAnchors(graph);

      expect(anchors.length).toBe(2);
      expect(anchors.map((a) => a.eventId)).toContain('a');
      expect(anchors.map((a) => a.eventId)).toContain('b');
    });

    it('should return empty array for unanchored timeline', () => {
      const events = [
        createEvent('a', 'Event A', []),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const anchors = findAnchors(graph);

      expect(anchors.length).toBe(0);
    });
  });

  describe('Component Analysis', () => {
    it('should identify anchored component', () => {
      const events = [
        createEvent('a', 'Event A', [createAbsoluteConstraint(1920)]),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const components = analyzeComponents(graph);

      expect(components.length).toBe(1);
      expect(components[0].isAnchored).toBe(true);
      expect(components[0].anchors.length).toBe(1);
      expect(components[0].referenceEventId).toBeUndefined();
    });

    it('should identify unanchored component', () => {
      const events = [
        createEvent('a', 'Event A', []),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const components = analyzeComponents(graph);

      expect(components.length).toBe(1);
      expect(components[0].isAnchored).toBe(false);
      expect(components[0].anchors.length).toBe(0);
      expect(components[0].referenceEventId).toBeDefined();
    });

    it('should identify multiple disconnected components', () => {
      const events = [
        // First component (anchored)
        createEvent('a', 'Event A', [createAbsoluteConstraint(1920)]),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
        // Second component (unanchored)
        createEvent('c', 'Event C', []),
        createEvent('d', 'Event D', [
          { type: 'after', targetEventId: 'c', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const components = analyzeComponents(graph);

      expect(components.length).toBe(2);

      const anchoredComponent = components.find((c) => c.isAnchored);
      const unanchoredComponent = components.find((c) => !c.isAnchored);

      expect(anchoredComponent).toBeDefined();
      expect(unanchoredComponent).toBeDefined();
      expect(anchoredComponent?.eventIds.length).toBe(2);
      expect(unanchoredComponent?.eventIds.length).toBe(2);
    });

    it('should handle component with multiple anchors', () => {
      const events = [
        createEvent('a', 'Event A', [createAbsoluteConstraint(1920)]),
        createEvent('b', 'Event B', [
          createAbsoluteConstraint(1950),
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const components = analyzeComponents(graph);

      expect(components.length).toBe(1);
      expect(components[0].isAnchored).toBe(true);
      expect(components[0].anchors.length).toBe(2);
    });
  });

  describe('Reference Event Selection', () => {
    it('should use metadata reference if specified', () => {
      const events = [
        createEvent('a', 'Event A', []),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
        createEvent('preferred', 'Preferred Event', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const components = analyzeComponents(graph);
      const component = components[0];

      const referenceId = chooseReferenceEvent(
        component,
        graph,
        { reference: 'preferred' }
      );

      expect(referenceId).toBe('preferred');
    });

    it('should use first event if no metadata reference', () => {
      const events = [
        createEvent('a', 'Event A', []),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const components = analyzeComponents(graph);
      const component = components[0];

      const referenceId = chooseReferenceEvent(component, graph, {});

      expect(referenceId).toBe(component.eventIds[0]);
    });

    it('should ignore metadata reference not in component', () => {
      const events = [
        createEvent('a', 'Event A', []),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const components = analyzeComponents(graph);
      const component = components[0];

      const referenceId = chooseReferenceEvent(
        component,
        graph,
        { reference: 'nonexistent' }
      );

      // Should fall back to first event
      expect(referenceId).toBe(component.eventIds[0]);
    });
  });

  describe('Full Anchoring Analysis', () => {
    it('should analyze fully anchored timeline', () => {
      const events = [
        createEvent('a', 'Event A', [createAbsoluteConstraint(1920)]),
        createEvent('b', 'Event B', [
          createAbsoluteConstraint(1950),
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const result = analyzeAnchoring(graph);

      expect(result.fullyAnchored).toBe(true);
      expect(result.anchoredEvents.length).toBe(2);
      expect(result.warnings.length).toBe(0);
    });

    it('should analyze partially anchored timeline', () => {
      const events = [
        createEvent('a', 'Event A', [createAbsoluteConstraint(1920)]),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
        createEvent('c', 'Event C', []),
        createEvent('d', 'Event D', [
          { type: 'after', targetEventId: 'c', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const result = analyzeAnchoring(graph);

      expect(result.fullyAnchored).toBe(false);
      expect(result.anchoredEvents.length).toBe(1);
      expect(result.components.length).toBe(2);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should warn about multiple anchors in same component', () => {
      const events = [
        createEvent('a', 'Event A', [createAbsoluteConstraint(1920)]),
        createEvent('b', 'Event B', [
          createAbsoluteConstraint(1950),
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const result = analyzeAnchoring(graph);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.includes('anchor points'))).toBe(true);
    });
  });

  describe('Relative Time Conversion', () => {
    it('should convert to relative time', () => {
      const events = [
        createEvent('a', 'Event A', []),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high', duration: {
            value: 10, unit: 'years', approximate: false,
          }},
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      const components = analyzeComponents(graph);
      const component = components[0];

      const relativeRanges = toRelativeTime(result.ranges, component);

      expect(relativeRanges.size).toBe(2);

      // Reference event should be at year 0 (or close to it)
      const refRange = relativeRanges.get(component.referenceEventId!);
      expect(refRange).toBeDefined();
      // The reference range will be relative to itself, so likely centered around 0
    });

    it('should preserve precision in relative time', () => {
      const events = [
        createEvent('a', 'Event A', []),
        createEvent('b', 'Event B', [
          { type: 'after', targetEventId: 'a', confidence: 'high' },
        ]),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);
      const result = propagate(graph);

      const components = analyzeComponents(graph);
      const component = components[0];

      const relativeRanges = toRelativeTime(result.ranges, component);

      for (const range of relativeRanges.values()) {
        expect(range.precision).toBeDefined();
        expect(range.anchored).toBe(false);
      }
    });
  });

  describe('Utility Functions', () => {
    it('should detect anchored event', () => {
      const anchored = createEvent('a', 'Anchored', [createAbsoluteConstraint(1920)]);
      const unanchored = createEvent('b', 'Unanchored', []);

      expect(isEventAnchored(anchored)).toBe(true);
      expect(isEventAnchored(unanchored)).toBe(false);
    });

    it('should get strongest anchor', () => {
      const component = {
        eventIds: ['a', 'b', 'c'],
        isAnchored: true,
        anchors: [
          { eventId: 'a', range: { min: { year: 1920 }, max: { year: 1920 }, precision: 'year' as const, anchored: true }, confidence: 'low' as const },
          { eventId: 'b', range: { min: { year: 1950 }, max: { year: 1950 }, precision: 'year' as const, anchored: true }, confidence: 'high' as const },
          { eventId: 'c', range: { min: { year: 1960 }, max: { year: 1960 }, precision: 'year' as const, anchored: true }, confidence: 'medium' as const },
        ],
      };

      const strongest = getStrongestAnchor(component);

      expect(strongest).toBeDefined();
      expect(strongest?.eventId).toBe('b');
      expect(strongest?.confidence).toBe('high');
    });

    it('should return undefined for unanchored component', () => {
      const component = {
        eventIds: ['a', 'b'],
        isAnchored: false,
        anchors: [],
        referenceEventId: 'a',
      };

      const strongest = getStrongestAnchor(component);

      expect(strongest).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty timeline', () => {
      const timeline = createTimeline([]);
      const graph = new ConstraintGraph(timeline);

      const result = analyzeAnchoring(graph);

      expect(result.anchoredEvents.length).toBe(0);
      expect(result.components.length).toBe(0);
      expect(result.fullyAnchored).toBe(true); // Vacuously true
    });

    it('should handle isolated events', () => {
      const events = [
        createEvent('a', 'Event A', [createAbsoluteConstraint(1920)]),
        createEvent('b', 'Event B', []),
      ];

      const timeline = createTimeline(events);
      const graph = new ConstraintGraph(timeline);

      const result = analyzeAnchoring(graph);

      expect(result.components.length).toBe(2);
    });
  });
});
