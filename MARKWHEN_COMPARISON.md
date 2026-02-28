# Markwhen vs. Timeline-Builder Requirements: A Detailed Comparison

## Executive Summary

**Markwhen** is a markdown-like timeline tool that converts plain text into visualized timelines. After thorough research, **Markwhen addresses some but not all of our core requirements**. While it provides excellent support for basic timelines, event dependencies, and date formatting, it lacks critical features for research-focused timeline work, particularly around:

1. **Constraint-based reasoning and propagation**
2. **Uncertain durations in relationships** (e.g., "13-15 years after X")
3. **Confidence levels on constraints**
4. **Theory/scenario toggling**
5. **Unanchored timeline support with relative-only events**

**Recommendation:** Build custom syntax inspired by Markwhen's clean design, but implement our own parser and constraint solver to support research-specific features.

---

## 1. Markwhen Overview

### What is Markwhen?

Markwhen is an interactive text-to-timeline tool that converts markdown-like text into cascading timelines. It's designed for creating logs, gantt charts, blogs, timelines, calendars, and journals.

**Key Design Principles:**
- Markdown-inspired plain text format
- Human-readable and version-controllable
- Multiple visualization modes (timeline, calendar, resume)
- Web-based editor with VS Code and Obsidian plugins

**Architecture:**
- Open-source parser and visualization components
- Web editor (proprietary but free to use)
- Modular system with separate parser, timeline view, calendar view, etc.

### Core Capabilities

1. **Multiple date formats:** EDTF (recommended), ISO8601, human-readable (e.g., "March 18, 2026", "Aug 30 9:45am")
2. **Date ranges:** Using `/` separator (e.g., `1964/2008`, `2005/now`)
3. **Event dependencies:** Reference other events with `!eventId` syntax
4. **Groups/sections:** Hierarchical organization using markdown headers
5. **Tags:** Color-coded categorization with `#tag` syntax
6. **Properties:** Key-value pairs for event metadata
7. **Recurring events:** Support for repeating patterns
8. **Visualizations:** Timeline, calendar, map, resume views

---

## 2. Detailed Feature Comparison

### 2.1 Date and Time Representation

| Feature | Markwhen | Timeline-Builder Needs | Status |
|---------|----------|------------------------|---------|
| **Basic dates** | ✅ Multiple formats (EDTF, ISO8601, human-readable) | ✅ Year, month, day precision | **✅ COVERED** |
| **Date ranges** | ✅ `2018/2023` syntax | ✅ Start/end ranges | **✅ COVERED** |
| **Uncertain dates (EDTF)** | ✅ `1984?` (uncertain), `1985~` (approximate) | ✅ Circa/approximate dates | **✅ COVERED** |
| **Complex EDTF** | ✅ `2015-06?-14` (partially uncertain) | ⚠️ Advanced uncertainty | **✅ COVERED** |
| **Before/after constraints** | ⚠️ Limited: `before !Christmas 1 month` | ✅ Full constraint system | **⚠️ PARTIAL** |
| **Multiple precision levels** | ✅ Year to second granularity | ✅ Year/month/day (extendable) | **✅ COVERED** |

**Markwhen Strengths:**
- Excellent EDTF support for uncertain/approximate dates at the date level
- `1984?` = uncertain year
- `1985~` = approximate year
- `2015-06?-14` = certain day (14th), but "June 2015" is uncertain
- Multiple date format options for user convenience

**Gaps:**
- EDTF uncertainty applies to individual dates, not to relationships between events
- No way to express "this event happened approximately 3 years after X" (the 3 years is uncertain)
- No constraint confidence levels

### 2.2 Event Relationships and Dependencies

| Feature | Markwhen | Timeline-Builder Needs | Status |
|---------|----------|------------------------|---------|
| **Event references** | ✅ `!eventId` syntax | ✅ ID-based references | **✅ COVERED** |
| **Relative dates** | ✅ `!Phase1 2 weeks: Phase 2` | ✅ Offset-based constraints | **✅ COVERED** |
| **Start/end anchors** | ✅ `!thanksgiving.start`, `!winter.end` | ✅ Start-to-start, end-to-end | **✅ COVERED** |
| **Before constraints** | ✅ `before !Christmas 1 month: Buy presents` | ✅ Before/after primitives | **✅ COVERED** |
| **Uncertain relationships** | ❌ Not supported | ✅ "13-15 years after X" | **❌ MISSING** |
| **During constraints** | ❌ Not explicitly supported | ✅ "Event E during Period F" | **❌ MISSING** |
| **Duration constraints** | ⚠️ Implicit from date ranges | ✅ "Event M lasted 3 years" | **⚠️ PARTIAL** |

