import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ExcelService } from '../../core/services/excel.service';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './converter.component.html',
  styleUrl: './converter.component.scss'
})
export class ConverterComponent implements OnInit {
  private meta = inject(Meta);
  private titleService = inject(Title);
  private excelService = inject(ExcelService);
  private snackBar = inject(MatSnackBar);

  // JSON to Excel state
  jsonInput = signal('');
  sheetName = signal('Sheet1');
  isConvertingToExcel = signal(false);

  // Excel to JSON state
  selectedFile = signal<File | null>(null);
  jsonOutput = signal('');
  isConvertingToJson = signal(false);
  fileName = signal('');

  ngOnInit(): void {
    // Update meta tags for SEO and social sharing
    this.titleService.setTitle('JSON/Excel Converter - Bi-directional Conversion | Diff Toolbox');
    this.meta.updateTag({
      name: 'description',
      content: 'Convert between JSON and Excel formats instantly. Upload Excel files to generate JSON or convert JSON arrays to downloadable XLSX files. All processing happens locally.'
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'JSON/Excel Converter - Bi-directional Conversion | Diff Toolbox'
    });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Convert between JSON and Excel formats instantly. Upload Excel files to generate JSON or convert JSON arrays to downloadable XLSX files. All processing happens locally.'
    });
  }

  /**
   * Convert JSON to Excel and download
   */
  convertJsonToExcel(): void {
    try {
      const input = this.jsonInput().trim();

      if (!input) {
        this.snackBar.open('Please enter JSON data', 'Close', { duration: 3000 });
        return;
      }

      this.isConvertingToExcel.set(true);

      // Parse JSON
      const data = JSON.parse(input);

      // Ensure it's an array
      const arrayData = Array.isArray(data) ? data : [data];

      if (arrayData.length === 0) {
        throw new Error('JSON array is empty');
      }

      // Convert to Excel
      const blob = this.excelService.jsonToExcel(arrayData, {
        sheetName: this.sheetName() || 'Sheet1'
      });

      // Download
      const filename = `export_${new Date().toISOString().split('T')[0]}.xlsx`;
      this.excelService.downloadBlob(blob, filename);

      this.snackBar.open(`✓ Excel file downloaded: ${filename}`, 'Close', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.snackBar.open(`Error: ${errorMessage}`, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isConvertingToExcel.set(false);
    }
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.fileName.set(file.name);
      this.jsonOutput.set(''); // Clear previous output
    }
  }

  /**
   * Convert Excel to JSON
   */
  convertExcelToJson(): void {
    const file = this.selectedFile();

    if (!file) {
      this.snackBar.open('Please select an Excel file', 'Close', { duration: 3000 });
      return;
    }

    this.isConvertingToJson.set(true);
    this.jsonOutput.set('');

    this.excelService.excelToJson(file).subscribe({
      next: (data) => {
        this.jsonOutput.set(JSON.stringify(data, null, 2));
        this.isConvertingToJson.set(false);
        this.snackBar.open(`✓ Converted ${data.length} rows to JSON`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        this.isConvertingToJson.set(false);
        const errorMessage = error.message || 'Failed to convert Excel file';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Copy JSON output to clipboard
   */
  copyToClipboard(): void {
    const output = this.jsonOutput();
    if (!output) {
      this.snackBar.open('No JSON to copy', 'Close', { duration: 2000 });
      return;
    }

    navigator.clipboard.writeText(output).then(
      () => {
        this.snackBar.open('✓ Copied to clipboard', 'Close', { duration: 2000 });
      },
      () => {
        this.snackBar.open('Failed to copy', 'Close', { duration: 2000 });
      }
    );
  }

  /**
   * Load sample JSON data
   */
  loadSampleJson(): void {
    const sampleData = [
      { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, city: 'New York' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28, city: 'Los Angeles' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, city: 'Chicago' }
    ];

    this.jsonInput.set(JSON.stringify(sampleData, null, 2));
    this.snackBar.open('Sample data loaded', 'Close', { duration: 2000 });
  }

  /**
   * Clear all inputs and outputs
   */
  clearAll(): void {
    this.jsonInput.set('');
    this.jsonOutput.set('');
    this.selectedFile.set(null);
    this.fileName.set('');
    this.sheetName.set('Sheet1');
  }
}
