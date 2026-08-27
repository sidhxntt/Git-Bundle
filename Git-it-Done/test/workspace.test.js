import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { detectOperation, getInProgressOperation, parseAheadBehind, parseConflictFiles } from '../dist/utils/repository.js';
import { syncRecommendation, validateBranchName } from '../dist/utils/validation.js';
import { helpEntry } from '../dist/utils/help.js';
import { buildCreateBranchArgs } from '../dist/utils/branches.js';
import { buildStashApplyArgs } from '../dist/utils/stash.js';
import { buildPullArgs } from '../dist/utils/sync.js';
import { buildPushArgs, parseUpstream, resolvePushTarget } from '../dist/utils/push_to_remote.js';
import { operationCommands } from '../dist/utils/conflicts.js';

test('parseAheadBehind: reads porcelain ahead and behind counts', () => {
  assert.deepEqual(parseAheadBehind('2\n3\n'), { ahead: 2, behind: 3 });
  assert.deepEqual(parseAheadBehind('0\n0\n'), { ahead: 0, behind: 0 });
  assert.equal(parseAheadBehind('not-counts'), null);
});

test('parseConflictFiles: preserves NUL-delimited paths', () => {
  assert.deepEqual(parseConflictFiles('src/a.ts\0docs/my file.md\0'), [
    'src/a.ts',
    'docs/my file.md'
  ]);
});

test('detectOperation: distinguishes git am from apply-backend rebase state', () => {
  assert.equal(detectOperation(new Set(['rebase-apply', 'applying'])), 'am');
  assert.equal(detectOperation(new Set(['rebase-apply'])), 'rebase');
});

test('getInProgressOperation: finds git am marker inside rebase-apply', () => {
  const gitDir = mkdtempSync(path.join(tmpdir(), 'git-it-done-'));
  try {
    mkdirSync(path.join(gitDir, 'rebase-apply'));
    writeFileSync(path.join(gitDir, 'rebase-apply', 'applying'), '');
    assert.equal(getInProgressOperation(gitDir), 'am');
  } finally {
    rmSync(gitDir, { recursive: true, force: true });
  }
});

test('validateBranchName: rejects unsafe names and accepts a normal feature branch', () => {
  assert.equal(validateBranchName('feature/guided-workspace'), undefined);
  assert.match(validateBranchName('feature name'), /spaces/i);
  assert.match(validateBranchName('bad..name'), /consecutive dots/i);
  assert.match(validateBranchName('-leading-dash'), /dash/i);
  assert.match(validateBranchName('foo.lock'), /valid Git branch/i);
  assert.match(validateBranchName('foo//bar'), /valid Git branch/i);
});

test('syncRecommendation: only offers automatic transfer for one-sided divergence', () => {
  assert.equal(syncRecommendation({ ahead: 0, behind: 0 }), 'up-to-date');
  assert.equal(syncRecommendation({ ahead: 3, behind: 0 }), 'push');
  assert.equal(syncRecommendation({ ahead: 0, behind: 2 }), 'pull');
  assert.equal(syncRecommendation({ ahead: 1, behind: 2 }), 'inspect');
});

test('helpEntry: teaches the native command for each guided action', () => {
  assert.deepEqual(helpEntry('sync'), {
    title: 'Sync with remote',
    command: 'git fetch --prune && git pull --ff-only / git push',
    description: 'Fetch first, then safely bring your branch up to date or publish it.'
  });
  assert.equal(helpEntry('unknown'), undefined);
});

test('guided workflows: generate literal Git argv for branch, stash, sync, and recovery actions', () => {
  assert.deepEqual(buildCreateBranchArgs('feature/new-ui'), ['switch', '-c', 'feature/new-ui']);
  assert.deepEqual(buildStashApplyArgs('stash@{2}', false), ['stash', 'apply', 'stash@{2}']);
  assert.deepEqual(buildStashApplyArgs('stash@{2}', true), ['stash', 'pop', 'stash@{2}']);
  assert.deepEqual(buildPullArgs(), ['pull', '--ff-only']);
  assert.deepEqual(buildPushArgs('origin/topic', 'origin', 'topic'), ['push', 'origin', 'HEAD:topic']);
  assert.deepEqual(buildPushArgs(null, 'origin', 'topic'), ['push', '--set-upstream', 'origin', 'HEAD:topic']);
  assert.deepEqual(parseUpstream('origin/release', ['origin']), { remote: 'origin', branch: 'release' });
  assert.deepEqual(parseUpstream('team/origin/topic', ['origin', 'team/origin']), { remote: 'team/origin', branch: 'topic' });
  assert.equal(parseUpstream('deleted/topic', ['origin']), null);
  assert.equal(resolvePushTarget('topic', 'deleted/topic', ['origin']), null);
  assert.deepEqual(buildPushArgs('origin/release', 'origin', 'release'), ['push', 'origin', 'HEAD:release']);
  assert.deepEqual(operationCommands('merge'), {
    continueArgs: ['commit', '--no-edit'],
    abortArgs: ['merge', '--abort']
  });
  assert.deepEqual(operationCommands('rebase'), {
    continueArgs: ['rebase', '--continue'],
    abortArgs: ['rebase', '--abort']
  });
  assert.deepEqual(operationCommands('am'), {
    continueArgs: ['am', '--continue'],
    abortArgs: ['am', '--abort']
  });
  assert.equal(operationCommands('bisect').continueArgs, null);
});
