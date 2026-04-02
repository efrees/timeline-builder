import type { TimelineData, TimelineEvent, TimelineMetadata } from './types';

export interface LoadResult {
  success: boolean;
  data?: TimelineData;
  error?: string;
}

/**
 * Validates that a value is a valid TimePoint
 */
function isValidTimePoint(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.year !== 'number') return false;
  if (obj.month !== undefined && typeof obj.month !== 'number') return false;
  if (obj.day !== undefined && typeof obj.day !== 'number') return false;
  return true;
}

/**
 * Validates that a value is a valid TimeRange
 */
function isValidTimeRange(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  if (!isValidTimePoint(obj.min)) return false;
  if (!isValidTimePoint(obj.max)) return false;
  if (typeof obj.formatted !== 'string') return false;
  return true;
}

/**
 * Validates that a value is a valid TimelineEvent
 */
function isValidTimelineEvent(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.id !== 'string') return false;
  if (typeof obj.description !== 'string') return false;
  if (!isValidTimeRange(obj.computedRange)) return false;
  if (typeof obj.isAnchored !== 'boolean') return false;
  if (!Array.isArray(obj.tags)) return false;
  if (!obj.properties || typeof obj.properties !== 'object') return false;
  return true;
}

/**
 * Validates that a value is valid TimelineMetadata
 */
function isValidTimelineMetadata(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;

  // title and description are optional
  if (obj.title !== undefined && typeof obj.title !== 'string') return false;
  if (obj.description !== undefined && typeof obj.description !== 'string') return false;

  // solver is optional but if present must be valid
  if (obj.solver !== undefined) {
    if (typeof obj.solver !== 'object') return false;
    if (typeof obj.solver.converged !== 'boolean') return false;
    if (typeof obj.solver.iterations !== 'number') return false;
    if (typeof obj.solver.success !== 'boolean') return false;
  }

  return true;
}

/**
 * Validates that the parsed JSON matches the TimelineData structure
 */
function validateTimelineData(data: any): data is TimelineData {
  if (!data || typeof data !== 'object') return false;

  // Check metadata
  if (!isValidTimelineMetadata(data.metadata)) return false;

  // Check events array
  if (!Array.isArray(data.events)) return false;
  if (data.events.length === 0) return false;

  // Check each event
  for (const event of data.events) {
    if (!isValidTimelineEvent(event)) return false;
  }

  return true;
}

/**
 * Parse JSON text into TimelineData
 */
export function parseTimelineJSON(jsonText: string): LoadResult {
  try {
    const parsed = JSON.parse(jsonText);

    if (!validateTimelineData(parsed)) {
      return {
        success: false,
        error: 'Invalid timeline format. Expected metadata and events array.'
      };
    }

    return {
      success: true,
      data: parsed
    };
  } catch (e) {
    return {
      success: false,
      error: `JSON parse error: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}

/**
 * Load a timeline from a File object
 */
export async function loadTimelineFile(file: File): Promise<LoadResult> {
  // Check file extension
  if (!file.name.endsWith('.json')) {
    return {
      success: false,
      error: 'File must be a .json file'
    };
  }

  try {
    const text = await file.text();
    return parseTimelineJSON(text);
  } catch (e) {
    return {
      success: false,
      error: `Failed to read file: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}

/**
 * Read timeline from FileReader result
 */
export function loadTimelineFromText(text: string): LoadResult {
  return parseTimelineJSON(text);
}
