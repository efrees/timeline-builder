import { describe, it, expect } from 'vitest';
import { parse } from '../../src/parser/parser.js';

describe('Debug Parser', () => {
  it('should parse date range', () => {
    const input = `periodC: Period C
  date: 1918-1922
`;
    const timeline = parse(input);
    const event = timeline.events.get('periodC')!;
    
    console.log('Event:', event);
    console.log('Constraints:', event.constraints);
    if (event.constraints[0]) {
      const c = event.constraints[0];
      console.log('Constraint type:', c.type);
      console.log('Min year:', c.absoluteRange?.min.year);
      console.log('Max year:', c.absoluteRange?.max.year);
      console.log('Precision:', c.absoluteRange?.precision);
    }
    
    expect(event.constraints[0]!.absoluteRange?.min.year).toBe(1918);
    expect(event.constraints[0]!.absoluteRange?.max.year).toBe(1922);
  });
});
