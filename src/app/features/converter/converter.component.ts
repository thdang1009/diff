import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './converter.component.html',
  styleUrl: './converter.component.scss'
})
export class ConverterComponent implements OnInit {
  private meta = inject(Meta);
  private titleService = inject(Title);

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
}
