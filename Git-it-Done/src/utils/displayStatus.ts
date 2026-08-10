import chalk from 'chalk';
import { GitChanges } from './types/types.js';
import { formatFileStatus } from './formatFileStatus.js';

export function displayRepositoryStatus(changes: GitChanges): void {
  console.log(chalk.bold('\n📁 Repository Status:'));

  if (changes.staged.length > 0) {
    console.log(chalk.green('\nStaged files:'));
    changes.staged.forEach(({ status, file }) =>
      console.log(`  ${formatFileStatus(status)} ${file}`)
    );
  }

  if (changes.unstaged.length > 0) {
    console.log(chalk.yellow('\nUnstaged files:'));
    changes.unstaged.forEach(({ status, file }) =>
      console.log(`  ${formatFileStatus(status)} ${file}`)
    );
  }

  if (changes.untracked.length > 0) {
    console.log(chalk.cyan('\nUntracked files:'));
    changes.untracked.forEach(({ status, file }) =>
      console.log(`  ${formatFileStatus(status)} ${file}`)
    );
  }
}