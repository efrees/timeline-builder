# Constraint Propagation Demo Notes

## Purpose

The `constraint-demo.tl` file demonstrates how the constraint solver propagates temporal relationships through a timeline. This example shows:

1. **Absolute date anchors**: `grandfather` has a known date range (1920-1925)
2. **Relative constraints**: Other events are defined relative to previous events
3. **Constraint chains**: `grandfather` → `father` → `myself` → `sister`
4. **Range narrowing**: Multiple constraints on the same event narrow its possible date range

## Expected Behavior

Given the constraints:
- Grandfather: 1920-1925 (absolute date range)
- Father: after grandfather + 25 years AND date: 1945-1965
- Myself: after father + 20 years AND date: 1970-2000
- Sister: after myself + 2 years AND date: 1980-2010

The solver computes (by intersecting constraints):
- Grandfather: 1920-1925 (given)
- Father: 1950-1965 (min from "after" = 1950, max from absolute = 1965)
- Myself: 1985-2000 (min from "after" = 1985, max from absolute = 2000)
- Sister: 2002-2010 (min from "after" = 2002, max from absolute = 2010)

## How It Works

The solver demonstrates **constraint intersection**:
1. Each event can have multiple constraints (relative AND absolute)
2. "after" constraints set the minimum bound based on predecessor
3. Absolute date ranges constrain both min and max
4. The solver narrows ranges by intersecting all constraints
5. Fixed-point iteration propagates changes through the chain

This shows the power of combining different constraint types!

## Output Format

The `solve` command outputs JSON suitable for visualization:

```json
{
  "metadata": {
    "solver": {
      "converged": true,
      "iterations": 2,
      "success": true
    }
  },
  "events": [
    {
      "id": "grandfather",
      "computedRange": {
        "min": { "year": 1920 },
        "max": { "year": 1925 },
        "formatted": "1920 to 1925"
      },
      "isAnchored": true
    }
  ]
}
```

## Visualization Notes for Phase 3

When building the visualization (Phase 3), this output can be used to:

1. **Position events on timeline**: Use `computedRange.min.year` and `computedRange.max.year`
2. **Show uncertainty**: Render ranges as bars, points as circles
3. **Indicate anchoring**: Color-code anchored vs. unanchored events
4. **Display metadata**: Show solver convergence status, iteration count

Suggested visualization:
```
1920    1930    1940    1950    1960    1970    1980
[===grandfather===]
                    [========father=========]
                                    [======myself======]
                                            [==sister==]
```

## Testing the Demo

Run the demo with various options:

```bash
# Basic solve
tl-parse solve examples/constraint-demo.tl --pretty

# Show anchoring analysis
tl-parse solve examples/constraint-demo.tl --pretty --show-anchoring

# Show conflicts (should be none)
tl-parse solve examples/constraint-demo.tl --pretty --show-conflicts

# Strict mode (fail on conflicts)
tl-parse solve examples/constraint-demo.tl --strict
```

## Future Enhancements

- Fix backward propagation to properly narrow max bounds
- Add support for "during" constraints
- Support for uncertain duration ranges (e.g., "25-30 years")
- Multiple absolute constraints that intersect
- Theory-based constraint toggling
