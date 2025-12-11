# Engineering Design Document
## Diff & Convert Toolbox

**Version:** 1.0
**Last Updated:** 2025-12-11
**Author:** Engineering Team
**Status:** Implementation Ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technical Architecture](#2-technical-architecture)
3. [Technology Stack & Rationale](#3-technology-stack--rationale)
4. [System Design](#4-system-design)
5. [Component Architecture](#5-component-architecture)
6. [Data Flow & State Management](#6-data-flow--state-management)
7. [Performance Optimization Strategy](#7-performance-optimization-strategy)
8. [Security Considerations](#8-security-considerations)
9. [Build & Deployment Pipeline](#9-build--deployment-pipeline)
10. [Testing Strategy](#10-testing-strategy)
11. [Accessibility & Internationalization](#11-accessibility--internationalization)
12. [Monitoring & Analytics](#12-monitoring--analytics)
13. [Future Scalability](#13-future-scalability)

---

## 1. Executive Summary

### 1.1 Project Context

This project serves dual purposes:
1. **Technical Showcase**: Demonstrate advanced Angular development capabilities, modern TypeScript patterns, and enterprise-grade architecture suitable for EU market freelance opportunities
2. **Production Tool**: Deliver a high-performance, client-side web application for JSON/text comparison and file format conversion

### 1.2 Key Technical Decisions

| Decision Area | Choice | Rationale |
|--------------|--------|-----------|
| **Framework** | Angular 21.x (Standalone API) | Latest stable, showcases modern Angular patterns, strong EU market presence |
| **Rendering Strategy** | SSG (Static Site Generation) with Client-Side Hydration | **CRITICAL**: Prerendered HTML for SEO/social sharing + SPA performance after load. Zero backend, maximum shareability |
| **State Management** | Signals + RxJS | Modern reactive paradigm, Angular 21 first-class support |
| **UI Framework** | Angular Material 21.x | Enterprise-standard, accessibility built-in, highly customizable |
| **Code Editor** | Monaco Editor | Industry-standard (VS Code engine), excellent TypeScript support |
| **Diff Engine** | diff-match-patch + Custom Layer | Battle-tested algorithm, extensible for JSON-specific comparison |
| **Excel Processing** | SheetJS (xlsx) | De-facto standard, comprehensive format support, pure JavaScript |
| **Build Tool** | esbuild (via Angular CLI) | Superior performance, tree-shaking, modern ESM output |
| **Deployment** | GitHub Pages / Vercel / Netlify | Zero-cost static hosting, CI/CD integration, global CDN |

---

## 2. Technical Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Runtime                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Angular Application Shell                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │   │
│  │  │ JSON Diff    │  │ Text Diff    │  │ Convert  │  │   │
│  │  │ Module       │  │ Module       │  │ Module   │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Shared Services Layer                       │   │
│  │  • DiffEngine Service  • FileProcessor Service      │   │
│  │  • Validation Service  • Export Service             │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Web Workers (Heavy Computation)             │   │
│  │  • Large File Diff  • Excel Parsing  • JSON Deep    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Browser APIs                                │   │
│  │  • File API  • Blob API  • Web Workers API          │   │
│  │  • IndexedDB (Optional Cache)  • LocalStorage       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture Principles

1. **Zero Backend Dependency**: All processing occurs client-side, ensuring:
   - Maximum user privacy (no data transmission)
   - Zero operational costs
   - Instant availability (no server downtime)
   - GDPR compliance by design

2. **SSG for Shareability + SPA for Performance**:
   - **Build-time prerendering**: Generate static HTML with full meta tags and feature descriptions
   - **Social media optimization**: When users share `diff.netlify.app`, crawlers see actual content, not blank Angular shell
   - **Runtime behavior**: After initial load, works as pure SPA (fast client-side navigation)
   - **No server required**: Static files deployed to CDN, but with rich SEO metadata
   - **First paint advantage**: Users see meaningful content immediately (feature list, descriptions) before JavaScript loads

3. **Progressive Enhancement**:
   - Core functionality works without JavaScript (graceful degradation message)
   - Advanced features (syntax highlighting, Monaco) load progressively
   - Responsive design adapts to device capabilities

3. **Performance First**:
   - Code splitting by route (lazy loading)
   - Tree-shaking for minimal bundle size
   - Web Workers for CPU-intensive operations
   - Virtual scrolling for large diffs

4. **Maintainability**:
   - Strict TypeScript with no implicit any
   - Standalone components (Angular 21 best practice)
   - Functional reactive patterns
   - Comprehensive unit and integration tests

---

## 3. Technology Stack & Rationale

### 3.1 Rendering Strategy: SSG vs SPA vs SSR - The Critical Decision

#### The Problem Statement

When building a static, backendless tool website, there are three rendering approaches:

1. **Pure SPA (Single Page Application)**
   - ✅ Fast client-side navigation
   - ✅ No backend required
   - ❌ **DEAL BREAKER**: Social media crawlers see blank HTML
   - ❌ When sharing `diff.netlify.app`, users see no preview image, no description
   - ❌ Poor SEO (though less critical for a tool site)

2. **SSR (Server-Side Rendering)**
   - ✅ Rich social previews
   - ✅ Great SEO
   - ❌ **DEAL BREAKER**: Requires Node.js server (defeats "no backend" requirement)
   - ❌ Operational costs
   - ❌ Overkill for a static tool

3. **SSG (Static Site Generation)** ← **SELECTED APPROACH**
   - ✅ Rich social previews (prerendered HTML at build time)
   - ✅ Zero backend (generates static files)
   - ✅ Works as SPA after initial load
   - ✅ Fast initial paint with meaningful content
   - ✅ Perfect for Netlify/Vercel/GitHub Pages

#### Decision: Angular SSG (Prerendering)

**Implementation**: Angular's `@angular/ssr` with prerendering enabled

**Build Process**:
```bash
# At build time (on CI/CD)
ng build --configuration production

# This generates:
# 1. Static HTML files for each route with full content
# 2. JavaScript bundles for SPA behavior after hydration
# 3. All meta tags, Open Graph, Twitter Cards baked into HTML
```

**What Gets Prerendered**:
```html
<!-- dist/browser/index.html (generated at BUILD time) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Diff & Convert Toolbox - Free JSON/Text Diff & Excel Converter</title>

  <!-- Open Graph for social sharing -->
  <meta property="og:title" content="Diff & Convert Toolbox">
  <meta property="og:description" content="Free, fast, and secure client-side tools for JSON diff, text comparison, and Excel/JSON conversion. No backend, 100% privacy.">
  <meta property="og:image" content="https://diff.netlify.app/assets/preview.png">
  <meta property="og:url" content="https://diff.netlify.app">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Diff & Convert Toolbox">
  <meta name="twitter:description" content="Compare JSON/text and convert Excel files - entirely in your browser">

  <!-- SEO -->
  <meta name="description" content="Professional-grade diff and conversion tools. Compare JSON structures, analyze text differences, convert between JSON and Excel formats. All processing happens locally in your browser.">
  <meta name="keywords" content="json diff, text diff, excel to json, json to excel, online diff tool">
</head>
<body>
  <!-- ACTUAL HTML CONTENT (not just <div id="app"></div>) -->
  <app-root>
    <header>
      <h1>Diff & Convert Toolbox</h1>
      <nav>
        <a href="/json-diff">JSON Diff</a>
        <a href="/text-diff">Text Diff</a>
        <a href="/converter">Excel ↔ JSON</a>
      </nav>
    </header>

    <main>
      <section class="features">
        <h2>Professional Developer Tools - 100% Client-Side</h2>
        <ul>
          <li>🔍 JSON Diff - Structural comparison with key order handling</li>
          <li>📝 Text Diff - Line-by-line with word-level granularity</li>
          <li>📊 Excel Converter - Bi-directional JSON/XLSX conversion</li>
        </ul>
      </section>
    </main>
  </app-root>

  <!-- SPA JavaScript loads and "hydrates" the static content -->
  <script src="main.js" type="module"></script>
</body>
</html>
```

**Runtime Behavior**:
1. User visits `diff.netlify.app`
2. Browser downloads static HTML (already has content!)
3. User sees feature list, description immediately (fast FCP)
4. JavaScript loads in background
5. Angular "hydrates" the static content (attaches event listeners)
6. From this point on, behaves like pure SPA (instant navigation)

**Social Sharing Flow**:
```
User shares link on LinkedIn/Slack/Twitter
         ↓
Crawler fetches diff.netlify.app
         ↓
Gets FULL HTML with meta tags (not blank page!)
         ↓
Generates rich preview card with:
  - Title: "Diff & Convert Toolbox"
  - Description: "Free JSON/Text diff and Excel converter"
  - Preview image: Screenshot of tool
  - Direct link to site
```

**Configuration**:
```typescript
// angular.json
{
  "projects": {
    "diff-toolbox": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "prerender": true,
              "routes": [
                "/",
                "/json-diff",
                "/text-diff",
                "/converter"
              ]
            }
          }
        }
      }
    }
  }
}
```

#### Why This Satisfies All Requirements

| Requirement | How SSG Delivers |
|------------|------------------|
| **Fast load** | Static HTML + lazy-loaded JS bundles |
| **Full function without backend** | All processing client-side after hydration |
| **Shareable link with preview** | Prerendered HTML with Open Graph/Twitter meta tags |
| **No server** | Static files on CDN (Netlify/Vercel) |
| **SPA performance** | After hydration, pure client-side routing |

#### The Confusion: "SSR" vs "SSG"

- **SSR (Server-Side Rendering)**: Renders HTML on a Node.js server *per request* (requires backend)
- **SSG (Static Site Generation)**: Renders HTML once *at build time*, outputs static files (no backend)
- **Our choice**: SSG = all the SEO benefits, none of the server overhead

---

### 3.2 Core Framework

#### Angular 21.x (Standalone Components)

**Selected Version**: `21.0.2+`

**Justification**:
- **EU Market Alignment**: Angular is heavily adopted in enterprise environments across Germany, Netherlands, UK, and Nordic countries
- **Enterprise Readiness**: Built-in dependency injection, testing utilities, and architectural patterns
- **Modern Paradigm**: Standalone components eliminate NgModules, reducing boilerplate by ~30%
- **Signals Integration**: New reactive primitive offers better performance than Zone.js for change detection
- **Long-term Support**: Google's commitment to LTS versions ensures stability

**Key Features Utilized**:
```typescript
// Standalone component example
@Component({
  selector: 'app-json-diff',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MonacoEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class JsonDiffComponent {
  // Signals for reactive state
  leftInput = signal<string>('');
  rightInput = signal<string>('');

  // Computed signal for derived state
  diffResult = computed(() =>
    this.diffService.compare(this.leftInput(), this.rightInput())
  );
}
```

### 3.2 UI & Styling

#### Angular Material 21.x

**Components Used**:
- `MatTabs`: Primary navigation
- `MatButton`: CTAs and actions
- `MatIcon`: Visual indicators
- `MatSnackBar`: User feedback
- `MatProgressBar`: Loading states
- `MatSlideToggle`: Feature toggles (whitespace, case sensitivity)
- `MatTooltip`: Contextual help

**Custom Theming**:
```scss
// Define custom palette for professional appearance
$primary-palette: mat.define-palette(mat.$indigo-palette, 600);
$accent-palette: mat.define-palette(mat.$teal-palette, 500);
$warn-palette: mat.define-palette(mat.$red-palette, 700);

// Light/Dark theme support
$light-theme: mat.define-light-theme(...);
$dark-theme: mat.define-dark-theme(...);

// Apply conditionally based on user preference
@media (prefers-color-scheme: dark) {
  @include mat.all-component-themes($dark-theme);
}
```

**Design System**: Material Design 3 (Adopt latest MD3 tokens for modern appearance)

### 3.3 Code Editing

#### Monaco Editor

**Implementation**: `@monaco-editor/angular` wrapper

**Justification**:
- Industry-standard editor (powers VS Code)
- Built-in JSON schema validation
- Syntax highlighting for 50+ languages
- IntelliSense and auto-completion
- Diff editor mode (native split-view comparison)

**Configuration**:
```typescript
export const MONACO_CONFIG: MonacoEditorConfig = {
  language: 'json',
  theme: 'vs-dark',
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  renderWhitespace: 'selection',
  fontSize: 14,
  fontFamily: 'Fira Code, Consolas, monospace',
  // Enable diff-specific features
  enableSplitViewResizing: true,
  renderSideBySide: true
};
```

### 3.4 Diff & Comparison Libraries

#### Primary: `diff-match-patch`

**Version**: `1.0.5+`

**Algorithm**: Myers diff algorithm with optimizations

**Pros**:
- Battle-tested (used by Google internally)
- Handles large texts efficiently
- Provides semantic cleanup
- Multiple output formats (unified, split, patch)

**Cons**:
- Not JSON-aware (requires custom layer)

#### Secondary: Custom JSON Diff Layer

**Purpose**: Structural comparison of JSON objects

**Implementation**:
```typescript
interface JsonDiffOptions {
  ignoreKeyOrder?: boolean;
  ignoreWhitespace?: boolean;
  ignoreArrayOrder?: boolean;
  caseSensitive?: boolean;
}

class JsonDiffService {
  // Normalize JSON before comparison
  private normalize(obj: any, options: JsonDiffOptions): any {
    if (options.ignoreKeyOrder) {
      return this.sortKeys(obj);
    }
    return obj;
  }

  // Deep comparison with path tracking
  compare(left: any, right: any, options: JsonDiffOptions): DiffResult {
    // Track changes by JSON path (e.g., "user.address.city")
    // Return structured diff: added, removed, modified
  }
}
```

**Output Format**:
```typescript
interface DiffResult {
  added: Array<{ path: string; value: any }>;
  removed: Array<{ path: string; value: any }>;
  modified: Array<{ path: string; oldValue: any; newValue: any }>;
  unchanged: number; // Count for statistics
}
```

### 3.5 Excel Processing

#### SheetJS Community Edition (`xlsx`)

**Version**: `0.18.5+`

**Capabilities**:
- Read: XLSX, XLS, CSV, ODS
- Write: XLSX, CSV
- Formula preservation (optional)
- Style preservation (not required for MVP)

**JSON → Excel Flow**:
```typescript
interface ExcelExportOptions {
  sheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

class ExcelService {
  jsonToExcel(data: any[], options: ExcelExportOptions): Blob {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');

    // Generate binary
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  excelToJson(file: File): Observable<any[]> {
    return from(file.arrayBuffer()).pipe(
      map(buffer => {
        const workbook = XLSX.read(buffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json(firstSheet);
      })
    );
  }
}
```

### 3.6 State Management

#### Angular Signals + RxJS

**Philosophy**: Hybrid approach leveraging strengths of both

**Signals**: For synchronous, local component state
```typescript
class DiffComponent {
  // Simple reactive values
  leftContent = signal('');
  rightContent = signal('');
  diffOptions = signal<DiffOptions>({ ignoreWhitespace: false });

  // Derived state (auto-computed)
  isValid = computed(() =>
    this.leftContent().length > 0 && this.rightContent().length > 0
  );
}
```

**RxJS**: For asynchronous operations, complex event streams
```typescript
class FileUploadComponent {
  private fileSelected$ = new Subject<File>();

  // Processing pipeline
  processedFile$ = this.fileSelected$.pipe(
    tap(() => this.loadingSignal.set(true)),
    switchMap(file => this.excelService.excelToJson(file)),
    catchError(err => {
      this.errorSignal.set(err.message);
      return EMPTY;
    }),
    finalize(() => this.loadingSignal.set(false))
  );
}
```

**No External State Library**: Given the application scope (3 independent tools), global state management (NgRx, Akita) adds unnecessary complexity.

---

## 4. System Design

### 4.1 Application Structure

```
src/
├── app/
│   ├── core/                          # Singleton services, guards
│   │   ├── services/
│   │   │   ├── theme.service.ts       # Dark/light mode management
│   │   │   ├── analytics.service.ts   # Privacy-friendly analytics
│   │   │   └── error-handler.service.ts
│   │   └── guards/
│   │       └── unsaved-changes.guard.ts
│   │
│   ├── shared/                        # Reusable components, utilities
│   │   ├── components/
│   │   │   ├── monaco-editor/         # Monaco wrapper component
│   │   │   ├── diff-viewer/           # Reusable diff display
│   │   │   ├── file-upload/           # Drag-and-drop uploader
│   │   │   └── copy-button/           # Copy to clipboard
│   │   ├── pipes/
│   │   │   ├── pretty-json.pipe.ts
│   │   │   └── file-size.pipe.ts
│   │   └── utils/
│   │       ├── download.util.ts       # Blob download helper
│   │       └── validation.util.ts
│   │
│   ├── features/                      # Feature modules (lazy-loaded)
│   │   ├── json-diff/
│   │   │   ├── json-diff.component.ts
│   │   │   ├── json-diff.service.ts
│   │   │   └── json-diff.routes.ts
│   │   ├── text-diff/
│   │   │   ├── text-diff.component.ts
│   │   │   ├── text-diff.service.ts
│   │   │   └── text-diff.routes.ts
│   │   └── converter/
│   │       ├── converter.component.ts
│   │       ├── json-to-excel/
│   │       ├── excel-to-json/
│   │       └── converter.service.ts
│   │
│   ├── layout/                        # Shell components
│   │   ├── header/
│   │   ├── footer/
│   │   └── main-layout/
│   │
│   ├── workers/                       # Web Workers
│   │   ├── diff.worker.ts             # Heavy diff computation
│   │   └── excel-parser.worker.ts     # Large file parsing
│   │
│   └── app.config.ts                  # Application configuration
│
├── assets/
│   ├── monaco/                        # Monaco editor assets
│   ├── icons/                         # Custom SVG icons
│   └── i18n/                          # Translation files (future)
│
├── styles/
│   ├── _variables.scss                # Design tokens
│   ├── _mixins.scss
│   ├── _typography.scss
│   └── themes/
│       ├── light-theme.scss
│       └── dark-theme.scss
│
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

### 4.2 Routing Strategy

**Lazy Loading**: Each feature module loads on demand

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'json-diff',
        pathMatch: 'full'
      },
      {
        path: 'json-diff',
        loadComponent: () =>
          import('./features/json-diff/json-diff.component')
            .then(m => m.JsonDiffComponent),
        title: 'JSON Diff - Diff & Convert Toolbox'
      },
      {
        path: 'text-diff',
        loadComponent: () =>
          import('./features/text-diff/text-diff.component')
            .then(m => m.TextDiffComponent),
        title: 'Text Diff - Diff & Convert Toolbox'
      },
      {
        path: 'converter',
        loadComponent: () =>
          import('./features/converter/converter.component')
            .then(m => m.ConverterComponent),
        title: 'JSON/Excel Converter - Diff & Convert Toolbox'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
```

**Benefits**:
- Initial bundle ~150KB (gzipped)
- Feature bundles ~50KB each
- Faster initial paint

---

## 5. Component Architecture

### 5.1 JSON Diff Component

**Responsibility**: Compare two JSON inputs with structural awareness

**Interface**:
```typescript
@Component({
  selector: 'app-json-diff',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="diff-container">
      <div class="controls">
        <mat-slide-toggle [(ngModel)]="ignoreKeyOrder">
          Ignore Key Order
        </mat-slide-toggle>
        <mat-slide-toggle [(ngModel)]="ignoreWhitespace">
          Ignore Whitespace
        </mat-slide-toggle>
        <button mat-raised-button color="primary" (click)="compare()">
          Compare
        </button>
      </div>

      <div class="editors">
        <app-monaco-editor
          [value]="leftInput()"
          [language]="'json'"
          (valueChange)="leftInput.set($event)"
        />
        <app-monaco-editor
          [value]="rightInput()"
          [language]="'json'"
          (valueChange)="rightInput.set($event)"
        />
      </div>

      <app-diff-viewer
        [diffResult]="diffResult()"
        [viewMode]="viewMode()"
      />
    </div>
  `
})
export class JsonDiffComponent {
  private jsonDiffService = inject(JsonDiffService);

  // Input signals
  leftInput = signal('');
  rightInput = signal('');
  ignoreKeyOrder = signal(false);
  ignoreWhitespace = signal(false);
  viewMode = signal<'split' | 'unified'>('split');

  // Validation
  leftValid = computed(() => this.isValidJson(this.leftInput()));
  rightValid = computed(() => this.isValidJson(this.rightInput()));

  // Diff result
  diffResult = signal<DiffResult | null>(null);

  compare(): void {
    if (!this.leftValid() || !this.rightValid()) {
      // Fallback to text diff
      this.diffResult.set(this.jsonDiffService.compareAsText(
        this.leftInput(),
        this.rightInput()
      ));
      return;
    }

    const result = this.jsonDiffService.compare(
      JSON.parse(this.leftInput()),
      JSON.parse(this.rightInput()),
      {
        ignoreKeyOrder: this.ignoreKeyOrder(),
        ignoreWhitespace: this.ignoreWhitespace()
      }
    );

    this.diffResult.set(result);
  }
}
```

**Key Features**:
- Real-time JSON validation
- Fallback to text comparison for invalid JSON
- Monaco editor with IntelliSense
- Multiple view modes (split/unified)

### 5.2 Text Diff Component

**Responsibility**: Line-by-line text comparison with word-level granularity

**Implementation Highlight**:
```typescript
export class TextDiffComponent {
  private diffService = inject(DiffMatchPatchService);

  // Use Web Worker for large texts (>10,000 lines)
  private diffWorker = new Worker(
    new URL('../workers/diff.worker', import.meta.url)
  );

  performDiff(): void {
    const leftLines = this.leftInput().split('\n');
    const rightLines = this.rightInput().split('\n');

    // Threshold for worker offloading
    if (leftLines.length > 10000 || rightLines.length > 10000) {
      this.diffWorker.postMessage({ left: this.leftInput(), right: this.rightInput() });
      this.diffWorker.onmessage = ({ data }) => {
        this.diffResult.set(data);
      };
    } else {
      // Direct computation for small texts
      const diffs = this.diffService.diff_main(this.leftInput(), this.rightInput());
      this.diffService.diff_cleanupSemantic(diffs);
      this.diffResult.set(diffs);
    }
  }
}
```

**Performance Optimization**: Automatic Web Worker delegation for large inputs

### 5.3 Converter Component

**Sub-Components**:
1. `JsonToExcelComponent`: Converts JSON array to downloadable XLSX
2. `ExcelToJsonComponent`: Parses uploaded XLSX and displays JSON

**JSON → Excel Flow**:
```typescript
export class JsonToExcelComponent {
  private excelService = inject(ExcelService);
  private snackBar = inject(MatSnackBar);

  jsonInput = signal('');
  sheetName = signal('Sheet1');

  convertAndDownload(): void {
    try {
      const data = JSON.parse(this.jsonInput());

      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of objects');
      }

      const blob = this.excelService.jsonToExcel(data, {
        sheetName: this.sheetName()
      });

      downloadBlob(blob, 'export.xlsx');

      this.snackBar.open('Excel file downloaded successfully', 'Close', {
        duration: 3000
      });
    } catch (error) {
      this.snackBar.open(`Error: ${error.message}`, 'Close', {
        duration: 5000
      });
    }
  }
}
```

**Excel → JSON Flow**:
```typescript
export class ExcelToJsonComponent {
  private excelService = inject(ExcelService);

  selectedFile = signal<File | null>(null);
  jsonOutput = signal('');
  isProcessing = signal(false);

  onFileSelect(file: File): void {
    this.selectedFile.set(file);
  }

  convert(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.isProcessing.set(true);

    this.excelService.excelToJson(file).subscribe({
      next: (data) => {
        this.jsonOutput.set(JSON.stringify(data, null, 2));
        this.isProcessing.set(false);
      },
      error: (error) => {
        this.isProcessing.set(false);
        // Error handling
      }
    });
  }
}
```

---

## 6. Data Flow & State Management

### 6.1 Component Communication

**Pattern**: Signals for parent-child, Services for cross-component

```typescript
// Parent → Child (via inputs)
@Component({
  template: `<app-monaco-editor [value]="content()" />`
})
export class ParentComponent {
  content = signal('Initial value');
}

// Child → Parent (via outputs)
@Component({
  selector: 'app-monaco-editor',
  template: `...`
})
export class MonacoEditorComponent {
  valueChange = output<string>(); // Angular 21 output() function

  onEditorChange(newValue: string): void {
    this.valueChange.emit(newValue);
  }
}
```

### 6.2 Persistence Strategy

**LocalStorage** for user preferences:
```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultDiffMode: 'split' | 'unified';
  ignoreWhitespaceDefault: boolean;
  editorFontSize: number;
}

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly STORAGE_KEY = 'diff-toolbox-prefs';

  preferences = signal<UserPreferences>(this.load());

  save(prefs: UserPreferences): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
    this.preferences.set(prefs);
  }

  private load(): UserPreferences {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : this.getDefaults();
  }
}
```

**No Backend**: All data stays client-side (privacy-first approach)

### 6.3 SSG Implementation Guide

#### Step 1: Enable SSR/SSG in Angular Project

```bash
# Add Angular SSR support
ng add @angular/ssr

# This updates:
# - angular.json (adds server build configuration)
# - package.json (adds server dependencies)
# - Creates server.ts (for SSR, can be ignored for pure SSG)
```

#### Step 2: Configure Prerendering

```typescript
// angular.json
{
  "projects": {
    "diff-toolbox": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kB",
                  "maximumError": "1MB"
                }
              ],
              "outputHashing": "all",
              "prerender": true,  // ← Enable SSG
              "prerenderRoutes": [  // ← Routes to prerender
                "/",
                "/json-diff",
                "/text-diff",
                "/converter"
              ]
            }
          }
        }
      }
    }
  }
}
```

#### Step 3: Add Meta Tags Service

```typescript
// src/app/core/services/meta-tags.service.ts
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface PageMeta {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

@Injectable({ providedIn: 'root' })
export class MetaTagsService {
  private meta = inject(Meta);
  private titleService = inject(Title);

  updateTags(pageMeta: PageMeta): void {
    const baseUrl = 'https://diff.netlify.app';
    const defaultImage = `${baseUrl}/assets/preview.png`;

    // Set title
    this.titleService.setTitle(pageMeta.title);

    // Update meta tags
    this.meta.updateTag({ name: 'description', content: pageMeta.description });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: pageMeta.title });
    this.meta.updateTag({ property: 'og:description', content: pageMeta.description });
    this.meta.updateTag({ property: 'og:image', content: pageMeta.image || defaultImage });
    this.meta.updateTag({ property: 'og:url', content: pageMeta.url || baseUrl });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    // Twitter Cards
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageMeta.title });
    this.meta.updateTag({ name: 'twitter:description', content: pageMeta.description });
    this.meta.updateTag({ name: 'twitter:image', content: pageMeta.image || defaultImage });
  }
}
```

#### Step 4: Update Route Components with Meta Tags

```typescript
// src/app/features/json-diff/json-diff.component.ts
@Component({
  selector: 'app-json-diff',
  standalone: true,
  template: `...`
})
export class JsonDiffComponent implements OnInit {
  private metaTags = inject(MetaTagsService);

