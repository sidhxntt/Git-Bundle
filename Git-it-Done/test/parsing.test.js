import test from 'node:test';
import assert from 'node:assert/strict';

import { parseNameStatusZ, parseNulList } from '../dist/utils/getFileChanges.js';
import {
  buildCommitMessage,
  categorizeFile,
  deriveScope,
  dominantCategory
} from '../dist/utils/generateCommitMessage.js';
import { analyzeDiff } from '../dist/utils/diffSignals.js';

const NUL = '\0';

test('parseNameStatusZ: ordinary statuses', () => {
  const output = ['M', 'src/index.ts', 'A', 'src/new.ts', 'D', 'src/old.ts'].join(NUL) + NUL;

  assert.deepEqual(parseNameStatusZ(output), [
    { status: 'M', file: 'src/index.ts' },
    { status: 'A', file: 'src/new.ts' },
    { status: 'D', file: 'src/old.ts' }
  ]);
});

test('parseNameStatusZ: renames keep the destination path and an R status', () => {
  const output = ['R100', 'old.txt', 'new.txt', 'M', 'src/café.ts'].join(NUL) + NUL;
  const changes = parseNameStatusZ(output);

  assert.deepEqual(changes, [
    { status: 'R', file: 'new.txt', from: 'old.txt' },
    { status: 'M', file: 'src/café.ts' }
  ]);
  // The old parser produced status "R100" and file "old.txt\tnew.txt".
  assert.equal(changes[0].status, 'R');
  assert.ok(!changes[0].file.includes('\t'));
});

test('parseNameStatusZ: copies behave like renames', () => {
  const output = ['C75', 'a.ts', 'b.ts'].join(NUL) + NUL;
  assert.deepEqual(parseNameStatusZ(output), [{ status: 'C', file: 'b.ts', from: 'a.ts' }]);
});

test('parseNameStatusZ: paths containing spaces and tabs survive', () => {
  const output = ['M', 'src/my file.ts', 'A', 'src/tab\there.ts'].join(NUL) + NUL;

  assert.deepEqual(parseNameStatusZ(output), [
    { status: 'M', file: 'src/my file.ts' },
    { status: 'A', file: 'src/tab\there.ts' }
  ]);
});

test('parseNameStatusZ: truncated output does not throw', () => {
  assert.deepEqual(parseNameStatusZ(''), []);
  assert.deepEqual(parseNameStatusZ('R100' + NUL + 'only-one-path' + NUL), []);
});

test('parseNulList: untracked files', () => {
  assert.deepEqual(parseNulList('a.ts' + NUL + 'dir/b.ts' + NUL, '??'), [
    { status: '??', file: 'a.ts' },
    { status: '??', file: 'dir/b.ts' }
  ]);
});

test('categorizeFile: only real config files count as config', () => {
  assert.equal(categorizeFile('tsconfig.json'), 'config');
  assert.equal(categorizeFile('vite.config.ts'), 'config');
  assert.equal(categorizeFile('.github/workflows/ci.yml'), 'config');
  // Plain data JSON is source, not config.
  assert.equal(categorizeFile('src/fixtures/users.json'), 'source');
  assert.equal(categorizeFile('package.json'), 'deps');
});

test('categorizeFile: docs is anchored, not a substring match', () => {
  assert.equal(categorizeFile('docs/guide.md'), 'docs');
  assert.equal(categorizeFile('readme.md'), 'docs');
  // Used to be misread as docs because the path contains "doc".
  assert.equal(categorizeFile('src/docker/server.ts'), 'source');
  assert.equal(categorizeFile('src/documentStore.ts'), 'source');
});

test('dominantCategory: one config file cannot outvote the source files', () => {
  const files = [
    { status: 'M', file: 'tsconfig.json' },
    ...Array.from({ length: 10 }, (_, i) => ({ status: 'A', file: `src/mod${i}.ts` }))
  ];
  assert.equal(dominantCategory(files), 'source');
});

test('deriveScope: most common directory wins', () => {
  const files = [
    { status: 'M', file: 'src/a.ts' },
    { status: 'M', file: 'src/b.ts' },
    { status: 'M', file: 'docs/c.md' }
  ];
  assert.equal(deriveScope(files), 'src');
});

test('deriveScope: monorepo uses the workspace name, not "packages"', () => {
  const files = [
    { status: 'M', file: 'packages/core/src/index.ts' },
    { status: 'M', file: 'packages/core/src/util.ts' },
    { status: 'M', file: 'apps/web/page.tsx' }
  ];
  assert.equal(deriveScope(files), 'core');
});

test('deriveScope: top-level-only files produce no scope', () => {
  assert.equal(deriveScope([{ status: 'M', file: 'index.ts' }]), '');
});

