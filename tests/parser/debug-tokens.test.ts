import { describe, it } from 'vitest';
import { Lexer } from '../../src/parser/lexer.js';

describe('Debug Tokens', () => {
  it('should tokenize frontmatter', () => {
    const input = `---
title: Timeline of Jacob's Life
reference: jacobBorn
---
`;
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    
    console.log('Tokens:');
    tokens.forEach((token, i) => {
      console.log(`  ${i.toString().padStart(3)}: ${token.type.padEnd(25)} "${token.value}" @${token.start.line}:${token.start.column}`);
    });
  });
});
