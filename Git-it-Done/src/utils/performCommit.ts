import { confirm, spinner, cancel, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import { gitCommand, gitErrorText, gitOutput, GitResult } from './gitCommand.js';

export async function performCommit(commitMessage: string): Promise<boolean> {
  // Confirm commit
  const shouldCommit = await confirm({
    message: `Commit with message: "${commitMessage}"?`
  });

  if (isCancel(shouldCommit) || !shouldCommit) {
    cancel('Commit cancelled');
    return false;
  }

  // Execute commit
  const s = spinner();
  s.start('Committing changes...');

  // The message is passed as a single argv entry — no shell, so `$(id)`,
  // backticks and `!` reach git verbatim.
  const result = gitCommand(['commit', '-m', commitMessage]);

  if (!result.ok) {
    s.stop('❌ Commit failed');
    handleCommitError(result);
    return false;
  }

  // Verify commit was created
  const lastCommit = gitOutput(['log', '-1', '--oneline']);
  if (!lastCommit) {
    s.stop('⚠️  Commit status unclear');
    console.log(chalk.yellow('Commit may not have been created. Please check git status manually.'));
    return false;
  }

  s.stop('✅ Changes committed successfully!');
  console.log(chalk.dim(`Last commit: ${lastCommit}`));
  return true;
}

function handleCommitError(result: GitResult): void {
  const details = gitErrorText(result);

  // Always surface git's own output — pre-commit hook rejections and commitlint
  // failures only ever explain themselves there.
  console.log(chalk.red('\nGit reported:'));
  console.log(chalk.dim(details));

  if (/nothing to commit|no changes added to commit/i.test(details)) {
    cancel('Nothing to commit - working tree clean');
  } else if (/Please tell me who you are/i.test(details)) {
    cancel('Git user not configured. Run: git config --global user.email "you@example.com"');
  } else if (/not a git repository/i.test(details)) {
    cancel('Not in a git repository');
  } else if (result.status === 1 && /hook|husky|commitlint/i.test(details)) {
    cancel('A git hook rejected the commit (see output above)');
  } else {
    cancel('Failed to commit changes (see output above)');
  }
}
