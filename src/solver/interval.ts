/**
 * Interval arithmetic operations for constraint propagation.
 * Works with TimeRange types to support temporal reasoning.
 */

import { TimeRange, TimePoint, Duration } from '../types/time.js';

/**
 * Converts a TimePoint to a comparable number (days since epoch).
 * For simplicity, we use a rough approximation:
 * - Year 0 = day 0
 * - Months are 30 days
 * - Each year is 365 days
 */
function timePointToNumber(tp: TimePoint): number {
  const year = tp.year;
  const month = tp.month ?? 1;
  const day = tp.day ?? 1;

  return year * 365 + (month - 1) * 30 + (day - 1);
}

/**
 * Converts a number (days) back to a TimePoint.
 * Inverse of timePointToNumber with approximate calendar conversion.
 */
function numberToTimePoint(days: number): TimePoint {
  const year = Math.floor(days / 365);
  const remainder = days - year * 365;
  const month = Math.floor(remainder / 30) + 1;
  const day = Math.floor(remainder % 30) + 1;

  return {
    year,
    month: Math.max(1, Math.min(12, month)),
    day: Math.max(1, Math.min(31, day))
  };
}

/**
 * Gets the duration in days from a Duration object.
 */
function durationToDays(duration: Duration): number | [number, number] {
  const multiplier = duration.unit === 'years' ? 365 : duration.unit === 'months' ? 30 : 1;

  if (typeof duration.value === 'number') {
    return duration.value * multiplier;
  } else {
    return [duration.value[0] * multiplier, duration.value[1] * multiplier];
  }
}

/**
 * Checks if a TimeRange is empty (invalid, where min > max).
 */
export function isEmpty(interval: TimeRange): boolean {
  const minDays = timePointToNumber(interval.min);
  const maxDays = timePointToNumber(interval.max);
  return minDays > maxDays;
}

/**
 * Checks if a TimeRange is a single point (min equals max).
 */
export function isPoint(interval: TimeRange): boolean {
  const minDays = timePointToNumber(interval.min);
  const maxDays = timePointToNumber(interval.max);
  return minDays === maxDays;
}

/**
 * Gets the width of a TimeRange in days.
 */
export function width(interval: TimeRange): number {
  const minDays = timePointToNumber(interval.min);
  const maxDays = timePointToNumber(interval.max);
  return Math.max(0, maxDays - minDays);
}

/**
 * Computes the intersection of two TimeRanges.
 * Returns the overlapping interval, or null if they are disjoint.
 */
export function intersection(a: TimeRange, b: TimeRange): TimeRange | null {
  const aMinDays = timePointToNumber(a.min);
  const aMaxDays = timePointToNumber(a.max);
  const bMinDays = timePointToNumber(b.min);
  const bMaxDays = timePointToNumber(b.max);

  const newMinDays = Math.max(aMinDays, bMinDays);
  const newMaxDays = Math.min(aMaxDays, bMaxDays);

  // If intervals don't overlap, return null
  if (newMinDays > newMaxDays) {
    return null;
  }

  return {
    min: numberToTimePoint(newMinDays),
    max: numberToTimePoint(newMaxDays),
    precision: a.precision, // Use first interval's precision
    anchored: a.anchored && b.anchored // Both must be anchored
  };
}

/**
 * Computes the union of two TimeRanges.
 * If intervals overlap or are adjacent, returns a single merged interval.
 * If disjoint, returns an array of both intervals.
 */
