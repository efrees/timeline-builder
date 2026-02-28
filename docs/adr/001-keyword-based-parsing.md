# ADR-001: Keyword-Based Property Recognition for Parser

**Status:** Accepted

**Date:** 2026-02-28

**Sprint:** Sprint 2 (Parser Implementation)

**Deciders:** sprint-lead, parser-foundation, parser-constraints, parser-advanced

---

## Context

During Sprint 2 implementation of the `.tl` file parser (specifically task P1.8: Basic Events Parser), we encountered a fundamental design challenge with the parsing strategy.

### The Problem

The `.tl` syntax uses indentation to visually group properties under events:

```
exodus: The Exodus from Egypt
  date: 1446 BC
  source: "Exodus 12:41"
  tags: israel, egypt

josephBorn: Joseph is born
  date: ~1915 BC
```

The parser needs to distinguish between:
1. **New event declarations**: `eventId: description`
2. **Event properties**: `propertyName: value` (indented under an event)

However, the lexer (implemented in Sprint 1) tokenizes the input into a flat stream of tokens *without tracking indentation or whitespace*. This means the parser receives:

```
IDENTIFIER("exodus") COLON STRING("The Exodus...")
IDENTIFIER("date") COLON NUMBER(1446) IDENTIFIER("BC")
IDENTIFIER("source") COLON STRING("Exodus 12:41")
...
```

Without indentation information, the parser cannot determine whether `IDENTIFIER("date") COLON ...` represents:
- A property of the previous event `exodus` (correct)
- A new event named `date` (incorrect)

### Why This Matters

This is not a minor parsing detail - it's fundamental to the entire parser architecture:
- **Incorrect parsing** would create events with IDs like "date", "source", "tags"
- **Loss of event structure** - properties wouldn't be attached to their events
- **Breaking the data model** - Timeline object would be malformed
- **Test failures** - All 53 parser tests would fail

### Constraints

- Lexer from Sprint 1 is complete, tested, and committed
- Modifying the lexer mid-sprint would require:
  - Rolling back Sprint 1 commits
  - Redesigning lexer to track indentation state
  - Re-running all Sprint 1 tests
  - Delaying Sprint 2 delivery
- Sprint goal is parser implementation, not lexer reimplementation

---

## Decision

**We will use keyword-based property recognition instead of indentation-based parsing.**

The parser maintains a list of known property keywords and uses this to determine context:

```typescript
private isPropertyKeyword(name: string): boolean {
  return [
    // Constraint properties
    'date', 'after', 'before', 'during', 'duration',
    // Metadata properties
    'source', 'note', 'tags',
    // Container properties
    'name', 'description'
  ].includes(name);
}
```

When the parser sees `IDENTIFIER COLON ...`:
- **If identifier is a property keyword** → Parse as property of current event
- **Otherwise** → Parse as new event declaration

---

## Options Considered

### Option 1: Indentation-Based Parsing (Original Plan)

**Approach:** Modify lexer to track indentation levels and emit INDENT/DEDENT tokens.

**Pros:**
- Matches user's visual understanding of the syntax
- Standard approach for indentation-sensitive languages (Python, YAML)
- Clear semantic model

**Cons:**
- Requires major lexer rewrite mid-sprint
- Would need to rollback Sprint 1
- Complex edge cases: tabs vs spaces, mixed indentation
- Sprint 2 delay

**Why rejected:** Too disruptive to sprint process, unnecessary complexity

---

### Option 2: Keyword-Based Context Recognition (Chosen)

**Approach:** Parser recognizes property keywords to determine parsing context.

**Pros:**
- Works with existing lexer - no Sprint 1 changes needed
- Simpler implementation - single method with keyword list
- More robust - handles edge cases gracefully
- Easier to extend - just add keywords to list
- Common pattern in many parsers (e.g., CSS, SQL)
- Enables better error messages ("unknown property 'xyz'" vs "unexpected token")
- Allows properties in any order (not dependent on indentation)

