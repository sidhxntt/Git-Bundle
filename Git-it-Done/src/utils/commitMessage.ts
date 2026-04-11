import { select, text, cancel, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import { generateCommitMessage } from './generateCommitMessage';
import { formatFileStatus } from './formatFileStatus';
import { FileChange } from './types/types';

export async function handleCommitMessage(filesToCommit: FileChange[]): Promise<string> {
  // Display files to commit
  displayFilesToCommit(filesToCommit);

  // Generate automatic commit message
  const generatedMessage = generateCommitMessage(filesToCommit);

  // Get user preference for commit message
  const messageOption = await getMessageOption(generatedMessage);

  if (isCancel(messageOption)) {
    cancel('Operation cancelled');
    process.exit(0);
  }

  // Handle different message options
  let commitMessage = generatedMessage;

  if (messageOption === 'custom') {
    commitMessage = await getCustomMessage();
  } else if (messageOption === 'edit') {
    commitMessage = await getEditedMessage(generatedMessage);
  }

  return commitMessage;
}

function displayFilesToCommit(filesToCommit: FileChange[]): void {
  console.log(chalk.bold('\n📝 Files to commit:'));
  filesToCommit.forEach(({ status, file }) =>
    console.log(`  ${formatFileStatus(status)} ${file}`)
  );
}

async function getMessageOption(generatedMessage: string) {
  return await select({
    message: 'How would you like to create the commit message?',
    options: [
      { value: 'generated', label: `Use generated: "${generatedMessage}"` },
      { value: 'custom', label: 'Write custom message' },
      { value: 'edit', label: 'Edit generated message' }
    ]
  });
}

async function getCustomMessage(): Promise<string> {
  const commitMessage = await text({
    message: 'Enter commit message:',
    placeholder: 'feat: add new feature',
    validate: value => !value.trim() ? 'Commit message is required' : undefined
  }) as string;

  if (isCancel(commitMessage)) {
    cancel('Operation cancelled');
    process.exit(0);
  }

  return commitMessage;
}

async function getEditedMessage(generatedMessage: string): Promise<string> {
  const commitMessage = await text({
    message: 'Edit commit message:',
    initialValue: generatedMessage,
    validate: value => !value.trim() ? 'Commit message is required' : undefined
  }) as string;

  if (isCancel(commitMessage)) {
    cancel('Operation cancelled');
    process.exit(0);
  }

  return commitMessage;
}