export function union(a: TimeRange, b: TimeRange): TimeRange | TimeRange[] {
  const aMinDays = timePointToNumber(a.min);
  const aMaxDays = timePointToNumber(a.max);
  const bMinDays = timePointToNumber(b.min);
  const bMaxDays = timePointToNumber(b.max);

  // Check if intervals overlap or are adjacent
  const overlap = !(aMaxDays < bMinDays || bMaxDays < aMinDays);
  // Adjacent means they touch at boundaries: a ends where b starts or vice versa
  // Years 100-150 and 151-200 are adjacent at the year boundary (150/151)
  // In our day-based system, year 150 ends at day 150*365+364, year 151 starts at day 151*365
  // So they're adjacent if there's approximately a year gap (or less) at the boundary
  const aEndYear = Math.floor(aMaxDays / 365);
  const bStartYear = Math.floor(bMinDays / 365);
  const bEndYear = Math.floor(bMaxDays / 365);
  const aStartYear = Math.floor(aMinDays / 365);

  const adjacent = (aEndYear + 1 >= bStartYear && aEndYear + 1 <= bStartYear + 1) ||
                   (bEndYear + 1 >= aStartYear && bEndYear + 1 <= aStartYear + 1);

  if (overlap || adjacent) {
    // Merge into single interval
    const newMinDays = Math.min(aMinDays, bMinDays);
    const newMaxDays = Math.max(aMaxDays, bMaxDays);

    return {
      min: numberToTimePoint(newMinDays),
      max: numberToTimePoint(newMaxDays),
      precision: a.precision,
      anchored: a.anchored && b.anchored
    };
  } else {
    // Return both intervals as array (disjoint)
    return [a, b];
  }
}

/**
 * Widens a TimeRange by a Duration.
 * Expands the interval by adding uncertainty/duration to both ends.
 */
export function widen(interval: TimeRange, duration: Duration): TimeRange {
  const minDays = timePointToNumber(interval.min);
  const maxDays = timePointToNumber(interval.max);
  const days = durationToDays(duration);

  let expansion: number;
  if (typeof days === 'number') {
    expansion = days;
  } else {
    // Use the maximum of the range for widening
    expansion = days[1];
  }

  // If approximate, add extra margin (20% of duration)
  if (duration.approximate) {
    expansion = expansion * 1.2;
  }

  return {
    min: numberToTimePoint(minDays - expansion),
    max: numberToTimePoint(maxDays + expansion),
    precision: interval.precision,
    anchored: interval.anchored
  };
}

/**
 * Narrows a TimeRange by intersecting with a constraint interval.
 * Returns the tightened interval, or null if the constraint makes it empty.
 */
export function narrow(interval: TimeRange, constraint: TimeRange): TimeRange | null {
  return intersection(interval, constraint);
}

/**
 * Checks if interval 'a' is completely before interval 'b'.
 * True if a.max < b.min (no overlap, a ends before b starts).
 */
export function isBefore(a: TimeRange, b: TimeRange): boolean {
  const aMaxDays = timePointToNumber(a.max);
  const bMinDays = timePointToNumber(b.min);
  return aMaxDays < bMinDays;
}

/**
 * Checks if interval 'a' is completely after interval 'b'.
 * True if a.min > b.max (no overlap, a starts after b ends).
 */
export function isAfter(a: TimeRange, b: TimeRange): boolean {
  const aMinDays = timePointToNumber(a.min);
  const bMaxDays = timePointToNumber(b.max);
  return aMinDays > bMaxDays;
}

/**
 * Checks if two TimeRanges overlap.
 * True if there is any time point that belongs to both intervals.
 * Returns false if either interval is empty.
 */
export function overlaps(a: TimeRange, b: TimeRange): boolean {
  // Empty intervals don't overlap with anything
  if (isEmpty(a) || isEmpty(b)) {
    return false;
  }

  const aMinDays = timePointToNumber(a.min);
  const aMaxDays = timePointToNumber(a.max);
  const bMinDays = timePointToNumber(b.min);
  const bMaxDays = timePointToNumber(b.max);

  return !(aMaxDays < bMinDays || bMaxDays < aMinDays);
}

/**
 * Checks if interval 'a' fully contains interval 'b'.
 * True if b.min >= a.min and b.max <= a.max.
 */
export function contains(a: TimeRange, b: TimeRange): boolean {
  const aMinDays = timePointToNumber(a.min);
  const aMaxDays = timePointToNumber(a.max);
  const bMinDays = timePointToNumber(b.min);
  const bMaxDays = timePointToNumber(b.max);

  return bMinDays >= aMinDays && bMaxDays <= aMaxDays;
}