  ngOnInit(): void {
    this.metaTags.updateTags({
      title: 'JSON Diff Tool - Compare JSON Structures | Diff Toolbox',
      description: 'Free JSON comparison tool with structural analysis. Ignore key order, whitespace, and array differences. 100% client-side processing for maximum privacy.',
      image: 'https://diff.netlify.app/assets/json-diff-preview.png'
    });
  }
}
```

#### Step 5: Build and Verify

```bash
# Build with prerendering
npm run build

# Output structure:
# dist/
#   browser/
#     index.html           ← Prerendered home page
#     json-diff/
#       index.html         ← Prerendered JSON diff page
#     text-diff/
#       index.html         ← Prerendered text diff page
#     converter/
#       index.html         ← Prerendered converter page
#     *.js, *.css          ← Static assets
```

#### Step 6: Test Social Sharing

```bash
# Use Facebook's debugger
https://developers.facebook.com/tools/debug/
# Paste: https://diff.netlify.app

# Use Twitter Card Validator
https://cards-dev.twitter.com/validator
# Paste: https://diff.netlify.app

# Use LinkedIn Post Inspector
https://www.linkedin.com/post-inspector/
# Paste: https://diff.netlify.app
```

**Expected Result**: All validators should show:
- Correct title
- Full description
- Preview image
- No "Unable to fetch preview" errors

#### Deployment Configuration

**Netlify** (`netlify.toml`):
```toml
[build]
  publish = "dist/browser"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

