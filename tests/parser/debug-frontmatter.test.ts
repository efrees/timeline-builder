import { describe, it, expect } from 'vitest';
import { parse } from '../../src/parser/parser.js';

describe('Debug Frontmatter', () => {
  it('should parse title with apostrophe', () => {
    const input = `---
title: Timeline of Jacob's Life
reference: jacobBorn
---
`;
    console.log('Input:', JSON.stringify(input));
    const timeline = parse(input);
    console.log('Metadata:', timeline.metadata);
    expect(timeline.metadata.title).toBe("Timeline of Jacob's Life");
  });
});
