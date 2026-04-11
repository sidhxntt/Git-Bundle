import { confirm, spinner, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import { gitCommand } from './gitCommand';

export async function handlePushToRemote(): Promise<void> {
  const shouldPush = await confirm({
    message: 'Push to remote repository?'
  });

  if (isCancel(shouldPush) || !shouldPush) {
    return;
  }

  await executePush();
}

async function executePush(): Promise<void> {
  const pushSpinner = spinner();
  pushSpinner.start('Pushing to remote...');

  // Check if remote exists
  const remotes = gitCommand('remote');
  if (!remotes) {
    pushSpinner.stop('⚠️  No remote repository configured');
    console.log(chalk.yellow('No remote repository found. Skipping push.'));
    return;
  }

  try {
    const pushResult = gitCommand('push');
    
    if (pushResult !== null) {
      pushSpinner.stop('🚀 Changes pushed successfully!');
    } else {
      pushSpinner.stop('❌ Push failed');
      handlePushFailure();
    }
  } catch (error: any) {
    pushSpinner.stop('❌ Push failed');
    console.log(chalk.red('Failed to push. Error details:'));
    console.log(chalk.dim(error.message));
  }
}

function handlePushFailure(): void {
  console.log(chalk.red('Failed to push. You may need to set upstream branch.'));
  
  const branch = gitCommand('rev-parse --abbrev-ref HEAD');
  if (branch) {
    console.log(chalk.dim(`Try: git push --set-upstream origin ${branch}`));
  } else {
    console.log(chalk.dim('Try: git push --set-upstream origin <branch-name>'));
  }
}