**Vercel** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/browser",
  "framework": null,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

---

## 7. Performance Optimization Strategy

### 7.1 Bundle Optimization

**Target Metrics**:
- Initial load: <200ms (FCP)
- Time to Interactive: <1s
- Total bundle size: <500KB (gzipped)

**Techniques**:

1. **Code Splitting**:
```typescript
// Dynamic imports for heavy libraries
const loadMonaco = () => import('monaco-editor').then(m => m.editor);
const loadXlsx = () => import('xlsx');
```

2. **Tree Shaking**:
```typescript
// angular.json optimization config
"optimization": {
  "scripts": true,
  "styles": {
    "minify": true,
    "inlineCritical": true
  },
  "fonts": true
}
```

3. **Differential Loading**: Automatic ES2020+ for modern browsers, ES2015 fallback

### 7.2 Runtime Performance

**Web Workers** for CPU-intensive tasks:

```typescript
// diff.worker.ts
import { DiffMatchPatch } from 'diff-match-patch';

self.onmessage = ({ data: { left, right, options } }) => {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(left, right);
  dmp.diff_cleanupSemantic(diffs);

  self.postMessage({ diffs });
};
```

**Virtual Scrolling** for large diff outputs:
```typescript
// Using Angular CDK
<cdk-virtual-scroll-viewport itemSize="20" class="diff-viewport">
  <div *cdkVirtualFor="let line of diffLines()">
    {{ line }}
  </div>
</cdk-virtual-scroll-viewport>
```

