import { Injectable } from '@angular/core';

export type JsonDiffType = 'added' | 'deleted' | 'modified' | 'equal' | 'type-changed';

export interface JsonDiffNode {
  path: string;
  type: JsonDiffType;
  oldValue?: any;
  newValue?: any;
  children?: JsonDiffNode[];
}

export interface JsonDiffOptions {
  ignoreKeyOrder?: boolean;
  ignoreArrayOrder?: boolean;
  showUnchanged?: boolean;
}

export interface JsonDiffStats {
  added: number;
  deleted: number;
  modified: number;
  unchanged: number;
  totalChanges: number;
}

@Injectable({
  providedIn: 'root'
})
export class JsonDiffService {
  /**
   * Compare two JSON objects and return diff tree
   */
  compareJson(obj1: any, obj2: any, options: JsonDiffOptions = {}): JsonDiffNode[] {
    const result: JsonDiffNode[] = [];
    this.compareValues(obj1, obj2, '', result, options);
    return result;
  }

  /**
   * Get statistics from diff results
   */
  getDiffStats(diffs: JsonDiffNode[]): JsonDiffStats {
    let added = 0;
    let deleted = 0;
    let modified = 0;
    let unchanged = 0;

    const countNodes = (nodes: JsonDiffNode[]) => {
      for (const node of nodes) {
        switch (node.type) {
          case 'added':
            added++;
            break;
          case 'deleted':
            deleted++;
            break;
          case 'modified':
          case 'type-changed':
            modified++;
            break;
          case 'equal':
            unchanged++;
            break;
        }

        if (node.children) {
          countNodes(node.children);
        }
      }
    };

    countNodes(diffs);

    return {
      added,
      deleted,
      modified,
      unchanged,
      totalChanges: added + deleted + modified
    };
  }

  /**
   * Format diff result as text
   */
  formatDiffAsText(diffs: JsonDiffNode[]): string {
    const lines: string[] = [];

    const formatNode = (node: JsonDiffNode, indent = 0) => {
      const prefix = '  '.repeat(indent);
      const path = node.path || 'root';

      switch (node.type) {
        case 'added':
          lines.push(`${prefix}+ ${path}: ${JSON.stringify(node.newValue)}`);
          break;
        case 'deleted':
          lines.push(`${prefix}- ${path}: ${JSON.stringify(node.oldValue)}`);
          break;
        case 'modified':
          lines.push(`${prefix}~ ${path}:`);
          lines.push(`${prefix}  - ${JSON.stringify(node.oldValue)}`);
          lines.push(`${prefix}  + ${JSON.stringify(node.newValue)}`);
          break;
        case 'type-changed':
          lines.push(`${prefix}! ${path}: type changed`);
          lines.push(`${prefix}  - ${typeof node.oldValue}: ${JSON.stringify(node.oldValue)}`);
          lines.push(`${prefix}  + ${typeof node.newValue}: ${JSON.stringify(node.newValue)}`);
          break;
        case 'equal':
          if (node.children && node.children.length > 0) {
            lines.push(`${prefix}  ${path}:`);
          }
          break;
      }

      if (node.children) {
        node.children.forEach(child => formatNode(child, indent + 1));
      }
    };

    diffs.forEach(node => formatNode(node));
    return lines.join('\n');
  }

  private compareValues(
    val1: any,
    val2: any,
    path: string,
    result: JsonDiffNode[],
    options: JsonDiffOptions
  ): void {
    // Both are null or undefined
    if (val1 == null && val2 == null) {
      if (options.showUnchanged) {
        result.push({ path, type: 'equal', oldValue: val1, newValue: val2 });
      }
      return;
    }

    // One is null or undefined
    if (val1 == null) {
      result.push({ path, type: 'added', newValue: val2 });
      return;
    }

    if (val2 == null) {
      result.push({ path, type: 'deleted', oldValue: val1 });
      return;
    }

    const type1 = this.getType(val1);
    const type2 = this.getType(val2);

    // Type changed
    if (type1 !== type2) {
      result.push({ path, type: 'type-changed', oldValue: val1, newValue: val2 });
      return;
    }

    // Compare based on type
    switch (type1) {
      case 'object':
        this.compareObjects(val1, val2, path, result, options);
        break;
      case 'array':
        this.compareArrays(val1, val2, path, result, options);
        break;
      case 'primitive':
        if (val1 !== val2) {
          result.push({ path, type: 'modified', oldValue: val1, newValue: val2 });
        } else if (options.showUnchanged) {
          result.push({ path, type: 'equal', oldValue: val1, newValue: val2 });
        }
        break;
    }
  }

