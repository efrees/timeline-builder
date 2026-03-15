# Constraint Propagation Demo Notes

## Purpose

The `constraint-demo.tl` file demonstrates how the constraint solver propagates temporal relationships through a timeline. This example shows:

1. **Absolute date anchors**: `grandfather` has a known date range (1920-1925)
2. **Relative constraints**: Other events are defined relative to previous events
3. **Constraint chains**: `grandfather` → `father` → `myself` → `sister`
4. **Range narrowing**: Multiple constraints on the same event narrow its possible date range

## Expected Behavior

Given the constraints:
- Grandfather: 1920-1925 (absolute)
- Father: after grandfather + 25 years, before grandfather + 40 years
- Myself: after father + 20 years, before father + 35 years
- Sister: after myself + 2 years, before myself + 5 years

The solver should compute:
- Grandfather: 1920-1925 (given)
- Father: 1945-1965 (grandfather.max + 25 to grandfather.max + 40)
- Myself: 1965-2000 (father.min + 20 to father.max + 35)
- Sister: 1967-2005 (myself.min + 2 to myself.max + 5)

## Known Issues (Sprint 5)

The backward propagation isn't fully working yet:
- "before" constraints don't properly narrow the max bound
- Events show very large max values (1000000) instead of computed bounds
- This will be fixed in a future sprint with improved propagation

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