**Memoization** for expensive computations:
```typescript
const diffCache = new Map<string, DiffResult>();

function getCachedDiff(left: string, right: string): DiffResult {
  const key = `${hash(left)}:${hash(right)}`;
  if (!diffCache.has(key)) {
    diffCache.set(key, computeDiff(left, right));
  }
  return diffCache.get(key)!;
}
```

### 7.3 Network Optimization

**CDN Strategy**:
- Angular/Material from Google CDN (optional, build includes all)
- Monaco Editor assets from CDN
- Preconnect hints for external resources

**Service Worker** (future enhancement):
```typescript
// Offline-first caching for app shell
import { Workbox } from 'workbox-window';

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');
  wb.register();
}
```

---

## 8. Security Considerations

### 8.1 Input Validation

**JSON Parsing**:
```typescript
function safeJsonParse(input: string): { valid: boolean; data?: any; error?: string } {
  try {
    const data = JSON.parse(input);

    // Prevent prototype pollution
    if (data.__proto__ || data.constructor || data.prototype) {
      return { valid: false, error: 'Potentially malicious JSON structure' };
    }

    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

**File Upload Restrictions**:
```typescript
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large (max 10MB)' };
  }

  return { valid: true };
}
```

### 8.2 Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self' data:;
  connect-src 'self';
  worker-src 'self' blob:;
">
```

