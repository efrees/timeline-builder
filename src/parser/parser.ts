/**
 * Parser for .tl timeline files
 * Converts tokens from the lexer into a structured Timeline object
 */

import { Lexer } from './lexer.js';
import { Token, TokenType } from './tokens.js';
import {
  Timeline,
  Event,
  Metadata,
  Group,
  Theory,
} from '../types/timeline.js';
import {
  Constraint,
  ConstraintType,
  ConfidenceLevel,
  AnchorPoint,
} from '../types/constraints.js';
import {
  TimePoint,
  Duration,
  Precision,
  TimeUnit,
} from '../types/time.js';

/**
 * Parse error with position information
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number,
    public suggestion?: string
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Parser class for building Timeline from tokens
 */
export class Parser {
  private tokens: Token[];
  private current: number = 0;
  private pendingEvents: Event[] = [];
  private pendingGroups: Group[] = [];

  constructor(input: string) {
    const lexer = new Lexer(input);
    this.tokens = lexer.tokenize();
  }

  /**
   * Parse the entire timeline
   */
  public parse(): Timeline {
    const timeline: Timeline = {
      metadata: {},
      events: new Map(),
      groups: [],
      theories: [],
    };

    // Skip initial newlines
    this.skipNewlines();

    // Parse frontmatter if present
    if (this.check(TokenType.FRONTMATTER_DELIMITER)) {
      timeline.metadata = this.parseFrontmatter();
    }

    // Skip newlines after frontmatter
    this.skipNewlines();

    // Parse events and groups
    while (!this.isAtEnd()) {
      if (this.check(TokenType.GROUP)) {
        const group = this.parseGroup();
        timeline.groups.push(group);
        // Add any pending nested groups
        while (this.pendingGroups.length > 0) {
          const nestedGroup = this.pendingGroups.shift()!;
          timeline.groups.push(nestedGroup);
        }
        // Add any pending events from the group
        while (this.pendingEvents.length > 0) {
          const event = this.pendingEvents.shift()!;
          if (timeline.events.has(event.id)) {
            this.error(`Duplicate event ID '${event.id}'`);
          }
          timeline.events.set(event.id, event);
        }
      } else if (this.check(TokenType.THEORY)) {
        const theory = this.parseTheory();
        timeline.theories.push(theory);
        // Add any pending events from the theory
        while (this.pendingEvents.length > 0) {
          const event = this.pendingEvents.shift()!;
          if (timeline.events.has(event.id)) {
            this.error(`Duplicate event ID '${event.id}'`);
          }
          timeline.events.set(event.id, event);
        }
      } else if (this.check(TokenType.ID)) {
        const event = this.parseEvent();
        if (timeline.events.has(event.id)) {
          this.error(`Duplicate event ID '${event.id}'`);
        }
        timeline.events.set(event.id, event);
      } else if (this.check(TokenType.NEWLINE)) {
        this.advance(); // Skip blank lines
      } else if (this.check(TokenType.EOF)) {
        break;
      } else {
        this.error(`Unexpected token: ${this.peek().value}`);
      }
    }

    return timeline;
  }

  /**
   * Parse YAML frontmatter
   */
  private parseFrontmatter(): Metadata {
    this.consume(TokenType.FRONTMATTER_DELIMITER, 'Expected ---');
    this.skipNewlines();

    const metadata: Metadata = {};

    // Simple YAML parsing - just key: value pairs
    while (!this.check(TokenType.FRONTMATTER_DELIMITER) && !this.isAtEnd()) {
      if (this.check(TokenType.NEWLINE)) {
        this.advance();
        continue;
      }

      // Parse key
      const keyToken = this.consume(TokenType.ID, 'Expected metadata key');
      const key = keyToken.value;

      this.consume(TokenType.COLON, 'Expected : after metadata key');

      // Parse value - rest of line
      const value = this.parseRestOfLine();
      metadata[key] = value;
      this.skipNewlines();
    }

    this.consume(TokenType.FRONTMATTER_DELIMITER, 'Expected closing ---');
    return metadata;
  }

