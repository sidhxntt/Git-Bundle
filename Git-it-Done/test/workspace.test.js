import test from 'node:test';
import assert from 'node:assert/strict';

import { parseAheadBehind, parseConflictFiles } from '../dist/utils/repository.js';
import { syncRecommendation, validateBranchName } from '../dist/utils/validation.js';

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

test('validateBranchName: rejects unsafe names and accepts a normal feature branch', () => {
  assert.equal(validateBranchName('feature/guided-workspace'), undefined);
  assert.match(validateBranchName('feature name'), /spaces/i);
  assert.match(validateBranchName('bad..name'), /consecutive dots/i);
  assert.match(validateBranchName('-leading-dash'), /dash/i);
});

test('syncRecommendation: only offers automatic transfer for one-sided divergence', () => {
  assert.equal(syncRecommendation({ ahead: 0, behind: 0 }), 'up-to-date');
  assert.equal(syncRecommendation({ ahead: 3, behind: 0 }), 'push');
  assert.equal(syncRecommendation({ ahead: 0, behind: 2 }), 'pull');
  assert.equal(syncRecommendation({ ahead: 1, behind: 2 }), 'inspect');
});
