import { spawnSync } from 'child_process';

export interface GitResult {
  /** True when git exited with status 0. */
  ok: boolean;
  stdout: string;
  stderr: string;
  status: number | null;
  /** True when the output exceeded `maxBuffer` and was therefore truncated. */
  oversized: boolean;
}

export interface GitOptions {
  /** Defaults to 64 MiB (Node's default of 1 MiB truncates large diffs). */
  maxBuffer?: number;
  cwd?: string;
  input?: string;
}

/** 64 MiB — big enough for realistic diffs, small enough to stay a guard rail. */
export const DEFAULT_MAX_BUFFER = 64 * 1024 * 1024;

/**
 * Run git with an argv array. Never goes through a shell, so file names and
 * commit messages containing `$`, backticks, `!`, quotes or newlines are passed
 * through verbatim instead of being interpreted by /bin/sh.
 */
export function gitCommand(args: string[], options: GitOptions = {}): GitResult {
  const result = spawnSync('git', args, {
    encoding: 'utf-8',
    maxBuffer: options.maxBuffer ?? DEFAULT_MAX_BUFFER,
    cwd: options.cwd,
    input: options.input
  });

  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';

  if (result.error) {
    const code = (result.error as NodeJS.ErrnoException).code;
    return {
      ok: false,
      stdout,
      stderr: stderr || result.error.message,
      status: result.status,
      oversized: code === 'ENOBUFS'
    };
  }

  return {
    ok: result.status === 0,
    stdout,
    stderr,
    status: result.status,
    oversized: false
  };
}

/** Convenience wrapper for the common "give me the trimmed stdout" case. */
export function gitOutput(args: string[], options: GitOptions = {}): string | null {
  const result = gitCommand(args, options);
  return result.ok ? result.stdout.trim() : null;
}

/** Best-effort explanation of a failed git invocation, for display to the user. */
export function gitErrorText(result: GitResult): string {
  const text = [result.stderr, result.stdout]
    .map(part => part.trim())
    .filter(Boolean)
    .join('\n');

  if (text) {
    return text;
  }
  if (result.oversized) {
    return 'git produced more output than could be buffered';
  }
  return `git exited with status ${result.status ?? 'unknown'}`;
}