**Markwhen Syntax Examples:**

```markwhen
# Basic dependency - event starts after previous event ends
!Phase1 2 weeks: Phase 2

# Explicit event reference
after !Phase1 2 weeks: Phase 2  # "after" is optional

# Before constraint
before !Christmas 1 month: Buy presents

# Start-to-start using .start modifier
!thanksgiving.start / !winter.end: Spanning two events
```

**How Markwhen Dependencies Work:**
1. Events with `!eventId` look for the referenced event
2. By default, measures from the **end** of the referenced event
3. Can use `.start` or `.end` modifiers to be explicit
4. The duration (`2 weeks`) is added to the reference point
5. **Important limitation:** Referenced events must be defined **earlier** in the document

**Gaps for Our Use Case:**

1. **No uncertain durations:**
   - Can't express "13-15 years after Event A"
   - Only supports fixed durations: "3 years after X"

2. **No constraint types vocabulary:**
   - Markwhen has implicit start-to-end (default) and explicit `.start`/`.end` modifiers
   - We need: start-to-start, end-to-end, start-to-end, end-to-start
   - Markwhen's approach is simpler but less explicit

3. **No "during" constraints:**
   - Can't express "Event E happened during Period F" as a constraint
   - Would have to manually set dates to fall within the period

4. **No constraint propagation:**
   - Markwhen calculates the event's date when you reference another event
   - But it doesn't propagate constraints through a graph
   - If Event A's date changes, dependencies aren't automatically recalculated

### 2.3 Uncertainty and Confidence

| Feature | Markwhen | Timeline-Builder Needs | Status |
|---------|----------|------------------------|---------|
| **Date-level uncertainty** | ✅ EDTF `?` and `~` | ✅ Circa/approximate | **✅ COVERED** |
| **Relationship uncertainty** | ❌ Not supported | ✅ "~3 years after X" | **❌ MISSING** |
| **Range durations** | ❌ Not supported | ✅ "13-15 years after X" | **❌ MISSING** |
| **Confidence levels** | ❌ Not supported | ✅ high/medium/low | **❌ MISSING** |
| **Soft vs. hard constraints** | ❌ Not supported | ✅ Required for research | **❌ MISSING** |

**What Markwhen Supports:**

EDTF Level 1 and 2 provide sophisticated date uncertainty:
- `1984?` = year is uncertain (could be wrong)
- `1985~` = year is approximate (close but not exact)
- `1984?~` = both uncertain and approximate
- `2015-06?-14` = day is certain (14th), but "June 2015" is uncertain
- `2015-?06-14` = year and day certain, month uncertain

**Critical Gaps:**

1. **No relationship uncertainty:** EDTF uncertainty only applies to the dates themselves, not to the relationships between events. You can say "Event A happened in ~1920" but not "Event B happened ~3 years after Event A."

2. **No range durations:** Can't express "between 13 and 15 years after Event A." This is crucial for our biblical chronology use case where ancient texts often give ranges rather than precise numbers.

3. **No confidence levels:** No way to mark a constraint as "high confidence" (biblical text explicitly states it) vs. "low confidence" (scholarly inference). This is essential for research timelines where you want to track the reliability of your data.

### 2.4 Unanchored Timelines

| Feature | Markwhen | Timeline-Builder Needs | Status |
|---------|----------|------------------------|---------|
| **Relative-only events** | ⚠️ Partial support | ✅ Full support needed | **⚠️ PARTIAL** |
| **Named reference points** | ❌ Not supported | ✅ "Year 0 = Jacob's birth" | **❌ MISSING** |
| **Unanchored visualization** | ❌ Requires absolute dates | ✅ "X years after reference" | **❌ MISSING** |

**Markwhen's Approach:**

Markwhen supports relative dates through dependencies:
```markwhen
!Phase1 2 weeks: Phase 2
2 weeks: Phase 3  # Relative to previous event
```

However:
- **Requires an initial absolute date:** The first event in a dependency chain must have an absolute date
- **No explicit reference point:** Can't declare "Jacob's birth is Year 0 for this timeline"
- **Visualization assumes absolute dates:** The timeline x-axis shows calendar dates, not relative time

**What We Need:**

