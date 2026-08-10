#!/usr/bin/env node

import { intro, outro, cancel } from '@clack/prompts';
import chalk from 'chalk';
import { checkGitStatus } from './utils/checkGitStatus.js';
import { getChanges } from './utils/getFileChanges.js';
import { displayRepositoryStatus } from './utils/displayStatus.js';
import { handleFileStaging } from './utils/fileStaging.js';
import { handleCommitMessage } from './utils/commitMessage.js';
import { performCommit } from './utils/performCommit.js';
import { handlePushToRemote } from './utils/push_to_remote.js';
import start from './utils/process_interruption.js';

async function main(): Promise<void> {
  console.clear();
  intro(chalk.bgBlue(' Auto Commit Tool '));

  // 1. Validate git repository and configuration
  const gitStatus = checkGitStatus();
  if (!gitStatus.valid) {
    cancel(gitStatus.reason);
    process.exit(1);
  }

  // 2. Get current repository changes
  const changes = getChanges();
  const allFiles = [...changes.staged, ...changes.unstaged, ...changes.untracked];

  // 3. Handle no changes case
  if (allFiles.length === 0) {
    outro(chalk.green('✨ Working directory is clean. Nothing to commit! 🎉'));
    process.exit(0);
  }

  // 4. Display current repository status
  displayRepositoryStatus(changes);

  // 5. Handle file staging if needed
  const filesToCommit = await handleFileStaging(changes);
  
  if (filesToCommit.length === 0) {
    outro(chalk.yellow('ℹ️  No files to commit after staging process.'));
    process.exit(0);
  }

  // 6. Handle commit message creation
  const commitMessage = await handleCommitMessage(filesToCommit);

  // 7. Perform the commit
  const commitSuccess = await performCommit(commitMessage);
  
  if (!commitSuccess) {
    process.exit(1);
  }

  // 8. Handle push to remote
  await handlePushToRemote();

  outro(chalk.green('🎉 All done!'));
}

start(main);