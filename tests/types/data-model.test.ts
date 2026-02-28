import { describe, it, expect } from 'vitest';
import type {
  Event,
  Timeline,
  TimePoint,
  TimeRange,
  Constraint,
  Duration,
} from '../../src/types/index.js';

describe('Data Model Types', () => {
  describe('TimePoint', () => {
    it('should create a year-precision time point', () => {
      const timePoint: TimePoint = {
        year: 1920,
      };
      expect(timePoint.year).toBe(1920);
      expect(timePoint.month).toBeUndefined();
      expect(timePoint.day).toBeUndefined();
    });

    it('should create a month-precision time point', () => {
      const timePoint: TimePoint = {
        year: 1920,
        month: 6,
      };
      expect(timePoint.year).toBe(1920);
      expect(timePoint.month).toBe(6);
      expect(timePoint.day).toBeUndefined();
    });

    it('should create a day-precision time point', () => {
      const timePoint: TimePoint = {
        year: 1920,
        month: 6,
        day: 15,
      };
      expect(timePoint.year).toBe(1920);
      expect(timePoint.month).toBe(6);
      expect(timePoint.day).toBe(15);
    });

    it('should support BC dates with negative years', () => {
      const timePoint: TimePoint = {
        year: -1446,
        era: 'BC',
      };
      expect(timePoint.year).toBe(-1446);
      expect(timePoint.era).toBe('BC');
    });
  });

  describe('TimeRange', () => {
    it('should create a time range', () => {
      const range: TimeRange = {
        min: { year: 1918 },
        max: { year: 1922 },
        precision: 'year',
        anchored: true,
      };
      expect(range.min.year).toBe(1918);
      expect(range.max.year).toBe(1922);
      expect(range.precision).toBe('year');
      expect(range.anchored).toBe(true);
    });
  });

  describe('Duration', () => {
    it('should create a certain duration', () => {
      const duration: Duration = {
        value: 3,
        unit: 'years',
        approximate: false,
      };
      expect(duration.value).toBe(3);
      expect(duration.unit).toBe('years');
      expect(duration.approximate).toBe(false);
    });

    it('should create an uncertain duration with range', () => {
      const duration: Duration = {
        value: [13, 15],
        unit: 'years',
        approximate: false,
      };
      expect(duration.value).toEqual([13, 15]);
      expect(duration.unit).toBe('years');
    });

    it('should create an approximate duration', () => {
      const duration: Duration = {
        value: 3,
        unit: 'years',
        approximate: true,
      };
      expect(duration.approximate).toBe(true);
    });
  });

  describe('Constraint', () => {
    it('should create a basic after constraint', () => {
      const constraint: Constraint = {
        type: 'after',
        targetEventId: 'eventA',
        confidence: 'high',
      };
      expect(constraint.type).toBe('after');
      expect(constraint.targetEventId).toBe('eventA');
      expect(constraint.confidence).toBe('high');
    });

    it('should create a constraint with duration', () => {
      const constraint: Constraint = {
        type: 'after',
        targetEventId: 'eventA',
        duration: {
          value: 5,
          unit: 'years',
          approximate: false,
        },
        confidence: 'high',
      };
      expect(constraint.duration).toBeDefined();
      expect(constraint.duration?.value).toBe(5);
    });
  });

  describe('Event', () => {
    it('should create a basic event', () => {
      const event: Event = {
        id: 'testEvent',
        description: 'A test event',
        constraints: [],
        tags: [],
        properties: {},
      };
      expect(event.id).toBe('testEvent');
      expect(event.description).toBe('A test event');
      expect(event.constraints).toEqual([]);
    });

    it('should create an event with constraints', () => {
      const event: Event = {
        id: 'eventB',
        description: 'Event B',
        constraints: [
          {
            type: 'after',
            targetEventId: 'eventA',
            duration: { value: 3, unit: 'years', approximate: false },
            confidence: 'high',
          },
        ],
        tags: ['test'],
        properties: { source: 'Genesis 1:1' },
      };
      expect(event.constraints).toHaveLength(1);
      expect(event.constraints[0]?.type).toBe('after');
      expect(event.tags).toContain('test');
      expect(event.properties['source']).toBe('Genesis 1:1');
    });
  });

  describe('Timeline', () => {
    it('should create an empty timeline', () => {
      const timeline: Timeline = {
        metadata: { title: 'Test Timeline' },
        events: new Map(),
        groups: [],
        theories: [],
      };
      expect(timeline.metadata.title).toBe('Test Timeline');
      expect(timeline.events.size).toBe(0);
      expect(timeline.groups).toEqual([]);
      expect(timeline.theories).toEqual([]);
    });

    it('should create a timeline with events', () => {
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
        metadata: { title: 'Test Timeline' },
        events: new Map([
          ['event1', event1],
          ['event2', event2],
        ]),
        groups: [],
        theories: [],
      };

      expect(timeline.events.size).toBe(2);
      expect(timeline.events.get('event1')).toBe(event1);
      expect(timeline.events.get('event2')).toBe(event2);
    });
  });
});