For research timelines, especially biblical chronology:
1. Define events purely by relationships: "Event B is 3 years after Event A"
2. No absolute dates required initially
3. Declare a named reference point: "Jacob's birth" = Year 0
4. Timeline labeled "Years after Jacob's birth"
5. Can add absolute anchors later: "Jacob's birth = ~1900 BC" propagates to all events

**Verdict:** Markwhen assumes calendar-based timelines. Our use case requires timelines that can exist without absolute dates.

### 2.5 Constraint Solving and Propagation

| Feature | Markwhen | Timeline-Builder Needs | Status |
|---------|----------|------------------------|---------|
| **Automatic propagation** | ⚠️ Basic forward calculation | ✅ Full constraint propagation | **❌ MISSING** |
| **Tightest bounds** | ❌ Not supported | ✅ Compute min/max from all constraints | **❌ MISSING** |
| **Conflict detection** | ❌ Not mentioned | ✅ Detect impossible constraints | **❌ MISSING** |
| **Interval arithmetic** | ❌ Not supported | ✅ Propagate ranges through graph | **❌ MISSING** |

**Markwhen's Constraint Model:**

Markwhen uses a **simple forward calculation** approach:
1. Parse events from top to bottom
2. When encountering a reference (`!eventId`), look up the event's date
3. Add the specified duration
4. Set the new event's date

**Limitations:**

1. **No backward propagation:** If Event A changes, events that reference it don't update
2. **No multi-constraint solving:** Can't handle "Event X is after A AND before B, compute tightest range"
3. **No conflict detection:** Won't warn if constraints are impossible
4. **No range propagation:** Can't handle "Event A is 1920-1922, Event B is 3 years after A, so B is 1923-1925"

**What We Need:**

Our research use case requires:
- Multiple constraints on the same event (e.g., "after 1920" AND "before 1925")
- Automatic computation of tightest possible date range
- Propagation of uncertainty through the constraint graph
- Detection of conflicting constraints

**Example:**
```timeline
# Our syntax (not Markwhen):
eventA: Event A
  date: 1920-1925

eventB: Event B
  after: eventA + 3 years
  # System should compute: B is 1923-1928 (adding 3 to both bounds)

eventC: Event C
  after: eventA + 2 years
  before: eventB - 1 year
  # System should compute: C is 1922-1926 (tightest bounds from both constraints)
```

Markwhen cannot do this level of constraint reasoning.

### 2.6 Groups, Sections, and Organization

| Feature | Markwhen | Timeline-Builder Needs | Status |
|---------|----------|------------------------|---------|
| **Hierarchical groups** | ✅ Markdown headers (`#`, `##`, etc.) | ✅ Event grouping | **✅ COVERED** |
| **Auto-closing sections** | ✅ Automatic | ✅ Scope management | **✅ COVERED** |
| **Visual styling** | ✅ Groups vs. sections | ✅ Customizable display | **✅ COVERED** |
| **Collapsible groups** | ✅ Supported | ✅ UI feature | **✅ COVERED** |

**Markwhen Syntax:**

```markwhen
# The 90s
1991: Desert Storm
1994: Friends premiered

## The 2000s  # Nested section
2005: The Office premiered
# Auto-closes when parent section encountered

# Other Events  # This auto-closes "The 90s"
```

**Styling Options:**
- Default: collapsible groups
- `style: section` property makes it extend full timeline width

**Verdict:** Markwhen's grouping is excellent and meets our needs.

### 2.7 Tags and Metadata

| Feature | Markwhen | Timeline-Builder Needs | Status |
|---------|----------|------------------------|---------|
| **Tags** | ✅ `#tag` syntax | ✅ Event categorization | **✅ COVERED** |
| **Tag colors** | ✅ `#covid: blue` in header | ✅ Visual distinction | **✅ COVERED** |
| **Properties** | ✅ Key-value pairs | ✅ Event metadata | **✅ COVERED** |
| **Sources/citations** | ⚠️ Via properties | ✅ Dedicated citation support | **⚠️ PARTIAL** |
| **Notes** | ⚠️ Via descriptions | ✅ Researcher notes | **⚠️ PARTIAL** |

**Markwhen Syntax:**

```markwhen
---
#covid: blue
#travel: green
---

2020: Pandemic year #covid
  location: Global
  source: WHO

2019: Trip to Europe #travel
  destinations: [Paris, Rome, Berlin]
```

**Properties:**
- Defined immediately after event title
- Key-value pairs
- Arrays use flow style: `[item1, item2]`
- Can include timezone, custom metadata, etc.

