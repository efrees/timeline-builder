import { describe, it, expect } from 'vitest';
import {
  isEmpty,
  isPoint,
  width,
  intersection,
  union,
  widen,
  narrow,
  isBefore,
  isAfter,
  overlaps,
  contains
} from '../../src/solver/interval.ts';
import { TimeRange, TimePoint, Duration } from '../../src/types/time.js';

// Helper function to create TimeRange
function createRange(minYear: number, maxYear: number): TimeRange {
  return {
    min: { year: minYear },
    max: { year: maxYear },
    precision: 'year',
    anchored: false
  };
}

// Helper function to create TimePoint
function createPoint(year: number, month?: number, day?: number): TimePoint {
  return { year, month, day };
}

// Helper function to create Duration
function createDuration(value: number | [number, number], unit: 'years' | 'months' | 'days', approximate = false): Duration {
  return { value, unit, approximate };
}

describe('Interval Arithmetic - Basic Operations', () => {
  describe('isEmpty', () => {
    it('should return false for valid interval', () => {
      const interval = createRange(100, 200);
      expect(isEmpty(interval)).toBe(false);
    });

    it('should return false for point interval', () => {
      const interval = createRange(150, 150);
      expect(isEmpty(interval)).toBe(false);
    });

    it('should return true for invalid interval (min > max)', () => {
      const interval = createRange(200, 100);
      expect(isEmpty(interval)).toBe(true);
    });
  });

  describe('isPoint', () => {
    it('should return true for point interval', () => {
      const interval = createRange(150, 150);
      expect(isPoint(interval)).toBe(true);
    });

    it('should return false for range interval', () => {
      const interval = createRange(100, 200);
      expect(isPoint(interval)).toBe(false);
    });

    it('should handle precise dates', () => {
      const interval: TimeRange = {
        min: createPoint(1920, 5, 15),
        max: createPoint(1920, 5, 15),
        precision: 'day',
        anchored: true
      };
      expect(isPoint(interval)).toBe(true);
    });
  });

  describe('width', () => {
    it('should return 0 for point interval', () => {
      const interval = createRange(150, 150);
      expect(width(interval)).toBe(0);
    });

    it('should calculate width in days', () => {
      const interval = createRange(100, 101); // ~365 days
      expect(width(interval)).toBeCloseTo(365, 0);
    });

    it('should return 0 for invalid interval', () => {
      const interval = createRange(200, 100);
      expect(width(interval)).toBe(0);
    });

    it('should handle large intervals', () => {
      const interval = createRange(0, 1000); // 1000 years
      expect(width(interval)).toBe(1000 * 365);
    });
  });
});

describe('Interval Arithmetic - Intersection', () => {
  it('should return intersection of overlapping intervals', () => {
    const a = createRange(100, 200);
    const b = createRange(150, 250);
    const result = intersection(a, b);

    expect(result).not.toBeNull();
    expect(result!.min.year).toBe(150);
    expect(result!.max.year).toBe(200);
  });

  it('should return null for disjoint intervals', () => {
    const a = createRange(100, 150);
    const b = createRange(200, 250);
    const result = intersection(a, b);

    expect(result).toBeNull();
  });

  it('should handle adjacent intervals (no overlap)', () => {
    const a = createRange(100, 150);
    const b = createRange(151, 200);
    const result = intersection(a, b);

    expect(result).toBeNull();
  });

  it('should handle contained intervals', () => {
    const a = createRange(100, 300);
    const b = createRange(150, 200);
    const result = intersection(a, b);

    expect(result).not.toBeNull();
    expect(result!.min.year).toBe(150);
    expect(result!.max.year).toBe(200);
  });

  it('should handle point intervals', () => {
    const a = createRange(100, 200);
    const b = createRange(150, 150);
    const result = intersection(a, b);

    expect(result).not.toBeNull();
    expect(result!.min.year).toBe(150);
    expect(result!.max.year).toBe(150);
  });

  it('should preserve anchored status only if both are anchored', () => {
    const a: TimeRange = { ...createRange(100, 200), anchored: true };
    const b: TimeRange = { ...createRange(150, 250), anchored: false };
    const result = intersection(a, b);

    expect(result).not.toBeNull();
    expect(result!.anchored).toBe(false);
  });
});

