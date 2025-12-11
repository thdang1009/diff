# Angular 18 Project Structure - Diff Toolbox

This document describes the complete Angular 18 project structure created for the Diff & Convert Toolbox application.

## Overview

This is an Angular 18 standalone component application with SSR/SSG support, configured for static site generation and prerendering. All components use the new standalone API, not NgModules.

## Directory Structure

```
diff-toolbox/
├── .editorconfig                    # Editor configuration for consistent code style
├── angular.json                     # Angular workspace configuration
├── tsconfig.json                    # Base TypeScript configuration
├── tsconfig.app.json               # TypeScript config for application
├── tsconfig.spec.json              # TypeScript config for tests
├── tsconfig.server.json            # TypeScript config for SSR server
├── server.ts                        # Express server for SSR (build-time only)
├── package.json                     # Project dependencies
├── package-lock.json               # Locked dependency versions
│
├── src/
│   ├── index.html                  # Main HTML file with meta tags
│   ├── main.ts                     # Browser application bootstrap
│   ├── main.server.ts              # Server application bootstrap
│   ├── styles.scss                 # Global styles
│   ├── favicon.ico                 # Favicon (placeholder)
│   │
│   ├── app/
│   │   ├── app.component.ts        # Root standalone component
│   │   ├── app.component.html      # Root template with header/footer
│   │   ├── app.component.scss      # Root styles
│   │   ├── app.config.ts           # Application configuration (browser)
│   │   ├── app.config.server.ts    # Application configuration (server)
│   │   ├── app.routes.ts           # Routing configuration
│   │   ├── app.routes.server.ts    # Server routes for prerendering
│   │   │
│   │   └── features/               # Feature modules (lazy-loaded)
│   │       ├── json-diff/
│   │       │   ├── json-diff.component.ts
│   │       │   ├── json-diff.component.html
│   │       │   └── json-diff.component.scss
│   │       │
│   │       ├── text-diff/
│   │       │   ├── text-diff.component.ts
│   │       │   ├── text-diff.component.html
│   │       │   └── text-diff.component.scss
│   │       │
│   │       └── converter/
│   │           ├── converter.component.ts
│   │           ├── converter.component.html
│   │           └── converter.component.scss
│   │
│   ├── environments/
│   │   ├── environment.ts          # Development environment config
│   │   └── environment.prod.ts     # Production environment config
│   │
│   └── assets/                     # Static assets (empty for now)
│
├── docs/                           # Documentation
│   ├── PRD.md                      # Product Requirements Document
│   └── ENGINEERING.md              # Engineering Design Document
│
└── node_modules/                   # Dependencies (installed)
```

## Key Configuration Files

### angular.json

- **Builder**: `@angular-devkit/build-angular:application` (Angular 18+ application builder)
- **SSR/SSG**: Configured with `prerender: true` and server entry point
- **Standalone Components**: All schematics configured to generate standalone components
- **Styling**: SCSS with Angular Material prebuilt theme
- **Optimization**: Production build with budgets, minification, and tree-shaking
- **Lazy Loading**: Feature routes configured for code splitting

### tsconfig.json

- **Strict Mode**: Enabled for type safety
- **Target**: ES2022 for modern browser support
- **Module Resolution**: Bundler (Angular 18 default)
- **Path Mappings**: Configured for `@core/*`, `@shared/*`, `@features/*`, `@environments/*`
- **Experimental Decorators**: Enabled for Angular decorators

### package.json Scripts

- `ng`: Angular CLI
- `start`: Development server (`ng serve`)
- `build`: Production build with SSG (`ng build`)
- `watch`: Development build with watch mode
- `test`: Run unit tests
- `lint`: Run linter

## Application Architecture

### Standalone Components

All components use Angular 18's standalone API:

```typescript
@Component({
  selector: 'app-json-diff',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './json-diff.component.html',
  styleUrl: './json-diff.component.scss'
})
export class JsonDiffComponent { }
```

### Routing

- **Lazy Loading**: All feature routes use `loadComponent()` for code splitting
- **Route Titles**: SEO-friendly titles configured per route
- **Default Route**: Redirects to `/json-diff`

### SSR/SSG Configuration

The application is configured for Static Site Generation (SSG):

1. **Build Time**: Angular prerenders all routes to static HTML
2. **Runtime**: Works as a pure SPA after JavaScript hydration
3. **SEO**: Full meta tags and Open Graph data in prerendered HTML
4. **No Backend**: Deploys as static files to CDN (Netlify/Vercel/GitHub Pages)

#### Prerendered Routes

- `/` (home - redirects to json-diff)
- `/json-diff`
- `/text-diff`
- `/converter`

### Meta Tags & SEO

Each feature component updates meta tags in `ngOnInit()`:

