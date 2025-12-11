import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ExcelExportOptions {
  sheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  /**
   * Convert JSON array to Excel file (Blob)
   * @param data Array of objects to convert
   * @param options Export options
   * @returns Blob containing Excel file
   */
  jsonToExcel(data: any[], options: ExcelExportOptions = {}): Blob {
    try {
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array of objects');
      }

      if (data.length === 0) {
        throw new Error('Data array is empty');
      }

      const {
        sheetName = 'Sheet1',
        includeHeaders = true
      } = options;

      // Convert JSON to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data, {
        skipHeader: !includeHeaders
      });

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate Excel file buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
        compression: true
      });

      // Create and return Blob
      return new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    } catch (error) {
      throw new Error(`Failed to convert JSON to Excel: ${(error as Error).message}`);
    }
  }

  /**
   * Convert Excel file to JSON array
   * @param file Excel file to convert
   * @param sheetIndex Index of sheet to read (default: 0)
   * @returns Observable of JSON array
   */
  excelToJson(file: File, sheetIndex: number = 0): Observable<any[]> {
    if (!file) {
      return throwError(() => new Error('No file provided'));
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return throwError(() => new Error('Invalid file type. Please upload an Excel file (.xlsx, .xls, .csv)'));
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return throwError(() => new Error('File too large. Maximum size is 10MB'));
    }

    return from(file.arrayBuffer()).pipe(
      map(buffer => {
        try {
          // Read workbook
          const workbook = XLSX.read(buffer, { type: 'array' });

          // Check if workbook has sheets
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('No sheets found in Excel file');
          }

          // Get sheet by index or first sheet
          const sheetName = workbook.SheetNames[sheetIndex] || workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: null, // Use null for empty cells
            raw: false // Convert dates and numbers to strings
          });

          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            throw new Error('No data found in Excel sheet');
          }

          return jsonData;
        } catch (error) {
          throw new Error(`Failed to parse Excel file: ${(error as Error).message}`);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Get sheet names from Excel file
   * @param file Excel file
   * @returns Observable of sheet names array
   */
  getSheetNames(file: File): Observable<string[]> {
    return from(file.arrayBuffer()).pipe(
      map(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        return workbook.SheetNames;
      }),
      catchError(error => {
        return throwError(() => new Error(`Failed to read Excel file: ${(error as Error).message}`));
      })
    );
  }

  /**
   * Download Blob as file
   * @param blob Blob to download
   * @param filename Filename for download
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