**Gaps:**
- No built-in citation syntax (would use generic properties)
- No dedicated "notes" vs. "description" distinction
- Multiple tags can have conflicting properties (e.g., colors) with undefined behavior

**Verdict:** Good foundation, but we'd want more structured citation support for research use.

### 2.8 Theory and Scenario Support

| Feature | Markwhen | Timeline-Builder Needs | Status |
|---------|----------|------------------------|---------|
| **Alternative scenarios** | ❌ Not supported | ✅ Theory toggling | **❌ MISSING** |
| **Named constraint sets** | ❌ Not supported | ✅ "Early Exodus" vs "Late Exodus" | **❌ MISSING** |
| **UI toggling** | ❌ Not supported | ✅ Switch between theories | **❌ MISSING** |

**What We Need:**

For biblical chronology research, scholars have competing theories:
- **Theory A:** Exodus in 1446 BC
- **Theory B:** Exodus in 1270 BC

Each theory creates different constraints and propagates through the timeline. We need:
1. Define multiple named theories
2. Mark constraints as belonging to specific theories
3. Toggle theories in the UI to see how the timeline changes
4. Some events/constraints are shared across theories

**Markwhen's Limitation:**

Markwhen has no concept of alternative scenarios. You'd need to:
1. Create completely separate timeline documents for each theory, OR
2. Manually comment out conflicting events

Neither approach supports the research workflow of comparing theories side-by-side.

**Verdict:** This is a critical missing feature for our use case.

### 2.9 Visualization

| Feature | Markwhen | Timeline-Builder Needs | Status |
|---------|----------|------------------------|---------|
| **Horizontal timeline** | ✅ Primary view | ✅ Linear timeline | **✅ COVERED** |
| **Zoom/pan** | ✅ Supported | ✅ Navigation | **✅ COVERED** |
| **Uncertainty visualization** | ⚠️ Range display only | ✅ Shaded regions, error bars | **⚠️ PARTIAL** |
| **Multiple tracks** | ✅ Via sections/groups | ✅ Gantt-style lanes | **✅ COVERED** |
| **Anchored vs. unanchored** | ❌ Not distinguished | ✅ Visual indicators | **❌ MISSING** |
| **Interactive editing** | ✅ In web editor | ✅ Drag to adjust | **✅ COVERED** |

**Markwhen Visualizations:**
1. **Timeline view:** Cascading horizontal timeline with zoom/pan
2. **Calendar view:** Month/year calendar grid
3. **Resume view:** Structured resume format
4. **Map view:** Geographic visualization (for events with locations)

**Strengths:**
- Multiple visualization modes
- Interactive web editor
- Collapsible sections
- Color-coded tags

**Gaps:**
- Doesn't distinguish between certain vs. uncertain vs. anchored events visually
- No special handling for unanchored timelines (relative-only dates)
- Uncertain date ranges (from EDTF) are displayed, but not highlighted as uncertain

### 2.10 Plain Text Syntax

| Feature | Markwhen | Timeline-Builder Needs | Status |
|---------|----------|------------------------|---------|
| **Markdown-inspired** | ✅ Clean, minimal | ✅ Easy to type | **✅ COVERED** |
| **Human-readable** | ✅ Excellent | ✅ Version-controllable | **✅ COVERED** |
| **Event IDs** | ✅ `id: eventName` property | ✅ ID-based references | **✅ COVERED** |
| **Multi-line descriptions** | ✅ Automatic | ✅ Long descriptions | **✅ COVERED** |
| **Indentation** | ⚠️ Optional | ✅ Visual clarity | **⚠️ DIFFERENT** |
| **YAML frontmatter** | ✅ For document metadata | ✅ File-level config | **✅ COVERED** |

**Markwhen Syntax Example:**

```markwhen
---
title: My Timeline
#covid: red
#travel: blue
---

# Early Career

2018/2020: Graduate School #Education
id: gradSchool
university: MIT
degree: PhD

after !gradSchool 6 months: First Job #Work
company: Tech Corp
location: San Francisco

2019-06~: Approximate trip to Europe #travel
  countries: [France, Italy, Germany]
```

**Markwhen's Philosophy:**
- Minimal syntax overhead
- Multiple date format options for convenience
- Properties immediately after event (no strict indentation)
- Markdown headers for sections
- YAML frontmatter for document config

**Our Requirements:**
- Similar philosophy: minimal, readable, version-controllable
- Need more explicit constraint syntax
- Want indentation for clarity (YAML-like)
- Need theory/scenario blocks

