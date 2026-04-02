<script lang="ts">
  import type { TimelineEvent } from './types';

  export let event: TimelineEvent | null = null;
  export let x: number = 0;
  export let y: number = 0;
  export let visible: boolean = false;

  let tooltipElement: HTMLDivElement;
  let adjustedX = x;
  let adjustedY = y;

  // Adjust position to keep tooltip on screen
  $: if (tooltipElement && visible) {
    const rect = tooltipElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position
    if (x + rect.width > viewportWidth - 10) {
      adjustedX = x - rect.width - 10;
    } else {
      adjustedX = x + 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight - 10) {
      adjustedY = y - rect.height - 10;
    } else {
      adjustedY = y + 10;
    }
  } else {
    adjustedX = x + 10;
    adjustedY = y + 10;
  }
</script>

{#if visible && event}
  <div
    bind:this={tooltipElement}
    class="tooltip"
    style="left: {adjustedX}px; top: {adjustedY}px;"
  >
    <div class="tooltip-header">
      <span class="tooltip-id">{event.id}</span>
      {#if event.isAnchored}
        <span class="tooltip-badge">Anchored</span>
      {/if}
    </div>

    <div class="tooltip-section">
      <div class="tooltip-label">Description</div>
      <div class="tooltip-value">{event.description}</div>
    </div>

    <div class="tooltip-section">
      <div class="tooltip-label">Date Range</div>
      <div class="tooltip-value">{event.computedRange.formatted}</div>
    </div>

    {#if event.tags && event.tags.length > 0}
      <div class="tooltip-section">
        <div class="tooltip-label">Tags</div>
        <div class="tooltip-tags">
          {#each event.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
      </div>
    {/if}

    {#if event.properties && Object.keys(event.properties).length > 0}
      <div class="tooltip-section">
        <div class="tooltip-label">Properties</div>
        <div class="tooltip-properties">
          {#each Object.entries(event.properties) as [key, value]}
            <div class="property-row">
              <span class="property-key">{key}:</span>
              <span class="property-value">{JSON.stringify(value)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .tooltip {
    position: fixed;
    z-index: 1000;
    background: rgba(17, 24, 39, 0.95);
    color: white;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    max-width: 300px;
    font-size: 13px;
    line-height: 1.4;
    pointer-events: none;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tooltip-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .tooltip-id {
    font-weight: 600;
    font-family: monospace;
    font-size: 12px;
    color: #93c5fd;
  }

  .tooltip-badge {
    background: #3b82f6;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
  }

  .tooltip-section {
    margin-top: 8px;
  }

  .tooltip-section:first-of-type {
    margin-top: 0;
  }

  .tooltip-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    font-weight: 500;
  }

  .tooltip-value {
    color: white;
  }

  .tooltip-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag {
    background: rgba(59, 130, 246, 0.3);
    color: #93c5fd;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    border: 1px solid rgba(59, 130, 246, 0.4);
  }

  .tooltip-properties {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .property-row {
    display: flex;
    gap: 6px;
  }

  .property-key {
    color: #fbbf24;
    font-weight: 500;
  }

  .property-value {
    color: #86efac;
    font-family: monospace;
    font-size: 12px;
  }

  @media (prefers-color-scheme: light) {
    .tooltip {
      background: rgba(255, 255, 255, 0.98);
      color: #111827;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .tooltip-header {
      border-bottom-color: rgba(0, 0, 0, 0.1);
    }

    .tooltip-id {
      color: #2563eb;
    }

    .tooltip-label {
      color: #6b7280;
    }

    .tooltip-value {
      color: #111827;
    }

    .tag {
      background: rgba(59, 130, 246, 0.1);
      color: #2563eb;
      border-color: rgba(59, 130, 246, 0.3);
    }

    .property-key {
      color: #d97706;
    }

    .property-value {
      color: #059669;
    }
  }
</style>
