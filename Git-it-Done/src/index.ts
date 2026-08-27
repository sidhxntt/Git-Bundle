#!/usr/bin/env node

import { intro, outro, cancel } from '@clack/prompts';
import chalk from 'chalk';
import { checkGitStatus } from './utils/checkGitStatus.js';
import { runCommitWorkflow } from './utils/commitWorkflow.js';
import { runWorkspace } from './utils/workspace.js';
import { getRepositoryState } from './utils/repository.js';
import { handleInProgressOperation } from './utils/conflicts.js';
import start from './utils/process_interruption.js';

async function main(): Promise<void> {
  if (process.argv.slice(2).some(argument => argument === '--help' || argument === '-h')) {
    console.log(`Git-it-Done — a guided Git workspace\n\nUsage:\n  git-it-done          Open the interactive workspace\n  git-it-done commit   Start the direct commit workflow\n  git-it-done --help   Show this help\n\nChoose actions in the terminal UI; no Git command memorization is required.`);
    return;
  }
  console.clear();
  intro(chalk.bgBlue(' Auto Commit Tool '));

  // 1. Validate git repository and configuration
  const gitStatus = checkGitStatus();
  if (!gitStatus.valid) {
    cancel(gitStatus.reason);
    process.exit(1);
  }
  gitStatus.warnings?.forEach(warning => console.log(chalk.yellow.bold(`\n⚠️  ${warning}`)));

  if (process.argv[2] === 'commit' && getRepositoryState().operation) {
    await handleInProgressOperation();
  } else if (process.argv[2] === 'commit') await runCommitWorkflow();
  else await runWorkspace();

  outro(chalk.green('🎉 All done!'));
}

start(main);
