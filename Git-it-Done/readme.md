# Git-it-Done

Git-it-Done is a guided, interactive Git workspace for the terminal. Choose the task you want to accomplish instead of remembering Git commands; the CLI explains the target, checks for common risks, and asks before it changes anything.

## Install

```bash
npm install -g git-it-done
```

Git-it-Done requires Node.js 16+, Git, and a configured Git name and email.

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Run it from any existing Git repository:

```bash
git-it-done
```

## The guided workspace

The default screen shows your branch, working-tree state, remote/upstream, sync status, and any in-progress Git operation. Choose from:

- **Commit changes** — select files, generate or write a Conventional Commit message, confirm, and optionally push.
- **Sync with remote** — fetches first, then safely offers a fast-forward-only pull or a push. Diverged branches are explained instead of changed automatically.
- **Push current branch** — detects the upstream, warns when pushing directly to protected branch names, and can create a missing upstream.
- **Manage branches** — list, switch, or create validated branch names. It never deletes, merges, or rebases branches.
- **Save or restore work** — create, list, apply, pop, or drop stashes through prompts.
- **Resolve an in-progress operation** — guides merge, rebase, cherry-pick, revert, and bisect recovery.
- **Inspect repository** — shows recent commits, remotes, conflict files, and a plain-language state summary.
- **Help and native Git equivalents** — explains every menu option and displays the corresponding Git command.

For a direct commit-only entry point, use:

```bash
git-it-done commit
```

## Conflict recovery

When a merge, rebase, cherry-pick, or revert is already in progress, Git-it-Done surfaces it in the menu rather than leaving you to decipher Git status output. It lists unresolved files and lets you:

1. Open a selected file in `GIT_EDITOR`, `VISUAL`, or `EDITOR`.
2. Mark a manually resolved file as staged.
3. Continue after every conflict is staged.
4. Abort the operation after a clear confirmation.

Git-it-Done does not guess how code should be merged. You decide the correct resolution; the CLI keeps the Git state and next steps visible.

## Safety guarantees

- Git commands run with literal argument arrays, never through a shell.
- Every state-changing workflow identifies its branch, stash, file, or remote target and requests confirmation.
- It will not force-push, delete branches, automate a merge/rebase, or overwrite local work.
- Pulls use `--ff-only`; a dirty worktree is asked to be committed or stashed first.
- Git failures are shown with the native Git output plus a plain-language next step where one is known.

## Development

```bash
npm install
npm test
npm run dev
```

`npm test` compiles TypeScript and runs the Node test suite.

## License

[MIT](LICENSE)
