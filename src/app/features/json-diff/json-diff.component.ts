import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-json-diff',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './json-diff.component.html',
  styleUrl: './json-diff.component.scss'
})
export class JsonDiffComponent implements OnInit {
  private meta = inject(Meta);
  private titleService = inject(Title);

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
}
