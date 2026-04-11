import { cancel } from '@clack/prompts';

export default function start(main: () => Promise<void>): void {
  process.on('SIGINT', () => {
    cancel('Operation cancelled by user');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    cancel('Operation terminated');
    process.exit(0);
  });

  main().catch((error: unknown) => {
    cancel('An unexpected error occurred');
    console.error(error instanceof Error ? error.stack || error.message : error);
    process.exit(1);
  });
}
