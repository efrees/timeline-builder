/**
 * Anchoring system for constraint solving.
 * Handles events with absolute dates (anchored) and relative-only timelines (unanchored).
 */

import type { TimeRange, TimePoint } from '../types/time.js';
import type { Event, Metadata } from '../types/timeline.js';
import { ConstraintGraph } from './constraint-graph.js';
import { findConnectedComponents } from './graph-algorithms.js';

/**
 * Information about an anchored event
 */
export interface AnchorInfo {
  /** Event ID */
  eventId: string;
  /** Absolute date range */
  range: TimeRange;
  /** Confidence level of the anchor */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Information about a connected component in the graph
 */
export interface ComponentInfo {
  /** Event IDs in this component */
  eventIds: string[];
  /** Whether this component has any anchored events */
  isAnchored: boolean;
  /** Anchor points in this component (if any) */
  anchors: AnchorInfo[];
  /** Reference event ID for unanchored components */
  referenceEventId?: string;
}

/**
 * Result of anchoring analysis
 */
export interface AnchoringResult {
  /** All anchored events in the timeline */
  anchoredEvents: AnchorInfo[];
  /** Connected components */
  components: ComponentInfo[];
  /** Whether the entire timeline is anchored */
  fullyAnchored: boolean;
  /** Warnings or issues */
  warnings: string[];
}

/**
 * Identify anchored events in the graph.
 * An event is anchored if it has an absolute date constraint.
 */
export function findAnchors(graph: ConstraintGraph): AnchorInfo[] {
  const anchors: AnchorInfo[] = [];

  for (const event of graph.getAllEvents()) {
    const absoluteConstraint = event.constraints.find((c) => c.type === 'absolute');

    if (absoluteConstraint && absoluteConstraint.absoluteRange) {
      anchors.push({
        eventId: event.id,
        range: absoluteConstraint.absoluteRange,
        confidence: absoluteConstraint.confidence,
      });
    }
  }

  return anchors;
}

/**
 * Analyze connected components and their anchoring status.
 */
export function analyzeComponents(graph: ConstraintGraph): ComponentInfo[] {
  const components = findConnectedComponents(graph);
  const anchors = findAnchors(graph);

  // Map event IDs to their anchor info
  const anchorMap = new Map<string, AnchorInfo>();
  for (const anchor of anchors) {
    anchorMap.set(anchor.eventId, anchor);
  }

  // Analyze each component
  return components.map((eventIds) => {
    const componentAnchors = eventIds
      .map((id) => anchorMap.get(id))
      .filter((a): a is AnchorInfo => a !== undefined);

    const isAnchored = componentAnchors.length > 0;

    const result: ComponentInfo = {
      eventIds,
      isAnchored,
      anchors: componentAnchors,
      referenceEventId: !isAnchored ? eventIds[0] : undefined,
    };

    return result;
  });
}

/**
 * Choose a reference event for an unanchored component.
 * Uses metadata preference if available, otherwise uses the first event.
 */
export function chooseReferenceEvent(
  component: ComponentInfo,
  _graph: ConstraintGraph,
  metadata: Metadata
): string {
  // Check if metadata specifies a reference
  if (metadata.reference && component.eventIds.includes(metadata.reference)) {
    return metadata.reference;
  }

  // Otherwise, use the first event in the component
  const firstEvent = component.eventIds[0];
  if (!firstEvent) {
    throw new Error('Component has no events');
  }
  return firstEvent;
}

/**
 * Perform complete anchoring analysis on a timeline.
 */
export function analyzeAnchoring(
  graph: ConstraintGraph,
  metadata: Metadata = {}
): AnchoringResult {
  const warnings: string[] = [];

  // Find all anchored events
  const anchoredEvents = findAnchors(graph);

  // Analyze components
  const components = analyzeComponents(graph);

  // Choose reference events for unanchored components
  for (const component of components) {
    if (!component.isAnchored) {
      component.referenceEventId = chooseReferenceEvent(component, graph, metadata);

      warnings.push(
        `Component with ${component.eventIds.length} events is unanchored. ` +
          `Using "${component.referenceEventId}" as reference point.`
      );
    }
  }

  // Check if entire timeline is anchored
  const fullyAnchored = components.every((c) => c.isAnchored);

  // Warn about multiple anchors in same component
  for (const component of components) {
    if (component.anchors.length > 1) {
      warnings.push(
        `Component has ${component.anchors.length} anchor points: ` +
          component.anchors.map((a) => a.eventId).join(', ') +
          '. Propagation will use all anchors to tighten bounds.'
      );
    }
  }

  return {
    anchoredEvents,
    components,
    fullyAnchored,
    warnings,
  };
}

/**
 * Convert an unanchored timeline to use relative time (years since reference).
 * Returns a map of event ID to relative time range.
 */
export function toRelativeTime(
  ranges: Map<string, TimeRange>,
  component: ComponentInfo
): Map<string, TimeRange> {
  if (!component.referenceEventId) {
    throw new Error('Component must have a reference event');
  }

  const referenceRange = ranges.get(component.referenceEventId);
  if (!referenceRange) {
    throw new Error(`Reference event ${component.referenceEventId} not found in ranges`);
  }

  // Use the reference event's min as time 0
  const referenceYear = referenceRange.min.year;

  const relativeRanges = new Map<string, TimeRange>();

  for (const eventId of component.eventIds) {
    const range = ranges.get(eventId);
    if (!range) continue;

    // Convert to relative years
    const relativeMin: TimePoint = {
      year: range.min.year - referenceYear,
    };
    if (range.min.month !== undefined) {
      relativeMin.month = range.min.month;
    }
    if (range.min.day !== undefined) {
      relativeMin.day = range.min.day;
    }

    const relativeMax: TimePoint = {
      year: range.max.year - referenceYear,
    };
    if (range.max.month !== undefined) {
      relativeMax.month = range.max.month;
    }
    if (range.max.day !== undefined) {
      relativeMax.day = range.max.day;
    }

    relativeRanges.set(eventId, {
      min: relativeMin,
      max: relativeMax,
      precision: range.precision,
      anchored: false, // Explicitly mark as unanchored
    });
  }

  return relativeRanges;
}

/**
 * Check if an event is anchored (has absolute date constraint).
 */
export function isEventAnchored(event: Event): boolean {
  return event.constraints.some((c) => c.type === 'absolute');
}

/**
 * Get the strongest anchor (highest confidence) for a component.
 * Useful when choosing which anchor to use for propagation start.
 */
export function getStrongestAnchor(component: ComponentInfo): AnchorInfo | undefined {
  if (component.anchors.length === 0) return undefined;

  const confidenceOrder = { high: 3, medium: 2, low: 1 };

  return component.anchors.reduce((best, current) => {
    return confidenceOrder[current.confidence] > confidenceOrder[best.confidence]
      ? current
      : best;
  });
}
