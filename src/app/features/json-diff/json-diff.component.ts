import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { JsonDiffService, JsonDiffNode, JsonDiffType } from '../../core/services/json-diff.service';

@Component({
  selector: 'app-json-diff',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './json-diff.component.html',
  styleUrl: './json-diff.component.scss'
})
export class JsonDiffComponent implements OnInit {
  private meta = inject(Meta);
  private titleService = inject(Title);
  private jsonDiffService = inject(JsonDiffService);
  private snackBar = inject(MatSnackBar);

  // Input JSON strings
  originalJson = signal('');
  modifiedJson = signal('');

  // Options
  ignoreKeyOrder = signal(false);
  ignoreArrayOrder = signal(false);
  showUnchanged = signal(false);

  // Diff results
  diffResults = signal<JsonDiffNode[]>([]);

  // Computed stats
  stats = computed(() => {
    const diffs = this.diffResults();
    if (diffs.length === 0) {
      return { added: 0, deleted: 0, modified: 0, unchanged: 0, totalChanges: 0 };
    }
    return this.jsonDiffService.getDiffStats(diffs);
  });

  hasResults = computed(() => this.diffResults().length > 0);

  ngOnInit(): void {
    // Update meta tags for SEO and social sharing
    this.titleService.setTitle('JSON Diff Tool - Compare JSON Structures | Diff Toolbox');
    this.meta.updateTag({
      name: 'description',
      content: 'Free JSON comparison tool with structural analysis. Ignore key order, whitespace, and array differences. 100% client-side processing for maximum privacy.'
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'JSON Diff Tool - Compare JSON Structures | Diff Toolbox'
    });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Free JSON comparison tool with structural analysis. Ignore key order, whitespace, and array differences. 100% client-side processing for maximum privacy.'
    });
  }

  /**
   * Compute diff between original and modified JSON
   */
  computeDiff(): void {
    const original = this.originalJson().trim();
    const modified = this.modifiedJson().trim();

    if (!original && !modified) {
      this.snackBar.open('Please enter JSON in both fields', 'Close', { duration: 3000 });
      return;
    }

    try {
      // Parse JSON
      const obj1 = original ? JSON.parse(original) : null;
      const obj2 = modified ? JSON.parse(modified) : null;

      // Compute diff
      const options = {
        ignoreKeyOrder: this.ignoreKeyOrder(),
        ignoreArrayOrder: this.ignoreArrayOrder(),
        showUnchanged: this.showUnchanged()
      };

      const diffs = this.jsonDiffService.compareJson(obj1, obj2, options);
      this.diffResults.set(diffs);

      const stats = this.stats();
      this.snackBar.open(
        `✓ Diff computed: +${stats.added} -${stats.deleted} ~${stats.modified}`,
        'Close',
        { duration: 3000 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON';
      this.snackBar.open(`Error: ${message}`, 'Close', { duration: 3000 });
      console.error('JSON diff error:', error);
    }
  }

  /**
   * Swap original and modified JSON
   */
  swapJson(): void {
    const temp = this.originalJson();
    this.originalJson.set(this.modifiedJson());
    this.modifiedJson.set(temp);

    // Recompute if there are results
    if (this.hasResults()) {
      this.computeDiff();
    }

    this.snackBar.open('JSON swapped', 'Close', { duration: 2000 });
  }

  /**
   * Format JSON in input fields
   */
  formatJson(field: 'original' | 'modified'): void {
    try {
      const json = field === 'original' ? this.originalJson() : this.modifiedJson();
      if (!json.trim()) return;

      const parsed = JSON.parse(json);
      const formatted = JSON.stringify(parsed, null, 2);

      if (field === 'original') {
        this.originalJson.set(formatted);
      } else {
        this.modifiedJson.set(formatted);
      }

      this.snackBar.open('JSON formatted', 'Close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open('Invalid JSON', 'Close', { duration: 2000 });
    }
  }

  /**
   * Clear all inputs and results
   */
  clearAll(): void {
    this.originalJson.set('');
    this.modifiedJson.set('');
    this.diffResults.set([]);
    this.snackBar.open('Cleared', 'Close', { duration: 2000 });
  }

  /**
   * Load sample JSON for demonstration
   */
  loadSample(): void {
    this.originalJson.set(JSON.stringify({
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zip": "10001"
      },
      "hobbies": ["reading", "gaming"],
      "active": true
    }, null, 2));

    this.modifiedJson.set(JSON.stringify({
      "id": 123,
      "name": "John Smith",
      "email": "john.smith@example.com",
      "address": {
        "street": "123 Main St",
        "city": "Los Angeles",
        "zip": "90001",
        "country": "USA"
      },
      "hobbies": ["reading", "gaming", "hiking"],
      "active": true,
      "verified": true
    }, null, 2));

    this.snackBar.open('Sample JSON loaded', 'Close', { duration: 2000 });
  }

  /**
   * Copy diff result to clipboard
   */
  copyDiff(): void {
    const diffs = this.diffResults();
    if (diffs.length === 0) {
      this.snackBar.open('No diff to copy', 'Close', { duration: 2000 });
      return;
    }

    const diffText = this.jsonDiffService.formatDiffAsText(diffs);

    navigator.clipboard.writeText(diffText).then(
      () => {
        this.snackBar.open('✓ Diff copied to clipboard', 'Close', { duration: 2000 });
      },
      () => {
        this.snackBar.open('Failed to copy', 'Close', { duration: 2000 });
      }
    );
  }

  /**
   * Download diff as a file
   */
  downloadDiff(): void {
    const stats = this.stats();
    const timestamp = new Date().toISOString().split('T')[0];

    const header = `# JSON Diff - ${timestamp}\n\n`;
    const statsText = `## Statistics\n- Added: ${stats.added}\n- Deleted: ${stats.deleted}\n- Modified: ${stats.modified}\n- Unchanged: ${stats.unchanged}\n- Total Changes: ${stats.totalChanges}\n\n`;
    const diffText = `## Diff\n\`\`\`\n${this.jsonDiffService.formatDiffAsText(this.diffResults())}\n\`\`\`\n`;

    const content = header + statsText + diffText;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `json-diff_${timestamp}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.snackBar.open('✓ Diff downloaded', 'Close', { duration: 2000 });
  }

  /**
   * Get CSS class for diff type
   */
  getDiffClass(type: JsonDiffType): string {
    switch (type) {
      case 'added':
        return 'diff-added';
      case 'deleted':
        return 'diff-deleted';
      case 'modified':
        return 'diff-modified';
      case 'type-changed':
        return 'diff-type-changed';
      default:
        return 'diff-equal';
    }
  }

  /**
   * Get icon for diff type
   */
  getDiffIcon(type: JsonDiffType): string {
    switch (type) {
      case 'added':
        return 'add_circle';
      case 'deleted':
        return 'remove_circle';
      case 'modified':
        return 'edit';
      case 'type-changed':
        return 'sync_alt';
      default:
        return 'check_circle';
    }
  }

  /**
   * Format value for display
   */
  formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