**Note**: `unsafe-eval` required for Monaco Editor, isolated to worker context

### 8.3 Privacy

- **No Analytics Cookies**: Use privacy-friendly analytics (Plausible, Fathom)
- **No Data Transmission**: All processing local
- **No Third-Party Scripts**: Self-hosted dependencies
- **GDPR Compliant**: No personal data collection

---

## 9. Build & Deployment Pipeline

### 9.1 Build Configuration

**Production Build**:
```bash
ng build --configuration production
```

**Optimizations Applied**:
- AOT compilation
- Minification (Terser)
- Tree-shaking
- Dead code elimination
- CSS purging
- Source map generation (for debugging)

**Output**:
```
dist/
├── browser/
│   ├── index.html
│   ├── main-[hash].js          (~150KB gzipped)
│   ├── polyfills-[hash].js     (~35KB gzipped)
│   ├── styles-[hash].css       (~25KB gzipped)
│   └── assets/
└── server/ (if SSR added later)
```

### 9.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Run linter
        run: npm run lint

      - name: Build application
        run: npm run build -- --configuration production

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist/browser
          cname: diff-toolbox.example.com  # Custom domain
```

### 9.3 Hosting Strategy

**Primary**: GitHub Pages
- Free for public repositories
- HTTPS by default
- Custom domain support
- Global CDN (Fastly)

**Alternative**: Vercel
- Zero-config deployment
- Automatic preview deployments
- Edge network
- Better analytics

**Configuration**:
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/browser",
  "framework": "angular",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 10. Testing Strategy

### 10.1 Unit Testing

**Framework**: Jest (faster than Karma/Jasmine)

**Coverage Target**: >80% for services, >60% for components

**Example**:
```typescript
// json-diff.service.spec.ts
describe('JsonDiffService', () => {
  let service: JsonDiffService;

  beforeEach(() => {
    service = new JsonDiffService();
  });

  describe('compare', () => {
    it('should detect added properties', () => {
      const left = { name: 'John' };
      const right = { name: 'John', age: 30 };

      const result = service.compare(left, right);

      expect(result.added).toEqual([{ path: 'age', value: 30 }]);
    });

    it('should ignore key order when option is set', () => {
      const left = { a: 1, b: 2 };
      const right = { b: 2, a: 1 };

      const result = service.compare(left, right, { ignoreKeyOrder: true });

      expect(result.added).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
    });
  });
});
```

### 10.2 Integration Testing

**Framework**: Playwright or Cypress

**Critical Paths**:
1. JSON diff with valid inputs → displays diff
2. Text diff with large file → uses Web Worker
3. JSON to Excel → downloads file
4. Excel to JSON → displays parsed data

**Example**:
```typescript
// e2e/json-diff.spec.ts
test('should compare two JSON objects and display diff', async ({ page }) => {
  await page.goto('/json-diff');

  await page.locator('.left-editor').fill('{"name":"John","age":30}');
  await page.locator('.right-editor').fill('{"name":"John","age":31}');

  await page.click('button:has-text("Compare")');

  await expect(page.locator('.diff-result')).toContainText('age: 30 → 31');
});
```

### 10.3 Performance Testing

**Tool**: Lighthouse CI

**Thresholds**:
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "interactive": ["error", { "maxNumericValue": 3500 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

---

## 11. Accessibility & Internationalization

### 11.1 Accessibility (WCAG 2.1 AA)

**Keyboard Navigation**:
- All features accessible via keyboard
- Focus indicators visible
- Skip-to-content links

**Screen Reader Support**:
```html
<button
  mat-raised-button
  aria-label="Compare JSON inputs and display differences"
  [attr.aria-busy]="isProcessing()"
