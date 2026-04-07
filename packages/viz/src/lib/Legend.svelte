<script lang="ts">
  // Legend component to explain anchored vs unanchored events
</script>

<div class="legend">
  <h3 class="legend-title">Legend</h3>
  <div class="legend-items">
    <div class="legend-item">
      <div class="legend-indicator anchored"></div>
      <span class="legend-label">
        <strong>Anchored:</strong> Events with direct date evidence
      </span>
    </div>
    <div class="legend-item">
      <div class="legend-indicator unanchored"></div>
      <span class="legend-label">
        <strong>Unanchored:</strong> Events with computed/relative dates only
      </span>
    </div>
  </div>
</div>

<style>
  .legend {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .legend-title {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .legend-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .legend-indicator {
    width: 32px;
    height: 16px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .legend-indicator.anchored {
    background-color: #3b82f6;
  }

  .legend-indicator.unanchored {
    background-color: #94a3b8;
  }

  .legend-label {
    font-size: 0.875rem;
    color: #4b5563;
  }

  .legend-label strong {
    color: #1f2937;
  }

  @media (prefers-color-scheme: dark) {
    .legend {
      background: #1f2937;
      border-color: #374151;
    }

    .legend-title {
      color: #e5e7eb;
    }

    .legend-label {
      color: #d1d5db;
    }

    .legend-label strong {
      color: #f3f4f6;
    }
  }

  @media (min-width: 768px) {
    .legend-items {
      flex-direction: row;
      gap: 1.5rem;
    }
  }
</style>
