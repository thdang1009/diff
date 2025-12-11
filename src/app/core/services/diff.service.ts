import { Injectable } from '@angular/core';
// @ts-ignore
import DiffMatchPatch from 'diff-match-patch';

export interface DiffResult {
  type: 'equal' | 'insert' | 'delete';
  text: string;
}

export interface LineDiff {
  lineNumber: number;
  type: 'equal' | 'insert' | 'delete' | 'modified';
  oldText?: string;
  newText?: string;
  wordDiffs?: DiffResult[];
}

export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  contextLines?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DiffService {
  private dmp: any;

  constructor() {
    // diff-match-patch exports a constructor function directly
    this.dmp = new DiffMatchPatch();
    // Optimize for better semantic cleanup
    this.dmp.Diff_EditCost = 4;
  }

  /**
   * Compute character-level diff between two texts
   * @param text1 Original text
   * @param text2 Modified text
   * @param options Diff options
   * @returns Array of diff results
   */
  computeCharDiff(text1: string, text2: string, options: DiffOptions = {}): DiffResult[] {
    let processedText1 = text1;
    let processedText2 = text2;

    // Apply options
    if (options.ignoreCase) {
      processedText1 = text1.toLowerCase();
      processedText2 = text2.toLowerCase();
    }

    if (options.ignoreWhitespace) {
      processedText1 = this.normalizeWhitespace(processedText1);
      processedText2 = this.normalizeWhitespace(processedText2);
    }

    // Compute diff
    const diffs = this.dmp.diff_main(processedText1, processedText2);

    // Semantic cleanup for more human-readable diffs
    this.dmp.diff_cleanupSemantic(diffs);

    // Convert to our format
    return diffs.map(([operation, text]: [number, string]) => ({
      type: operation === 1 ? 'insert' : operation === -1 ? 'delete' : 'equal',
      text: options.ignoreCase ? this.getOriginalCase(text, text1, text2) : text
    }));
  }

  /**
   * Compute line-by-line diff between two texts
   * @param text1 Original text
   * @param text2 Modified text
   * @param options Diff options
   * @returns Array of line diffs
   */
  computeLineDiff(text1: string, text2: string, options: DiffOptions = {}): LineDiff[] {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');

    // Compute line-based diff
    const lineMode = true;
    const diffs = this.dmp.diff_main(text1, text2, lineMode);
    this.dmp.diff_cleanupSemantic(diffs);

    const result: LineDiff[] = [];
    let line1Index = 0;
    let line2Index = 0;
    let currentLine = 0;

    for (const [operation, text] of diffs as Array<[number, string]>) {
      const lines = text.split('\n').filter((line, index, arr) => {
        // Keep empty lines except the last one if text ends with newline
        return line !== '' || index !== arr.length - 1;
      });

      if (operation === 0) { // EQUAL
        lines.forEach((line) => {
          currentLine++;
          result.push({
            lineNumber: currentLine,
            type: 'equal',
            oldText: line,
            newText: line
          });
          line1Index++;
          line2Index++;
        });
      } else if (operation === -1) { // DELETE
        lines.forEach((line) => {
          currentLine++;
          result.push({
            lineNumber: currentLine,
            type: 'delete',
            oldText: line
          });
          line1Index++;
        });
      } else if (operation === 1) { // INSERT
        lines.forEach((line) => {
          currentLine++;
          result.push({
            lineNumber: currentLine,
            type: 'insert',
            newText: line
          });
          line2Index++;
        });
      }
    }

    // Enhance with word-level diffs for modified lines
    return this.enhanceWithWordDiffs(result, options);
  }

  /**
   * Compute side-by-side diff for better visualization
   * @param text1 Original text
   * @param text2 Modified text
   * @param options Diff options
   * @returns Array of side-by-side line diffs
   */
  computeSideBySideDiff(text1: string, text2: string, options: DiffOptions = {}): Array<{
    lineNumber: number;
    left?: { text: string; type: 'equal' | 'delete' | 'modified' };
    right?: { text: string; type: 'equal' | 'insert' | 'modified' };
    wordDiffs?: { left: DiffResult[]; right: DiffResult[] };
  }> {
    const lineDiffs = this.computeLineDiff(text1, text2, options);
    const result: Array<any> = [];

    let i = 0;
    while (i < lineDiffs.length) {
      const diff = lineDiffs[i];

      if (diff.type === 'equal') {
        result.push({
          lineNumber: diff.lineNumber,
          left: { text: diff.oldText!, type: 'equal' },
          right: { text: diff.newText!, type: 'equal' }
        });
        i++;
      } else if (diff.type === 'delete') {
        // Check if next is insert (modification)
        if (i + 1 < lineDiffs.length && lineDiffs[i + 1].type === 'insert') {
          const nextDiff = lineDiffs[i + 1];
          const wordDiffs = this.computeCharDiff(diff.oldText!, nextDiff.newText!, options);

          result.push({
            lineNumber: diff.lineNumber,
            left: { text: diff.oldText!, type: 'modified' },
            right: { text: nextDiff.newText!, type: 'modified' },
            wordDiffs: this.splitWordDiffs(wordDiffs)
          });
          i += 2;
        } else {
          result.push({
            lineNumber: diff.lineNumber,
            left: { text: diff.oldText!, type: 'delete' }
          });
          i++;
        }
      } else if (diff.type === 'insert') {
        result.push({
          lineNumber: diff.lineNumber,
          right: { text: diff.newText!, type: 'insert' }
        });
        i++;
      }
    }

    return result;
  }

  /**
   * Get diff statistics
   * @param diffs Array of diff results
   * @returns Statistics object
   */
  getDiffStats(diffs: DiffResult[]): {
    additions: number;
    deletions: number;
    unchanged: number;
    totalChanges: number;
  } {
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    diffs.forEach(diff => {
      const length = diff.text.length;
      if (diff.type === 'insert') {
        additions += length;
      } else if (diff.type === 'delete') {
        deletions += length;
      } else {
        unchanged += length;
      }
    });

    return {
      additions,
      deletions,
      unchanged,
      totalChanges: additions + deletions
    };
  }

  /**
   * Create a patch string from diff
   * @param text1 Original text
   * @param text2 Modified text
   * @returns Patch string
   */
  createPatch(text1: string, text2: string): string {
    const diffs = this.dmp.diff_main(text1, text2);
    this.dmp.diff_cleanupSemantic(diffs);
    const patches = this.dmp.patch_make(text1, diffs);
    return this.dmp.patch_toText(patches);
  }

  /**
   * Apply patch to text
   * @param text Original text
   * @param patchText Patch string
   * @returns Patched text and success status
   */
  applyPatch(text: string, patchText: string): { text: string; success: boolean } {
    const patches = this.dmp.patch_fromText(patchText);
    const [patchedText, results] = this.dmp.patch_apply(patches, text);
    const success = results.every((result: boolean) => result);
    return { text: patchedText, success };
  }

  /**
   * Normalize whitespace by replacing multiple spaces/tabs with single space
   * @param text Input text
   * @returns Normalized text
   */
  private normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Get original case for text when ignoreCase is true
   * @param text Lowercase text
   * @param original1 Original text 1
   * @param original2 Original text 2
   * @returns Text with original casing
   */
  private getOriginalCase(text: string, original1: string, original2: string): string {
    // Try to find the text in original sources
    const index1 = original1.toLowerCase().indexOf(text.toLowerCase());
    if (index1 !== -1) {
      return original1.substring(index1, index1 + text.length);
    }

    const index2 = original2.toLowerCase().indexOf(text.toLowerCase());
    if (index2 !== -1) {
      return original2.substring(index2, index2 + text.length);
    }

    return text;
  }

  /**
   * Enhance line diffs with word-level differences
   * @param lineDiffs Array of line diffs
   * @param options Diff options
   * @returns Enhanced line diffs
   */
  private enhanceWithWordDiffs(lineDiffs: LineDiff[], options: DiffOptions): LineDiff[] {
    return lineDiffs.map(lineDiff => {
      // Only add word diffs for lines that exist in both versions
      if (lineDiff.oldText && lineDiff.newText && lineDiff.oldText !== lineDiff.newText) {
        const wordDiffs = this.computeCharDiff(lineDiff.oldText, lineDiff.newText, options);
        return {
          ...lineDiff,
          type: 'modified',
          wordDiffs
        };
      }
      return lineDiff;
    });
  }

  /**
   * Split word diffs into left and right sides
   * @param wordDiffs Array of word diffs
   * @returns Split diffs for left and right
   */
  private splitWordDiffs(wordDiffs: DiffResult[]): { left: DiffResult[]; right: DiffResult[] } {
    const left: DiffResult[] = [];
    const right: DiffResult[] = [];

    wordDiffs.forEach(diff => {
      if (diff.type === 'delete') {
        left.push(diff);
      } else if (diff.type === 'insert') {
        right.push(diff);
      } else {
        left.push(diff);
        right.push(diff);
      }
    });

    return { left, right };
  }
}
