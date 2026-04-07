# Timeline Visualization

Interactive web-based timeline visualization for Timeline Builder.

## Features

- **Horizontal timeline view** with D3 scales
- **Zoom and pan** - scroll to zoom, drag to pan, or use UI controls
- **Zoom controls** - +/- buttons, zoom level display, and reset button
- **Event rendering** - events displayed as bars with date ranges
- **Uncertainty visualization** - semi-transparent halos show date range uncertainty
- **Visual indicators** - color-coded anchored (blue) vs unanchored (gray) events
- **Legend** - explains color scheme for event types
- **Event labels** - IDs and descriptions with smart truncation
- **Interactive tooltips** - hover to see full event details
- **Event selection** - click events to see comprehensive details in side panel
- **Detail panel** - fixed panel showing event ID, description, date range, status, tags, properties
- **Keyboard navigation** - Tab, Enter/Space, ESC for full accessibility
- **File loading** - drag-and-drop or browse for JSON files
- **Time axis** with automatic tick formatting
- **Responsive layout** adapts to container width (desktop, tablet, mobile)
- **Dark mode** support for all UI components

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
    Timeline.svelte       # Timeline visualization component (421 lines)
    Tooltip.svelte        # Hover tooltip component (236 lines)
    DetailPanel.svelte    # Click-to-open detail panel (349 lines)
    Legend.svelte         # Color legend for event types (100 lines)
    ZoomControls.svelte   # Zoom UI controls (162 lines)
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

### Sprint 8 (2026-04-07)
- ✅ **P3.5:** Uncertainty visualization with halos
- ✅ **P3.8:** Visual indicators with legend
- ✅ **P3.9:** Zoom UI controls
- ✅ **P3.10:** Event click selection with detail panel

## How to Use

1. **Load a timeline:**
   - Drag a JSON file onto the drop zone, OR
   - Click "Choose File" to browse for a file

2. **Navigate the timeline:**
   - **Zoom:** Scroll wheel, or use +/- buttons in top-right
   - **Pan:** Click and drag the timeline background
   - **Reset:** Click "Reset" button to return to 100% zoom

3. **Explore events:**
   - **Hover:** See quick preview tooltip with event details
   - **Click:** Open detail panel with full information
   - **Deselect:** Click background, close button, or press ESC

4. **Understand the visualization:**
   - **Blue events:** Anchored (direct date evidence)
   - **Gray events:** Unanchored (computed/relative dates)
   - **Halo effect:** Semi-transparent region shows date uncertainty
   - **Legend:** Reference at bottom explains color scheme

5. **Keyboard navigation:**
   - **Tab:** Move between events
   - **Enter/Space:** Select event
   - **ESC:** Close detail panel
   - **+/-:** Zoom (when controls are focused)

6. **Load a different file:**
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

- **P3.11:** Complete keyboard navigation (arrow keys for pan, +/- keys for zoom)
- **P3.14:** Comprehensive test suite (unit, integration, visual regression)
- **P3.15:** Complete documentation (detailed usage guide with screenshots)
- **P3.16:** Phase 3 polish and integration (performance, a11y audit, final release)

## Contributing

This is part of the Timeline Builder project. See the main project README for overall architecture and development process.

## License

Same as Timeline Builder main project.
