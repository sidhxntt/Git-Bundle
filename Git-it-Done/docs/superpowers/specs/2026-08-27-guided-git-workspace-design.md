# Guided Git Workspace Design

## Goal

Evolve Git-it-Done from a commit-only wizard into an approachable, terminal-native workspace for safe everyday Git tasks. Users select what they want to do from menus instead of remembering commands.

## Product Scope

The launch screen shows a compact repository summary and an action menu:

1. Commit changes — selective staging, generated/custom commit messages, confirmation, and optional push.
2. Sync with remote — fetch first, explain ahead/behind status, and offer a safe pull or push when eligible.
3. Push current branch — show upstream/protected-branch information and require confirmation.
4. Manage branches — list, switch, and create branches from validated names. No deletion, merge, or rebase operations are included.
5. Save or restore work — create, list, apply, pop, and drop stashes, with confirmation for every state-changing operation.
6. Resolve an in-progress operation — detect merges, rebases, cherry-picks, and reverts; display conflict files; open a selected file in the configured editor; mark files resolved; continue or abort the operation.
7. Inspect repository — status, recent commits, remotes, upstream, and a plain-language state summary.
8. Help — explain each menu item and display the equivalent native Git command.
9. Exit.

`git-it-done commit` remains a direct entry point to the existing commit workflow. The default launch opens the workspace menu.

## Experience and Safety

All user-facing workflows use Clack prompts. The CLI must name the branch, remote, file, stash, or operation that an action affects before asking for confirmation. It never force-pushes, deletes a branch, performs a merge/rebase automatically, guesses conflict content, or overwrites uncommitted work.

At startup, in-progress Git operations are not treated as a hard failure. The workspace identifies the operation and prioritizes the guided recovery action. A conflict workflow can open a file with `GIT_EDITOR`, `VISUAL`, or `EDITOR`; after the user edits it, Git-it-Done re-checks the file state. It offers only inspect, mark resolved, continue, and abort. Semantic resolution remains the developer's decision.

Before checkout, pull, stash apply/pop, or a similar operation that can affect local work, the workflow verifies that the worktree is clean or presents a non-destructive alternative. Expected Git failures—including authentication, conflicts, non-fast-forward pushes, and protected branches—are shown with Git's output and clear next steps.

## Architecture

`gitCommand` continues as the only process boundary and receives literal argv arrays, never shell strings. New pure repository-state helpers parse Git output into typed state. The menu is a small routing loop whose workflows own prompts, eligibility checks, execution, and outcome guidance.

New modules:

- `utils/repository.ts`: typed status, branch, remotes, upstream, ahead/behind, recent commits, and in-progress-operation discovery.
- `utils/workspace.ts`: top-level summary, action selection, and routing loop.
- `utils/sync.ts`, `utils/branches.ts`, `utils/stash.ts`, `utils/conflicts.ts`, `utils/inspect.ts`, and `utils/help.ts`: individual guided actions.
- `utils/validation.ts`: branch-name and safe action eligibility helpers.

The existing commit, staging, push, and status utilities remain reusable workflow components. `checkGitStatus` still rejects non-repositories and missing user configuration; it returns in-progress-operation details as a warning rather than blocking the workspace.

## Data Flow

Each menu render reads repository state fresh. The selected workflow obtains only the state it needs, validates preconditions, shows its planned target, asks for confirmation, invokes `gitCommand`, and displays either a success summary or native Git output plus a recovery recommendation. The workflow returns to the menu unless the user exits.

## Testing

Use Node's built-in test runner. Keep pure state parsing, action eligibility, branch validation, Git argv construction, and help mappings directly testable without a Git repository. Existing parsing and message-generation tests remain. Add behavior tests for in-progress operations and conflicted file parsing, ahead/behind parsing, branch name validation, safe sync decisions, and stash/branch command argument construction. Build the TypeScript project and run the full test suite before release.

## Documentation

Update the README to describe the guided workspace, supported workflows, conflict handling limits, direct `commit` shortcut, and installation/development commands. Remove the obsolete project-structure diagram.
