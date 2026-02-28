/**
 * Lexer for tokenizing .tl timeline files
 */

import { Token, TokenType, Position } from './tokens.js';

/**
 * Keywords map
 */
const KEYWORDS: Record<string, TokenType> = {
  after: TokenType.AFTER,
  before: TokenType.BEFORE,
  during: TokenType.DURING,
  'start-after': TokenType.START_AFTER,
  'end-after': TokenType.END_AFTER,
  'start-before': TokenType.START_BEFORE,
  'end-before': TokenType.END_BEFORE,
  date: TokenType.DATE_KW,
  duration: TokenType.DURATION,
  source: TokenType.SOURCE,
  note: TokenType.NOTE,
  tags: TokenType.TAGS,
  years: TokenType.YEARS,
  year: TokenType.YEARS, // Allow singular
  months: TokenType.MONTHS,
  month: TokenType.MONTHS, // Allow singular
  days: TokenType.DAYS,
  day: TokenType.DAYS, // Allow singular
};

/**
 * Lexer class for tokenization
 */
export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Tokenize the entire input
   */
  public tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.scanToken();
    }

    // Add EOF token
    this.tokens.push(this.createToken(TokenType.EOF, ''));
    return this.tokens;
  }

  /**
   * Scan a single token
   */
  private scanToken(): void {
    const char = this.peek();

    // Skip whitespace (except newlines)
    if (char === ' ' || char === '\t' || char === '\r') {
      this.advance();
      return;
    }

    // Newlines
    if (char === '\n') {
      this.addToken(TokenType.NEWLINE, '\n');
      this.advance();
      this.line++;
      this.column = 1;
      return;
    }

    // Comments (line comments with //)
    if (char === '/' && this.peekNext() === '/') {
      this.skipLineComment();
      return;
    }

    // Frontmatter delimiter (---)
    if (char === '-' && this.peekNext() === '-' && this.peek(2) === '-') {
      this.advance();
      this.advance();
      this.advance();
      this.addToken(TokenType.FRONTMATTER_DELIMITER, '---');
      return;
    }

    // Hash (for tags, groups, theories)
    if (char === '#') {
      this.scanHashToken();
      return;
    }

    // Colon
    if (char === ':') {
      this.advance();
      this.addToken(TokenType.COLON, ':');
      return;
    }

    // Plus
    if (char === '+') {
      this.advance();
      this.addToken(TokenType.PLUS, '+');
      return;
    }

    // Minus or hyphen
    if (char === '-') {
      this.advance();
      this.addToken(TokenType.MINUS, '-');
      return;
    }

    // Tilde (approximate)
    if (char === '~') {
      this.advance();
      this.addToken(TokenType.TILDE, '~');
      return;
    }

    // Dot
    if (char === '.') {
      this.advance();
      this.addToken(TokenType.DOT, '.');
      return;
    }

    // Brackets (for confidence levels)
    if (char === '[') {
      this.scanBracketToken();
      return;
    }

    if (char === ']') {
      this.advance();
      this.addToken(TokenType.RBRACKET, ']');
      return;
    }

    // Pipe (for multi-line strings)
    if (char === '|') {
      this.advance();
      this.addToken(TokenType.PIPE, '|');
      return;
    }

    // Strings (single or double quoted)
    if (char === '"' || char === "'") {
      this.scanString(char);
      return;
    }

    // Numbers and dates
    if (this.isDigit(char)) {
      this.scanNumberOrDate();
      return;
    }

    // Identifiers and keywords
    if (this.isAlpha(char)) {
      this.scanIdentifier();
      return;
    }

    // Unknown character
    this.advance();
    this.addToken(TokenType.UNKNOWN, char);
  }

  /**
   * Scan hash tokens (#tag, #group, etc.)
   */
  private scanHashToken(): void {
    this.advance(); // Skip #
    const start = this.position;

    if (this.isAlpha(this.peek())) {
      while (this.isAlphaNumeric(this.peek())) {
        this.advance();
      }
      const value = this.input.slice(start, this.position);
      const lowerValue = value.toLowerCase();

      if (lowerValue === 'group') {
        this.addToken(TokenType.GROUP, '#group');
      } else if (lowerValue === 'endgroup') {
        this.addToken(TokenType.ENDGROUP, '#endgroup');
      } else if (lowerValue === 'theory') {
        this.addToken(TokenType.THEORY, '#theory');
      } else if (lowerValue === 'endtheory') {
        this.addToken(TokenType.ENDTHEORY, '#endtheory');
      } else {
        this.addToken(TokenType.TAG, '#' + value);
      }
    } else {
      this.addToken(TokenType.HASH, '#');
    }
  }

  /**
   * Scan bracket tokens (confidence levels)
   */
  private scanBracketToken(): void {
    this.advance(); // Skip [
    const start = this.position;

    while (!this.isAtEnd() && this.peek() !== ']') {
      this.advance();
    }

    const value = this.input.slice(start, this.position);
    const lowerValue = value.toLowerCase();

    if (this.peek() === ']') {
      this.advance(); // Skip ]

      if (lowerValue === 'high') {
        this.addToken(TokenType.CONFIDENCE_HIGH, '[high]');
      } else if (lowerValue === 'medium') {
        this.addToken(TokenType.CONFIDENCE_MEDIUM, '[medium]');
      } else if (lowerValue === 'low') {
        this.addToken(TokenType.CONFIDENCE_LOW, '[low]');
      } else {
        // Unknown bracket content, add as LBRACKET and the content
        this.addToken(TokenType.LBRACKET, '[');
      }
    } else {
      this.addToken(TokenType.LBRACKET, '[');
    }
  }

  /**
   * Scan a string literal
   */
  private scanString(quote: string): void {
    this.advance(); // Skip opening quote
    const start = this.position;

    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      // Unterminated string
      this.addToken(TokenType.UNKNOWN, this.input.slice(start));
      return;
    }

    const value = this.input.slice(start, this.position);
    this.advance(); // Skip closing quote
    this.addToken(TokenType.STRING, value);
  }

  /**
   * Scan a number or date
   */
  private scanNumberOrDate(): void {
    const start = this.position;

    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Check if it's a date (YYYY-MM or YYYY-MM-DD)
    if (this.peek() === '-' && this.isDigit(this.peekNext())) {
      this.advance(); // Skip -
      while (this.isDigit(this.peek())) {
        this.advance();
      }

      if (this.peek() === '-' && this.isDigit(this.peekNext())) {
        this.advance(); // Skip -
        while (this.isDigit(this.peek())) {
          this.advance();
        }
      }

      const value = this.input.slice(start, this.position);
      this.addToken(TokenType.DATE, value);
    } else {
      const value = this.input.slice(start, this.position);
      this.addToken(TokenType.NUMBER, value);
    }
  }

  /**
   * Scan an identifier or keyword
   */
  private scanIdentifier(): void {
    const start = this.position;

    while (this.isAlphaNumeric(this.peek()) || this.peek() === '-') {
      this.advance();
    }

    const value = this.input.slice(start, this.position);
    const lowerValue = value.toLowerCase();

    // Check if it's a keyword
    const tokenType = KEYWORDS[lowerValue] ?? TokenType.ID;
    this.addToken(tokenType, value);
  }

  /**
   * Skip line comment (// ...)
   */
  private skipLineComment(): void {
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }
  }

  /**
   * Helper: Check if character is a digit
   */
  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  /**
   * Helper: Check if character is alphabetic
   */
  private isAlpha(char: string): boolean {
    return (
      (char >= 'a' && char <= 'z') ||
      (char >= 'A' && char <= 'Z') ||
      char === '_'
    );
  }

  /**
   * Helper: Check if character is alphanumeric
   */
  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  /**
   * Helper: Check if at end of input
   */
  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }

  /**
   * Helper: Peek at current character
   */
  private peek(offset: number = 0): string {
    const pos = this.position + offset;
    if (pos >= this.input.length) return '\0';
    return this.input[pos] ?? '\0';
  }

  /**
   * Helper: Peek at next character
   */
  private peekNext(): string {
    return this.peek(1);
  }

  /**
   * Helper: Advance position
   */
  private advance(): void {
    if (!this.isAtEnd()) {
      this.position++;
      this.column++;
    }
  }

  /**
   * Helper: Add a token to the list
   */
  private addToken(type: TokenType, value: string): void {
    this.tokens.push(this.createToken(type, value));
  }

  /**
   * Helper: Create a token
   */
  private createToken(type: TokenType, value: string): Token {
    const start: Position = {
      line: this.line,
      column: this.column - value.length,
      offset: this.position - value.length,
    };
    const end: Position = {
      line: this.line,
      column: this.column,
      offset: this.position,
    };
    return { type, value, start, end };
  }
}
