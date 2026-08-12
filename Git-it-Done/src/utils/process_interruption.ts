import { cancel } from '@clack/prompts';

const SHOW_CURSOR = '\u001B[?25h';

/** clack hides the cursor while a prompt/spinner is active; bring it back. */
function restoreCursor(): void {
  if (process.stdout.isTTY) {
    process.stdout.write(SHOW_CURSOR);
  }
}

function exitWith(code: number, message: string, error?: unknown): void {
  restoreCursor();
  cancel(message);
  if (error !== undefined) {
    console.error(error instanceof Error ? error.stack || error.message : error);
  }
  process.exit(code);
}

export default function start(main: () => Promise<void>): void {
  // 128 + signal number, so CI wrappers do not read Ctrl+C as success.
  process.on('SIGINT', () => exitWith(130, 'Operation cancelled by user'));
  process.on('SIGTERM', () => exitWith(143, 'Operation terminated'));

  process.on('unhandledRejection', (reason: unknown) =>
    exitWith(1, 'An unexpected error occurred (unhandled rejection)', reason)
  );
  process.on('uncaughtException', (error: unknown) =>
    exitWith(1, 'An unexpected error occurred (uncaught exception)', error)
  );

  process.on('exit', restoreCursor);

  main().catch((error: unknown) => exitWith(1, 'An unexpected error occurred', error));
}
