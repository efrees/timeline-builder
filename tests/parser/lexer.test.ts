import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/parser/lexer.js';
import { TokenType } from '../../src/parser/tokens.js';

describe('Lexer', () => {
  describe('Basic Tokens', () => {
    it('should tokenize identifiers', () => {
      const lexer = new Lexer('eventId anotherEvent');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.ID);
      expect(tokens[0]?.value).toBe('eventId');
      expect(tokens[1]?.type).toBe(TokenType.ID);
      expect(tokens[1]?.value).toBe('anotherEvent');
      expect(tokens[2]?.type).toBe(TokenType.EOF);
    });

    it('should tokenize colon', () => {
      const lexer = new Lexer('eventId:');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.ID);
      expect(tokens[1]?.type).toBe(TokenType.COLON);
      expect(tokens[1]?.value).toBe(':');
    });

    it('should tokenize numbers', () => {
      const lexer = new Lexer('123 456');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[0]?.value).toBe('123');
      expect(tokens[1]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]?.value).toBe('456');
    });

    it('should tokenize strings', () => {
      const lexer = new Lexer('"hello world"');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.STRING);
      expect(tokens[0]?.value).toBe('hello world');
    });
  });

  describe('Date Tokens', () => {
    it('should tokenize year dates', () => {
      const lexer = new Lexer('1920');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[0]?.value).toBe('1920');
    });

    it('should tokenize year-month dates', () => {
      const lexer = new Lexer('1920-06');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.DATE);
      expect(tokens[0]?.value).toBe('1920-06');
    });

    it('should tokenize full dates', () => {
      const lexer = new Lexer('1920-06-15');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.DATE);
      expect(tokens[0]?.value).toBe('1920-06-15');
    });
  });

  describe('Keywords', () => {
    it('should tokenize constraint keywords', () => {
      const lexer = new Lexer('after before during');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.AFTER);
      expect(tokens[1]?.type).toBe(TokenType.BEFORE);
      expect(tokens[2]?.type).toBe(TokenType.DURING);
    });

    it('should tokenize compound constraint keywords', () => {
      const lexer = new Lexer('start-after end-before');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.START_AFTER);
      expect(tokens[1]?.type).toBe(TokenType.END_BEFORE);
    });

    it('should tokenize property keywords', () => {
      const lexer = new Lexer('date duration source note tags');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.DATE_KW);
      expect(tokens[1]?.type).toBe(TokenType.DURATION);
      expect(tokens[2]?.type).toBe(TokenType.SOURCE);
      expect(tokens[3]?.type).toBe(TokenType.NOTE);
      expect(tokens[4]?.type).toBe(TokenType.TAGS);
    });

    it('should tokenize time units', () => {
      const lexer = new Lexer('years months days');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.YEARS);
      expect(tokens[1]?.type).toBe(TokenType.MONTHS);
      expect(tokens[2]?.type).toBe(TokenType.DAYS);
    });

    it('should tokenize singular time units', () => {
      const lexer = new Lexer('year month day');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.YEARS);
      expect(tokens[1]?.type).toBe(TokenType.MONTHS);
      expect(tokens[2]?.type).toBe(TokenType.DAYS);
    });
  });

  describe('Symbols', () => {
    it('should tokenize plus and minus', () => {
      const lexer = new Lexer('+ -');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.PLUS);
      expect(tokens[1]?.type).toBe(TokenType.MINUS);
    });

    it('should tokenize tilde (approximate)', () => {
      const lexer = new Lexer('~1920');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.TILDE);
      expect(tokens[1]?.type).toBe(TokenType.NUMBER);
    });

    it('should tokenize dot', () => {
      const lexer = new Lexer('eventId.start');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.ID);
      expect(tokens[1]?.type).toBe(TokenType.DOT);
      expect(tokens[2]?.type).toBe(TokenType.ID);
    });
  });

  describe('Confidence Levels', () => {
    it('should tokenize confidence levels', () => {
      const lexer = new Lexer('[high] [medium] [low]');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.CONFIDENCE_HIGH);
      expect(tokens[1]?.type).toBe(TokenType.CONFIDENCE_MEDIUM);
      expect(tokens[2]?.type).toBe(TokenType.CONFIDENCE_LOW);
    });
  });

  describe('Groups and Tags', () => {
    it('should tokenize group markers', () => {
      const lexer = new Lexer('#group #endgroup');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.GROUP);
      expect(tokens[1]?.type).toBe(TokenType.ENDGROUP);
    });

    it('should tokenize theory markers', () => {
      const lexer = new Lexer('#theory #endtheory');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.THEORY);
      expect(tokens[1]?.type).toBe(TokenType.ENDTHEORY);
    });

    it('should tokenize tags', () => {
      const lexer = new Lexer('#family #travel');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.TAG);
      expect(tokens[0]?.value).toBe('#family');
      expect(tokens[1]?.type).toBe(TokenType.TAG);
      expect(tokens[1]?.value).toBe('#travel');
    });
  });

  describe('Frontmatter', () => {
    it('should tokenize frontmatter delimiters', () => {
      const lexer = new Lexer('---');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.FRONTMATTER_DELIMITER);
      expect(tokens[0]?.value).toBe('---');
    });
  });

  describe('Whitespace and Comments', () => {
    it('should skip spaces and tabs', () => {
      const lexer = new Lexer('a   b\t\tc');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(4); // a, b, c, EOF
      expect(tokens[0]?.type).toBe(TokenType.ID);
      expect(tokens[1]?.type).toBe(TokenType.ID);
      expect(tokens[2]?.type).toBe(TokenType.ID);
    });

    it('should tokenize newlines', () => {
      const lexer = new Lexer('a\nb');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(4); // a, NEWLINE, b, EOF
      expect(tokens[0]?.type).toBe(TokenType.ID);
      expect(tokens[1]?.type).toBe(TokenType.NEWLINE);
      expect(tokens[2]?.type).toBe(TokenType.ID);
    });

    it('should skip line comments', () => {
      const lexer = new Lexer('a // comment\nb');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(4); // a, NEWLINE, b, EOF
      expect(tokens[0]?.type).toBe(TokenType.ID);
      expect(tokens[1]?.type).toBe(TokenType.NEWLINE);
      expect(tokens[2]?.type).toBe(TokenType.ID);
    });
  });

  describe('Complex Examples', () => {
    it('should tokenize a basic event definition', () => {
      const lexer = new Lexer('eventId: Event description');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.ID);
      expect(tokens[0]?.value).toBe('eventId');
      expect(tokens[1]?.type).toBe(TokenType.COLON);
      expect(tokens[2]?.type).toBe(TokenType.ID);
      expect(tokens[2]?.value).toBe('Event');
      expect(tokens[3]?.type).toBe(TokenType.ID);
      expect(tokens[3]?.value).toBe('description');
    });

    it('should tokenize a constraint with duration', () => {
      const lexer = new Lexer('after: eventA + 3 years');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.AFTER);
      expect(tokens[1]?.type).toBe(TokenType.COLON);
      expect(tokens[2]?.type).toBe(TokenType.ID);
      expect(tokens[3]?.type).toBe(TokenType.PLUS);
      expect(tokens[4]?.type).toBe(TokenType.NUMBER);
      expect(tokens[5]?.type).toBe(TokenType.YEARS);
    });

    it('should tokenize a date property', () => {
      const lexer = new Lexer('date: 1920-06-15');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.DATE_KW);
      expect(tokens[1]?.type).toBe(TokenType.COLON);
      expect(tokens[2]?.type).toBe(TokenType.DATE);
      expect(tokens[2]?.value).toBe('1920-06-15');
    });

    it('should tokenize approximate date', () => {
      const lexer = new Lexer('date: ~1920');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.type).toBe(TokenType.DATE_KW);
      expect(tokens[1]?.type).toBe(TokenType.COLON);
      expect(tokens[2]?.type).toBe(TokenType.TILDE);
      expect(tokens[3]?.type).toBe(TokenType.NUMBER);
    });

    it('should tokenize a complete event with properties', () => {
      const input = `eventId: Event description
  date: 1920
  source: "Genesis 1:1"
  note: "A note"
  tags: #family #travel`;

      const lexer = new Lexer(input);
      const tokens = lexer.tokenize();

      // Should have tokens for all parts
      expect(tokens.some((t) => t.type === TokenType.ID)).toBe(true);
      expect(tokens.some((t) => t.type === TokenType.COLON)).toBe(true);
      expect(tokens.some((t) => t.type === TokenType.DATE_KW)).toBe(true);
      expect(tokens.some((t) => t.type === TokenType.SOURCE)).toBe(true);
      expect(tokens.some((t) => t.type === TokenType.NOTE)).toBe(true);
      expect(tokens.some((t) => t.type === TokenType.TAGS)).toBe(true);
      expect(tokens.some((t) => t.type === TokenType.TAG)).toBe(true);
      expect(tokens.some((t) => t.type === TokenType.NEWLINE)).toBe(true);
    });
  });

  describe('Position Tracking', () => {
    it('should track line and column positions', () => {
      const lexer = new Lexer('a\nb');
      const tokens = lexer.tokenize();

      expect(tokens[0]?.start.line).toBe(1);
      expect(tokens[0]?.start.column).toBe(1);
      expect(tokens[2]?.start.line).toBe(2);
      expect(tokens[2]?.start.column).toBe(1);
    });
  });
});
