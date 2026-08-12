import { confirm, spinner, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import { gitCommand, gitErrorText, gitOutput } from './gitCommand.js';

const PROTECTED_BRANCHES = new Set(['main', 'master', 'production', 'release']);

interface PushTarget {
  branch: string;
  remote: string;
  /** Upstream ref as `<remote>/<branch>`, or null when none is configured. */
  upstream: string | null;
}

export async function handlePushToRemote(): Promise<void> {
  const remotes = (gitOutput(['remote']) ?? '').split('\n').filter(Boolean);
  if (remotes.length === 0) {
    console.log(chalk.yellow('⚠️  No remote repository configured. Skipping push.'));
    return;
  }

  const branch = gitOutput(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!branch || branch === 'HEAD') {
    console.log(chalk.yellow('⚠️  HEAD is detached — not pushing. Create a branch first.'));
    return;
  }

  const upstream = gitOutput(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const remote = upstream ? upstream.split('/')[0] : remotes.includes('origin') ? 'origin' : remotes[0];
  const target: PushTarget = { branch, remote, upstream };

  if (PROTECTED_BRANCHES.has(branch.toLowerCase())) {
    console.log(chalk.yellow.bold(`\n⚠️  You are about to push directly to "${branch}".`));
  }
  if (!upstream) {
    console.log(
      chalk.yellow(`ℹ️  "${branch}" has no upstream; it will be created as ${remote}/${branch}.`)
    );
  }

  const shouldPush = await confirm({
    message: upstream
      ? `Push to ${upstream}?`
      : `Push to ${remote}/${branch} and set it as upstream?`
  });

  if (isCancel(shouldPush) || !shouldPush) {
    return;
  }

  executePush(target);
}

function executePush(target: PushTarget): void {
  const pushSpinner = spinner();
  pushSpinner.start(`Pushing to ${target.remote}/${target.branch}...`);

  const args = target.upstream
    ? ['push']
    : ['push', '--set-upstream', target.remote, target.branch];
  const result = gitCommand(args);

  if (result.ok) {
    pushSpinner.stop('🚀 Changes pushed successfully!');
    const summary = gitErrorText(result);
    if (summary) {
      console.log(chalk.dim(summary));
    }
    return;
  }

  pushSpinner.stop('❌ Push failed');
  handlePushFailure(target, gitErrorText(result));
}

function handlePushFailure(target: PushTarget, details: string): void {
  console.log(chalk.red('\nGit reported:'));
  console.log(chalk.dim(details));

  if (/non-fast-forward|fetch first|behind its remote/i.test(details)) {
    console.log(
      chalk.yellow(`Remote has commits you don't. Try: git pull --rebase ${target.remote} ${target.branch}`)
    );
  } else if (/Authentication failed|could not read Username|Permission denied|403/i.test(details)) {
    console.log(chalk.yellow('Authentication failed — check your credentials or SSH key.'));
  } else if (/protected branch|pre-receive hook declined/i.test(details)) {
    console.log(chalk.yellow('The remote rejected the push (protected branch or server-side hook).'));
  }
}