**Verdict:** Markwhen's syntax is excellent and should inspire our design. We'll need extensions for constraints, confidence, and theories.

---

## 3. Side-by-Side Syntax Comparison

### 3.1 Basic Events

**Markwhen:**
```markwhen
2025-04-09: Single date event

2025-01-22 / 2026-10-24: Date range event

Dec 1 2025: Human-readable date
```

**Timeline-Builder (Our Proposal):**
```timeline
singleEvent: Single date event
  date: 2025-04-09

rangeEvent: Date range event
  date: 2025-01-22 / 2026-10-24

readableDate: Human-readable date
  date: Dec 1 2025
```

**Comparison:**
- Markwhen: More concise, date-first
- Ours: More structured, ID-first
- Both are readable and version-controllable

### 3.2 Uncertain Dates

**Markwhen (EDTF):**
```markwhen
1984?: Uncertain year

1985~: Approximate year

1984?~: Both uncertain and approximate

2015-06?-14: Day certain, but "June 2015" uncertain
```

**Timeline-Builder:**
```timeline
uncertainEvent: Uncertain year
  date: ~1984  # circa/approximate

rangeEvent: Date range (implicit uncertainty)
  date: 1918-1922
```

**Comparison:**
- Markwhen: Sophisticated EDTF support with `?` (uncertain) vs `~` (approximate)
- Ours: Simpler `~` for circa, ranges for uncertainty
- Both cover basic needs; Markwhen is more precise

### 3.3 Event Dependencies

**Markwhen:**
```markwhen
2023-01-01 / 2023-01-14: Phase 1
id: Phase1

!Phase1 2 weeks: Phase 2

before !Christmas 1 month: Buy presents
```

**Timeline-Builder:**
```timeline
phase1: Phase 1
  date: 2023-01-01 / 2023-01-14

phase2: Phase 2
  after: phase1 + 2 weeks

buyPresents: Buy presents
  before: christmas - 1 month
```

**Comparison:**
- Markwhen: Uses `!` prefix for references, ID defined via property
- Ours: Uses bare ID, ID is the event's primary identifier
- Both support similar dependency concepts

### 3.4 Uncertain Relationships (Critical Difference)

**Markwhen:**
```markwhen
# NOT POSSIBLE - cannot express uncertain durations in relationships
# Can only do: !eventA 3 years: Event B (fixed duration)
```

**Timeline-Builder:**
```timeline
jacobArrival: Jacob arrives in Haran
  after: jacobBorn + 20 years

jacobDeparture: Jacob departs Haran
  after: arrival + 13-15 years  # RANGE DURATION

josephBorn: Joseph is born
  before: departure - ~1 year  # APPROXIMATE OFFSET
```

**Comparison:**
- Markwhen: ❌ Cannot express uncertain durations in relationships
- Ours: ✅ Supports range durations (`13-15 years`) and approximate offsets (`~1 year`)
- **This is a critical differentiator for research timelines**

### 3.5 Multiple Constraints and Solving

**Markwhen:**
```markwhen
# NOT POSSIBLE - each event can only reference one other event
# Cannot express: "Event X is after A AND before B"
```

**Timeline-Builder:**
```timeline
eventX: Event X
  after: eventA + 2 years
  before: eventB - 1 year
  # System computes tightest possible range
```

**Comparison:**
- Markwhen: ❌ Single dependency per event
- Ours: ✅ Multiple constraints, automatic solving
- **Another critical differentiator**

### 3.6 Theory/Scenario Support

**Markwhen:**
```markwhen
# NOT POSSIBLE - no theory/scenario support
# Would need separate files for different theories
```

**Timeline-Builder:**
```timeline
#theory Early Exodus
exodus: The Exodus
  date: 1446 BC
#endtheory

#theory Late Exodus
exodus: The Exodus
  date: 1270 BC
#endtheory
```

**Comparison:**
- Markwhen: ❌ No scenario support
- Ours: ✅ Named theories with toggling
- **Critical for scholarly research**

### 3.7 Groups and Sections

**Markwhen:**
```markwhen
# The 90s
1991: Desert Storm
1994: Friends premiered

## Nested section
2005: The Office
```

**Timeline-Builder:**
```timeline
#group The 90s
desertStorm: Desert Storm
  date: 1991

friendsPremiere: Friends premiered
  date: 1994
#endgroup
```

**Comparison:**
- Markwhen: Markdown headers (more familiar to users)
- Ours: Explicit open/close (more explicit scope)
- Both work well; personal preference

---

## 4. What Markwhen CANNOT Do (Critical Gaps)

