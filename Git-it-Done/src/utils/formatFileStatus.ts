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
    case 'C':
      return chalk.blue('⧉ copied');
    case 'T':
      return chalk.magenta('± typechange');
    case 'U':
      return chalk.red('! unmerged');
    case '??':
      return chalk.cyan('? untracked');
    default:
      return chalk.gray(status);
  }
}
