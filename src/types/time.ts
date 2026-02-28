/**
 * Time-related types for the timeline system.
 * Supports various precision levels and uncertainty representations.
 */

/**
 * Era designation for historical dates
 */
export type Era = 'BC' | 'AD' | 'BCE' | 'CE';

/**
 * Precision level for time points
 */
export type Precision = 'year' | 'month' | 'day';

/**
 * A specific point in time with optional precision
 */
export interface TimePoint {
  /** Year value (negative for BC/BCE) */
  year: number;
  /** Month (1-12, optional based on precision) */
  month?: number;
  /** Day (1-31, optional based on precision) */
  day?: number;
  /** Era designation (optional, defaults to AD/CE for positive years, BC/BCE for negative) */
  era?: Era;
}

/**
 * A range of time with minimum and maximum bounds.
 * Represents uncertainty in dating.
 */
export interface TimeRange {
  /** Earliest possible date */
  min: TimePoint;
  /** Latest possible date */
  max: TimePoint;
  /** Precision level of this range */
  precision: Precision;
  /** Whether this range is anchored to an absolute date */
  anchored: boolean;
}

/**
 * Time units for durations
 */
export type TimeUnit = 'years' | 'months' | 'days';

/**
 * A duration with optional uncertainty
 */
export interface Duration {
  /** Single value or range [min, max] */
  value: number | [number, number];
  /** Time unit */
  unit: TimeUnit;
  /** Whether this is an approximate duration (e.g., ~3 years) */
  approximate: boolean;
}
