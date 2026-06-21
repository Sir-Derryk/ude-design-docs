# Integration and Artifact Verification Tests Specification

This document provides a comprehensive, centralized specification of the **12 specialized post-build integration and artifact verification tests** of the **Universal Documentation Engine (UDE)**. These tests operate at the integration, semantic, and artifact validation levels to ensure 100% correctness of compiled documentation without testing raw internal code logic.

---

## 📊 Summary of Verification Suites

| Test Suite / Tool | Purpose & Scope | Implementation Status | Verified Functionality Status | Primary Script(s) / Traced Req |
| :--- | :--- | :--- | :--- | :--- |
| **1. Golden Master Regression** | Verifies parsing and rendering consistency against portable baselines. | **Implemented** | **Already Implemented** (Parser & Renderers) | [run_regression_tests.py](../../../Tests/run_regression_tests.py) <br/> `REQ-FUN-48` |
| **2. Docomatic Alignment** | Ensures semantic and ToC alignment with legacy Docomatic outputs. | **Implemented** | **Already Implemented** (ToC & Structure Mapping) | [test_docomatic_alignment.py](../../../engine/tests/test_docomatic_alignment.py) <br/> `REQ-FUN-49` |
| **3. Page Integrity Verifier** | Ensures compiled pages physically exist on disk and contain correct heading signatures. | **Implemented** | **Already Implemented** (HTML Page Layouts) | [verify_pages.py](../../../Tests/verify_pages.py) <br/> `REQ-FUN-31`, `REQ-FUN-32` |
| **4. Post-Build Link Checker** | Crawls generated HTML to validate local pathways and external URLs. | **Implemented** | **Already Implemented** (Routing & Delimiter Layouts) | [check_links.py](../../../Tests/check_links.py) <br/> `REQ-FUN-31` |
| **5. Incremental Build Integrity** | Validates that changes to source files write only the affected compiled assets. | *Planned* <br/> (Covered by Unit Tests) | **Already Implemented** (`BuildCacheManager`) | `test_incremental_build.py` (Planned) <br/> `REQ-FUN-29`, `TSK-DAT-03` |
| **6. Multi-Language Cross-Link Resolver** | Verifies cross-reference resolution for mixed-language APIs (C++, C#, Python). | **Implemented** <br/> (Bundled in Link Checker) | **Already Implemented** (Polymorphic Delimiters) | [check_links.py](../../../Tests/check_links.py) <br/> `REQ-FUN-31`, `TSK-RND-09` |
| **7. RAG-Friendly Export Schema Validator** | Validates structure, metadata coverage, and schema compliance of exported JSON datasets. | *Planned* <br/> (Future Phase v2.0+) | **Already Implemented** (Pydantic IR Schema & Gzip Storage) | `test_rag_schema.py` (Planned) <br/> `REQ-FUN-05`, `REQ-BUS-04` |
| **8. Robustness against Doxygen Versions** | Runs parser over pre-defined XML schemas from various Doxygen releases to ensure compatibility. | *Planned* <br/> (Future Phase v2.0+) | *Planned* (Cross-Version Parser — Phase v2.0+) | `test_doxygen_compatibility.py` (Planned) <br/> `REQ-FUN-19`, `TSK-PAR-02` |
| **9. API Coverage Audit** | Analyzes the ratio of documented code entities and alerts on undocumented structures. | *Planned* | **Already Implemented** (Docstring Extraction & IR Metadata) | `test_api_coverage.py` (Planned) <br/> `REQ-FUN-48` |
| **10. CSS Visual Regression** | Uses headless rendering to perform screenshot pixel-diff checks on page templates. | *Planned* | **Already Implemented** (Template HTML & CSS Compilation) | `test_visual_regression.py` (Planned) |
| **11. Search Index Validity** | Validates that compiled search engine index JSON keys match physical page anchors. | *Planned* | **Already Implemented** (Search Engine Indexing) | `test_search_index.py` (Planned) <br/> `REQ-FUN-31` |
| **12. Wrapper Boundary Integrity** | Verifies parameter mapping consistency across multi-language API wrappers (SWIG/JNI). | *Planned* | **Already Implemented** (SWIG Wrappers & Core Parsing) | `test_boundary_integrity.py` (Planned) <br/> `TSK-RND-09` |

> [!IMPORTANT]
> **Strict Template Existence Policy**: Under the strict pipeline validation design, if physical layout templates are missing or corrupted on disk, the compilation process must explicitly fail and crash with a `RendererError` instead of reverting to hot-reload inline fallbacks. This ensures visual regressions are caught immediately.

---

## 🔍 Detailed Specifications

### 📦 1. Golden Master Regression Testing
This suite prevents behavioral drift in the parser and rendering components. It maintains and compares output state snapshots.
*   **Workflow**:
    1. Developers run [prepare_baseline.py](../../../Tests/prepare_baseline.py) to freeze the state of Doxygen XML parsing, Pydantic IR catalogs (`.json.gz`), rendered standalone HTML, and Hugo Markdown.
    2. During continuous integration, [run_regression_tests.py](../../../Tests/run_regression_tests.py) regenerates these outputs on-the-fly and runs a multi-stage comparison (JSON structure match and directory diffing).
*   **Language Feasibility Matrix**:
    *   **Current Status**: Implemented in **Python** ([prepare_baseline.py](../../../Tests/prepare_baseline.py) & [run_regression_tests.py](../../../Tests/run_regression_tests.py))
    *   **Easy**: **Python** (native serialization of Pydantic JSON schemas, folder comparison utilities without compilation overhead).
    *   **Medium**: **C#, Java** (robust built-in directory scanning and JSON support, but require compiling separate verification utilities).
    *   **Hard**: **Delphi (Object Pascal)** (requires custom integration of external JSON parser frameworks).
    *   **Extremely Hard**: **C++** (requires tedious cross-platform linking of JSON libraries, directory diffing algorithms, and compilation).
*   **Key Files**:
    *   [Tests/prepare_baseline.py](../../../Tests/prepare_baseline.py)
    *   [Tests/run_regression_tests.py](../../../Tests/run_regression_tests.py)

---

### 🧬 2. Docomatic Semantic Alignment & Difference Tracking
This suite verifies that the newly built UDE output matches the exact semantic contents and structural hierarchy of legacy Docomatic documentation, regardless of visual differences.
*   **Workflow**:
    1. Automatically extracts legacy TOC sidebar configurations from Docomatic's `contents.html`.
    2. Recursively strips layouts, styles, and empty blocks, comparing text blocks.
    3. Handles known layout differences via the `AlignmentAllowances` database.
    4. Automatically writes new discrepancies into `difference_mock_sdk_{lang}.json` and enforces CI blocks under strict mode.
*   **Language Feasibility Matrix**:
    *   **Current Status**: Implemented in **Python** ([test_docomatic_alignment.py](../../../engine/tests/test_docomatic_alignment.py))
    *   **Easy**: **Python** (highly recommended due to specialized HTML parsing libraries like BeautifulSoup/lxml).
    *   **Medium**: **C#, Java** (supported by HTML parsers like HtmlAgilityPack or JSoup, but strict static typing makes the dynamic alignment mapping rigid).
    *   **Hard**: **Delphi (Object Pascal)** (parsing unstructured HTML and hierarchical ToCs without robust modern HTML-DOM engines is labor-intensive).
    *   **Extremely Hard**: **C++** (practically unfeasible due to absence of standard high-level HTML-DOM engines, resulting in high implementation overhead).
*   **Key Files**:
    *   [engine/tests/test_docomatic_alignment.py](../../../engine/tests/test_docomatic_alignment.py)

---

### 📁 3. Compiled Pages Integrity Verifier
This validator performs a physical sanity check on compiled static pages on disk.
*   **Workflow**:
    1. Scans source Markdown directories in `user-docs`.
    2. Builds a dictionary of expected target routes and page heading signatures.
    3. Traverses compiled directory structures to verify that every expected route corresponds to a compiled file (e.g. `index.html`).
    4. Asserts that the physical HTML files contain the exact page heading signature.
*   **Language Feasibility Matrix**:
    *   **Current Status**: Implemented in **Python** ([verify_pages.py](../../../Tests/verify_pages.py))
    *   **Easy**: **Python** (native directory walk and lightweight regex heading verification).
    *   **Medium**: **C#, Java, Delphi (Object Pascal), Python** (all support quick file scanning and directory routing natively with negligible boilerplate).
    *   **Hard**: **C++** (filesystem `<filesystem>` operations are verbose and regex matching requires extra boilerplate).
*   **Key Files**:
    *   [Tests/verify_pages.py](../../../Tests/verify_pages.py)

---

### 🌐 4. Post-Build Link Validation & Cross-Link Resolution
This crawling tool ensures zero broken navigation links exist in the published portal, verifying language-specific entity delimiters and layouts.
*   **Workflow**:
    1. Scans all generated HTML files in the output directory.
    2. Parses anchor tags (`<a href="...">`) using a robust parser class.
    3. Resolves local path links to physical disk locations relative to the output root.
    4. Validates C++, C#, Java, and Python delimiter layouts (e.g. namespace resolution via `::` vs `.`).
    5. Performs real-world concurrent network requests (utilizing HTTP `HEAD` with dynamic `GET` fallbacks) for external web links.
*   **Language Feasibility Matrix**:
    *   **Current Status**: Implemented in **Python** ([check_links.py](../../../Tests/check_links.py))
    *   **Easy**: **Python** (built-in concurrent networking with requests/aiohttp, making URL verification highly performant).
    *   **Medium**: **C#, Java, Python** (easy HTTP/HTTPS network clients and standard async processing).
    *   **Hard**: **Delphi (Object Pascal)** (asynchronous concurrent sockets require tedious configuration using Indy or WinINet frameworks).
    *   **Extremely Hard**: **C++** (building a multi-threaded, SSL-enabled asynchronous web crawler is extremely complex and bloating).
*   **Key Files**:
    *   [Tests/check_links.py](../../../Tests/check_links.py)

---

### 🔄 5. Incremental Build Integrity
This suite validates the correctness of the two-level build cache (`BuildCacheManager`), ensuring only modified files trigger file writing.
*   **Workflow**:
    1. Compiles a full project reference catalog, tracking `mtime` and SHA-256 signatures of all output files.
    2. Modifies a single source entity (XML file) and triggers an incremental compilation.
    3. Verifies that only the changed entity's page and TOC index file are updated, and other files remain untouched.
*   **Language Feasibility Matrix**:
    *   **Current Status**: *Planned* (Core caching logic already implemented in Python under `BuildCacheManager`)
    *   **Easy**: **Python** (integrated directly into the compiler's build pipeline).
    *   **Medium**: **C#, Java** (excellent built-in libraries for SHA-256 hashing and directory mapping).
    *   **Hard**: **Delphi (Object Pascal)** (requires custom wrapping of system crypto APIs for secure file hashing).
    *   **Extremely Hard**: **C++** (highly complex platform-specific calls to monitor file metadata/timestamps cross-platform).
*   **Traced Tasks**: `TSK-DAT-03` (Build Cache Manager)

---

### 🧬 6. Multi-Language Cross-Link Resolver
This test tracks routing accuracy across cross-referenced API frameworks utilizing distinct language scopes.
*   **Workflow**:
    1. Parsers resolve polymorphic entities (e.g. SWIG-generated Python wrappers referencing underlying C++ core classes).
    2. The Link Checker scrolls the compiled assets, verifying that references dynamically mapped between C# or Python scopes correctly navigate back to C++ source modules.
*   **Language Feasibility Matrix**:
    *   **Current Status**: Implemented in **Python** (bundled inside [check_links.py](../../../Tests/check_links.py))
    *   **Easy**: **Python** (highly flexible dynamic type mapping in memory across different programming languages).
    *   **Medium**: **C#, Java** (strict static typing requires implementing custom type adapters).
    *   **Hard**: **Delphi (Object Pascal)** (parsing module namespaces and custom units is tedious).
    *   **Extremely Hard**: **C++** (requires managing complex dynamic cross-language pointer and type reference graphs).
*   **Traced Tasks**: `TSK-RND-09` (Signature strategizer), `Tests/check_links.py`

---

### 🤖 7. RAG-Friendly Export Schema Validator
Ensures the machine-readable outputs generated for enterprise AI systems are mathematically correct and structured according to standard contracts.
*   **Workflow**:
    1. Triggers compilation of structured data outputs (`--format json_rag`).
    2. Reads the output JSON files and runs validation against strict JSON/Pydantic schemas.
    3. Asserts the presence of mandatory metadata keys (`entity_type`, `fully_qualified_name`, `signature_hash`, `line_range`, `dependencies`).
*   **Language Feasibility Matrix**:
    *   **Current Status**: *Planned* (Core validation models defined in Python under `ude/models.py`)
    *   **Easy**: **Python** (native schema enforcement via built-in Pydantic validators).
    *   **Medium**: **C#, Java** (robust JSON Schema verification libraries).
    *   **Hard**: **Delphi (Object Pascal)** (lack of built-in data contract schema validators).
    *   **Extremely Hard**: **C++** (extremely difficult to enforce dynamic schema validation without native reflection features).
*   **Traced Requirements**: `REQ-FUN-05`, `REQ-BUS-04` (RAG Hierarchical Export)

---

### 🧪 8. Robustness against Doxygen Versions
Verifies backward-compatible parsing against varied Doxygen XML dialects produced by different compiler releases.
*   **Workflow**:
    1. Runs the UDE parser engine over identical source modules pre-compiled via distinct Doxygen versions (e.g. `1.9.x`, `1.10.x`, `1.12.x`).
    2. Asserts that the resulting `ProjectCatalog` model instances are structurally identical, preventing breaking parsing regressions.
*   **Language Feasibility Matrix**:
    *   **Current Status**: *Planned*
    *   **Easy**: **Python** (highly robust XML parsing and XPath queries using lxml/xml.etree).
    *   **Medium**: **C#, Java** (excellent XML/XPath querying using LINQ-to-XML or JSoup).
    *   **Hard**: **Delphi (Object Pascal)** (native XML libraries have verbose syntax and lack modern XPath query optimization).
    *   **Extremely Hard**: **C++** (low-level parsing of nested XML trees requires substantial boilerplate and error handling).
*   **Traced Requirements**: `REQ-FUN-19`, `TSK-PAR-02`

---

### 📊 9. API Coverage Audit & Undocumented Entities Alert
Analyzes the ratio of documented code entities and alerts in continuous integration pipelines on undocumented structures to guarantee comprehensive reference coverage.
*   **Workflow**:
    1. Parses the compiled database IR (`.json.gz`) to cross-reference total entity definitions against entities containing non-empty docstrings.
    2. Computes the final API documentation coverage ratio (%).
    3. Triggers build errors or alerts in CI if coverage drops below the strict threshold (e.g. 90%).
*   **Language Feasibility Matrix**:
    *   **Current Status**: *Planned* (Verified Functionality Status: **Already Implemented** via Docstring Extraction & IR Metadata)
    *   **Easy**: **Python** (parsing generated JSON catalogs, performing dynamic ratio calculation, and printing reports).
    *   **Medium**: **C#, Java** (strong collections support for grouping and counting, easy HTML output writing).
    *   **Hard**: **Delphi (Object Pascal)** (tedious JSON processing and custom data sorting).
    *   **Extremely Hard**: **C++** (demands excessive boilerplate to generate report layouts and perform file processing).
*   **Traced Requirements**: `REQ-FUN-48`

---

### 🖼️ 10. CSS Visual Regression & Screenshot Diff Tester
Uses headless rendering engines to perform automated screenshot pixel-diff checks on page templates to protect responsive designs from regressions.
*   **Workflow**:
    1. Launches a headless web browser (e.g. Playwright or Selenium) to render local offline HTML pages.
    2. Captures high-resolution PNG screenshots of major layout views (namespaces, structures, collapsible sidebars).
    3. Runs a pixel-by-pixel comparisons (image subtraction) against pre-defined visual baseline files.
    4. Automatically flags and exports visual layouts shifts exceeding 0.1% threshold.
*   **Language Feasibility Matrix**:
    *   **Current Status**: *Planned* (Verified Functionality Status: **Already Implemented** via Template HTML & CSS Compilation)
    *   **Easy**: **Python** (native integration with Playwright or Selenium, immediate screenshot comparison using Pillow/OpenCV).
    *   **Medium**: **C#, Java** (strong bindings to Playwright/Selenium, robust image manipulation libraries).
    *   **Hard / Extremely Hard**: **Delphi (Object Pascal), C++** (extremely difficult to integrate headless rendering engines and image diffing tools without bloating external binaries).

---

### 🔍 11. Search Index Integrity & Anchor Verifier
Validates that compiled search engine index JSON keys match physical page anchors to prevent dead ends in live searching.
*   **Workflow**:
    1. Reads compiled searchable indexes (`search.json` assets used in VitePress/Hugo portals).
    2. Verifies that each logical item's URL structure maps directly to a generated static HTML file on disk.
    3. For anchor references (e.g., `#ClassEntity`), parses target HTML files using DOM selectors to guarantee that elements with matching `id` or `name` attributes actually exist.
*   **Language Feasibility Matrix**:
    *   **Current Status**: *Planned* (Indexing compiler engine already implemented)
    *   **Easy**: **Python** (fast JSON loading, simple HTML element parsing via lxml).
    *   **Medium**: **C#, Java** (easy JSON schema validation and file structure checking).
    *   **Hard**: **Delphi (Object Pascal)** (tedious DOM parsing and routing checking).
    *   **Extremely Hard**: **C++** (demands excessive code for JSON/HTML processing cross-platform).
*   **Traced Requirements**: `REQ-FUN-31`

---

### 🌉 12. Wrapper Boundary Parameter Integrity
Verifies parameter mapping consistency across multi-language API wrappers (SWIG/JNI) to avoid documentation desynchronization.
*   **Workflow**:
    1. Dynamically parses C++ core headers alongside generated target language wrappers (Python, C#, Java, or Delphi modules).
    2. Correlates parameter lists, data types, and default values across boundaries.
    3. Triggers alerts on any parameters that are renamed or missed in translation mapping tables.
*   **Language Feasibility Matrix**:
    *   **Current Status**: *Planned* (Verified Functionality Status: **Already Implemented** via SWIG Wrappers & Core Parsing)
    *   **Easy**: **Python** (flexible runtime class introspection and C++ header parsing).
    *   **Medium**: **C#, Java** (reflection and meta-programming support for boundary parameter checks).
    *   **Hard**: **Delphi (Object Pascal)** (inspecting flat C-style DLL interfaces requires manual schema declarations).
    *   **Extremely Hard**: **C++** (demands extensive parsing of complex header ASTs to match dynamic wrapping types).
*   **Traced Tasks**: `TSK-RND-09` (Signature strategizer)
