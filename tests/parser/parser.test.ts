/**
 * Tests for the Timeline Parser
 */

import { describe, it, expect } from 'vitest';
import { Parser, ParseError, parse } from '../../src/parser/parser.js';
import type { Timeline, Event } from '../../src/types/timeline.js';

describe('Parser', () => {
  describe('Basic Event Parsing', () => {
    it('should parse a simple event', () => {
      const input = 'eventA: Event A happened';
      const timeline = parse(input);

      expect(timeline.events.size).toBe(1);
      expect(timeline.events.has('eventA')).toBe(true);

      const event = timeline.events.get('eventA')!;
      expect(event.id).toBe('eventA');
      expect(event.description).toBe('Event A happened');
    });

    it('should parse multiple events', () => {
      const input = `
eventA: Event A happened
eventB: Event B occurred
eventC: Event C took place
      `;
      const timeline = parse(input);

      expect(timeline.events.size).toBe(3);
      expect(timeline.events.has('eventA')).toBe(true);
      expect(timeline.events.has('eventB')).toBe(true);
      expect(timeline.events.has('eventC')).toBe(true);
    });

    it('should throw error for duplicate event IDs', () => {
      const input = `
eventA: First event
eventA: Duplicate event
      `;
      expect(() => parse(input)).toThrow(ParseError);
      expect(() => parse(input)).toThrow('Duplicate event ID');
    });
  });

  describe('Absolute Date Constraints', () => {
    it('should parse year-only date', () => {
      const input = `
eventA: Event A
  date: 1920
      `;
      const timeline = parse(input);
      const event = timeline.events.get('eventA')!;

      expect(event.constraints).toHaveLength(1);
      const constraint = event.constraints[0]!;
      expect(constraint.type).toBe('absolute');
      expect(constraint.absoluteRange?.min.year).toBe(1920);
      expect(constraint.absoluteRange?.max.year).toBe(1920);
      expect(constraint.absoluteRange?.precision).toBe('year');
    });

    it('should parse approximate date (~)', () => {
      const input = `
eventA: Event A
  date: ~1920
      `;
      const timeline = parse(input);
      const event = timeline.events.get('eventA')!;

      expect(event.constraints).toHaveLength(1);
      const constraint = event.constraints[0]!;
      expect(constraint.type).toBe('absolute');
      expect(constraint.absoluteRange?.min.year).toBe(1920);
    });

    it('should parse date range', () => {
      const input = `
periodC: Period C
  date: 1918-1922
      `;
      const timeline = parse(input);
      const event = timeline.events.get('periodC')!;

      expect(event.constraints).toHaveLength(1);
      const constraint = event.constraints[0]!;
      expect(constraint.type).toBe('absolute');
      expect(constraint.absoluteRange?.min.year).toBe(1918);
      expect(constraint.absoluteRange?.max.year).toBe(1922);
    });

    it('should parse year-month date', () => {
      const input = `
eventA: Event A
  date: 1920-05
      `;
      const timeline = parse(input);
      const event = timeline.events.get('eventA')!;

      const constraint = event.constraints[0]!;
      expect(constraint.absoluteRange?.min.year).toBe(1920);
      expect(constraint.absoluteRange?.min.month).toBe(5);
      expect(constraint.absoluteRange?.precision).toBe('month');
    });

    it('should parse full date', () => {
      const input = `
eventA: Event A
  date: 1920-05-15
      `;
      const timeline = parse(input);
      const event = timeline.events.get('eventA')!;

      const constraint = event.constraints[0]!;
      expect(constraint.absoluteRange?.min.year).toBe(1920);
      expect(constraint.absoluteRange?.min.month).toBe(5);
      expect(constraint.absoluteRange?.min.day).toBe(15);
      expect(constraint.absoluteRange?.precision).toBe('day');
    });

    it('should parse confidence levels', () => {
      const input = `
eventA: Event A
  date: 1920 [high]

eventB: Event B
  date: 1925 [medium]

eventC: Event C
  date: 1930 [low]
      `;
      const timeline = parse(input);

      const eventA = timeline.events.get('eventA')!;
      expect(eventA.constraints[0]!.confidence).toBe('high');

      const eventB = timeline.events.get('eventB')!;
      expect(eventB.constraints[0]!.confidence).toBe('medium');

      const eventC = timeline.events.get('eventC')!;
      expect(eventC.constraints[0]!.confidence).toBe('low');
    });
  });

  describe('Relative Constraints', () => {
    it('should parse after constraint', () => {
      const input = `
eventA: Event A
  date: 1920

eventB: Event B
  after: eventA
      `;
      const timeline = parse(input);
      const eventB = timeline.events.get('eventB')!;

      expect(eventB.constraints).toHaveLength(1);
      const constraint = eventB.constraints[0]!;
      expect(constraint.type).toBe('after');
      expect(constraint.targetEventId).toBe('eventA');
    });

    it('should parse before constraint', () => {
      const input = `
eventA: Event A
  date: 1920

eventB: Event B
  before: eventA
      `;
      const timeline = parse(input);
      const eventB = timeline.events.get('eventB')!;

      const constraint = eventB.constraints[0]!;
      expect(constraint.type).toBe('before');
      expect(constraint.targetEventId).toBe('eventA');
    });

    it('should parse during constraint', () => {
      const input = `
periodA: Period A
  date: 1918-1922

eventB: Event B
  during: periodA
      `;
      const timeline = parse(input);
      const eventB = timeline.events.get('eventB')!;

      const constraint = eventB.constraints[0]!;
      expect(constraint.type).toBe('during');
      expect(constraint.targetEventId).toBe('periodA');
    });

    it('should parse constraint with duration offset', () => {
      const input = `
eventA: Event A
  date: 1920

eventB: Event B
  after: eventA + 3 years
      `;
      const timeline = parse(input);
      const eventB = timeline.events.get('eventB')!;

      const constraint = eventB.constraints[0]!;
      expect(constraint.type).toBe('after');
      expect(constraint.targetEventId).toBe('eventA');
      expect(constraint.duration?.value).toBe(3);
      expect(constraint.duration?.unit).toBe('years');
    });

    it('should parse constraint with range duration', () => {
      const input = `
eventA: Event A
  date: 1920

eventB: Event B
  after: eventA + 13-15 years
      `;
      const timeline = parse(input);
      const eventB = timeline.events.get('eventB')!;

      const constraint = eventB.constraints[0]!;
      expect(constraint.duration?.value).toEqual([13, 15]);
      expect(constraint.duration?.unit).toBe('years');
    });

    it('should parse constraint with approximate duration', () => {
      const input = `
eventA: Event A
  date: 1920

eventB: Event B
  after: eventA + ~3 years
      `;
      const timeline = parse(input);
      const eventB = timeline.events.get('eventB')!;

      const constraint = eventB.constraints[0]!;
      expect(constraint.duration?.approximate).toBe(true);
      expect(constraint.duration?.value).toBe(3);
    });

    it('should parse start-after constraint', () => {
      const input = `
eventA: Event A
  date: 1920

eventB: Event B
  start-after: eventA + 5 years
      `;
      const timeline = parse(input);
      const eventB = timeline.events.get('eventB')!;

      const constraint = eventB.constraints[0]!;
      expect(constraint.type).toBe('start-after');
      expect(constraint.targetEventId).toBe('eventA');
    });

    it('should parse explicit anchor point', () => {
      const input = `
eventA: Event A
  date: 1920

eventB: Event B
  after: eventA.start + 5 years
      `;
      const timeline = parse(input);
      const eventB = timeline.events.get('eventB')!;

      const constraint = eventB.constraints[0]!;
      expect(constraint.anchorPoint).toBe('start');
    });

    it('should parse different time units', () => {
      const input = `
eventA: Event A
  date: 1920

eventB: Event B
  after: eventA + 3 months

eventC: Event C
  after: eventA + 10 days
      `;
      const timeline = parse(input);

      const eventB = timeline.events.get('eventB')!;
      expect(eventB.constraints[0]!.duration?.unit).toBe('months');

      const eventC = timeline.events.get('eventC')!;
      expect(eventC.constraints[0]!.duration?.unit).toBe('days');
    });

    it('should parse multiple constraints on one event', () => {
      const input = `
eventA: Event A
  date: 1920

eventB: Event B
  date: 1925

eventC: Event C
  after: eventA + 2 years
  before: eventB - 1 year
      `;
      const timeline = parse(input);
      const eventC = timeline.events.get('eventC')!;

      expect(eventC.constraints).toHaveLength(2);
      expect(eventC.constraints[0]!.type).toBe('after');
      expect(eventC.constraints[1]!.type).toBe('before');
    });
  });

  describe('Event Properties', () => {
    it('should parse source property', () => {
      const input = `
eventA: Event A
  date: 1920
  source: Genesis 30:22-24
      `;
      const timeline = parse(input);
      const event = timeline.events.get('eventA')!;

      expect(event.properties['source']).toBe('Genesis 30:22-24');
    });

    it('should parse note property', () => {
      const input = `
eventA: Event A
  date: 1920
  note: This is a note about the event
      `;
      const timeline = parse(input);
      const event = timeline.events.get('eventA')!;

      expect(event.properties['note']).toBe('This is a note about the event');
    });

    it('should parse tags property', () => {
      const input = `
eventA: Event A
  date: 1920
  tags: #family #travel
      `;
      const timeline = parse(input);
      const event = timeline.events.get('eventA')!;

      expect(event.tags).toContain('family');
      expect(event.tags).toContain('travel');
    });

    it('should parse duration property', () => {
      const input = `
eventA: Event A
  date: 1920
  duration: 5 years
      `;
      const timeline = parse(input);
      const event = timeline.events.get('eventA')!;

      expect(event.durationConstraint?.duration.value).toBe(5);
      expect(event.durationConstraint?.duration.unit).toBe('years');
    });
  });

  describe('Frontmatter', () => {
    it('should parse YAML frontmatter', () => {
      const input = `
---
title: Basic Timeline Example
reference: eventA
description: Simple timeline
---

eventA: Event A
  date: 1920
      `;
      const timeline = parse(input);

      expect(timeline.metadata.title).toBe('Basic Timeline Example');
      expect(timeline.metadata.reference).toBe('eventA');
      expect(timeline.metadata.description).toBe('Simple timeline');
    });

    it('should handle empty frontmatter', () => {
      const input = `
---
---

eventA: Event A
  date: 1920
      `;
      const timeline = parse(input);

      expect(timeline.metadata).toEqual({});
    });
  });

  describe('Groups', () => {
    it('should parse group block', () => {
      const input = `
#group JacobLife

eventA: Event A
  date: 1920

eventB: Event B
  date: 1925

#endgroup
      `;
      const timeline = parse(input);

      expect(timeline.groups).toHaveLength(1);
      const group = timeline.groups[0]!;
      expect(group.id).toBe('JacobLife');
      expect(group.name).toBe('JacobLife');
      expect(group.eventIds.size).toBe(2);
      expect(group.eventIds.has('eventA')).toBe(true);
      expect(group.eventIds.has('eventB')).toBe(true);
    });

    it('should assign group to events', () => {
      const input = `
#group JacobLife

eventA: Event A
  date: 1920

#endgroup
      `;
      const timeline = parse(input);

      const event = timeline.events.get('eventA')!;
      expect(event.group).toBe('JacobLife');
    });

    it('should add events from groups to timeline.events', () => {
      const input = `
#group TestGroup
eventA: Event A
  date: 1920

eventB: Event B
  after: eventA + 5 years
#endgroup
      `;
      const timeline = parse(input);

      expect(timeline.events.size).toBe(2);
      expect(timeline.events.has('eventA')).toBe(true);
      expect(timeline.events.has('eventB')).toBe(true);
    });

    it('should parse multiple groups', () => {
      const input = `
#group Group1
event1: Event 1
  date: 1920
#endgroup

#group Group2
event2: Event 2
  date: 1930
#endgroup
      `;
      const timeline = parse(input);

      expect(timeline.groups).toHaveLength(2);
      expect(timeline.events.size).toBe(2);
      expect(timeline.events.get('event1')?.group).toBe('Group1');
      expect(timeline.events.get('event2')?.group).toBe('Group2');
    });

    it('should parse nested groups', () => {
      const input = `
#group Outer
outerEvent: Outer event
  date: 1900

#group Inner
innerEvent: Inner event
  date: 1920
#endgroup

#endgroup
      `;
      const timeline = parse(input);

      expect(timeline.groups).toHaveLength(2);

      const outerGroup = timeline.groups.find((g) => g.id === 'Outer');
      const innerGroup = timeline.groups.find((g) => g.id === 'Inner');

      expect(outerGroup).toBeDefined();
      expect(innerGroup).toBeDefined();
      expect(innerGroup?.parentGroupId).toBe('Outer');

      expect(timeline.events.size).toBe(2);
      expect(timeline.events.get('outerEvent')?.group).toBe('Outer');
      expect(timeline.events.get('innerEvent')?.group).toBe('Inner');
    });

    it('should parse deeply nested groups', () => {
      const input = `
#group Level1
event1: Level 1 event
  date: 1900

#group Level2
event2: Level 2 event
  date: 1920

#group Level3
event3: Level 3 event
  date: 1940
#endgroup

#endgroup

#endgroup
      `;
      const timeline = parse(input);

      expect(timeline.groups).toHaveLength(3);

      const level1 = timeline.groups.find((g) => g.id === 'Level1');
      const level2 = timeline.groups.find((g) => g.id === 'Level2');
      const level3 = timeline.groups.find((g) => g.id === 'Level3');

      expect(level1?.parentGroupId).toBeUndefined();
      expect(level2?.parentGroupId).toBe('Level1');
      expect(level3?.parentGroupId).toBe('Level2');
    });

    it('should handle empty groups', () => {
      const input = `
#group EmptyGroup
#endgroup

event1: Event outside group
  date: 1920
      `;
      const timeline = parse(input);

      expect(timeline.groups).toHaveLength(1);
      expect(timeline.groups[0]?.eventIds.size).toBe(0);
      expect(timeline.events.size).toBe(1);
    });

    it('should throw error for missing #endgroup', () => {
      const input = `
#group MyGroup
event1: Event
  date: 1920
      `;
      expect(() => parse(input)).toThrow(ParseError);
      expect(() => parse(input)).toThrow('Expected #endgroup');
    });

    it('should throw error for missing group name', () => {
      const input = `
#group
event1: Event
  date: 1920
#endgroup
      `;
      expect(() => parse(input)).toThrow(ParseError);
      expect(() => parse(input)).toThrow('Expected group name');
    });

    it('should preserve event constraints within groups', () => {
      const input = `
#group MyGroup
event1: First event
  date: 1920

event2: Second event
  after: event1 + 5 years
  tags: #important
#endgroup
      `;
      const timeline = parse(input);

      const event2 = timeline.events.get('event2')!;
      expect(event2.constraints).toHaveLength(1);
      expect(event2.constraints[0]!.type).toBe('after');
      expect(event2.constraints[0]!.targetEventId).toBe('event1');
      expect(event2.tags).toContain('important');
    });
  });

  describe('Theories', () => {
    it('should parse theory block', () => {
      const input = `
#theory EarlyExodus

eventA: Event A
  date: 1446

#endtheory
      `;
      const timeline = parse(input);

      expect(timeline.theories).toHaveLength(1);
      const theory = timeline.theories[0]!;
      expect(theory.id).toBe('EarlyExodus');
      expect(theory.name).toBe('EarlyExodus');
      expect(theory.eventIds.has('eventA')).toBe(true);
    });

    it('should assign theory to events', () => {
      const input = `
#theory EarlyExodus

eventA: Event A
  date: 1446

#endtheory
      `;
      const timeline = parse(input);

      const event = timeline.events.get('eventA')!;
      expect(event.theoryId).toBe('EarlyExodus');
    });

    it('should add events from theories to timeline.events', () => {
      const input = `
#theory TestTheory
eventA: Event A
  date: 1446

eventB: Event B
  after: eventA + 40 years
#endtheory
      `;
      const timeline = parse(input);

      expect(timeline.events.size).toBe(2);
      expect(timeline.events.has('eventA')).toBe(true);
      expect(timeline.events.has('eventB')).toBe(true);
    });

    it('should parse multiple theories with different events', () => {
      const input = `
#theory EarlyExodus
earlyExodus: The Exodus (early theory)
  date: 1446
#endtheory

#theory LateExodus
lateExodus: The Exodus (late theory)
  date: 1270
#endtheory
      `;
      const timeline = parse(input);

      expect(timeline.theories).toHaveLength(2);
      expect(timeline.theories[0]?.id).toBe('EarlyExodus');
      expect(timeline.theories[1]?.id).toBe('LateExodus');

      expect(timeline.events.size).toBe(2);
      expect(timeline.events.get('earlyExodus')?.theoryId).toBe('EarlyExodus');
      expect(timeline.events.get('lateExodus')?.theoryId).toBe('LateExodus');
    });

    it('should throw error for duplicate event IDs across theories', () => {
      const input = `
#theory EarlyExodus
exodus: The Exodus
  date: 1446
#endtheory

#theory LateExodus
exodus: The Exodus (duplicate)
  date: 1270
#endtheory
      `;
      expect(() => parse(input)).toThrow(ParseError);
      expect(() => parse(input)).toThrow('Duplicate event ID');
    });

    it('should parse theory with multiple events', () => {
      const input = `
#theory MyTheory
event1: First event
  date: 1900

event2: Second event
  date: 1920

event3: Third event
  after: event1 + 10 years
  before: event2 - 5 years
#endtheory
      `;
      const timeline = parse(input);

      expect(timeline.theories).toHaveLength(1);
      expect(timeline.theories[0]?.eventIds.size).toBe(3);

      expect(timeline.events.size).toBe(3);
      expect(timeline.events.get('event1')?.theoryId).toBe('MyTheory');
      expect(timeline.events.get('event2')?.theoryId).toBe('MyTheory');
      expect(timeline.events.get('event3')?.theoryId).toBe('MyTheory');
    });

    it('should handle empty theories', () => {
      const input = `
#theory EmptyTheory
#endtheory

event1: Event outside theory
  date: 1920
      `;
      const timeline = parse(input);

      expect(timeline.theories).toHaveLength(1);
      expect(timeline.theories[0]?.eventIds.size).toBe(0);
      expect(timeline.events.size).toBe(1);
    });

    it('should throw error for missing #endtheory', () => {
      const input = `
#theory MyTheory
event1: Event
  date: 1920
      `;
      expect(() => parse(input)).toThrow(ParseError);
      expect(() => parse(input)).toThrow('Expected #endtheory');
    });

    it('should throw error for missing theory name', () => {
      const input = `
#theory
event1: Event
  date: 1920
#endtheory
      `;
      expect(() => parse(input)).toThrow(ParseError);
      expect(() => parse(input)).toThrow('Expected theory name');
    });

    it('should parse events outside and inside theories', () => {
      const input = `
commonEvent: Common event
  date: 1900

#theory Theory1
theoryEvent: Theory-specific event
  date: 1920
#endtheory

anotherCommon: Another common event
  date: 1950
      `;
      const timeline = parse(input);

      expect(timeline.theories).toHaveLength(1);
      expect(timeline.events.size).toBe(3);

      expect(timeline.events.get('commonEvent')?.theoryId).toBeUndefined();
      expect(timeline.events.get('theoryEvent')?.theoryId).toBe('Theory1');
      expect(timeline.events.get('anotherCommon')?.theoryId).toBeUndefined();
    });

    it('should preserve event constraints within theories', () => {
      const input = `
#theory MyTheory
event1: First event
  date: 1920

event2: Second event
  after: event1 + 5 years
  source: Historical record
#endtheory
      `;
      const timeline = parse(input);

      const event2 = timeline.events.get('event2')!;
      expect(event2.constraints).toHaveLength(1);
      expect(event2.constraints[0]!.type).toBe('after');
      expect(event2.properties['source']).toBe('Historical record');
    });
  });

  describe('Example Files', () => {
    it('should parse basic.tl example', () => {
      const input = `
---
title: Basic Timeline Example
reference: eventA
description: Simple timeline demonstrating basic absolute dates
---

eventA: Event A happened
  date: 1920

eventB: Event B occurred (circa)
  date: ~1922

periodC: Period C
  date: 1918-1922
      `;
      const timeline = parse(input);

      expect(timeline.events.size).toBe(3);
      expect(timeline.events.has('eventA')).toBe(true);
      expect(timeline.events.has('eventB')).toBe(true);
      expect(timeline.events.has('periodC')).toBe(true);

      expect(timeline.metadata.title).toBe('Basic Timeline Example');
    });

    it('should parse jacob.tl example (simplified)', () => {
      const input = `
---
title: Timeline of Jacob's Life
reference: jacobBorn
---

#group JacobEarlyLife

jacobBorn: Jacob is born
  note: Reference point for this timeline

jacobFlees: Jacob flees to Haran
  after: jacobBorn + 77 years
  source: Traditional chronology

#endgroup
      `;
      const timeline = parse(input);

      expect(timeline.events.size).toBe(2);
      expect(timeline.groups).toHaveLength(1);

      const jacobFlees = timeline.events.get('jacobFlees')!;
      expect(jacobFlees.constraints[0]!.type).toBe('after');
      expect(jacobFlees.constraints[0]!.targetEventId).toBe('jacobBorn');
      expect(jacobFlees.constraints[0]!.duration?.value).toBe(77);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for missing colon', () => {
      const input = 'eventA Event A happened';
      expect(() => parse(input)).toThrow(ParseError);
    });

    it('should throw error for invalid date format', () => {
      const input = `
eventA: Event A
  date: not-a-date
      `;
      expect(() => parse(input)).toThrow(ParseError);
    });

    it('should provide line and column information in errors', () => {
      const input = `
eventA: Event A
  invalid: property
      `;
      try {
        parse(input);
        expect.fail('Should have thrown ParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        const parseError = error as ParseError;
        expect(parseError.line).toBeGreaterThan(0);
        expect(parseError.column).toBeGreaterThan(0);
      }
    });
  });

  describe('Comments and Whitespace', () => {
    it('should ignore line comments', () => {
      const input = `
// This is a comment
eventA: Event A happened  // inline comment
  date: 1920
      `;
      const timeline = parse(input);

      expect(timeline.events.size).toBe(1);
      expect(timeline.events.has('eventA')).toBe(true);
    });

    it('should handle multiple blank lines', () => {
      const input = `
eventA: Event A happened
  date: 1920


eventB: Event B occurred
  date: 1925
      `;
      const timeline = parse(input);

      expect(timeline.events.size).toBe(2);
    });
  });
});