### 4.1 Uncertain Durations in Relationships

**Use Case:** Biblical text says "Jacob served Laban for his daughters for a period of years" with scholarly debate about whether it was 13, 14, or 15 years.

**What We Need:**
```timeline
departure: Jacob departs Haran
  after: arrival + 13-15 years
```

**Markwhen:** Cannot express this. Only supports fixed durations like `3 years`.

**Impact:** High. This is fundamental to research timelines with incomplete data.

### 4.2 Constraint-Based Reasoning

**Use Case:** Event X is "after 1920" AND "before 1925" AND "3 years after Event Y".

**What We Need:**
```timeline
eventX: Event X
  after: 1920
  before: 1925
  after: eventY + 3 years
# System computes: X must be in the intersection of all constraints
```

**Markwhen:** Cannot express multiple constraints. Each event can only reference one other event.

**Impact:** High. Research timelines accumulate constraints from multiple sources.

### 4.3 Confidence Levels

**Use Case:** Some constraints are certain (biblical text explicitly states), others are inferred (scholarly guess).

**What We Need:**
```timeline
exodus: The Exodus
  date: 1446 BC [high]  # Explicitly stated in 1 Kings 6:1

alternateDate: Alternative theory
  date: 1270 BC [low]  # Scholarly inference from archaeology
```

**Markwhen:** No confidence levels or constraint priorities.

**Impact:** Medium. Important for tracking data quality in research.

### 4.4 Theory/Scenario Toggling

**Use Case:** Compare "Early Exodus" vs "Late Exodus" theories side-by-side.

**What We Need:**
```timeline
#theory Early Exodus
exodus: The Exodus
  date: 1446 BC
#endtheory

#theory Late Exodus
exodus: The Exodus
  date: 1270 BC
#endtheory
```

**Markwhen:** No scenario support. Would need separate files.

**Impact:** High. Essential for scholarly research with competing theories.

### 4.5 Unanchored Timelines

**Use Case:** Build a timeline of Jacob's life with only relative relationships, no absolute dates initially.

**What We Need:**
```timeline
---
reference: jacobBorn
---

jacobBorn: Jacob is born [reference]
  # No absolute date

arrival: Jacob arrives in Haran
  after: jacobBorn + 20 years

departure: Jacob departs
  after: arrival + 14 years

# Later, can add absolute anchor:
# jacobBorn: date: ~1900 BC (propagates to all events)
```

**Markwhen:** Requires the first event in a dependency chain to have an absolute date. Timeline visualization assumes calendar dates.

**Impact:** High. Critical for ancient history where absolute dates are uncertain or unknown.

### 4.6 Interval Arithmetic and Propagation

**Use Case:** Event A is 1920-1925, Event B is 3 years after A, so B should be computed as 1923-1928.

**What We Need:**
```timeline
eventA: Event A
  date: 1920-1925

eventB: Event B
  after: eventA + 3 years
  # System computes: B is 1923-1928 (range propagation)
```

**Markwhen:** When you reference an event with a date range, it uses one of the bounds (implementation-dependent). No automatic range propagation.

**Impact:** High. Uncertainty compounds through the constraint graph.

---

## 5. What Markwhen DOES WELL (Can Inspire Our Design)

### 5.1 Clean, Minimal Syntax

Markwhen's syntax is approachable and minimal:
```markwhen
2025-04-09: Single date
2025-01-22 / 2026-10-24: Date range
```

**Lesson:** Keep syntax lightweight. Date-first format is intuitive for simple timelines.

**Adaptation:** We'll use ID-first for complex timelines with many constraints, but should consider date-first shorthand for simple cases.

### 5.2 EDTF Support

Markwhen's EDTF integration is sophisticated:
- `1984?` (uncertain)
- `1985~` (approximate)
- `1984?~` (both)
- `2015-06?-14` (partial uncertainty)

**Lesson:** EDTF is a well-designed standard for date uncertainty.

**Adaptation:** We should support EDTF dates, but extend uncertainty to relationships too.

### 5.3 Multiple Date Formats

Markwhen accepts:
- EDTF: `2022-05-14`
- ISO8601: `2022-02-22T16:27:08.369Z`
- Human-readable: `March 18, 2026`, `Aug 30 9:45am`

**Lesson:** Flexibility improves user experience.

**Adaptation:** Support multiple formats but recommend one (EDTF) for consistency.

### 5.4 Markdown-Inspired Headers for Groups

```markwhen
# Top level
## Nested
### More nested
```

