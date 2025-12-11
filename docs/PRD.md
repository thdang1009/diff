### 1. Technology Choice

For a static, backendless web application with computationally intensive client-side tasks like diffing and file conversions (JSON/Excel), the key priority is a robust frontend framework and **client-side processing**.

* **Angular SSR (Server-Side Rendering)**: While Angular is a great choice, the "SSR" part is usually aimed at improving SEO and initial load performance for content-heavy sites. For a **tool** website where most of the work happens after the initial load and the content is user-generated (diff inputs, files), the benefits of SSR are less pronounced, and it adds complexity.
* **Recommendation: Angular (Latest Stable Version) with SPA/SSG**:
    * **Angular v21.0.2** (latest stable as of search results) is an excellent, enterprise-grade framework.
    * Since your app is **backendless and static**, you should focus on building it as a **Single Page Application (SPA)** or generating it as a **Static Site (SSG)** (which Angular fully supports now, like with its new Standalone components). This perfectly suits free static hosting (GitHub Pages, Netlify, Vercel).
    * **Rationale**: Angular provides powerful tooling, component reusability, and a structured way to handle complex UI logic (like diffing and file conversions) entirely on the client side using TypeScript and relevant npm libraries.

---

## 2. 📝 Product Requirements Document (PRD)

### 2.1. Project Overview

| Field | Value |
| :--- | :--- |
| **Product Name** | Diff & Convert Toolbox |
| **Product Type** | Free, Backendless Static Web Application |
| **Target Audience** | Developers, QA Engineers, Data Analysts, and Users who need quick JSON/Text comparison and file format conversion. |
| **Project Goal** | Provide a fast, reliable, and secure client-side tool for common diff and data conversion tasks. |
| **Technology Stack** | **Frontend:** Angular v21.x (Standalone Components), TypeScript, HTML, SCSS. **Deployment:** Static Hosting (e.g., GitHub Pages). |

### 2.2. Feature Requirements

The application will feature a clear, tabbed interface with three main tools:

#### A. Tab 1: JSON Diff Tool

| ID | Requirement | Description |
| :--- | :--- | :--- |
| **F-JD-1.0** | **Input** | Two side-by-side text areas for user to paste JSON (or plain text) content. |
| **F-JD-2.0** | **Diff Logic** | Compare the two inputs and display a visual, color-coded difference (e.g., green for additions, red for deletions, yellow/blue for changes). |
| **F-JD-3.0** | **Output/View** | Display the diff in a format that is easily readable and collapsible (e.g., line-by-line or side-by-side structure). Include options to ignore white-space or key order. |
| **F-JD-4.0** | **Validation** | Automatically validate if the pasted content is valid JSON. Show an error if invalid, but allow comparison as plain text if validation fails. |

#### B. Tab 2: Text Diff Tool

| ID | Requirement | Description | |
| :--- | :--- | :--- | :--- |
| **F-TD-1.0** | **Input** | Two side-by-side text areas for user to paste plain text content. |
| **F-TD-2.0** | **Diff Logic** | Compare the two inputs on a line-by-line basis, highlighting differences word-by-word within lines. |
| **F-TD-3.0** | **Output/View** | Display the diff using a standard unified or split view (similar to GitHub diffs). |
| **F-TD-4.0** | **Options** | Toggle for line wrapping and ignoring case sensitivity. |

#### C. Tab 3: JSON/Excel Conversion Tools (Combined)

This tab will contain two sub-sections or smaller tabs for the conversion functionalities.

| ID | Requirement | Description |
| :--- | :--- | :--- |
| **F-C-1.0** | **JSON to Excel (Download)** | Input area for JSON data. A button to trigger conversion. Should handle an array of objects for multi-row data. Output must be a downloadable `.xlsx` file. |
| **F-C-2.0** | **Excel to JSON (Display)** | An upload button/area for a `.xlsx` file (single sheet is sufficient). A button to trigger conversion. Output must be displayed as formatted JSON in a text area. |
| **F-C-3.0** | **Error Handling** | Display clear messages for file upload errors, invalid JSON structure, or issues during conversion. |
| **F-C-4.0** | **Client-Side** | All file processing (reading/writing Excel data, parsing/stringifying JSON) must occur in the browser (backendless). |

