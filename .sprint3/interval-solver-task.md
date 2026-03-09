# Task: Interval Solver (P2.1 + P2.2)

**Developer:** interval-solver
**Sprint:** 3
**Size:** M + S = Medium-Large
**Dependencies:** None (can start immediately)

## Overview

You are implementing the foundational interval arithmetic library for the constraint solver. This will enable time range operations and comparisons needed for constraint propagation.

## Task P2.1: Extend Interval Arithmetic for Constraint Propagation

### Goal
Create a complete TimeInterval class with operations for intersection, union, widening, and narrowing.

### Files to Create
- `src/solver/interval.ts` - Main implementation
- `tests/solver/interval.test.ts` - Comprehensive test suite

### Requirements

**⚠️ IMPORTANT:** The project already has `TimeRange` type in `src/types/time.ts`. Review this type first and decide whether to:
- Extend TimeRange with additional methods
- Create a wrapper class that adds operations
- Add utility functions that work with TimeRange

1. **TimeInterval Operations**
   - Work with existing `TimeRange` type from `src/types/time.ts`
   - TimeRange already has: min, max (TimePoint), precision, anchored
   - Use existing `TimePoint` type for time values
   - Support both closed and open intervals (if needed)

2. **Operations to Implement**
   - `intersection(a: TimeInterval, b: TimeInterval): TimeInterval | null`
     - Returns overlap between intervals, or null if disjoint
   - `union(a: TimeInterval, b: TimeInterval): TimeInterval | TimeInterval[]`
     - Returns merged interval if overlapping, or array of both if disjoint
   - `widen(interval: TimeInterval, duration: Duration): TimeInterval`
     - Expand interval by adding uncertain duration
     - Example: `[1920, 1925] + [13, 15] years = [1933, 1940]`
   - `narrow(interval: TimeInterval, constraint: TimeInterval): TimeInterval | null`
     - Tighten interval by intersecting with constraint
     - Return null if conflict detected

3. **Helper Functions**
   - `isEmpty(interval: TimeInterval): boolean`
   - `isPoint(interval: TimeInterval): boolean` - check if min == max
   - `width(interval: TimeInterval): number` - duration in some unit

### Testing Requirements
- Test intersection with overlapping, adjacent, and disjoint intervals
- Test union with various overlap scenarios
- Test widening with exact and uncertain durations
- Test narrowing with compatible and conflicting constraints
- Test edge cases: empty intervals, point intervals, infinite ranges
- Target: >80% code coverage

### Design Considerations
- Should widening/narrowing work with `Duration` objects from types?
- How to handle different time units (years, months, days)?
- Should intervals track uncertainty/confidence?

---

## Task P2.2: Implement Time Range Comparison and Ordering

### Goal
Add comparison operations for determining temporal relationships between intervals.

### Files to Modify
- `src/solver/interval.ts` - Add comparison functions

### Operations to Implement

1. **isBefore(a: TimeInterval, b: TimeInterval): boolean**
   - True if `a.max < b.min` (a completely before b)

2. **isAfter(a: TimeInterval, b: TimeInterval): boolean**
   - True if `a.min > b.max` (a completely after b)

3. **overlaps(a: TimeInterval, b: TimeInterval): boolean**
   - True if intervals have any overlap

4. **contains(a: TimeInterval, b: TimeInterval): boolean**
   - True if `a` fully contains `b`

5. **meets(a: TimeInterval, b: TimeInterval): boolean** (optional)
   - True if `a.max == b.min` (adjacent intervals)

### Edge Cases to Handle
- Point events (min == max)
- Infinite/unbounded ranges (future feature?)
- Same interval (isBefore should be false)

### Testing Requirements
- Test each comparison with various interval configurations
- Test with point intervals
- Test reflexive/symmetric properties where applicable
- Add tests to existing `tests/solver/interval.test.ts`

---

## Implementation Guidelines

### Code Style
- Follow existing TypeScript patterns from `src/types/`
- Use strict type checking (project is in strict mode)
- Add JSDoc comments for all public functions
- Export types and functions from `src/solver/index.ts`

### Testing Strategy
1. Write tests first (TDD approach)
2. Test one operation at a time
3. Run tests frequently: `npm test -- interval.test.ts`
4. Aim for >80% coverage: `npm run test:coverage`

### Time Handling
- Reuse `TimePoint`, `Duration`, `TimeUnit` from `src/types/time.ts`
- Consider creating utility functions for TimePoint arithmetic
- Be mindful of calendar complexities (month/day precision)

### Commit Strategy
- Commit P2.1 and P2.2 together when both are complete and tested
- Commit message: "Implement interval arithmetic and comparisons (P2.1, P2.2)"
- Include Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>

---

## Deliverables Checklist

- [ ] `src/solver/interval.ts` created with TimeInterval class
- [ ] Intersection operation implemented and tested
- [ ] Union operation implemented and tested
- [ ] Widen operation implemented and tested
- [ ] Narrow operation implemented and tested
- [ ] Comparison operations (isBefore, isAfter, overlaps, contains) implemented
- [ ] `tests/solver/interval.test.ts` with comprehensive test coverage
- [ ] All tests passing: `npm test`
- [ ] Coverage >80% for interval.ts: `npm run test:coverage`
- [ ] Code committed with proper message

---

## Questions or Blockers?

- If design decisions need input, message sprint-lead
- If blocked by missing types, coordinate with team
- If tests are unclear, reference Sprint 1-2 test patterns

## Success Criteria

✅ All interval operations work correctly with existing TimePoint/Duration types
✅ All comparison operations handle edge cases
✅ Test suite is comprehensive (>80% coverage)
✅ Code is well-documented with JSDoc
✅ Work is committed atomically
