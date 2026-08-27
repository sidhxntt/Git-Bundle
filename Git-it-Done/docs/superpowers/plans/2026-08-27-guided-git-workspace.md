# Guided Git Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a terminal-native, menu-driven Git workspace that guides everyday repository operations without requiring users to remember Git commands.

**Architecture:** Pure repository parsers and validation helpers make Git state deterministic and unit-testable. A workspace routing loop delegates to focused prompt-driven workflows, all of which execute literal Git argv arrays through `gitCommand`.

**Tech Stack:** TypeScript, Node.js built-in test runner, @clack/prompts, Chalk, Git CLI.

**Spec:** `docs/superpowers/specs/2026-08-27-guided-git-workspace-design.md`

## Global Constraints

- Keep Node.js support at `>=16.0.0` and TypeScript ESM imports with explicit `.js` suffixes.
- Never execute shell command strings; all Git calls use argv arrays through `gitCommand`.
- Never force-push, delete branches, resolve conflict contents automatically, or overwrite a dirty worktree.
- Every state-changing workflow must name its target and ask for confirmation.
- Keep `git-it-done commit` as the direct entry point for the existing commit wizard.

---

### Task 1: Repository State and Validation Core

**Files:**
- Create: `src/utils/repository.ts`
- Create: `src/utils/validation.ts`
- Modify: `src/utils/types/types.ts`
- Test: `test/workspace.test.js`

**Interfaces:**
- Produces `parseAheadBehind(output): AheadBehind`, `parseConflictFiles(output): string[]`, `getRepositoryState(): RepositoryState`.
- Produces `validateBranchName(name): string | undefined` and `syncRecommendation(state): SyncRecommendation`.

- [ ] **Step 1: Write failing tests** for `2\n3\n`, NUL conflict paths, invalid branch names, and all ahead/behind recommendations.
- [ ] **Step 2: Run `npm test`** and confirm imports/functions fail.
- [ ] **Step 3: Implement** typed parsers and conservative recommendations: pull only when behind with no local commits, push only when ahead with no remote commits, otherwise inspect.
- [ ] **Step 4: Run `npm test`** and confirm all tests pass.
- [ ] **Step 5: Commit** with `git commit -m "feat: add repository state helpers"`.

### Task 2: Inspection, Help, and Workspace Menu

**Files:**
- Create: `src/utils/inspect.ts`
- Create: `src/utils/help.ts`
- Create: `src/utils/workspace.ts`
- Modify: `src/index.ts`
- Test: `test/workspace.test.js`

**Interfaces:**
- `runWorkspace(): Promise<void>` renders the repository summary and routes menu values.
- `helpEntry(action): { title: string; command: string; description: string }` provides exact UI help text.

- [ ] **Step 1: Write failing tests** asserting supported help entries and their native command mappings.
- [ ] **Step 2: Run `npm test`** and confirm the tests fail because the API is absent.
- [ ] **Step 3: Implement** a repeatable Clack menu plus inspect and help views; route `commit` argv directly to the current commit flow.
- [ ] **Step 4: Run `npm test`** and confirm all tests pass.
- [ ] **Step 5: Commit** with `git commit -m "feat: add guided workspace menu"`.

### Task 3: Safe Sync, Branch, and Stash Workflows

**Files:**
- Create: `src/utils/sync.ts`
- Create: `src/utils/branches.ts`
- Create: `src/utils/stash.ts`
- Test: `test/workspace.test.js`

**Interfaces:**
- `buildPushArgs(upstream): string[]`, `buildPullArgs(): string[]`, `buildCreateBranchArgs(name): string[]`, `buildStashApplyArgs(ref, pop): string[]`.

- [ ] **Step 1: Write failing tests** for generated argv arrays, including an upstream-less branch and a stash reference.
- [ ] **Step 2: Run `npm test`** and confirm expected failures.
- [ ] **Step 3: Implement** prompt-driven workflows that fetch before sync, protect dirty worktrees, validate names, and confirm target actions.
- [ ] **Step 4: Run `npm test`** and confirm all tests pass.
- [ ] **Step 5: Commit** with `git commit -m "feat: add guided git workflows"`.

### Task 4: In-Progress Operation and Conflict Recovery

**Files:**
- Create: `src/utils/conflicts.ts`
- Modify: `src/utils/checkGitStatus.ts`
- Modify: `src/utils/workspace.ts`
- Test: `test/workspace.test.js`

**Interfaces:**
- `operationCommands(operation): { continueArgs: string[]; abortArgs: string[] }` maps merge/rebase/cherry-pick/revert safely.
- `handleInProgressOperation(state): Promise<void>` guides inspect, edit, add, continue, and abort.

- [ ] **Step 1: Write failing tests** for every operation command mapping and conflict-file parser edge case.
- [ ] **Step 2: Run `npm test`** and confirm expected failures.
- [ ] **Step 3: Implement** conflict status display, configured-editor launch, mark-resolved, continue, and abort screens; change startup validation to surface operations instead of rejecting them.
- [ ] **Step 4: Run `npm test`** and confirm all tests pass.
- [ ] **Step 5: Commit** with `git commit -m "feat: guide conflict recovery"`.

### Task 5: Documentation and Full Verification

**Files:**
- Modify: `readme.md`
- Test: `test/parsing.test.js`, `test/workspace.test.js`

- [ ] **Step 1: Update README** with the dashboard workflow, safety guarantees, conflict recovery limits, and `commit` shortcut.
- [ ] **Step 2: Run `npm test`** and inspect complete output for build/test failures.
- [ ] **Step 3: Smoke test** `node dist/index.js --help` or its non-interactive equivalent and verify no runtime import errors.
- [ ] **Step 4: Run `git diff --check`** and review all changed files against the design spec.
- [ ] **Step 5: Commit** with `git commit -m "docs: document guided git workspace"`.