  /**
   * Parse a group block
   */
  private parseGroup(parentGroupId?: string): Group {
    this.consume(TokenType.GROUP, 'Expected #group');

    // Group name
    const nameToken = this.consume(TokenType.ID, 'Expected group name');
    const group: Group = {
      id: nameToken.value,
      name: nameToken.value,
      eventIds: new Set(),
    };
    if (parentGroupId !== undefined) {
      group.parentGroupId = parentGroupId;
    }

    this.skipNewlines();

    // Parse events and nested groups within the group
    while (!this.check(TokenType.ENDGROUP) && !this.isAtEnd()) {
      if (this.check(TokenType.GROUP)) {
        // Nested group
        const nestedGroup = this.parseGroup(group.id);
        this.pendingGroups.push(nestedGroup);
        this.skipNewlines();
      } else if (this.check(TokenType.ID)) {
        const event = this.parseEvent();
        event.group = group.id;
        group.eventIds.add(event.id);
        // Store event to be added to timeline after parsing
        this.pendingEvents.push(event);
        this.skipNewlines();
      } else if (this.check(TokenType.NEWLINE)) {
        this.advance();
      } else {
        this.error('Expected event, nested group, or #endgroup');
      }
    }

    this.consume(TokenType.ENDGROUP, 'Expected #endgroup');
    return group;
  }

  /**
   * Parse a theory block
   */
  private parseTheory(): Theory {
    this.consume(TokenType.THEORY, 'Expected #theory');

    // Theory name
    const nameToken = this.consume(TokenType.ID, 'Expected theory name');
    const theory: Theory = {
      id: nameToken.value,
      name: nameToken.value,
      eventIds: new Set(),
    };

    this.skipNewlines();

    // Parse events within the theory
    while (!this.check(TokenType.ENDTHEORY) && !this.isAtEnd()) {
      if (this.check(TokenType.ID)) {
        const event = this.parseEvent();
        event.theoryId = theory.id;
        theory.eventIds.add(event.id);
        // Store event to be added to timeline after parsing
        this.pendingEvents.push(event);
        this.skipNewlines();
      } else if (this.check(TokenType.NEWLINE)) {
        this.advance();
      } else {
        this.error('Expected event or #endtheory');
      }
    }

    this.consume(TokenType.ENDTHEORY, 'Expected #endtheory');
    return theory;
  }

  /**
   * Parse an event
   */
  private parseEvent(): Event {
    // Event ID
    const idToken = this.consume(TokenType.ID, 'Expected event ID');
    const event: Event = {
      id: idToken.value,
      description: '',
      constraints: [],
      tags: [],
      properties: {},
    };

    this.consume(TokenType.COLON, 'Expected : after event ID');

    // Event description (rest of the line)
    const descriptionParts: string[] = [];
    while (!this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
      descriptionParts.push(this.advance().value);
    }
    event.description = descriptionParts.join(' ').trim();

    this.skipNewlines();

    // Parse event properties
    while (this.checkProperty() && !this.isAtEnd()) {
      this.parseEventProperty(event);
      this.skipNewlines();
    }

    return event;
  }

  /**
   * Parse an event property (indented line)
   */
  private parseEventProperty(event: Event): void {
    // Properties start with a keyword
    if (this.check(TokenType.DATE_KW)) {
      this.parseDateProperty(event);
    } else if (this.check(TokenType.DURATION)) {
      this.parseDurationProperty(event);
    } else if (this.check(TokenType.SOURCE)) {
      this.parseSourceProperty(event);
    } else if (this.check(TokenType.NOTE)) {
      this.parseNoteProperty(event);
    } else if (this.check(TokenType.TAGS)) {
      this.parseTagsProperty(event);
    } else if (
      this.check(TokenType.AFTER) ||
      this.check(TokenType.BEFORE) ||
      this.check(TokenType.DURING) ||
      this.check(TokenType.START_AFTER) ||
      this.check(TokenType.END_AFTER) ||
      this.check(TokenType.START_BEFORE) ||
      this.check(TokenType.END_BEFORE)
    ) {
      this.parseConstraintProperty(event);
    } else {
      this.error(`Unknown property: ${this.peek().value}`);
    }
  }