**Lesson:** Users already know markdown headers.

**Adaptation:** Consider markdown headers vs. explicit `#group`/`#endgroup`. Markdown is more familiar; explicit is clearer for scope.

### 5.5 Tag System with Colors

```markwhen
---
#covid: blue
#travel: green
---

2020: Pandemic #covid
2019: Europe trip #travel
```

**Lesson:** Simple tag syntax with visual distinction is powerful.

**Adaptation:** Use the same `#tag` syntax and color assignment.

### 5.6 Properties for Extensibility

```markwhen
2025-04-30: Carpooling
  riders: [Tom, Jerry]
  fee: $4
```

**Lesson:** Key-value properties provide flexibility for custom metadata.

**Adaptation:** Support properties, but also have dedicated syntax for common needs (citations, confidence).

---

## 6. Recommendations

### Option 1: Use Markwhen As-Is ❌

**Pros:**
- Existing tool with good visualization
- Clean syntax
- Active development
- Web editor and VS Code extension

**Cons:**
- Missing critical features (uncertain relationships, constraint solving, theories)
- Cannot express our core use cases
- Would require major changes to the tool

**Verdict:** **Not viable.** Markwhen is designed for general timelines and project management, not research with uncertain data.

---

### Option 2: Fork and Extend Markwhen ⚠️

**Pros:**
- Start with working parser and visualization
- Leverage existing EDTF support
- Build on proven architecture

**Cons:**
- Major architectural changes needed (constraint solver, theory system)
- Parser would need significant extensions
- Would diverge quickly from upstream
- Might be easier to start fresh given the scope of changes

**Verdict:** **Possible but not recommended.** The required changes are so fundamental that we'd essentially be building a new tool. Better to start fresh with lessons learned.

---

### Option 3: Build Custom Syntax, Inspired by Markwhen ✅

**Pros:**
- Full control over features and architecture
- Can design specifically for research use case
- Learn from Markwhen's successes (EDTF, clean syntax, tags)
- No legacy constraints

**Cons:**
- More upfront work
- No existing visualization to leverage
- Need to build parser from scratch

**Verdict:** **Recommended.** Our requirements are different enough that a custom solution is warranted. We can still borrow Markwhen's best ideas.

---

## 7. Proposed Design: Taking the Best of Markwhen

### 7.1 What to Borrow from Markwhen

1. **EDTF support:** Use `1984?` for uncertain dates, `1985~` for approximate
2. **Tag syntax:** `#covid` for tags, `#covid: blue` for colors in header
3. **Property syntax:** Key-value pairs for extensibility
4. **Multiple date formats:** Accept EDTF, ISO8601, human-readable
5. **Date range syntax:** `2020/2023` for ranges
6. **Philosophy:** Minimal, readable, version-controllable

### 7.2 What to Add Beyond Markwhen

1. **Uncertain relationships:** `after: eventA + 13-15 years`
2. **Multiple constraints:** Events can have many `after`/`before`/`during` constraints
3. **Constraint solver:** Automatic propagation and tightest-bounds computation
4. **Confidence levels:** `[high]`, `[medium]`, `[low]` on constraints
5. **Theory blocks:** `#theory Early Exodus` ... `#endtheory`
6. **Unanchored support:** `reference: jacobBorn` in frontmatter
7. **Constraint types:** `start-after`, `end-after`, `during` keywords

### 7.3 Proposed Syntax (Refined)

```timeline
---
title: Jacob's Life Timeline
reference: jacobBorn
#family: blue
#travel: green
---

# Jacob's Family

jacobBorn: Jacob is born [reference]
  tags: #family
  note: Reference point for this timeline

esauBorn: Esau is born (twin)
  start-after: jacobBorn + 0 days [high]
  tags: #family
  source: Genesis 25:24-26

# Jacob's Journey

#theory Traditional Chronology
jacobArrival: Jacob arrives in Haran
  after: jacobBorn + 20 years [medium]
  tags: #travel
  source: Genesis 28

jacobDeparture: Jacob departs Haran
  after: jacobArrival + 13-15 years [medium]
  tags: #travel
  note: Served 7 years for each wife, uncertainty about when Joseph was born
  source: Genesis 31
#endtheory

#theory Alternative Chronology
jacobArrival: Jacob arrives in Haran
  after: jacobBorn + 15 years [low]

jacobDeparture: Jacob departs Haran
  after: jacobArrival + 20 years [low]
#endtheory

josephBorn: Joseph is born
  before: jacobDeparture - ~1 year [medium]
  tags: #family
  source: Genesis 30:22-24
  note: Born shortly before departure
```

