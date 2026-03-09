import { describe, it, expect, beforeEach } from 'vitest';
import { ConstraintGraph } from '../../src/solver/constraint-graph.js';
import type { Timeline, Event } from '../../src/types/timeline.js';
import type { Constraint } from '../../src/types/constraints.js';

describe('ConstraintGraph', () => {
  describe('Graph construction from Timeline', () => {
    it('should create an empty graph from empty timeline', () => {
      const timeline: Timeline = {
        metadata: {},
        events: new Map(),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);

      expect(graph.getAllEvents()).toHaveLength(0);
    });

    it('should create a graph with events from timeline', () => {
      const event1: Event = {
        id: 'event1',
        description: 'First event',
        constraints: [],
        tags: [],
        properties: {},
      };

      const event2: Event = {
        id: 'event2',
        description: 'Second event',
        constraints: [],
        tags: [],
        properties: {},
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([
          ['event1', event1],
          ['event2', event2],
        ]),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);

      expect(graph.getAllEvents()).toHaveLength(2);
      expect(graph.hasEvent('event1')).toBe(true);
      expect(graph.hasEvent('event2')).toBe(true);
    });

    it('should build edges from event constraints', () => {
      const constraint: Constraint = {
        type: 'after',
        targetEventId: 'eventA',
        confidence: 'high',
      };

      const eventA: Event = {
        id: 'eventA',
        description: 'Event A',
        constraints: [],
        tags: [],
        properties: {},
      };

      const eventB: Event = {
        id: 'eventB',
        description: 'Event B happens after A',
        constraints: [constraint],
        tags: [],
        properties: {},
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([
          ['eventA', eventA],
          ['eventB', eventB],
        ]),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);

      // eventB depends on eventA (edge B → A)
      expect(graph.getPredecessors('eventB')).toContain('eventA');
      expect(graph.getSuccessors('eventA')).toContain('eventB');
    });

    it('should handle multiple constraints on one event', () => {
      const eventA: Event = {
        id: 'eventA',
        description: 'Event A',
        constraints: [],
        tags: [],
        properties: {},
      };

      const eventB: Event = {
        id: 'eventB',
        description: 'Event B',
        constraints: [],
        tags: [],
        properties: {},
      };

      const eventC: Event = {
        id: 'eventC',
        description: 'Event C after A and B',
        constraints: [
          {
            type: 'after',
            targetEventId: 'eventA',
            confidence: 'high',
          },
          {
            type: 'after',
            targetEventId: 'eventB',
            confidence: 'high',
          },
        ],
        tags: [],
        properties: {},
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([
          ['eventA', eventA],
          ['eventB', eventB],
          ['eventC', eventC],
        ]),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);

      expect(graph.getPredecessors('eventC')).toContain('eventA');
      expect(graph.getPredecessors('eventC')).toContain('eventB');
      expect(graph.getPredecessors('eventC')).toHaveLength(2);
    });

    it('should ignore absolute constraints when building edges', () => {
      const event: Event = {
        id: 'event1',
        description: 'Event with absolute date',
        constraints: [
          {
            type: 'absolute',
            targetEventId: '',
            confidence: 'high',
            absoluteRange: {
              min: { year: 1920 },
              max: { year: 1920 },
              precision: 'year',
              anchored: true,
            },
          },
        ],
        tags: [],
        properties: {},
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([['event1', event]]),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);

      expect(graph.getPredecessors('event1')).toHaveLength(0);
      expect(graph.getSuccessors('event1')).toHaveLength(0);
      expect(graph.getConstraints('event1')).toHaveLength(1);
    });
  });

  describe('Node operations', () => {
    let graph: ConstraintGraph;

    beforeEach(() => {
      const timeline: Timeline = {
        metadata: {},
        events: new Map(),
        groups: [],
        theories: [],
      };
      graph = new ConstraintGraph(timeline);
    });

    it('should add an event to the graph', () => {
      const event: Event = {
        id: 'newEvent',
        description: 'A new event',
        constraints: [],
        tags: [],
        properties: {},
      };

      graph.addEvent(event);

      expect(graph.hasEvent('newEvent')).toBe(true);
      expect(graph.getEvent('newEvent')).toBe(event);
    });

    it('should remove an event from the graph', () => {
      const event: Event = {
        id: 'tempEvent',
        description: 'Temporary event',
        constraints: [],
        tags: [],
        properties: {},
      };

      graph.addEvent(event);
      expect(graph.hasEvent('tempEvent')).toBe(true);

      graph.removeEvent('tempEvent');
      expect(graph.hasEvent('tempEvent')).toBe(false);
      expect(graph.getEvent('tempEvent')).toBeUndefined();
    });

    it('should handle removing non-existent event gracefully', () => {
      graph.removeEvent('nonExistent');
      expect(graph.hasEvent('nonExistent')).toBe(false);
    });

    it('should remove event and its edges', () => {
      const eventA: Event = {
        id: 'eventA',
        description: 'Event A',
        constraints: [],
        tags: [],
        properties: {},
      };

      const eventB: Event = {
        id: 'eventB',
        description: 'Event B after A',
        constraints: [
          {
            type: 'after',
            targetEventId: 'eventA',
            confidence: 'high',
          },
        ],
        tags: [],
        properties: {},
      };

      graph.addEvent(eventA);
      graph.addEvent(eventB);

      expect(graph.getPredecessors('eventB')).toContain('eventA');
      expect(graph.getSuccessors('eventA')).toContain('eventB');

      // Remove eventA
      graph.removeEvent('eventA');

      expect(graph.hasEvent('eventA')).toBe(false);
      expect(graph.hasEvent('eventB')).toBe(true);
      expect(graph.getPredecessors('eventB')).not.toContain('eventA');
    });

    it('should get all events', () => {
      const event1: Event = {
        id: 'event1',
        description: 'Event 1',
        constraints: [],
        tags: [],
        properties: {},
      };

      const event2: Event = {
        id: 'event2',
        description: 'Event 2',
        constraints: [],
        tags: [],
        properties: {},
      };

      graph.addEvent(event1);
      graph.addEvent(event2);

      const allEvents = graph.getAllEvents();
      expect(allEvents).toHaveLength(2);
      expect(allEvents).toContain(event1);
      expect(allEvents).toContain(event2);
    });

    it('should return undefined for non-existent event', () => {
      expect(graph.getEvent('nonExistent')).toBeUndefined();
    });
  });

  describe('Edge operations', () => {
    let graph: ConstraintGraph;

    beforeEach(() => {
      const timeline: Timeline = {
        metadata: {},
        events: new Map(),
        groups: [],
        theories: [],
      };
      graph = new ConstraintGraph(timeline);
    });

    it('should add constraint and create edge', () => {
      const eventA: Event = {
        id: 'eventA',
        description: 'Event A',
        constraints: [],
        tags: [],
        properties: {},
      };

      const eventB: Event = {
        id: 'eventB',
        description: 'Event B',
        constraints: [],
        tags: [],
        properties: {},
      };

      graph.addEvent(eventA);
      graph.addEvent(eventB);

      const constraint: Constraint = {
        type: 'after',
        targetEventId: 'eventA',
        confidence: 'high',
      };

      // Add constraint to eventB
      eventB.constraints.push(constraint);
      graph.addConstraint(constraint, 'eventB');

      expect(graph.getConstraints('eventB')).toContain(constraint);
      expect(graph.getPredecessors('eventB')).toContain('eventA');
      expect(graph.getSuccessors('eventA')).toContain('eventB');
    });

    it('should handle different constraint types', () => {
      const eventA: Event = {
        id: 'eventA',
        description: 'Event A',
        constraints: [],
        tags: [],
        properties: {},
      };

      const eventB: Event = {
        id: 'eventB',
        description: 'Event B before A',
        constraints: [
          {
            type: 'before',
            targetEventId: 'eventA',
            confidence: 'high',
          },
        ],
        tags: [],
        properties: {},
      };

      graph.addEvent(eventA);
      graph.addEvent(eventB);

      // Even for 'before', B depends on A (B must know A's position)
      expect(graph.getPredecessors('eventB')).toContain('eventA');
      expect(graph.getSuccessors('eventA')).toContain('eventB');
    });

    it('should not create edge if target event does not exist', () => {
      const eventB: Event = {
        id: 'eventB',
        description: 'Event B after non-existent A',
        constraints: [
          {
            type: 'after',
            targetEventId: 'eventA',
            confidence: 'high',
          },
        ],
        tags: [],
        properties: {},
      };

      graph.addEvent(eventB);

      // No edge should be created because eventA doesn't exist
      expect(graph.getPredecessors('eventB')).toHaveLength(0);
    });

    it('should get empty constraints for non-existent event', () => {
      expect(graph.getConstraints('nonExistent')).toEqual([]);
    });
  });

  describe('Query operations', () => {
    let graph: ConstraintGraph;

    beforeEach(() => {
      // Build a simple graph: A → B → C
      //                           ↘ D
      const eventA: Event = {
        id: 'eventA',
        description: 'Event A',
        constraints: [],
        tags: [],
        properties: {},
      };

      const eventB: Event = {
        id: 'eventB',
        description: 'Event B after A',
        constraints: [
          {
            type: 'after',
            targetEventId: 'eventA',
            confidence: 'high',
          },
        ],
        tags: [],
        properties: {},
      };

      const eventC: Event = {
        id: 'eventC',
        description: 'Event C after B',
        constraints: [
          {
            type: 'after',
            targetEventId: 'eventB',
            confidence: 'high',
          },
        ],
        tags: [],
        properties: {},
      };

      const eventD: Event = {
        id: 'eventD',
        description: 'Event D after B',
        constraints: [
          {
            type: 'after',
            targetEventId: 'eventB',
            confidence: 'high',
          },
        ],
        tags: [],
        properties: {},
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([
          ['eventA', eventA],
          ['eventB', eventB],
          ['eventC', eventC],
          ['eventD', eventD],
        ]),
        groups: [],
        theories: [],
      };

      graph = new ConstraintGraph(timeline);
    });

    it('should get predecessors of an event', () => {
      expect(graph.getPredecessors('eventA')).toEqual([]);
      expect(graph.getPredecessors('eventB')).toEqual(['eventA']);
      expect(graph.getPredecessors('eventC')).toEqual(['eventB']);
      expect(graph.getPredecessors('eventD')).toEqual(['eventB']);
    });

    it('should get successors of an event', () => {
      expect(graph.getSuccessors('eventA')).toEqual(['eventB']);

      const successorsB = graph.getSuccessors('eventB');
      expect(successorsB).toHaveLength(2);
      expect(successorsB).toContain('eventC');
      expect(successorsB).toContain('eventD');

      expect(graph.getSuccessors('eventC')).toEqual([]);
      expect(graph.getSuccessors('eventD')).toEqual([]);
    });

    it('should return empty arrays for non-existent event', () => {
      expect(graph.getPredecessors('nonExistent')).toEqual([]);
      expect(graph.getSuccessors('nonExistent')).toEqual([]);
    });
  });

  describe('Theory support', () => {
    it('should filter events by theory', () => {
      const event1: Event = {
        id: 'event1',
        description: 'Base timeline event',
        constraints: [],
        tags: [],
        properties: {},
      };

      const event2: Event = {
        id: 'event2',
        description: 'Theory A event',
        constraints: [],
        tags: [],
        properties: {},
        theoryId: 'theoryA',
      };

      const event3: Event = {
        id: 'event3',
        description: 'Theory B event',
        constraints: [],
        tags: [],
        properties: {},
        theoryId: 'theoryB',
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([
          ['event1', event1],
          ['event2', event2],
          ['event3', event3],
        ]),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);

      // Filter by theoryA
      const graphA = graph.filterByTheory('theoryA');
      expect(graphA.getAllEvents()).toHaveLength(1);
      expect(graphA.hasEvent('event2')).toBe(true);
      expect(graphA.hasEvent('event1')).toBe(false);
      expect(graphA.hasEvent('event3')).toBe(false);

      // Filter by theoryB
      const graphB = graph.filterByTheory('theoryB');
      expect(graphB.getAllEvents()).toHaveLength(1);
      expect(graphB.hasEvent('event3')).toBe(true);

      // Filter by undefined (base timeline)
      const graphBase = graph.filterByTheory(undefined);
      expect(graphBase.getAllEvents()).toHaveLength(1);
      expect(graphBase.hasEvent('event1')).toBe(true);
    });

    it('should preserve constraints when filtering by theory', () => {
      const eventA: Event = {
        id: 'eventA',
        description: 'Event A',
        constraints: [],
        tags: [],
        properties: {},
        theoryId: 'theory1',
      };

      const eventB: Event = {
        id: 'eventB',
        description: 'Event B after A',
        constraints: [
          {
            type: 'after',
            targetEventId: 'eventA',
            confidence: 'high',
          },
        ],
        tags: [],
        properties: {},
        theoryId: 'theory1',
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([
          ['eventA', eventA],
          ['eventB', eventB],
        ]),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);
      const filtered = graph.filterByTheory('theory1');

      expect(filtered.getAllEvents()).toHaveLength(2);
      expect(filtered.getPredecessors('eventB')).toContain('eventA');
      expect(filtered.getSuccessors('eventA')).toContain('eventB');
    });

    it('should return empty graph for non-existent theory', () => {
      const event: Event = {
        id: 'event1',
        description: 'Event',
        constraints: [],
        tags: [],
        properties: {},
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([['event1', event]]),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);
      const filtered = graph.filterByTheory('nonExistentTheory');

      expect(filtered.getAllEvents()).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle self-referencing constraint', () => {
      const event: Event = {
        id: 'event1',
        description: 'Self-referencing event',
        constraints: [
          {
            type: 'after',
            targetEventId: 'event1',
            confidence: 'high',
          },
        ],
        tags: [],
        properties: {},
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([['event1', event]]),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);

      // Self-reference creates a self-loop
      expect(graph.getPredecessors('event1')).toContain('event1');
      expect(graph.getSuccessors('event1')).toContain('event1');
    });

    it('should handle constraint with missing target event', () => {
      const event: Event = {
        id: 'event1',
        description: 'Event with missing target',
        constraints: [
          {
            type: 'after',
            targetEventId: 'missingEvent',
            confidence: 'high',
          },
        ],
        tags: [],
        properties: {},
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([['event1', event]]),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);

      // No edge should be created for missing target
      expect(graph.getPredecessors('event1')).toHaveLength(0);
      expect(graph.getConstraints('event1')).toHaveLength(1);
    });

    it('should handle adding duplicate constraints', () => {
      const eventA: Event = {
        id: 'eventA',
        description: 'Event A',
        constraints: [],
        tags: [],
        properties: {},
      };

      const eventB: Event = {
        id: 'eventB',
        description: 'Event B',
        constraints: [],
        tags: [],
        properties: {},
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([
          ['eventA', eventA],
          ['eventB', eventB],
        ]),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);

      const constraint: Constraint = {
        type: 'after',
        targetEventId: 'eventA',
        confidence: 'high',
      };

      // Add same constraint twice
      eventB.constraints.push(constraint);
      graph.addConstraint(constraint, 'eventB');
      graph.addConstraint(constraint, 'eventB');

      // Should only be added once
      expect(graph.getConstraints('eventB')).toHaveLength(1);
    });

    it('should handle complex constraint types', () => {
      const eventA: Event = {
        id: 'eventA',
        description: 'Event A',
        constraints: [],
        tags: [],
        properties: {},
      };

      const eventB: Event = {
        id: 'eventB',
        description: 'Event B',
        constraints: [
          {
            type: 'start-after',
            targetEventId: 'eventA',
            confidence: 'high',
            anchorPoint: 'start',
          },
          {
            type: 'end-before',
            targetEventId: 'eventA',
            confidence: 'medium',
            anchorPoint: 'end',
          },
        ],
        tags: [],
        properties: {},
      };

      const timeline: Timeline = {
        metadata: {},
        events: new Map([
          ['eventA', eventA],
          ['eventB', eventB],
        ]),
        groups: [],
        theories: [],
      };

      const graph = new ConstraintGraph(timeline);

      expect(graph.getConstraints('eventB')).toHaveLength(2);
      expect(graph.getPredecessors('eventB')).toContain('eventA');
    });
  });
});