  /**
   * Parse date property (absolute date constraint)
   */
  private parseDateProperty(event: Event): void {
    this.consume(TokenType.DATE_KW, 'Expected date');
    this.consume(TokenType.COLON, 'Expected : after date');

    // Check for approximate marker (~)
    this.match(TokenType.TILDE); // TODO: Use approximate in constraint

    // Parse date value
    let minDate: TimePoint;
    let maxDate: TimePoint;
    let precision: Precision = 'year';

    if (this.check(TokenType.NUMBER)) {
      // Year only: 1920
      const year = parseInt(this.advance().value, 10);
      precision = 'year';
      minDate = { year };
      maxDate = { year };

      // Check for range (1918-1922)
      if (this.check(TokenType.MINUS) && this.checkNext(TokenType.NUMBER)) {
        this.advance(); // Skip minus
        const endYear = parseInt(this.advance().value, 10);
        maxDate = { year: endYear };
      }
    } else if (this.check(TokenType.DATE)) {
      // Date with month or day: 1920-05 or 1920-05-15
      // OR year range: 1918-1922
      const dateStr = this.advance().value;
      const parsed = this.parseDate(dateStr);
      minDate = parsed.min;
      maxDate = parsed.max;
      precision = parsed.precision;
    } else {
      this.error('Expected date value');
    }

    // Check for confidence level
    let confidence: ConfidenceLevel = 'high';
    if (
      this.check(TokenType.CONFIDENCE_HIGH) ||
      this.check(TokenType.CONFIDENCE_MEDIUM) ||
      this.check(TokenType.CONFIDENCE_LOW)
    ) {
      const confToken = this.advance();
      if (confToken.type === TokenType.CONFIDENCE_HIGH) confidence = 'high';
      else if (confToken.type === TokenType.CONFIDENCE_MEDIUM) confidence = 'medium';
      else if (confToken.type === TokenType.CONFIDENCE_LOW) confidence = 'low';
    }

    // Create absolute constraint (no target event)
    const constraint: Constraint = {
      type: 'absolute',
      targetEventId: '',
      confidence,
      absoluteRange: {
        min: minDate,
        max: maxDate,
        precision,
        anchored: true,
      },
    };

    event.constraints.push(constraint);
  }

  /**
   * Parse a date string (YYYY-MM or YYYY-MM-DD)
   */
  private parseDate(dateStr: string): {
    min: TimePoint;
    max: TimePoint;
    precision: Precision;
  } {
    const parts = dateStr.split('-');

    if (parts.length === 2) {
      // Could be YYYY-MM (year-month) or YYYY-YYYY (year range)
      // Check if both parts are 4 digits (year range)
      if (parts[0]!.length === 4 && parts[1]!.length === 4) {
        // Year range: 1918-1922
        return {
          min: { year: parseInt(parts[0]!, 10) },
          max: { year: parseInt(parts[1]!, 10) },
          precision: 'year',
        };
      } else {
        // Year-month: 1920-05
        return {
          min: { year: parseInt(parts[0]!, 10), month: parseInt(parts[1]!, 10) },
          max: { year: parseInt(parts[0]!, 10), month: parseInt(parts[1]!, 10) },
          precision: 'month',
        };
      }
    } else if (parts.length === 3) {
      // YYYY-MM-DD
      return {
        min: {
          year: parseInt(parts[0]!, 10),
          month: parseInt(parts[1]!, 10),
          day: parseInt(parts[2]!, 10),
        },
        max: {
          year: parseInt(parts[0]!, 10),
          month: parseInt(parts[1]!, 10),
          day: parseInt(parts[2]!, 10),
        },
        precision: 'day',
      };
    } else {
      this.error('Invalid date format');
    }
  }

  /**
   * Parse duration property
   */
  private parseDurationProperty(event: Event): void {
    this.consume(TokenType.DURATION, 'Expected duration');
    this.consume(TokenType.COLON, 'Expected : after duration');

    const duration = this.parseDuration();
    event.durationConstraint = {
      duration,
      confidence: 'high',
    };
  }

