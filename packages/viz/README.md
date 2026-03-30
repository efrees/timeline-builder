# Timeline Visualization

Interactive web-based timeline visualization for Timeline Builder.

## Features

- **Horizontal timeline view** with D3 scales
- **Zoom and pan** - scroll to zoom, drag to pan
- **Event rendering** - events displayed as bars with date ranges
- **Time axis** with automatic tick formatting
- **Responsive layout** adapts to container width

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
  App.svelte              # Main application component
  main.ts                 # Entry point
  app.css                 # Global styles with Tailwind
  lib/
    Timeline.svelte       # Timeline visualization component
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

## Completed Tasks (Sprint 6)

- ✅ **P3.1:** Set up web visualization project
- ✅ **P3.2:** Design timeline layout and D3 scales
- ✅ **P3.3:** Implement timeline axis
- ✅ **P3.4:** Render events as bars

## Next Steps

Future enhancements (Phase 3 remaining tasks):

- **P3.5:** Visualize uncertainty (shaded regions)
- **P3.6:** Event labels with intelligent placement
- **P3.7:** Hover tooltips with event details
- **P3.8:** Visual indicators for anchored vs unanchored
- **P3.9-P3.11:** Enhanced interactivity (keyboard nav, event selection)
- **P3.12-P3.13:** File loading (drag-and-drop, JSON import)

## Contributing

This is part of the Timeline Builder project. See the main project README for overall architecture and development process.

## License

Same as Timeline Builder main project.