```typescript
ngOnInit(): void {
  this.titleService.setTitle('JSON Diff Tool - Compare JSON Structures | Diff Toolbox');
  this.meta.updateTag({
    name: 'description',
    content: 'Free JSON comparison tool...'
  });
  // Open Graph and Twitter Card tags
}
```

## Styling

### Global Styles (styles.scss)

- Material Design base styles
- Custom scrollbar styling
- Utility classes (margins, padding, text alignment)
- Responsive breakpoints
- Dark mode support via `prefers-color-scheme`
- Accessibility focus styles

### Component Styles

- Scoped SCSS per component
- BEM-like naming conventions
- Responsive design
- Dark mode variants

## Current Status

### ✅ Completed

- Angular 18 project structure
- Configuration files (angular.json, tsconfig.*)
- SSR/SSG setup
- Main application component with header/footer/navigation
- Three feature components (placeholders):
  - JSON Diff
  - Text Diff
  - Converter
- Environment configurations
- Global styles
- SEO meta tags in index.html
- Lazy-loaded routing
- .editorconfig for code consistency

### 🚧 To Be Implemented

The following need to be added in future development:

1. **Core Services** (src/app/core/services/)
   - Theme service (dark/light mode)
   - Analytics service
   - Error handler service

2. **Shared Components** (src/app/shared/components/)
   - Monaco editor wrapper
   - Diff viewer
   - File upload component
   - Copy button component

3. **Shared Utilities** (src/app/shared/utils/)
   - Download helper
   - Validation utilities
   - JSON parser utilities

4. **Feature Implementation**
   - JSON diff service and logic
   - Text diff service and logic
   - Excel/JSON converter service
   - Monaco editor integration
   - Web Workers for heavy processing

5. **Testing**
   - Unit tests (Jasmine/Karma)
   - E2E tests (Playwright/Cypress)
   - Test configuration

6. **Additional Assets**
   - Favicon (actual icon)
   - Preview images for social sharing
   - Logo assets

## Build & Deployment

### Development

```bash
npm start
# or
ng serve
```

Runs at `http://localhost:4200`

### Production Build

```bash
npm run build
# or
ng build --configuration production
```

Output: `dist/diff-toolbox/browser/` (static files ready for deployment)

### Deployment Targets

- **GitHub Pages**: Deploy `dist/diff-toolbox/browser/` folder
- **Netlify**: Connect repository, build command `npm run build`, publish directory `dist/diff-toolbox/browser`
- **Vercel**: Auto-detect Angular, same configuration

## TypeScript Path Mappings

The following path aliases are configured:

- `@core/*` → `src/app/core/*`
- `@shared/*` → `src/app/shared/*`
- `@features/*` → `src/app/features/*`
- `@environments/*` → `src/environments/*`

Usage example:
```typescript
import { environment } from '@environments/environment';
```

## Dependencies

### Core Angular Packages

- @angular/animations: ^18.2.0
- @angular/cdk: ^18.2.0
- @angular/common: ^18.2.0
- @angular/compiler: ^18.2.0
- @angular/core: ^18.2.0
- @angular/forms: ^18.2.0
- @angular/material: ^18.2.0
- @angular/platform-browser: ^18.2.0
- @angular/platform-server: ^18.2.0
- @angular/router: ^18.2.0
- @angular/ssr: ^18.2.0

### Libraries

- diff-match-patch: ^1.0.5 (text diff algorithm)
- monaco-editor: ^0.50.0 (code editor)
- ngx-monaco-editor-v2: ^18.0.2 (Angular Monaco wrapper)
- xlsx: ^0.18.5 (Excel processing)
- express: ^4.18.2 (SSR server)

### Dev Dependencies

- @angular-devkit/build-angular: ^18.2.0
- @angular/cli: ^18.2.0
- @angular/compiler-cli: ^18.2.0
- TypeScript: ~5.5.0

## Notes

1. **No NgModules**: This project uses standalone components exclusively
2. **SSG vs SSR**: Configured for SSG (static generation), not runtime SSR
3. **Privacy-First**: All processing client-side, no backend required
4. **Modern Angular**: Uses Angular 18 features (signals will be added in feature implementation)
5. **Performance**: Lazy loading configured for optimal bundle sizes

## Next Steps

1. Implement core services (theme, analytics, error handling)
2. Create shared components (Monaco wrapper, file upload, diff viewer)
3. Implement JSON diff feature with Monaco editor
4. Implement text diff feature with Web Worker support
5. Implement Excel/JSON converter
6. Add unit and E2E tests
7. Create actual favicon and preview images
8. Set up CI/CD pipeline (GitHub Actions)
9. Deploy to hosting platform

## References

- [Engineering Design Document](docs/ENGINEERING.md)
- [Product Requirements Document](docs/PRD.md)
- [Angular Documentation](https://angular.dev)
- [Angular Material](https://material.angular.io)
