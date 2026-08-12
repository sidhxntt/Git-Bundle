import { gitCommand } from './gitCommand.js';

export interface DiffSignals {
  /** An added comment explicitly states the change fixes something. */
  fixIntent: boolean;
  /** An added comment explicitly states the change restructures code. */
  refactorIntent: boolean;
  /** More declarations were added than removed — likely new API surface. */
  newApi: boolean;
  /** Conditional logic was both removed and added — weak "behaviour fix" hint. */
  conditionalChurn: boolean;
  /** The diff was too large to read; callers should say so rather than guess. */
  oversized: boolean;
}

export const EMPTY_SIGNALS: DiffSignals = {
  fixIntent: false,
  refactorIntent: false,
  newApi: false,
  conditionalChurn: false,
  oversized: false
};

const COMMENT = /^\s*(\/\/+|\/\*+|\*|#+|--|<!--|"""|''')/;

/**
 * Deliberately narrow: it matches someone *stating* they fixed something, not
 * the mere presence of the substring "error" (which `catch (error)` supplies in
 * almost every real diff).
 */
const FIX_INTENT =
  /\b(bug\s?fix|hot\s?fix|work\s?around|regression|fix(e[sd])?\s+(a|an|the|this|issue|bug|crash|error|regression|typo|#\d+)|(fix|fixes|fixed|resolve|resolves|resolved|close|closes|closed)\s+#\d+)\b/i;

const REFACTOR_INTENT =
  /\b(refactor(ed|ing)?|restructur(e|ed|ing)|clean\s?up|simplif(y|ied|ies)|dedupe|deduplicat(e|ed)|extract(ed)?\s+(in)?to)\b/i;

const DECLARATION =
  /^\s*(export\s+(default\s+)?)?(public\s+|private\s+|protected\s+|static\s+|abstract\s+)*(async\s+)?(function|class|interface|enum|type\s+\w+\s*=|struct|trait|impl|def|func|fn)\b/;

const CONDITIONAL = /(^|[^\w.])(if|elif|else\s+if|switch|while|unless)\s*[({:]|\?\?|\?\./;

function isComment(line: string): boolean {
  return COMMENT.test(line);
}

/**
 * Derive intent hints from a unified diff, looking only at ADDED lines (`+`,
 * excluding the `+++` file header) and REMOVED lines (`-`, excluding `---`).
 * Scanning the raw diff text — headers, context lines and all — is what made
 * every commit come out as "fix: resolve issues and bugs".
 */
export function analyzeDiff(diff: string): DiffSignals {
  const signals: DiffSignals = { ...EMPTY_SIGNALS };
  let addedDeclarations = 0;
  let removedDeclarations = 0;
  let addedConditionals = 0;
  let removedConditionals = 0;

  for (const line of diff.split('\n')) {
    const added = line.startsWith('+') && !line.startsWith('+++');
    const removed = line.startsWith('-') && !line.startsWith('---');
    if (!added && !removed) continue;

    const content = line.slice(1);

    if (isComment(content)) {
      if (added && FIX_INTENT.test(content)) signals.fixIntent = true;
      if (added && REFACTOR_INTENT.test(content)) signals.refactorIntent = true;
      continue;
    }

    if (DECLARATION.test(content)) {
      if (added) addedDeclarations++;
      else removedDeclarations++;
    }

    if (CONDITIONAL.test(content)) {
      if (added) addedConditionals++;
      else removedConditionals++;
    }
  }

  signals.newApi = addedDeclarations > removedDeclarations;
  signals.conditionalChurn = removedConditionals > 0 && addedConditionals > 0;

  return signals;
}

/** Read and analyse the staged diff. Returns null when git itself failed. */
export function readStagedDiffSignals(): DiffSignals | null {
  const result = gitCommand(['diff', '--cached', '--no-color', '--no-ext-diff']);

  if (result.oversized) {
    return { ...EMPTY_SIGNALS, oversized: true };
  }
  if (!result.ok) {
    return null;
  }

  return analyzeDiff(result.stdout);
}
