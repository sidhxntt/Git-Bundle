import chalk from 'chalk';

export function formatFileStatus(status: string): string {
  switch (status) {
    case 'A':
      return chalk.green('+ added');
    case 'M':
      return chalk.yellow('~ modified');
    case 'D':
      return chalk.red('- deleted');
    case 'R':
      return chalk.blue('→ renamed');
    case '??':
      return chalk.cyan('? untracked');
    default:
      return chalk.gray(status);
  }
}
