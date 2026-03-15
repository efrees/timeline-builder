#!/usr/bin/env node

/**
 * CLI tool for parsing and solving timeline files
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { Parser } from '../parser/parser.js';
import { Solver } from '../solver/solver.js';
import type { TimeRange } from '../types/time.js';

const program = new Command();

program
  .name('tl-parse')
  .description('Parse and solve .tl timeline files')
  .version('0.2.0');

/**
 * Format a time point as a string
 */
function formatTimePoint(tp: { year: number; month?: number; day?: number }): string {
  if (tp.day) {
    return `${tp.year}-${String(tp.month).padStart(2, '0')}-${String(tp.day).padStart(2, '0')}`;
  } else if (tp.month) {
    return `${tp.year}-${String(tp.month).padStart(2, '0')}`;
  } else {
    return `${tp.year}`;
  }
}

/**
 * Format a time range as a string
 */
function formatTimeRange(range: TimeRange): string {
  const minStr = formatTimePoint(range.min);
  const maxStr = formatTimePoint(range.max);
  if (minStr === maxStr) {
    return minStr;
  }
  return `${minStr} to ${maxStr}`;
}

program
  .command('parse <file>')
  .description('Parse a .tl file without solving')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('--pretty', 'Pretty-print JSON output')
  .action((file: string, options: { output?: string; pretty?: boolean }) => {
    try {
      const content = readFileSync(file, 'utf-8');
      const parser = new Parser(content);
      const timeline = parser.parse();

      // Convert Map to object for JSON serialization
      const output = {
        metadata: timeline.metadata,
        events: Array.from(timeline.events.entries()).map(([id, event]) => ({
          ...event,
          id: id, // Override with key to ensure consistency
        })),
        groups: timeline.groups,
        theories: timeline.theories,
      };

      const json = options.pretty
        ? JSON.stringify(output, null, 2)
        : JSON.stringify(output);

      if (options.output) {
        writeFileSync(options.output, json);
        console.log(`Wrote output to ${options.output}`);
      } else {
        console.log(json);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error('Unknown error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('solve <file>')
  .description('Parse and solve a .tl file, outputting computed date ranges')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('--pretty', 'Pretty-print JSON output')
  .option('--theory <name>', 'Activate specific theory')
  .option('--strict', 'Fail on conflicts (exit code 2)')
  .option('--show-conflicts', 'Include conflict details in output')
  .option('--show-anchoring', 'Include anchoring analysis in output')
  .option('--max-iterations <n>', 'Maximum propagation iterations', parseInt)
  .action((
    file: string,
    options: {
      output?: string;
      pretty?: boolean;
      theory?: string;
      strict?: boolean;
      showConflicts?: boolean;
      showAnchoring?: boolean;
      maxIterations?: number;
    }
  ) => {
    try {
      // Read and parse file
      const content = readFileSync(file, 'utf-8');
      const parser = new Parser(content);
      const timeline = parser.parse();

      // Solve timeline
      const solver = new Solver();
      const solverOptions: any = {};
      if (options.theory !== undefined) {
        solverOptions.theoryId = options.theory;
      }
      if (options.strict !== undefined) {
        solverOptions.strictMode = options.strict;
      }
      if (options.maxIterations !== undefined) {
        solverOptions.maxIterations = options.maxIterations;
      }
      const result = solver.solve(timeline, solverOptions);

      // Check for conflicts in strict mode
      if (options.strict && !result.success) {
        console.error('Solver failed due to conflicts:');
        for (const conflict of result.conflicts) {
          console.error(`- ${conflict.type}: ${conflict.message}`);
        }
        process.exit(2);
      }

      // Build output object
      const outputData: any = {
        metadata: {
          ...timeline.metadata,
          solver: {
            converged: result.propagation.converged,
            iterations: result.propagation.iterations,
            success: result.success,
          },
        },
        events: [] as any[],
      };

      // Add events with computed ranges
      for (const [id, event] of timeline.events) {
        const range = result.ranges.get(id);
        if (range) {
          outputData.events.push({
            id,
            description: event.description,
            computedRange: {
              min: range.min,
              max: range.max,
              formatted: formatTimeRange(range),
            },
            isAnchored: event.constraints.some((c) => c.type === 'absolute'),
            tags: event.tags,
            properties: event.properties,
            group: event.group,
          });
        }
      }

      // Add conflicts if requested
      if (options.showConflicts && result.conflicts.length > 0) {
        outputData.conflicts = result.conflicts.map((c) => ({
          type: c.type,
          eventIds: c.eventIds,
          message: c.message,
          suggestion: c.suggestion,
        }));
      }

      // Add anchoring if requested
      if (options.showAnchoring) {
        outputData.anchoring = {
          fullyAnchored: result.anchoring.fullyAnchored,
          anchoredEvents: result.anchoring.anchoredEvents.map((a) => a.eventId),
          components: result.anchoring.components.map((c) => ({
            eventIds: c.eventIds,
            isAnchored: c.isAnchored,
            referenceEventId: c.referenceEventId,
          })),
        };
      }

      // Output JSON
      const json = options.pretty
        ? JSON.stringify(outputData, null, 2)
        : JSON.stringify(outputData);

      if (options.output) {
        writeFileSync(options.output, json);
        console.log(`Wrote output to ${options.output}`);
      } else {
        console.log(json);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error('Unknown error occurred');
      }
      process.exit(1);
    }
  });

program.parse();
