import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/parser/lexer.js';

describe('Debug Lexer', () => {
  it('should tokenize date range', () => {
    const input = '1918-1922';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    
    console.log('Tokens:');
    tokens.forEach((token, i) => {
      if (token.type !== 'EOF') {
        console.log(`  ${i}: ${token.type} = "${token.value}"`);
      }
    });
  });
});