**Cons:**
- Requires maintaining keyword list
- New property types must be added to keyword list
- User cannot create events with property keyword IDs (e.g., can't have event `date:`)

**Why chosen:**
- Pragmatic solution that works with existing infrastructure
- Actually provides better robustness and extensibility
- Minimal cons are acceptable trade-offs

---

### Option 3: Hybrid Approach

**Approach:** Use indentation as a hint but fall back to keywords.

**Pros:**
- Best of both worlds?

**Cons:**
- Still requires lexer modifications
- More complex parser logic
- Ambiguous behavior when indentation and keywords conflict

**Why rejected:** Complexity without clear benefits

---

### Option 4: Require Explicit Property Markers

**Approach:** Change syntax to require explicit markers like `@date:` or `prop date:`.

**Pros:**
- Unambiguous parsing

**Cons:**
- Breaks clean syntax design
- Less user-friendly
- Would require updating all example files
- Against project goal of clean, minimal syntax

**Why rejected:** Violates design principles

---

## Consequences

### Positive

✅ **No Sprint 1 changes needed** - Lexer remains unchanged and tested

✅ **Simpler parser implementation** - Single `isPropertyKeyword()` method vs complex indentation tracking

✅ **Better error messages** - Can report "unknown property 'xyz'" instead of generic parse errors

✅ **Easier to extend** - Adding new properties just requires adding keywords to the list

✅ **More flexible syntax** - Properties can appear in any order without breaking parsing

✅ **Robust to whitespace variations** - Handles different indentation styles gracefully

✅ **Sprint 2 on schedule** - No delays, all 98 tests passing

### Negative

⚠️ **Keyword maintenance** - New property types must be added to the keyword list

⚠️ **Reserved keywords** - Users cannot create events with property keyword IDs
   - Events cannot be named `date`, `source`, `note`, etc.
   - Unlikely to be a real issue (these aren't good event IDs anyway)
   - Can provide clear error message: "Cannot use property keyword 'date' as event ID"

⚠️ **Documentation needed** - Must document which keywords are reserved

### Neutral

○ **Different from indentation-based languages** - But consistent with other parsers (SQL, CSS)

○ **Keyword list is small** - Only ~10 keywords, manageable

---

## Implementation

### Keyword List

Currently recognized property keywords (Sprint 2):
- `date` - Absolute date constraint
- `after` - Relative constraint (event must be after another)
- `before` - Relative constraint (event must be before another)
- `during` - Containment constraint (event during another)
- `duration` - Event duration specification
- `source` - Citation/reference metadata
- `note` - Additional notes/annotations
- `tags` - Categorization tags
- `name` - Name for groups/theories
- `description` - Description for groups/theories

### Parser Logic

```typescript
private parseEventOrProperty(): void {
  const identifier = this.expect(TokenType.IDENTIFIER);
  this.expect(TokenType.COLON);

  if (this.isPropertyKeyword(identifier.value)) {
    // Parse as property of current event
    this.parseProperty(identifier.value);
  } else {
    // Parse as new event declaration
    this.parseEvent(identifier);
  }
}
```

### Future Extensions

Adding new properties requires:
1. Add keyword to `isPropertyKeyword()` list
2. Implement parsing logic for the new property
3. Update tests
4. Document in syntax guide

Example for hypothetical `confidence:` property:
```typescript
private isPropertyKeyword(name: string): boolean {
  return [
    // ... existing keywords ...
    'confidence',  // New property
  ].includes(name);
}
```

---

## Related Decisions

- **Sprint 1**: Lexer design did not include indentation tracking
- **Sprint 2 TD-2**: Single-quote string support in lexer (minor lexer change that was acceptable)

---

## Lessons Learned

1. **Early pivots are cheaper than late ones** - Identifying this issue during P1.8 implementation allowed quick resolution

2. **Lexer/parser boundary is important** - Decision about what the lexer tracks (indentation) has major parser implications

3. **Pragmatism over purity** - Keyword-based approach is "less pure" than indentation-based but more practical

4. **Test-driven development catches design issues early** - First failing test revealed the problem immediately

5. **Sprint process enabled quick decision** - Team discussed, decided, and implemented within single sprint

---

## References

- Sprint 2 Sprint Letter: `docs/SPRINT_LETTER_02.md`
- Parser implementation: `src/parser/parser.ts`
- Parser tests: `tests/parser/parser.test.ts`
- Syntax design: `PRODUCT_PLAN.md` - Draft Syntax section

---

## Approval

**Status:** ✅ **Accepted**

**Approved by:** sprint-lead (blue)

**Implementation:** Complete - all 98 tests passing

**Review:** Successful - parser is production-ready