**Key Differences from Markwhen:**
1. ID-first (not date-first) because many events don't have absolute dates
2. Explicit constraint keywords: `after:`, `before:`, `start-after:`, etc.
3. Range durations: `13-15 years`
4. Approximate offsets: `~1 year`
5. Confidence levels: `[high]`, `[medium]`, `[low]`
6. Theory blocks for alternative scenarios
7. Reference point for unanchored timelines

---

## 8. Technical Implementation Path

### Phase 1: Parser (Inspired by Markwhen)
- TypeScript parser (like Markwhen's)
- Support EDTF via existing libraries (like Markwhen)
- Parse our extended syntax (constraints, theories, confidence)
- Output: structured data model (events, constraints)

### Phase 2: Constraint Solver (New)
- Graph-based constraint representation
- Interval arithmetic for range propagation
- Constraint satisfaction algorithm
- Conflict detection
- Theory-aware solving (activate/deactivate constraint sets)

### Phase 3: Visualization (Inspired by Markwhen)
- Can study Markwhen's timeline view (open source)
- D3.js or vis-timeline for rendering
- Uncertainty visualization (shaded regions, error bars)
- Theory toggle UI
- Anchored vs. unanchored indicators

### Phase 4: Integration
- Web app with live editing (like Markwhen's editor)
- VS Code extension (like Markwhen's)
- File format: `.tl` extension

---

## 9. Conclusion

**Markwhen is excellent for what it does** — general-purpose timelines, project management, journaling. Its clean syntax, EDTF support, and visualization are impressive.

**But Markwhen cannot handle our research-focused requirements:**
- ❌ Uncertain durations in relationships
- ❌ Multiple constraints with automatic solving
- ❌ Confidence levels on constraints
- ❌ Theory/scenario toggling
- ❌ Fully unanchored timelines

**Therefore, we should:**
1. ✅ Build a custom tool with our own parser and constraint solver
2. ✅ Borrow Markwhen's best ideas (EDTF, tags, clean syntax)
3. ✅ Design specifically for research use cases
4. ✅ Support advanced features Markwhen doesn't provide

**The proposed timeline-builder syntax** combines:
- Markwhen's clarity and minimalism
- EDTF's date uncertainty
- Advanced constraint reasoning for research
- Theory support for scholarly work

This gives us a tool purpose-built for research timelines with uncertain data, while still maintaining the readability and version-control benefits of plain text.

---

## Sources

- [Markwhen Official Site](https://markwhen.com/)
- [Markwhen Documentation - Introduction](https://docs.markwhen.com/)
- [Markwhen GitHub Repository](https://github.com/mark-when/markwhen)
- [Markwhen Documentation - Dates and Ranges](https://docs.markwhen.com/syntax/dates-and-ranges)
- [Introduction to Markwhen - The New Stack](https://thenewstack.io/introduction-to-markwhen-a-markdown-timeline-tool-for-devs/)
- [Markwhen on Hacker News](https://news.ycombinator.com/item?id=42289690)
- [Markwhen Review - GIGAZINE](https://gigazine.net/gsc_news/en/20241207-markdown-timeline-markwhen/)
- [Markwhen Documentation - Timeline Visualization](https://docs.markwhen.com/visualizations/timeline/)
- [Markwhen Documentation - Syntax Overview](https://docs.markwhen.com/syntax/overview)
- [Markwhen Documentation - Events](https://docs.markwhen.com/syntax/events)
- [Markwhen Documentation - Properties](https://docs.markwhen.com/syntax/properties)
- [Markwhen Documentation - Groups and Sections](https://docs.markwhen.com/syntax/groups-and-sections)
- [Markwhen Documentation - Tags](https://docs.markwhen.com/syntax/tags)
- [Task dependency issue #106](https://github.com/mark-when/markwhen/issues/106)
- [Weekdays, due dates, and checkboxes - Markwhen Blog](https://blog.markwhen.com/posts/2022-07-17-weekdays)
- [Light mode and sections - Markwhen Blog](https://blog.markwhen.com/posts/2022-04-17-light-mode)
- [EDTF Specification - Library of Congress](https://www.loc.gov/standards/datetime/)
- [How to Use EDTF for Fuzzy Dates - STQRY Support](https://support.stqry.com/support/solutions/articles/153000136628-how-to-use-extended-date-time-format-edtf-for-fuzzy-dates)