### 2.3. User Experience (UX) Requirements

| ID | Requirement | Description |
| :--- | :--- | :--- |
| **UX-1.0** | **Navigation** | Clean, tabbed navigation (e.g., using Angular Material Tabs) for easy switching between tools. |
| **UX-2.0** | **Performance** | Operations must be fast. Utilize Web Workers for heavy computations (like large diffs or file conversions) to prevent UI blocking. |
| **UX-3.0** | **Styling** | A clean, minimalist design with a responsive layout (mobile-friendly). Consider a dark/light mode toggle. |
| **UX-4.0** | **Monaco Editor** | Use an embedded editor (like a simplified version of the Monaco Editor/Code Mirror) for the text input/output areas to enhance syntax highlighting and readability for JSON/Text. |

---

## 3. 📅 Development Schedule (2 Days to 1 Week with AI/Cursor)

This schedule assumes development using an AI assistant like Cursor/GitHub Copilot for boilerplate, component generation, and initial logic implementation. The total time estimates range from an aggressive **4 days** to a more relaxed **7 days**, depending on the complexity of the diff/conversion libraries and styling requirements.

| Phase | Days | Task Breakdown (Focus on AI-Assisted Implementation) | Output/Goal |
| :--- | :--- | :--- | :--- |
| **Day 1** | **1 Day** | **Setup & Core Structure** | **Base Application Ready** |
| | | * **1.1 Setup:** Create new Angular v21 app (`ng new --standalone`), configure routing, install Angular Material for tabs. (AI-assisted setup). |
| | | * **1.2 Layout:** Implement the main shell component with the 3 tabs and basic routing. |
| | | * **1.3 Libs:** Install core libraries (e.g., a good diff library like `diff-match-patch` or `ngx-json-viewer`, and Excel libraries like `xlsx`). |
| **Day 2** | **1 Day** | **JSON & Text Diff Implementation** | **JSON/Text Diff Functional** |
| | | * **2.1 JSON Diff:** Implement the component logic using the diff library. Focus on parsing and displaying the visual diff result. (AI for boilerplate component/diff function). |
| | | * **2.2 Text Diff:** Implement the component logic. Reuse diff display utilities, adjusting for plain text comparison. |
| | | * **2.3 UX Refinement:** Integrate text editors (Monaco/Code Mirror) into the input fields for better UX. (AI for editor integration). |
| **Day 3** | **1 Day** | **Excel Conversion (JSON -> Excel)** | **JSON -> Excel Functional** |
| | | * **3.1 Component:** Create the Conversion Component and the JSON input UI. |
| | | * **3.2 Logic:** Implement JSON parsing and data structure mapping to Excel format using the `xlsx` library. Implement the file download mechanism. (AI for parsing/library usage examples). |
| | | * **3.3 Validation:** Add validation for input JSON format. |
| **Day 4** | **1 Day** | **Excel Conversion (Excel -> JSON)** | **Excel -> JSON Functional** |
| | | * **4.1 Logic:** Implement Excel file upload handler and read the file into a JavaScript array of objects. |
| | | * **4.2 Output:** Display the resulting array as pretty-printed JSON in the output area. |
| | | * **4.3 Error Handling:** Robustly handle different upload file types/errors. |
| **Day 5-7** | **3 Days** | **Testing, Polish, and Deployment** | **Product Ready for Launch** |
| | | * **5.1 Cross-Browser Testing:** Test all features (diffing, conversion, file I/O) on major browsers. |
| | | * **5.2 Performance & Edge Cases:** Optimize large file handling (e.g., using Web Workers if needed, which AI can help draft). Test edge cases like empty inputs, malformed files, and deeply nested JSON. |
| | | * **5.3 Deployment:** Finalize build configuration and deploy to static hosting (e.g., configure GitHub Pages/Netlify build actions). |

---