>
  Compare
</button>

<div role="region" aria-live="polite" aria-label="Diff results">
  <app-diff-viewer [diffResult]="result()" />
</div>
```

**Color Contrast**: All text meets 4.5:1 ratio minimum

**Testing**: Automated with axe-core, manual with NVDA/JAWS

### 11.2 Internationalization (i18n)

**Framework**: Angular i18n (built-in)

**Supported Languages** (Phase 2):
- English (default)
- German
- French
- Dutch
- Spanish

**Implementation**:
```html
<h1 i18n="@@jsonDiffTitle">JSON Diff Tool</h1>
<button i18n="@@compareButton">Compare</button>
```

**Build for multiple locales**:
```bash
ng build --configuration production --localize
```

---

## 12. Monitoring & Analytics

### 12.1 Error Tracking

**Tool**: Sentry (self-hosted or cloud)

```typescript
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: environment.sentryDsn,
  environment: environment.production ? 'production' : 'development',
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Scrub sensitive data
    if (event.request?.data) {
      delete event.request.data;
    }
    return event;
  }
});
```

### 12.2 Usage Analytics

**Tool**: Plausible Analytics (privacy-friendly)

**Tracked Events**:
- Page views
- Feature usage (diff performed, file converted)
- Error occurrences
- Performance metrics (custom)

**No PII Collected**: Anonymous aggregate statistics only

---

## 13. Future Scalability

### 13.1 Planned Enhancements

**Phase 2** (Post-MVP):
- XML diff support
- YAML diff support
- CSV to JSON conversion
- Diff history (IndexedDB persistence)
- Share diff via URL (base64 encoded)
- Dark/Light theme customization
- Keyboard shortcuts

**Phase 3**:
- Collaborative diff (WebRTC peer-to-peer)
- Diff API generation (export as code)
- Browser extension version
- VS Code extension

### 13.2 Architecture Extensibility

**Plugin System** (future):
```typescript
interface DiffPlugin {
  name: string;
  supports(left: any, right: any): boolean;
  diff(left: any, right: any): DiffResult;
}

