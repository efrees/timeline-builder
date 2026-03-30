<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { TimelineData } from './types';
  import { timePointToYear } from './timeUtils';

  export let data: TimelineData;

  let svgElement: SVGSVGElement;
  let width = 1000;
  let height = 400;
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };

  // Reactive values
  $: innerWidth = width - margin.left - margin.right;
  $: innerHeight = height - margin.top - margin.bottom;

  // Calculate time domain from events
  $: minYear = d3.min(data.events, e => timePointToYear(e.computedRange.min)) || 1900;
  $: maxYear = d3.max(data.events, e => timePointToYear(e.computedRange.max)) || 2000;

  // Add padding to domain
  $: yearPadding = (maxYear - minYear) * 0.1;
  $: xDomain = [minYear - yearPadding, maxYear + yearPadding];

  // D3 scales
  $: xScale = d3.scaleLinear()
    .domain(xDomain)
    .range([0, innerWidth]);

  // Create zoom behavior
  let currentZoom = d3.zoomIdentity;

  onMount(() => {
    const svg = d3.select(svgElement);
    const container = svg.select('.zoom-container');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .translateExtent([[0, 0], [innerWidth, innerHeight]])
      .on('zoom', (event) => {
        currentZoom = event.transform;
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Update size on window resize
    const handleResize = () => {
      const container = svgElement.parentElement;
      if (container) {
        width = container.clientWidth;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  // Transform x-coordinate based on current zoom
  $: transformedXScale = currentZoom.rescaleX(xScale);

  // Generate axis ticks
  $: xAxis = d3.axisBottom(transformedXScale)
    .ticks(10)
    .tickFormat(d => d3.format('.0f')(d as number));

  // Event layout - simple stacking to avoid overlaps
  function getEventY(index: number): number {
    return 100 + (index % 3) * 60; // Stack in 3 rows
  }

  function getEventX(event: { computedRange: { min: any; max: any } }): number {
    const minYear = timePointToYear(event.computedRange.min);
    return transformedXScale(minYear);
  }

  function getEventWidth(event: { computedRange: { min: any; max: any } }): number {
    const minYear = timePointToYear(event.computedRange.min);
    const maxYear = timePointToYear(event.computedRange.max);
    const width = transformedXScale(maxYear) - transformedXScale(minYear);
    return Math.max(width, 3); // Minimum 3px width for visibility
  }
</script>

<div class="timeline-container">
  <div class="timeline-header">
    <h2>{data.metadata.title || 'Timeline Visualization'}</h2>
    {#if data.metadata.description}
      <p class="text-gray-600">{data.metadata.description}</p>
    {/if}
  </div>

  <svg bind:this={svgElement} {width} {height} class="timeline-svg">
    <g transform="translate({margin.left},{margin.top})">
      <g class="zoom-container">
        <!-- X-axis -->
        <g
          class="axis"
          transform="translate(0,{innerHeight - 40})"
        >
          {#each xAxis.scale().ticks(10) as tick}
            <g transform="translate({transformedXScale(tick)},0)">
              <line y2="6" stroke="currentColor"></line>
              <text
                y="20"
                text-anchor="middle"
                fill="currentColor"
                font-size="12"
              >
                {Math.round(tick)}
              </text>
            </g>
          {/each}
        </g>

        <!-- Events -->
        {#each data.events as event, i}
          {@const x = getEventX(event)}
          {@const eventWidth = getEventWidth(event)}
          {@const y = getEventY(i)}

          <g class="event-group" transform="translate({x},{y})">
            <!-- Event range bar -->
            <rect
              width={eventWidth}
              height="20"
              fill={event.isAnchored ? '#3b82f6' : '#94a3b8'}
              rx="3"
              class="event-bar"
            />

            <!-- Event label -->
            <text
              x={eventWidth / 2}
              y="-8"
              text-anchor="middle"
              font-size="12"
              fill="currentColor"
              class="event-label"
            >
              {event.description}
            </text>

            <!-- Date range label -->
            <text
              x={eventWidth / 2}
              y="35"
              text-anchor="middle"
              font-size="10"
              fill="gray"
              class="date-label"
            >
              {event.computedRange.formatted}
            </text>
          </g>
        {/each}
      </g>

      <!-- Grid lines (non-zooming background) -->
      <g class="grid" opacity="0.1">
        {#each xScale.ticks(20) as tick}
          <line
            x1={xScale(tick)}
            y1="0"
            x2={xScale(tick)}
            y2={innerHeight}
            stroke="currentColor"
          />
        {/each}
      </g>
    </g>
  </svg>

  <div class="timeline-controls">
    <div class="text-sm text-gray-600">
      Scroll to zoom • Drag to pan
    </div>
  </div>
</div>

<style>
  .timeline-container {
    width: 100%;
    max-width: 100%;
  }

  .timeline-header {
    margin-bottom: 1rem;
  }

  .timeline-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .timeline-svg {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
  }

  .timeline-controls {
    margin-top: 0.5rem;
    text-align: center;
  }

  .event-bar {
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .event-bar:hover {
    opacity: 0.8;
  }

  .event-label {
    pointer-events: none;
    user-select: none;
  }

  .date-label {
    pointer-events: none;
    user-select: none;
  }

  @media (prefers-color-scheme: dark) {
    .timeline-svg {
      background: #1f2937;
      border-color: #374151;
    }
  }
</style>
