# Diff & Convert Toolbox

> Free, fast, and secure client-side tools for JSON/Text comparison and Excel/JSON conversion

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-18.2-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)

---

## 🚀 Features

### 🔍 JSON Diff
- Structural JSON comparison with deep object analysis
- Ignore key order, whitespace, and array differences
- Monaco editor with syntax highlighting and IntelliSense
- Export diff results in multiple formats

### 📝 Text Diff
- Line-by-line text comparison with word-level granularity
- Split and unified view modes
- Web Worker support for large files (10,000+ lines)
- Syntax highlighting for code files

### 📊 Excel/JSON Converter
- Bi-directional conversion between JSON and Excel formats
- Support for XLSX, XLS, and CSV files
- Multiple sheet handling
- Large file support (10MB+)

---

## 🎯 Key Highlights

- ✅ **100% Client-Side Processing** - No data leaves your browser
- ✅ **Privacy-First** - GDPR compliant, no tracking, no cookies
- ✅ **Zero Backend** - Pure static site, no server costs
- ✅ **Fast & Modern** - Built with Angular 18 standalone components
- ✅ **Responsive** - Works on desktop, tablet, and mobile
- ✅ **Accessible** - WCAG 2.1 AA compliant
- ✅ **SEO Optimized** - Static Site Generation with rich meta tags

---

## 🛠️ Tech Stack

- **Framework**: Angular 18.2+ (Standalone Components)
- **Language**: TypeScript 5.5+
- **UI**: Angular Material
- **Code Editor**: Monaco Editor (VS Code engine)
- **Diff Engine**: diff-match-patch
- **Excel Processing**: SheetJS (xlsx)
- **Styling**: SCSS with Material Design 3
- **Build**: esbuild (via Angular CLI)
- **Deployment**: Static hosting (Netlify/Vercel/GitHub Pages)

---

## 📦 Installation

### Prerequisites
- Node.js 20.x or higher (LTS recommended)
- npm 10.x or higher

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/diff-toolbox.git
cd diff-toolbox

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:4200`

---

## 🚀 Quick Start

### Development

```bash
# Start dev server with hot reload
npm start

# Build with watch mode
npm run watch
```

### Production Build

```bash
# Build for production with SSG
npm run build

# Output will be in dist/diff-toolbox/browser/
```

### Testing

```bash
# Run unit tests
npm test

# Run linter
npm run lint
```

---

## 📁 Project Structure

```
diff-toolbox/
├── src/
│   ├── app/
│   │   ├── features/           # Lazy-loaded feature modules
│   │   │   ├── json-diff/
│   │   │   ├── text-diff/
│   │   │   └── converter/
│   │   ├── core/               # Singleton services (to be added)
│   │   ├── shared/             # Reusable components (to be added)
│   │   ├── app.component.*     # Root component
│   │   ├── app.config.*        # App configuration
│   │   └── app.routes.*        # Routing
│   ├── environments/           # Environment configs
│   ├── styles.scss            # Global styles
│   └── index.html             # HTML with SEO meta tags
├── docs/                      # Documentation
│   ├── PRD.md                # Product Requirements
│   └── ENGINEERING.md        # Engineering Design
├── angular.json              # Angular configuration
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies

```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed documentation.

---

## 🌐 Deployment

This application is pre-configured for static hosting with SSG (Static Site Generation).

### Deploy to Netlify

```bash
# Build command
npm run build

# Publish directory
dist/diff-toolbox/browser
```

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Deploy to Vercel

```bash
# Vercel will auto-detect Angular configuration
vercel
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Deploy to GitHub Pages

```bash
# Build
npm run build

# Deploy dist/diff-toolbox/browser/ folder
```

---

## 📖 Documentation

- **[Setup Complete Guide](SETUP_COMPLETE.md)** - Complete setup overview
- **[Project Structure](PROJECT_STRUCTURE.md)** - Detailed file structure
- **[Engineering Design](docs/ENGINEERING.md)** - Technical architecture
- **[Product Requirements](docs/PRD.md)** - Feature specifications

---

## 🏗️ Development Status

### ✅ Phase 1: Scaffolding (Complete)
- [x] Angular 18 project structure
- [x] Standalone components architecture
- [x] SSR/SSG configuration
- [x] Routing with lazy loading
- [x] Global styles and Material theme
- [x] SEO meta tags

### 🚧 Phase 2: Core Implementation (In Progress)
- [ ] Core services (theme, analytics, error handling)
- [ ] Shared components (Monaco wrapper, file upload, diff viewer)
- [ ] JSON diff feature with Monaco editor
- [ ] Text diff feature with Web Workers
- [ ] Excel/JSON converter with xlsx library

### 📋 Phase 3: Polish & Launch (Planned)
- [ ] Unit and E2E tests
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] CI/CD pipeline
- [ ] Production deployment

---

## 🤝 Contributing

Contributions are welcome! This project is designed to showcase modern Angular development practices.

### Development Guidelines

1. Use standalone components (no NgModules)
2. Follow TypeScript strict mode
3. Write unit tests for all services
4. Ensure WCAG 2.1 AA compliance
5. Use Angular Material components
6. Follow the existing code style (.editorconfig)

---

## 🔒 Privacy & Security

- **No Backend**: All processing happens in your browser
- **No Tracking**: No analytics cookies or user tracking
- **No Data Transmission**: Your files never leave your device
- **GDPR Compliant**: No personal data collection
- **Open Source**: Full transparency

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Angular Team** - Modern web framework
- **Google** - diff-match-patch algorithm
- **Microsoft** - Monaco Editor
- **SheetJS** - Excel processing library
- **Material Design** - UI components and design system

---

## 📧 Contact

- **GitHub**: [yourusername/diff-toolbox](https://github.com/yourusername/diff-toolbox)
- **Issues**: [Report a bug](https://github.com/yourusername/diff-toolbox/issues)
- **Discussions**: [Join the conversation](https://github.com/yourusername/diff-toolbox/discussions)

---

## 🎯 Roadmap

### Version 1.0 (MVP)
- JSON structural diff
- Text line-by-line diff
- JSON ↔ Excel conversion

### Version 1.1
- XML diff support
- YAML diff support
- CSV to JSON conversion
- Diff history (IndexedDB)

### Version 2.0
- Share diff via URL (base64 encoded)
- Dark/Light theme toggle
- Keyboard shortcuts
- Diff API code generation
- Browser extension

### Version 3.0
- Collaborative diff (WebRTC)
- VS Code extension
- CLI tool
- Plugin system

---

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ using Angular 18**

*Showcasing modern web development practices for the EU freelance market*
