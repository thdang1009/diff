import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-text-diff',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-diff.component.html',
  styleUrl: './text-diff.component.scss'
})
export class TextDiffComponent implements OnInit {
  private meta = inject(Meta);
  private titleService = inject(Title);

  ngOnInit(): void {
    // Update meta tags for SEO and social sharing
    this.titleService.setTitle('Text Diff Tool - Line-by-Line Comparison | Diff Toolbox');
    this.meta.updateTag({
      name: 'description',
      content: 'Professional text comparison tool with line-by-line and word-level granularity. Perfect for code review, document comparison, and content analysis.'
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'Text Diff Tool - Line-by-Line Comparison | Diff Toolbox'
    });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Professional text comparison tool with line-by-line and word-level granularity. Perfect for code review, document comparison, and content analysis.'
    });
  }
}