describe('Interval Arithmetic - Union', () => {
  it('should merge overlapping intervals', () => {
    const a = createRange(100, 200);
    const b = createRange(150, 250);
    const result = union(a, b);

    expect(Array.isArray(result)).toBe(false);
    expect((result as TimeRange).min.year).toBe(100);
    expect((result as TimeRange).max.year).toBe(250);
  });

  it('should merge adjacent intervals', () => {
    const a = createRange(100, 150);
    const b = createRange(151, 200);
    const result = union(a, b);

    expect(Array.isArray(result)).toBe(false);
    expect((result as TimeRange).min.year).toBe(100);
    expect((result as TimeRange).max.year).toBe(200);
  });

  it('should return array for disjoint intervals', () => {
    const a = createRange(100, 150);
    const b = createRange(200, 250);
    const result = union(a, b);

    expect(Array.isArray(result)).toBe(true);
    expect((result as TimeRange[]).length).toBe(2);
  });

  it('should merge when one contains the other', () => {
    const a = createRange(100, 300);
    const b = createRange(150, 200);
    const result = union(a, b);

    expect(Array.isArray(result)).toBe(false);
    expect((result as TimeRange).min.year).toBe(100);
    expect((result as TimeRange).max.year).toBe(300);
  });
});

describe('Interval Arithmetic - Widen', () => {
  it('should expand interval by fixed duration', () => {
    const interval = createRange(1000, 1100);
    const duration = createDuration(50, 'years');
    const result = widen(interval, duration);

    // Should expand by 50 years (18250 days) on each side
    expect(result.min.year).toBeLessThan(1000);
    expect(result.max.year).toBeGreaterThan(1100);
  });

  it('should handle duration with range', () => {
    const interval = createRange(1000, 1100);
    const duration = createDuration([10, 50], 'years');
    const result = widen(interval, duration);

    // Should use max of range (50 years)
    expect(result.min.year).toBeLessThan(1000);
    expect(result.max.year).toBeGreaterThan(1100);
  });

  it('should add extra margin for approximate durations', () => {
    const interval = createRange(1000, 1100);
    const exactDuration = createDuration(50, 'years', false);
    const approxDuration = createDuration(50, 'years', true);

    const exactResult = widen(interval, exactDuration);
    const approxResult = widen(interval, approxDuration);

    // Approximate should expand more (20% extra)
    expect(approxResult.min.year).toBeLessThan(exactResult.min.year);
    expect(approxResult.max.year).toBeGreaterThan(exactResult.max.year);
  });

  it('should handle different time units', () => {
    const interval = createRange(1000, 1000);

    const yearDuration = createDuration(1, 'years');
    const monthDuration = createDuration(12, 'months');
    const dayDuration = createDuration(365, 'days');

    const yearResult = widen(interval, yearDuration);
    const monthResult = widen(interval, monthDuration);
    const dayResult = widen(interval, dayDuration);

    // All should expand by approximately the same amount
    expect(yearResult.min.year).toBeCloseTo(monthResult.min.year, 0);
    expect(yearResult.min.year).toBeCloseTo(dayResult.min.year, 0);
  });
});

describe('Interval Arithmetic - Narrow', () => {
  it('should tighten interval with constraint', () => {
    const interval = createRange(1000, 2000);
    const constraint = createRange(1200, 1800);
    const result = narrow(interval, constraint);

    expect(result).not.toBeNull();
    expect(result!.min.year).toBe(1200);
    expect(result!.max.year).toBe(1800);
  });

  it('should return null for non-overlapping constraint', () => {
    const interval = createRange(1000, 1500);
    const constraint = createRange(1600, 2000);
    const result = narrow(interval, constraint);

    expect(result).toBeNull();
  });

  it('should preserve interval if constraint is wider', () => {
    const interval = createRange(1200, 1800);
    const constraint = createRange(1000, 2000);
    const result = narrow(interval, constraint);

    expect(result).not.toBeNull();
    expect(result!.min.year).toBe(1200);
    expect(result!.max.year).toBe(1800);
  });
});

describe('Interval Comparisons - isBefore', () => {
  it('should return true when a is completely before b', () => {
    const a = createRange(100, 150);
    const b = createRange(200, 250);

    expect(isBefore(a, b)).toBe(true);
  });

  it('should return false when intervals overlap', () => {
    const a = createRange(100, 200);
    const b = createRange(150, 250);

    expect(isBefore(a, b)).toBe(false);
  });

  it('should return false when a is after b', () => {
    const a = createRange(200, 250);
    const b = createRange(100, 150);

    expect(isBefore(a, b)).toBe(false);
  });

  it('should return false for adjacent intervals', () => {
    const a = createRange(100, 150);
    const b = createRange(150, 200);

    expect(isBefore(a, b)).toBe(false);
  });

  it('should handle point intervals', () => {
    const a = createRange(100, 100);
    const b = createRange(200, 200);

    expect(isBefore(a, b)).toBe(true);
  });
});