  /**
   * Parse a duration value
   */
  private parseDuration(): Duration {
    // Parse number or range
    // The lexer might tokenize "13-15" as a DATE token instead of NUMBER-MINUS-NUMBER
    let value: number | [number, number];

    if (this.check(TokenType.DATE)) {
      // Range like "13-15" tokenized as DATE
      const dateToken = this.advance();
      const parts = dateToken.value.split('-');
      if (parts.length === 2) {
        value = [parseInt(parts[0]!, 10), parseInt(parts[1]!, 10)];
      } else {
        this.error('Invalid duration range format');
      }
    } else if (this.check(TokenType.NUMBER)) {
      // Single number or NUMBER-MINUS-NUMBER
      const numToken = this.advance();
      value = parseInt(numToken.value, 10);

      // Check for range (13 - 15)
      if (this.check(TokenType.MINUS) && this.checkNext(TokenType.NUMBER)) {
        this.advance(); // Skip minus
        const endNum = parseInt(this.advance().value, 10);
        value = [value as number, endNum];
      }
    } else {
      this.error('Expected number for duration');
    }

    // Parse unit
    let unit: TimeUnit = 'years';
    if (this.check(TokenType.YEARS)) {
      unit = 'years';
      this.advance();
    } else if (this.check(TokenType.MONTHS)) {
      unit = 'months';
      this.advance();
    } else if (this.check(TokenType.DAYS)) {
      unit = 'days';
      this.advance();
    } else {
      this.error('Expected time unit (years, months, or days)');
    }

    return {
      value,
      unit,
      approximate: false,
    };
  }

  /**
   * Parse source property
   */
  private parseSourceProperty(event: Event): void {
    this.consume(TokenType.SOURCE, 'Expected source');
    this.consume(TokenType.COLON, 'Expected : after source');

    // Source value (rest of line) - reconstruct text properly
    event.properties['source'] = this.parseRestOfLine();
  }

  /**
   * Parse note property
   */
  private parseNoteProperty(event: Event): void {
    this.consume(TokenType.NOTE, 'Expected note');
    this.consume(TokenType.COLON, 'Expected : after note');

    // Note value (rest of line) - reconstruct text properly
    event.properties['note'] = this.parseRestOfLine();
  }

  /**
   * Parse the rest of the line and reconstruct the original text
   */
  private parseRestOfLine(): string {
    const parts: string[] = [];
    let lastToken: Token | null = null;

    while (!this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
      const token = this.advance();

      // Add space before token if needed
      // Don't add space if:
      // - This is the first token
      // - Last token was a colon
      // - Current token is a colon
      // - Current token is punctuation (UNKNOWN tokens like apostrophes)
      // - Last token was punctuation
      const noPunctuationTypes = [TokenType.COLON, TokenType.UNKNOWN];
      const needsSpace = lastToken &&
        !noPunctuationTypes.includes(lastToken.type) &&
        !noPunctuationTypes.includes(token.type);

      if (needsSpace) {
        parts.push(' ');
      }

      parts.push(token.value);
      lastToken = token;
    }

    return parts.join('').trim();
  }

  /**
   * Parse tags property
   */
  private parseTagsProperty(event: Event): void {
    this.consume(TokenType.TAGS, 'Expected tags');
    this.consume(TokenType.COLON, 'Expected : after tags');

    // Parse tags (hashtags)
    while (this.check(TokenType.TAG)) {
      const tag = this.advance().value.substring(1); // Remove #
      event.tags.push(tag);
    }
  }

