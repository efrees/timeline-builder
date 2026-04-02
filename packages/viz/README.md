# Timeline Visualization

Interactive web-based timeline visualization for Timeline Builder.

## Features

- **Horizontal timeline view** with D3 scales
- **Zoom and pan** - scroll to zoom, drag to pan
- **Event rendering** - events displayed as bars with date ranges
- **Event labels** - IDs and descriptions with smart truncation
- **Interactive tooltips** - hover to see full event details
- **File loading** - drag-and-drop or browse for JSON files
- **Time axis** with automatic tick formatting
- **Responsive layout** adapts to container width
- **Dark mode** support for tooltips and UI

## Tech Stack

- **Svelte 5** - reactive UI framework
- **Vite** - fast build tool with HMR
- **D3.js** - data-driven visualization
- **Tailwind CSS** - utility-first styling
- **TypeScript** - type safety

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
  App.svelte              # Main application component (file loading UI)
  main.ts                 # Entry point
  app.css                 # Global styles with Tailwind
  lib/
    Timeline.svelte       # Timeline visualization component
    Tooltip.svelte        # Hover tooltip component
    fileLoader.ts         # JSON validation and parsing
    types.ts              # TypeScript type definitions
    timeUtils.ts          # Time conversion utilities
```

## Usage

The Timeline component accepts a `data` prop matching the JSON format from the CLI solver:

```typescript
interface TimelineData {
  metadata: {
    title?: string;
    description?: string;
    solver?: { converged: boolean; iterations: number; success: boolean };
  };
  events: TimelineEvent[];
}
```

Example:

```svelte
<script>
  import Timeline from './lib/Timeline.svelte';

  const data = { /* ... timeline JSON ... */ };
</script>

<Timeline {data} />
```

## Completed Tasks

### Sprint 6 (2026-03-30)
- ✅ **P3.1:** Set up web visualization project
- ✅ **P3.2:** Design timeline layout and D3 scales
- ✅ **P3.3:** Implement timeline axis
- ✅ **P3.4:** Render events as bars

### Sprint 7 (2026-04-02)
- ✅ **P3.6:** Event labels with truncation
- ✅ **P3.7:** Hover tooltips with event details
- ✅ **P3.12:** Load timeline JSON files
- ✅ **P3.13:** Drag-and-drop file loading

## How to Use

1. **Load a timeline:**
   - Drag a JSON file onto the drop zone, OR
   - Click "Choose File" to browse for a file

2. **View the timeline:**
   - Scroll to zoom in/out
   - Click and drag to pan left/right
   - Hover over events to see details

3. **Load a different file:**
   - Click "Load Different File" button

## JSON Format

The visualization expects JSON files with this structure:

```json
{
  "metadata": {
    "title": "Timeline Title",
    "description": "Optional description",
    "solver": {
      "converged": true,
      "iterations": 2,
      "success": true
    }
  },
  "events": [
    {
      "id": "event-id",
      "description": "Event description",
      "computedRange": {
        "min": { "year": 1920 },
        "max": { "year": 1925 },
        "formatted": "1920 to 1925"
      },
      "isAnchored": true,
      "tags": ["tag1", "tag2"],
      "properties": {}
    }
  ]
}
```

This format matches the output from the Timeline Builder CLI solver.

## Next Steps

Future enhancements (Phase 3 remaining tasks):

- **P3.5:** Visualize uncertainty (shaded regions)
- **P3.8:** Enhanced visual indicators for anchored vs unanchored
- **P3.9-P3.11:** Advanced interactivity (keyboard nav, event selection)
- **P3.14:** Comprehensive test suite
- **P3.15:** Complete documentation
- **P3.16:** Phase 3 polish and integration

## Contributing

This is part of the Timeline Builder project. See the main project README for overall architecture and development process.

## License

Same as Timeline Builder main project.
