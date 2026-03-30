<script lang="ts">
  import Timeline from './lib/Timeline.svelte';
  import type { TimelineData } from './lib/types';

  // Sample data - this will be loaded from JSON file
  const sampleData: TimelineData = {
    "metadata": {
      "title": "Constraint Propagation Demo",
      "description": "Shows how relative constraints narrow date ranges",
      "solver": {
        "converged": true,
        "iterations": 2,
        "success": true
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
        },
        "isAnchored": true,
        "tags": [],
        "properties": {}
      },
      {
        "id": "father",
        "description": "Father born",
        "computedRange": {
          "min": { "year": 1950 },
          "max": { "year": 1965 },
          "formatted": "1950 to 1965"
        },
        "isAnchored": true,
        "tags": [],
        "properties": {}
      },
      {
        "id": "myself",
        "description": "My birth",
        "computedRange": {
          "min": { "year": 1985 },
          "max": { "year": 2000 },
          "formatted": "1985 to 2000"
        },
        "isAnchored": true,
        "tags": [],
        "properties": {}
      },
      {
        "id": "sister",
        "description": "Sister born",
        "computedRange": {
          "min": { "year": 2002 },
          "max": { "year": 2010 },
          "formatted": "2002 to 2010"
        },
        "isAnchored": true,
        "tags": [],
        "properties": {}
      }
    ]
  };
</script>

<main class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  <div class="container mx-auto px-4 max-w-6xl">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Timeline Builder Visualization
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Interactive timeline visualization with zoom and pan
      </p>
    </div>

    <Timeline data={sampleData} />

    <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
        How to use:
      </h3>
      <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
        <li>• Scroll to zoom in and out</li>
        <li>• Click and drag to pan left and right</li>
        <li>• Blue bars are anchored events (with absolute dates)</li>
        <li>• Gray bars are unanchored events (relative only)</li>
      </ul>
    </div>
  </div>
</main>
