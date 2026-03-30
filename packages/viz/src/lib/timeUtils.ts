// Utility functions for converting TimePoint to Date objects for D3

import type { TimePoint } from './types';

export function timePointToDate(tp: TimePoint): Date {
  return new Date(
    tp.year,
    tp.month !== undefined ? tp.month - 1 : 0,
    tp.day !== undefined ? tp.day : 1
  );
}

export function timePointToYear(tp: TimePoint): number {
  // Convert to decimal year for better precision
  let year = tp.year;

  if (tp.month !== undefined) {
    year += (tp.month - 1) / 12;

    if (tp.day !== undefined) {
      // Rough approximation: add day fraction
      year += (tp.day - 1) / 365.25;
    }
  }

  return year;
}
