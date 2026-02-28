/**
 * Timeline Builder - Main entry point
 *
 * A research-focused timeline tool for managing events with uncertain dates
 * and complex temporal constraints.
 */

// Export types
export * from './types/index.js';

// Export parser components
export { Lexer } from './parser/lexer.js';
export { TokenType } from './parser/tokens.js';
export type { Token, Position } from './parser/tokens.js';