describe('Interval Comparisons - isAfter', () => {
  it('should return true when a is completely after b', () => {
    const a = createRange(200, 250);
    const b = createRange(100, 150);

    expect(isAfter(a, b)).toBe(true);
  });

  it('should return false when intervals overlap', () => {
    const a = createRange(150, 250);
    const b = createRange(100, 200);

    expect(isAfter(a, b)).toBe(false);
  });

  it('should return false when a is before b', () => {
    const a = createRange(100, 150);
    const b = createRange(200, 250);

    expect(isAfter(a, b)).toBe(false);
  });

  it('should return false for adjacent intervals', () => {
    const a = createRange(150, 200);
    const b = createRange(100, 150);

    expect(isAfter(a, b)).toBe(false);
  });
});

describe('Interval Comparisons - overlaps', () => {
  it('should return true for overlapping intervals', () => {
    const a = createRange(100, 200);
    const b = createRange(150, 250);

    expect(overlaps(a, b)).toBe(true);
  });

  it('should return false for disjoint intervals', () => {
    const a = createRange(100, 150);
    const b = createRange(200, 250);

    expect(overlaps(a, b)).toBe(false);
  });

  it('should return true when one contains the other', () => {
    const a = createRange(100, 300);
    const b = createRange(150, 200);

    expect(overlaps(a, b)).toBe(true);
  });

  it('should return false for adjacent intervals', () => {
    const a = createRange(100, 150);
    const b = createRange(151, 200);

    expect(overlaps(a, b)).toBe(false);
  });

  it('should return true for identical intervals', () => {
    const a = createRange(100, 200);
    const b = createRange(100, 200);

    expect(overlaps(a, b)).toBe(true);
  });

  it('should return true for point intervals that overlap', () => {
    const a = createRange(150, 150);
    const b = createRange(100, 200);

    expect(overlaps(a, b)).toBe(true);
  });
});

describe('Interval Comparisons - contains', () => {
  it('should return true when a contains b', () => {
    const a = createRange(100, 300);
    const b = createRange(150, 200);

    expect(contains(a, b)).toBe(true);
  });

  it('should return false when b extends beyond a', () => {
    const a = createRange(100, 200);
    const b = createRange(150, 250);

    expect(contains(a, b)).toBe(false);
  });

  it('should return true for identical intervals', () => {
    const a = createRange(100, 200);
    const b = createRange(100, 200);

    expect(contains(a, b)).toBe(true);
  });

  it('should return false when intervals are disjoint', () => {
    const a = createRange(100, 150);
    const b = createRange(200, 250);

    expect(contains(a, b)).toBe(false);
  });

  it('should return true when a contains point b', () => {
    const a = createRange(100, 200);
    const b = createRange(150, 150);

    expect(contains(a, b)).toBe(true);
  });

  it('should return false when a is point and b is range', () => {
    const a = createRange(150, 150);
    const b = createRange(100, 200);

    expect(contains(a, b)).toBe(false);
  });

  it('should handle boundary conditions', () => {
    const a = createRange(100, 200);
    const bStart = createRange(100, 150);
    const bEnd = createRange(150, 200);

    expect(contains(a, bStart)).toBe(true);
    expect(contains(a, bEnd)).toBe(true);
  });
});

describe('Edge Cases and Integration', () => {
  it('should handle BC dates (negative years)', () => {
    const a = createRange(-500, -400);
    const b = createRange(-450, -350);
    const result = intersection(a, b);

    expect(result).not.toBeNull();
    expect(result!.min.year).toBe(-450);
    expect(result!.max.year).toBe(-400);
  });

  it('should handle BC to AD transition', () => {
    const a = createRange(-100, 100);
    const b = createRange(-50, 50);
    const result = intersection(a, b);

    expect(result).not.toBeNull();
    expect(result!.min.year).toBe(-50);
    expect(result!.max.year).toBe(50);
  });

  it('should handle precise dates with months and days', () => {
    const a: TimeRange = {
      min: createPoint(1920, 1, 1),
      max: createPoint(1920, 12, 31),
      precision: 'day',
      anchored: true
    };
    const b: TimeRange = {
      min: createPoint(1920, 6, 1),
      max: createPoint(1921, 6, 1),
      precision: 'day',
      anchored: true
    };
    const result = intersection(a, b);

    expect(result).not.toBeNull();
    expect(result!.min.year).toBe(1920);
    expect(result!.max.year).toBe(1920);
  });

  it('should handle very large time spans', () => {
    const a = createRange(-10000, 10000); // 20,000 years
    const b = createRange(-5000, 5000);
    const result = intersection(a, b);

    expect(result).not.toBeNull();
    expect(width(result!)).toBe(10000 * 365);
  });

  it('should handle empty intervals consistently', () => {
    const empty = createRange(200, 100); // Invalid
    const valid = createRange(100, 200);

    expect(isEmpty(empty)).toBe(true);
    expect(intersection(empty, valid)).toBeNull();
    expect(overlaps(empty, valid)).toBe(false);
  });
});