  /**
   * Parse constraint property (relative constraint)
   */
  private parseConstraintProperty(event: Event): void {
    // Get constraint type
    let constraintType: ConstraintType;
    if (this.check(TokenType.AFTER)) {
      constraintType = 'after';
      this.advance();
    } else if (this.check(TokenType.BEFORE)) {
      constraintType = 'before';
      this.advance();
    } else if (this.check(TokenType.DURING)) {
      constraintType = 'during';
      this.advance();
    } else if (this.check(TokenType.START_AFTER)) {
      constraintType = 'start-after';
      this.advance();
    } else if (this.check(TokenType.END_AFTER)) {
      constraintType = 'end-after';
      this.advance();
    } else if (this.check(TokenType.START_BEFORE)) {
      constraintType = 'start-before';
      this.advance();
    } else if (this.check(TokenType.END_BEFORE)) {
      constraintType = 'end-before';
      this.advance();
    } else {
      this.error('Expected constraint type');
    }

    this.consume(TokenType.COLON, 'Expected : after constraint type');

    // Parse target event ID
    const targetToken = this.consume(TokenType.ID, 'Expected target event ID');
    const targetEventId = targetToken.value;

    // Optional: parse anchor point (event.start or event.end)
    let anchorPoint: AnchorPoint | undefined;
    if (this.check(TokenType.DOT)) {
      this.advance();
      const anchorToken = this.consume(TokenType.ID, 'Expected start or end');
      if (anchorToken.value === 'start') {
        anchorPoint = 'start';
      } else if (anchorToken.value === 'end') {
        anchorPoint = 'end';
      } else {
        this.error('Expected start or end after dot');
      }
    }

    // Optional: parse offset (+ 3 years or - 2 months)
    let duration: Duration | undefined;
    if (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
      const isPlus = this.check(TokenType.PLUS);
      this.advance();

      // Check for approximate (~)
      const approximate = this.match(TokenType.TILDE);

      duration = this.parseDuration();
      duration.approximate = approximate;

      // If minus, negate the duration
      if (!isPlus) {
        if (typeof duration.value === 'number') {
          duration.value = -duration.value;
        } else {
          duration.value = [-duration.value[1], -duration.value[0]];
        }
      }
    }

    // Optional: confidence level
    let confidence: ConfidenceLevel = 'high';
    if (
      this.check(TokenType.CONFIDENCE_HIGH) ||
      this.check(TokenType.CONFIDENCE_MEDIUM) ||
      this.check(TokenType.CONFIDENCE_LOW)
    ) {
      const confToken = this.advance();
      if (confToken.type === TokenType.CONFIDENCE_HIGH) confidence = 'high';
      else if (confToken.type === TokenType.CONFIDENCE_MEDIUM) confidence = 'medium';
      else if (confToken.type === TokenType.CONFIDENCE_LOW) confidence = 'low';
    }

    // Create constraint
    const constraint: Constraint = {
      type: constraintType,
      targetEventId,
      confidence,
    };

    if (duration !== undefined) {
      constraint.duration = duration;
    }

    if (anchorPoint !== undefined) {
      constraint.anchorPoint = anchorPoint;
    }

    event.constraints.push(constraint);
  }

  /**
   * Check if we're looking at an event property (not a new event or group/theory)
   */
  private checkProperty(): boolean {
    if (this.isAtEnd()) return false;

    // Property keywords
    return (
      this.check(TokenType.DATE_KW) ||
      this.check(TokenType.DURATION) ||
      this.check(TokenType.SOURCE) ||
      this.check(TokenType.NOTE) ||
      this.check(TokenType.TAGS) ||
      this.check(TokenType.AFTER) ||
      this.check(TokenType.BEFORE) ||
      this.check(TokenType.DURING) ||
      this.check(TokenType.START_AFTER) ||
      this.check(TokenType.END_AFTER) ||
      this.check(TokenType.START_BEFORE) ||
      this.check(TokenType.END_BEFORE)
    );
  }

  /**
   * Skip newline tokens
   */
  private skipNewlines(): void {
    while (this.check(TokenType.NEWLINE)) {
      this.advance();
    }
  }

  /**
   * Check if current token matches type
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  /**
   * Check if next token matches type
   */
  private checkNext(type: TokenType): boolean {
    if (this.current + 1 >= this.tokens.length) return false;
    return this.tokens[this.current + 1]!.type === type;
  }

  /**
   * Match and consume token if it matches
   */
  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  /**
   * Consume token of expected type
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    this.error(message);
  }

  /**
   * Advance to next token
   */
  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  /**
   * Get current token
   */
  private peek(): Token {
    return this.tokens[this.current] ?? this.tokens[this.tokens.length - 1]!;
  }

  /**
   * Get previous token
   */
  private previous(): Token {
    return this.tokens[this.current - 1]!;
  }

  /**
   * Check if at end of tokens
   */
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  /**
   * Throw parse error
   */
  private error(message: string): never {
    const token = this.peek();
    throw new ParseError(
      message,
      token.start.line,
      token.start.column
    );
  }
}

/**
 * Convenience function to parse a timeline from text
 */
export function parse(input: string): Timeline {
  const parser = new Parser(input);
  return parser.parse();
}
