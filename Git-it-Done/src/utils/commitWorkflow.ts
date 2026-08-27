import { outro } from '@clack/prompts';
import chalk from 'chalk';
import { getChanges } from './getFileChanges.js';
import { displayRepositoryStatus } from './displayStatus.js';
import { handleFileStaging } from './fileStaging.js';
import { handleCommitMessage } from './commitMessage.js';
import { performCommit } from './performCommit.js';
import { handlePushToRemote } from './push_to_remote.js';

export async function runCommitWorkflow(): Promise<void> {
  const changes = getChanges();
  const allFiles = [...changes.staged, ...changes.unstaged, ...changes.untracked];
  if (!allFiles.length) return void outro(chalk.green('Working directory is clean. Nothing to commit.'));
  displayRepositoryStatus(changes);
  const files = await handleFileStaging(changes);
  if (!files.length) return;
  const message = await handleCommitMessage(files);
  if (await performCommit(message)) await handlePushToRemote();
}
