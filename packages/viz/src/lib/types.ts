// Timeline data types (matching CLI output format)

export interface TimePoint {
  year: number;
  month?: number;
  day?: number;
}

export interface TimeRange {
  min: TimePoint;
  max: TimePoint;
  formatted: string;
}

export interface TimelineEvent {
  id: string;
  description: string;
  computedRange: TimeRange;
  isAnchored: boolean;
  tags: string[];
  properties: Record<string, any>;
}

export interface TimelineMetadata {
  title?: string;
  description?: string;
  solver?: {
    converged: boolean;
    iterations: number;
    success: boolean;
  };
}

export interface TimelineData {
  metadata: TimelineMetadata;
  events: TimelineEvent[];
}