class PluginRegistry {
  private plugins: DiffPlugin[] = [];

  register(plugin: DiffPlugin): void {
    this.plugins.push(plugin);
  }

  findPlugin(left: any, right: any): DiffPlugin | null {
    return this.plugins.find(p => p.supports(left, right)) ?? null;
  }
}
```

---

## Appendix A: Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "^21.0.2",
    "@angular/cdk": "^21.0.2",
    "@angular/common": "^21.0.2",
    "@angular/compiler": "^21.0.2",
    "@angular/core": "^21.0.2",
    "@angular/forms": "^21.0.2",
    "@angular/material": "^21.0.2",
    "@angular/platform-browser": "^21.0.2",
    "@angular/platform-browser-dynamic": "^21.0.2",
    "@angular/platform-server": "^21.0.2",
    "@angular/router": "^21.0.2",
    "@angular/ssr": "^21.0.2",
    "@monaco-editor/angular": "^1.0.0",
    "diff-match-patch": "^1.0.5",
    "express": "^4.18.2",
    "monaco-editor": "^0.50.0",
    "rxjs": "^7.8.1",
    "tslib": "^2.7.0",
    "xlsx": "^0.18.5",
    "zone.js": "^0.15.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^21.0.2",
    "@angular/cli": "^21.0.2",
    "@angular/compiler-cli": "^21.0.2",
    "@types/diff-match-patch": "^1.0.36",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "typescript": "~5.6.3",
    "jest": "^29.7.0",
    "@playwright/test": "^1.48.0",
    "eslint": "^9.14.0"
  }
}
```