test('buildCommitMessage: classification for representative file sets', () => {
  assert.equal(
    buildCommitMessage([
      { status: 'M', file: 'package.json' },
      { status: 'M', file: 'package-lock.json' }
    ]),
    'build: update dependencies'
  );

  assert.equal(
    buildCommitMessage([{ status: 'A', file: 'tests/auth.test.ts' }]),
    'test(tests): add tests'
  );

  assert.equal(
    buildCommitMessage([{ status: 'M', file: 'docs/guide.md' }]),
    'docs(docs): update documentation'
  );

  assert.equal(
    buildCommitMessage([{ status: 'M', file: 'src/theme.css' }]),
    'style(src): update styles'
  );

  assert.equal(
    buildCommitMessage([{ status: 'A', file: 'src/feature.ts' }]),
    'feat(src): add feature.ts'
  );

  assert.equal(
    buildCommitMessage([{ status: 'D', file: 'src/legacy.ts' }]),
    'refactor(src): remove legacy.ts'
  );
});

test('buildCommitMessage: emitted types are valid Conventional Commits types', () => {
  const valid = new Set([
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'build',
    'ci',
    'chore',
    'revert'
  ]);
  const samples = [
    [{ status: 'M', file: 'package.json' }],
    [{ status: 'M', file: 'tsconfig.json' }],
    [{ status: 'D', file: 'src/a.ts' }],
    [{ status: 'R', file: 'src/b.ts', from: 'src/a.ts' }]
  ];

  for (const files of samples) {
    const message = buildCommitMessage(files);
    const type = message.split(/[(:]/)[0];
    assert.ok(valid.has(type), `${message} uses non-conventional type "${type}"`);
  }
});

test('buildCommitMessage: renames-only still gets a description', () => {
  const message = buildCommitMessage([{ status: 'R', file: 'src/b.ts', from: 'src/a.ts' }]);
  assert.equal(message, 'refactor(src): rename b.ts');
  assert.ok(!message.endsWith(': '));
});

test('analyzeDiff: "catch (error)" no longer implies a bug fix', () => {
  const diff = [
    'diff --git a/src/a.ts b/src/a.ts',
    '--- a/src/a.ts',
    '+++ b/src/a.ts',
    '@@ -1,3 +1,4 @@',
    '+  } catch (error) {',
    '+    console.log(error);',
    ' const x = 1;'
  ].join('\n');

  const signals = analyzeDiff(diff);
  assert.equal(signals.fixIntent, false);
  assert.equal(signals.conditionalChurn, false);
});

test('analyzeDiff: fix intent only comes from added comments stating it', () => {
  const diff = ['+++ b/src/a.ts', '+// fixes #42 — off-by-one in the pager'].join('\n');
  assert.equal(analyzeDiff(diff).fixIntent, true);

  // Removed comments must not count.
  const removed = ['--- a/src/a.ts', '-// fixes #42'].join('\n');
  assert.equal(analyzeDiff(removed).fixIntent, false);
});

test('analyzeDiff: new declarations are detected as new API', () => {
  const diff = ['+++ b/src/a.ts', '+export function greet() {', '+  return 1;', '+}'].join('\n');
  assert.equal(analyzeDiff(diff).newApi, true);
});

test('buildCommitMessage: diff hints never override a confident classification', () => {
  const fixSignals = {
    fixIntent: true,
    refactorIntent: false,
    newApi: false,
    conditionalChurn: true,
    oversized: false
  };

  // 40 added source files must stay a feat, whatever the diff text says.
  const manyAdds = Array.from({ length: 40 }, (_, i) => ({ status: 'A', file: `src/mod${i}.ts` }));
  assert.equal(buildCommitMessage(manyAdds, fixSignals), 'feat(src): add 40 new files');

  // Docs-only commits stay docs.
  assert.equal(
    buildCommitMessage([{ status: 'M', file: 'docs/guide.md' }], fixSignals),
    'docs(docs): update documentation'
  );

  // The vague "update and improve code" fallback is where hints are allowed.
  const vague = [
    { status: 'M', file: 'src/a.ts' },
    { status: 'M', file: 'src/b.ts' }
  ];
  assert.equal(buildCommitMessage(vague, fixSignals), 'fix(src): correct faulty behavior');
  assert.equal(buildCommitMessage(vague, null), 'chore(src): update and improve code');
});

test('buildCommitMessage: an oversized diff is ignored rather than guessed at', () => {
  const oversized = {
    fixIntent: false,
    refactorIntent: false,
    newApi: true,
    conditionalChurn: false,
    oversized: true
  };
  const files = [
    { status: 'M', file: 'src/a.ts' },
    { status: 'M', file: 'src/b.ts' }
  ];
  assert.equal(buildCommitMessage(files, oversized), 'chore(src): update and improve code');
});