  private compareObjects(
    obj1: any,
    obj2: any,
    path: string,
    result: JsonDiffNode[],
    options: JsonDiffOptions
  ): void {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;

      if (!(key in obj1)) {
        result.push({ path: newPath, type: 'added', newValue: obj2[key] });
      } else if (!(key in obj2)) {
        result.push({ path: newPath, type: 'deleted', oldValue: obj1[key] });
      } else {
        this.compareValues(obj1[key], obj2[key], newPath, result, options);
      }
    }
  }

  private compareArrays(
    arr1: any[],
    arr2: any[],
    path: string,
    result: JsonDiffNode[],
    options: JsonDiffOptions
  ): void {
    if (options.ignoreArrayOrder) {
      this.compareArraysUnordered(arr1, arr2, path, result, options);
    } else {
      this.compareArraysOrdered(arr1, arr2, path, result, options);
    }
  }

  private compareArraysOrdered(
    arr1: any[],
    arr2: any[],
    path: string,
    result: JsonDiffNode[],
    options: JsonDiffOptions
  ): void {
    const maxLength = Math.max(arr1.length, arr2.length);

    for (let i = 0; i < maxLength; i++) {
      const newPath = `${path}[${i}]`;

      if (i >= arr1.length) {
        result.push({ path: newPath, type: 'added', newValue: arr2[i] });
      } else if (i >= arr2.length) {
        result.push({ path: newPath, type: 'deleted', oldValue: arr1[i] });
      } else {
        this.compareValues(arr1[i], arr2[i], newPath, result, options);
      }
    }
  }

  private compareArraysUnordered(
    arr1: any[],
    arr2: any[],
    path: string,
    result: JsonDiffNode[],
    options: JsonDiffOptions
  ): void {
    // For unordered comparison, we check if arrays have same elements
    // Find elements only in arr1 (deleted)
    const arr2Matched = new Set<number>();
    arr1.forEach((item1, idx1) => {
      const newPath = `${path}[${idx1}]`;
      const matchIdx = arr2.findIndex((item2, idx2) =>
        !arr2Matched.has(idx2) && this.deepEqual(item1, item2)
      );

      if (matchIdx === -1) {
        result.push({ path: newPath, type: 'deleted', oldValue: item1 });
      } else {
        arr2Matched.add(matchIdx);
        if (options.showUnchanged) {
          result.push({ path: newPath, type: 'equal', oldValue: item1, newValue: arr2[matchIdx] });
        }
      }
    });

    // Find elements only in arr2 (added)
    arr2.forEach((item2, idx2) => {
      if (!arr2Matched.has(idx2)) {
        const newPath = `${path}[${idx2}]`;
        result.push({ path: newPath, type: 'added', newValue: item2 });
      }
    });
  }

  private getType(val: any): 'object' | 'array' | 'primitive' {
    if (Array.isArray(val)) return 'array';
    if (val !== null && typeof val === 'object') return 'object';
    return 'primitive';
  }

  private deepEqual(val1: any, val2: any): boolean {
    if (val1 === val2) return true;
    if (val1 == null || val2 == null) return false;
    if (typeof val1 !== typeof val2) return false;

    if (Array.isArray(val1) && Array.isArray(val2)) {
      if (val1.length !== val2.length) return false;
      return val1.every((item, idx) => this.deepEqual(item, val2[idx]));
    }

    if (typeof val1 === 'object') {
      const keys1 = Object.keys(val1);
      const keys2 = Object.keys(val2);
      if (keys1.length !== keys2.length) return false;
      return keys1.every(key => this.deepEqual(val1[key], val2[key]));
    }

    return false;
  }
}