**Note**: `@angular/ssr` and `@angular/platform-server` are required for SSG prerendering, but the Express server is only used at build time (not runtime). The final deployment is still pure static files.

---

## Appendix B: Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 120+ | Full support |
| Firefox | 120+ | Full support |
| Safari | 17+ | Web Worker tested |
| Edge | 120+ | Full support |
| Opera | 105+ | Full support |

**Polyfills**: Minimal (only for legacy browsers via differential loading)

---

## Appendix C: Performance Budget

| Metric | Target | Max |
|--------|--------|-----|
| First Contentful Paint | 1.5s | 2s |
| Largest Contentful Paint | 2.5s | 3s |
| Time to Interactive | 3s | 4s |
| Total Blocking Time | 200ms | 300ms |
| Cumulative Layout Shift | 0.05 | 0.1 |
| Initial Bundle (gzip) | 150KB | 200KB |
| Monaco Bundle (lazy) | 800KB | 1MB |

---

## Appendix D: Quick Reference - SSG Decision Summary

### The Question
"Should I use SPA or SSR for a backendless diff tool that needs to be shareable on social media?"

### The Answer
**Neither! Use SSG (Static Site Generation)**

### Why Not Pure SPA?
```
❌ Problem: When you share diff.netlify.app on LinkedIn/Slack/Twitter
          Social crawler sees: <div id="app"></div>
          Result: No preview, no description, just blank card
```

### Why Not SSR?
```
❌ Problem: SSR = Server-Side Rendering = Node.js server running 24/7
          Requirements: Backend infrastructure, hosting costs, server maintenance
          Conflicts with: "No backend" requirement
```

### Why SSG? ✅
```
✅ SSG = Static Site Generation
   Build time: Angular prerenders HTML with full content
   Deploy: Static files to Netlify/Vercel (like a SPA)
   Runtime: Works exactly like a SPA (fast, client-side)
   Social: Crawlers see actual HTML with meta tags
   Cost: $0 (static hosting is free)
```

### Implementation Command
```bash
# 1. Add SSG support
ng add @angular/ssr

# 2. Enable prerendering in angular.json
"prerender": true,
"prerenderRoutes": ["/", "/json-diff", "/text-diff", "/converter"]

# 3. Build
npm run build

# 4. Deploy dist/browser/ folder to Netlify/Vercel
# Done! You have SSG with SPA performance + rich social previews
```

### What You Get
| Feature | Pure SPA | SSR | SSG (Our Choice) |
|---------|----------|-----|------------------|
| Fast load | ✅ | ✅ | ✅ |
| No backend needed | ✅ | ❌ | ✅ |
| Rich social previews | ❌ | ✅ | ✅ |
| Client-side processing | ✅ | ✅ | ✅ |
| Free hosting | ✅ | ❌ | ✅ |
| SPA after hydration | ✅ | ✅ | ✅ |

### Visual Flow
```
User shares diff.netlify.app on LinkedIn
              ↓
LinkedIn crawler fetches page
              ↓
Gets prerendered HTML with:
  <meta property="og:title" content="Diff & Convert Toolbox">
  <meta property="og:description" content="Free JSON/Text diff...">
  <meta property="og:image" content="preview.png">
              ↓
Shows rich preview card ✅

User clicks link → loads page
              ↓
Browser gets prerendered HTML (instant content!)
              ↓
JavaScript hydrates (adds interactivity)
              ↓
From now on, behaves like pure SPA ✅
```

### Key Takeaway
**SSG is not SSR**. SSG gives you SEO/social benefits at BUILD time, not runtime. Zero server needed.

---

**Document Version**: 1.0
**Next Review**: Post-MVP Launch
**Maintained By**: Engineering Team

