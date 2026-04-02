# Timeline Builder

Build and visualize timelines when your dates are uncertain, approximate, or relative to other events.

Perfect for historical research, genealogy, reconstructing past events, or any scenario where you're working with incomplete or fuzzy temporal data.

## Quick Start

Get a working timeline in 5 minutes:

```bash
# 1. Clone and install
git clone <repository-url>
cd timeline-builder
npm install
npm run build

# 2. Parse an example timeline
npx tl-parse solve examples/constraint-demo.tl --pretty

# 3. Start the visualization
cd packages/viz
npm install
npm run dev

# 4. Open http://localhost:5173 and drag-and-drop the JSON output
```

## What You Can Do

Timeline Builder lets you express events with:

- **Uncertain dates**: "circa 1920" or "between 1918 and 1922"
- **Relative constraints**: "25 years after grandfather was born"
- **Constraint solving**: Automatically narrows date ranges based on relationships
- **Interactive visualization**: Drag-and-drop JSON files to see timelines

## Example Timeline

Create a file called `family.tl`:

```yaml
---
title: Family Timeline
description: Three generations
---

grandfather: Grandfather born
  date: 1920-1925

father: Father born
  after: grandfather + 25 years
  date: 1945-1965

myself: My birth
  after: father + 20 years
  date: 1970-2000

sister: Sister born
  after: myself + 2 years
  date: 1980-2010
```

Notice how we provide broad initial date ranges, but the constraints between events help narrow them down.

## Step-by-Step First Run

### 1. Install the Project

```bash
git clone <repository-url>
cd timeline-builder
npm install
npm run build
```

This installs dependencies and compiles the TypeScript source to the `dist/` directory.

### 2. Parse a Timeline

The CLI reads `.tl` files and outputs structured JSON:

```bash
# Basic parsing (shows structure)
npx tl-parse parse examples/basic.tl

# Solve constraints (computes date ranges)
npx tl-parse solve examples/constraint-demo.tl --pretty
```

The `solve` command runs the constraint solver to compute tighter date ranges based on relationships between events.

**Output**: JSON with computed date ranges for each event:

```json
{
  "metadata": {
    "title": "Constraint Propagation Demo",
    "solver": {
      "converged": true,
      "iterations": 2
    }
  },
  "events": [
    {
      "id": "grandfather",
      "description": "Grandfather born",
      "computedRange": {
        "min": { "year": 1920 },
        "max": { "year": 1925 },
        "formatted": "1920 to 1925"
      }
    }
    // ... more events
  ]
}
```

### 3. Save JSON Output

Save the solver output to a file:

```bash
npx tl-parse solve examples/constraint-demo.tl --pretty -o output.json
```

### 4. Visualize the Timeline

The interactive visualization displays your timeline with:
- Event bars showing date ranges
- Hover tooltips with full details
- Color-coded anchored vs. computed events

```bash
cd packages/viz
npm install
npm run dev
```

Open your browser to `http://localhost:5173`, then drag-and-drop `output.json` onto the page.

You'll see:
- A horizontal timeline with event bars
- Uncertainty ranges visualized as bar widths
- Hover over events for detailed information
- Tags, properties, and metadata displayed in tooltips

### 5. Create Your Own Timeline

Create a new `.tl` file with your events:

```yaml
---
title: My Project Timeline
description: Software release history
---

alpha: Alpha release
  date: 2024-01

beta: Beta release
  after: alpha + 3 months
  date: 2024-03-2024-06

launch: Production launch
  after: beta + 1 month
  date: 2024-06-2024-08
  tags: [milestone]
```

Then solve and visualize:

```bash
npx tl-parse solve my-timeline.tl --pretty -o my-output.json
cd packages/viz
npm run dev
# Drag my-output.json into the browser
```

## Timeline File Format

Timeline files use a YAML-like syntax:

### Metadata Block (Optional)

```yaml
---
title: Timeline Title
description: Brief description
reference: eventId  # Which event to use as reference
---
```

### Event Syntax

```yaml
eventId: Event description
  date: <date-expression>
  after: <reference> + <offset>
  before: <reference> - <offset>
  duration: <duration>
  tags: [tag1, tag2]
  property_name: value
```

### Date Expressions

- **Absolute dates**: `1920`, `1920-05`, `1920-05-15`
- **Approximate**: `~1920` (circa 1920)
- **Ranges**: `1918-1922`, `1920-01-1920-06`
- **Open-ended**: `1920-` (from 1920 onward)

### Relative Constraints

```yaml
eventB: Event B
  after: eventA + 5 years

eventC: Event C
  before: eventB - 3 months

eventD: Event D
  after: eventA + 10-15 years  # Uncertain offset
  after: eventB + ~2 years     # Approximate offset
```

### Properties and Tags

```yaml
battle: Battle of Marathon
  date: -490  # BCE dates use negative years
  tags: [military, ancient-greece]
  location: Marathon
  participants: Greeks, Persians
  outcome: Greek victory
```

