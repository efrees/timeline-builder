<script lang="ts">
  // Zoom controls component for timeline navigation
  export let zoomLevel: number = 100;
  export let onZoomIn: () => void;
  export let onZoomOut: () => void;
  export let onReset: () => void;
</script>

<div class="zoom-controls">
  <div class="zoom-buttons">
    <button
      class="zoom-button"
      on:click={onZoomOut}
      aria-label="Zoom out"
      title="Zoom out"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="7" width="8" height="2" fill="currentColor" rx="1"/>
      </svg>
    </button>

    <div class="zoom-level" aria-live="polite">
      {zoomLevel}%
    </div>

    <button
      class="zoom-button"
      on:click={onZoomIn}
      aria-label="Zoom in"
      title="Zoom in"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="7" width="8" height="2" fill="currentColor" rx="1"/>
        <rect x="7" y="4" width="2" height="8" fill="currentColor" rx="1"/>
      </svg>
    </button>

    <button
      class="reset-button"
      on:click={onReset}
      aria-label="Reset zoom"
      title="Reset zoom to 100%"
    >
      Reset
    </button>
  </div>
</div>

<style>
  .zoom-controls {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 100;
  }

  .zoom-buttons {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .zoom-button,
  .reset-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.75rem;
    font-weight: 500;
    color: #374151;
  }

  .zoom-button {
    width: 32px;
    height: 32px;
    padding: 0;
  }

  .reset-button {
    height: 32px;
    padding: 0 0.75rem;
    margin-left: 0.25rem;
  }

  .zoom-button:hover,
  .reset-button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .zoom-button:active,
  .reset-button:active {
    background: #f3f4f6;
  }

  .zoom-button:focus,
  .reset-button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .zoom-level {
    min-width: 48px;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    padding: 0 0.5rem;
    user-select: none;
  }

  @media (prefers-color-scheme: dark) {
    .zoom-buttons {
      background: #1f2937;
      border-color: #374151;
    }

    .zoom-button,
    .reset-button {
      background: #374151;
      border-color: #4b5563;
      color: #e5e7eb;
    }

    .zoom-button:hover,
    .reset-button:hover {
      background: #4b5563;
      border-color: #6b7280;
    }

    .zoom-button:active,
    .reset-button:active {
      background: #374151;
    }

    .zoom-level {
      color: #d1d5db;
    }
  }

  @media (max-width: 640px) {
    .zoom-controls {
      top: auto;
      bottom: 1rem;
      right: 1rem;
    }

    .reset-button {
      display: none;
    }
  }
</style>
