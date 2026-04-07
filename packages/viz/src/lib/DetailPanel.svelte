<script lang="ts">
  import type { TimelineEvent } from './types';

  export let event: TimelineEvent | null = null;
  export let onClose: () => void;

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      onClose();
    }
  }
</script>

{#if event}
  <div class="detail-panel">
    <div class="panel-header">
      <h3>Event Details</h3>
      <button
        class="close-button"
        on:click={onClose}
        on:keypress={handleKeyPress}
        aria-label="Close detail panel"
        title="Close (ESC)"
      >
        ×
      </button>
    </div>

    <div class="panel-content">
      <div class="detail-section">
        <div class="detail-label">Event ID</div>
        <div class="detail-value event-id">{event.id}</div>
      </div>

      <div class="detail-section">
        <div class="detail-label">Description</div>
        <div class="detail-value">{event.description}</div>
      </div>

      <div class="detail-section">
        <div class="detail-label">Date Range</div>
        <div class="detail-value date-range">{event.computedRange.formatted}</div>
      </div>

      <div class="detail-section">
        <div class="detail-label">Status</div>
        <div class="detail-value">
          {#if event.isAnchored}
            <span class="status-badge anchored">Anchored</span>
          {:else}
            <span class="status-badge unanchored">Computed</span>
          {/if}
        </div>
      </div>

      {#if event.tags && event.tags.length > 0}
        <div class="detail-section">
          <div class="detail-label">Tags</div>
          <div class="tags-container">
            {#each event.tags as tag}
              <span class="tag-chip">{tag}</span>
            {/each}
          </div>
        </div>
      {/if}

      {#if event.properties && Object.keys(event.properties).length > 0}
        <div class="detail-section">
          <div class="detail-label">Properties</div>
          <div class="properties-list">
            {#each Object.entries(event.properties) as [key, value]}
              <div class="property-item">
                <span class="property-key">{key}:</span>
                <span class="property-value">{JSON.stringify(value)}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .detail-panel {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 320px;
    max-height: 80vh;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 100;
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 28px;
    line-height: 1;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.15s;
  }

  .close-button:hover {
    background: #e5e7eb;
    color: #111827;
  }

  .close-button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .panel-content {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }

  .detail-section {
    margin-bottom: 16px;
  }

  .detail-section:last-child {
    margin-bottom: 0;
  }

  .detail-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .detail-value {
    font-size: 14px;
    color: #111827;
    line-height: 1.5;
  }

  .event-id {
    font-family: monospace;
    font-weight: 600;
    color: #2563eb;
    font-size: 13px;
  }

  .date-range {
    font-weight: 500;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .status-badge.anchored {
    background: #dbeafe;
    color: #1e40af;
  }

  .status-badge.unanchored {
    background: #f1f5f9;
    color: #475569;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag-chip {
    background: #eff6ff;
    color: #2563eb;
    padding: 4px 10px;
    border-radius: 14px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid #bfdbfe;
  }

  .properties-list {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 10px;
  }

  .property-item {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 13px;
  }

  .property-item:last-child {
    margin-bottom: 0;
  }

  .property-key {
    color: #d97706;
    font-weight: 600;
  }

  .property-value {
    color: #059669;
    font-family: monospace;
    word-break: break-all;
  }

  @media (prefers-color-scheme: dark) {
    .detail-panel {
      background: #1f2937;
      border-color: #374151;
    }

    .panel-header {
      background: #111827;
      border-bottom-color: #374151;
    }

    .panel-header h3 {
      color: #f9fafb;
    }

    .close-button {
      color: #9ca3af;
    }

    .close-button:hover {
      background: #374151;
      color: #f9fafb;
    }

    .detail-label {
      color: #9ca3af;
    }

    .detail-value {
      color: #f9fafb;
    }

    .event-id {
      color: #60a5fa;
    }

    .status-badge.anchored {
      background: #1e3a8a;
      color: #93c5fd;
    }

    .status-badge.unanchored {
      background: #1e293b;
      color: #cbd5e1;
    }

    .tag-chip {
      background: #1e3a8a;
      color: #93c5fd;
      border-color: #1e40af;
    }

    .properties-list {
      background: #111827;
      border-color: #374151;
    }

    .property-key {
      color: #fbbf24;
    }

    .property-value {
      color: #34d399;
    }
  }

  /* Responsive: bottom panel on smaller screens */
  @media (max-width: 768px) {
    .detail-panel {
      right: 10px;
      left: 10px;
      top: auto;
      bottom: 20px;
      width: auto;
      max-height: 50vh;
      transform: none;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
</style>
