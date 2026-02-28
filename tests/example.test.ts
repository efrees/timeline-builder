import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with objects', () => {
    const obj = { name: 'timeline-builder', version: '0.1.0' };
    expect(obj).toHaveProperty('name');
    expect(obj.name).toBe('timeline-builder');
  });
});
