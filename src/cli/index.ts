#!/usr/bin/env node

/**
 * CLI tool for parsing timeline files
 */

import { Command } from 'commander';

const program = new Command();

program
  .name('tl-parse')
  .description('Parse .tl timeline files and output structured data')
  .version('0.1.0');

program
  .command('parse <file>')
  .description('Parse a .tl file')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('--pretty', 'Pretty-print JSON output')
  .action((file: string, options: { output?: string; pretty?: boolean }) => {
    console.log(`Parsing file: ${file}`);
    console.log('Options:', options);
    console.log('Parser not yet implemented (Sprint 1 - foundation only)');
  });

program.parse();
