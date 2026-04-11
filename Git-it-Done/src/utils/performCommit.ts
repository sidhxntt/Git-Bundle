import { confirm, spinner, cancel, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import { gitCommand } from './gitCommand';

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

  try {
    const success = executeCommit(commitMessage);
    
    if (!success) {
      s.stop('❌ Commit failed');
      cancel('Failed to commit changes. Please check your git status.');
      return false;
    }

    // Verify commit was created
    const lastCommit = gitCommand('log -1 --oneline');
    if (!lastCommit) {
      s.stop('⚠️  Commit status unclear');
      console.log(chalk.yellow('Commit may not have been created. Please check git status manually.'));
      return false;
    } else {
      s.stop('✅ Changes committed successfully!');
      console.log(chalk.dim(`Last commit: ${lastCommit}`));
      return true;
    }

  } catch (error: any) {
    s.stop('❌ Commit failed');
    handleCommitError(error);
    return false;
  }
}

function executeCommit(commitMessage: string): boolean {
  const escapedMessage = JSON.stringify(commitMessage);
  const result = gitCommand(`commit -m ${escapedMessage}`);
  return result !== null;
}

function handleCommitError(error: any): void {
  const msg = error.message || '';
  
  if (msg.includes('nothing to commit')) {
    cancel('Nothing to commit - working tree clean');
  } else if (msg.includes('Please tell me who you are')) {
    cancel('Git user not configured. Run: git config --global user.email "you@example.com"');
  } else if (msg.includes('not a git repository')) {
    cancel('Not in a git repository');
  } else {
    cancel(`Failed to commit: ${msg}`);
  }
}