## CLI Reference

### Commands

```bash
# Parse without solving
npx tl-parse parse <file>

# Parse and solve constraints
npx tl-parse solve <file> [options]
```

### Solve Options

- `--pretty` - Pretty-print JSON output
- `-o <file>` - Write to file instead of stdout
- `--strict` - Exit with error code if conflicts detected
- `--show-conflicts` - Include conflict details in output
- `--show-anchoring` - Include anchoring analysis
- `--max-iterations <n>` - Set max solver iterations

### Examples

```bash
# Pretty JSON to console
npx tl-parse solve timeline.tl --pretty

# Save to file
npx tl-parse solve timeline.tl -o output.json

# Show conflicts
npx tl-parse solve timeline.tl --show-conflicts --strict
```

## Features

### Constraint Solver

The solver propagates constraints to narrow date ranges:

1. **Initial ranges**: You provide broad date ranges for each event
2. **Constraints**: Define relationships (after, before, duration)
3. **Propagation**: Solver iteratively tightens ranges
4. **Convergence**: Stops when ranges stabilize or conflicts detected

Example: If you say "father born 1945-1965" and "son born after father + 20 years", the solver will narrow both ranges based on the constraint.

### Uncertainty Handling

- **Approximate dates** (`~1920`): Treated as ±5 year range
- **Uncertain offsets** (`+ 10-15 years`): Range-based constraints
- **Confidence levels**: Tag events with confidence metadata

### Interactive Visualization

- **Drag-and-drop**: Load JSON files directly in browser
- **Hover tooltips**: See full event details
- **Date range bars**: Visual width shows uncertainty
- **Anchoring indicators**: Shows which events have direct date evidence
- **Responsive layout**: Scales to viewport

### Validation and Error Handling

- Syntax validation during parsing
- Conflict detection in solver
- Missing reference warnings
- Circular dependency detection

## Project Structure

```
timeline-builder/
├── src/               # TypeScript source
│   ├── parser/        # .tl file parser
│   ├── solver/        # Constraint solver
│   └── cli/           # Command-line interface
├── packages/
│   └── viz/           # Svelte visualization app
├── examples/          # Example .tl files
├── docs/              # Documentation
│   ├── adr/           # Architecture Decision Records
│   └── SPRINT_LETTER_*.md  # Sprint reports
├── tests/             # Test suites
└── dist/              # Compiled output
```

## Learn More

### Documentation

- **[docs/adr/](docs/adr/)** - Architecture decisions and design rationale
- **[docs/SPRINT_LETTER_*.md](docs/)** - Detailed sprint reports with features and implementation notes
- **[examples/](examples/)** - Sample timeline files demonstrating features

### Example Files

- `examples/basic.tl` - Simple absolute dates
- `examples/constraint-demo.tl` - Relative constraints and propagation
- `examples/uncertain.tl` - Uncertainty features (circa, ranges, confidence)
- `examples/jacob.tl` - Biblical genealogy example

### Key Concepts

**Anchored Events**: Events with direct date evidence (absolute date constraint)

**Computed Events**: Events whose dates are primarily derived from constraints

**Constraint Propagation**: The solver's iterative process of narrowing date ranges

**Convergence**: When the solver reaches a stable state (no more changes possible)

## Development

### Run Tests

```bash
npm test              # Run all tests
npm run test:ui       # Interactive test UI
npm run test:coverage # Coverage report
```

### Build

```bash
npm run build         # Compile TypeScript
npm run typecheck     # Type checking only
```

### Code Quality

```bash
npm run lint          # ESLint
npm run format        # Prettier format
npm run format:check  # Check formatting
```

## Use Cases

Timeline Builder is designed for scenarios where:

- **Dates are uncertain**: "circa 1920", "early 1900s", "between 1918 and 1922"
- **Only relative information exists**: "25 years after X", "3 months before Y"
- **You're reconstructing timelines**: Historical research, genealogy, investigations
- **Evidence is incomplete**: Working with partial records, oral histories, estimates
- **You need to track uncertainty**: Show what's known vs. computed vs. guessed

Perfect for:
- Genealogical research
- Historical event reconstruction
- Biography timelines
- Archaeological site chronologies
- Document dating analysis
- Forensic timeline building

## Limitations and Future Work

Current limitations:
- No support for cyclical constraints
- Limited date precision (year/month/day only)
- No built-in timeline merging
- Visualization is read-only (no editing)

See [BACKLOG.md](BACKLOG.md) for planned features and improvements.

## Contributing

This is an active research project. Contributions welcome!

When contributing:
1. Run tests: `npm test`
2. Check types: `npm run typecheck`
3. Format code: `npm run format`
4. Update docs if adding features

## License

MIT

## Questions?

Check the [docs/](docs/) directory for detailed sprint reports and architecture decisions, or review the [examples/](examples/) to see the syntax in action.
