/**
 * Token types and definitions for the lexer
 */

/**
 * Token types recognized by the lexer
 */
export enum TokenType {
  // Identifiers and literals
  ID = 'ID', // Event IDs (camelCase identifiers)
  STRING = 'STRING', // Quoted strings
  NUMBER = 'NUMBER', // Numeric literals
  DATE = 'DATE', // Date literals (YYYY, YYYY-MM, YYYY-MM-DD)

  // Keywords
  AFTER = 'AFTER',
  BEFORE = 'BEFORE',
  DURING = 'DURING',
  START_AFTER = 'START_AFTER',
  END_AFTER = 'END_AFTER',
  START_BEFORE = 'START_BEFORE',
  END_BEFORE = 'END_BEFORE',
  DATE_KW = 'DATE_KW', // "date:" property
  DURATION = 'DURATION', // "duration:" property
  SOURCE = 'SOURCE', // "source:" property
  NOTE = 'NOTE', // "note:" property
  TAGS = 'TAGS', // "tags:" property

  // Time units
  YEARS = 'YEARS',
  MONTHS = 'MONTHS',
  DAYS = 'DAYS',

  // Confidence levels
  CONFIDENCE_HIGH = 'CONFIDENCE_HIGH', // [high]
  CONFIDENCE_MEDIUM = 'CONFIDENCE_MEDIUM', // [medium]
  CONFIDENCE_LOW = 'CONFIDENCE_LOW', // [low]

  // Symbols
  COLON = 'COLON', // :
  PLUS = 'PLUS', // +
  MINUS = 'MINUS', // -
  TILDE = 'TILDE', // ~ (approximate marker)
  HYPHEN = 'HYPHEN', // - (in ranges like 13-15)
  DOT = 'DOT', // . (for X.start, X.end)
  HASH = 'HASH', // # (for tags, groups, theories)
  LBRACKET = 'LBRACKET', // [
  RBRACKET = 'RBRACKET', // ]
  PIPE = 'PIPE', // | (for multi-line strings)

  // Group/Theory markers
  GROUP = 'GROUP', // #group
  ENDGROUP = 'ENDGROUP', // #endgroup
  THEORY = 'THEORY', // #theory
  ENDTHEORY = 'ENDTHEORY', // #endtheory
  TAG = 'TAG', // #tagName

  // Frontmatter
  FRONTMATTER_DELIMITER = 'FRONTMATTER_DELIMITER', // ---

  // Whitespace and structural
  NEWLINE = 'NEWLINE',
  INDENT = 'INDENT',
  DEDENT = 'DEDENT',
  EOF = 'EOF',

  // Special
  UNKNOWN = 'UNKNOWN',
}

/**
 * Position in source text
 */
export interface Position {
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** Character offset from start of input (0-indexed) */
  offset: number;
}

/**
 * A token produced by the lexer
 */
export interface Token {
  /** Type of token */
  type: TokenType;
  /** Literal value of the token */
  value: string;
  /** Start position in source */
  start: Position;
  /** End position in source */
  end: Position;
}
