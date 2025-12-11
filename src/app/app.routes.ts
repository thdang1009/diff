import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'json-diff',
    pathMatch: 'full'
  },
  {
    path: 'json-diff',
    loadComponent: () =>
      import('./features/json-diff/json-diff.component').then(m => m.JsonDiffComponent),
    title: 'JSON Diff - Diff & Convert Toolbox'
  },
  {
    path: 'text-diff',
    loadComponent: () =>
      import('./features/text-diff/text-diff.component').then(m => m.TextDiffComponent),
    title: 'Text Diff - Diff & Convert Toolbox'
  },
  {
    path: 'converter',
    loadComponent: () =>
      import('./features/converter/converter.component').then(m => m.ConverterComponent),
    title: 'JSON/Excel Converter - Diff & Convert Toolbox'
  },
  {
    path: '**',
    redirectTo: 'json-diff'
  }
];
