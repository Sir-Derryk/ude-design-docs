# Integration and Artifact Verification Tests Specification

This document provides a comprehensive, centralized specification of the **9 specialized post-build integration and artifact verification tests** of the **Universal Documentation Engine (UDE)**. These tests operate at the integration, semantic, and artifact validation levels to ensure 100% correctness of compiled documentation without testing raw internal code logic.

---

## 📊 Summary of Verification Suites

| Test Suite / Tool | Purpose & Scope | Implementation Status | Core Feature Status | Primary Script(s) / Traced Req |
| :--- | :--- | :--- | :--- | :--- |
| **1. Golden Master Regression** | Verifies parsing and rendering consistency against portable baselines. | **Implemented** | **Already Implemented** | [run_regression_tests.py](../../../Tests/run_regression_tests.py) <br/> `REQ-FUN-48` |
| **2. Docomatic Alignment** | Ensures semantic and ToC alignment with legacy Docomatic outputs. | **Implemented** | **Already Implemented** | [test_docomatic_alignment.py](../../../engine/tests/test_docomatic_alignment.py) <br/> `REQ-FUN-49` |
| **3. Page Integrity Verifier** | Ensures compiled pages physically exist on disk and contain correct heading signatures. | **Implemented** | **Already Implemented** | [verify_pages.py](../../../Tests/verify_pages.py) <br/> `REQ-FUN-31`, `REQ-FUN-32` |
| **4. Post-Build Link Checker** | Crawls generated HTML to validate local pathways and external URLs. | **Implemented** | **Already Implemented** | [check_links.py](../../../Tests/check_links.py) <br/> `REQ-FUN-31` |
| **5. Incremental Build Integrity** | Validates that changes to source files write only the affected compiled assets. | *Planned* <br/> (Covered by Unit Tests) | **Already Implemented** <br/> (`BuildCacheManager`) | `test_incremental_build.py` (Planned) <br/> `REQ-FUN-29`, `TSK-DAT-03` |
| **6. Multi-Language Cross-Link Resolver** | Verifies cross-reference resolution for mixed-language APIs (C++, C#, Python). | **Implemented** <br/> (Bundled in Link Checker) | **Already Implemented** <br/> (`check_links.py`) | [check_links.py](../../../Tests/check_links.py) <br/> `REQ-FUN-31`, `TSK-RND-09` |
| **7. RAG-Friendly Export Schema Validator** | Validates structure, metadata coverage, and schema compliance of exported JSON datasets. | *Planned* <br/> (Future Phase v2.0+) | *Planned* <br/> (Future Phase v2.0+) | `test_rag_schema.py` (Planned) <br/> `REQ-FUN-05`, `REQ-BUS-04` |
| **8. Template Hot-Reload Fallback** | Verifies fail-safe default inline rendering when physical template directories are missing. | *Planned* <br/> (Covered by Unit Tests) | **Already Implemented** <br/> (Backup fallback engine) | `test_fallback_renderer.py` (Planned) <br/> `REQ-FUN-33`, `TSK-RND-10` |
| **9. Robustness against Doxygen Versions** | Runs parser over pre-defined XML schemas from various Doxygen releases to ensure compatibility. | *Planned* <br/> (Future Phase v2.0+) | *Planned* <br/> (Future Phase v2.0+) | `test_doxygen_compatibility.py` (Planned) <br/> `REQ-FUN-19`, `TSK-PAR-02` |

---

## 🔍 Detailed Specifications

### 📦 1. Golden Master Regression Testing
This suite prevents behavioral drift in the parser and rendering components. It maintains and compares output state snapshots.
*   **Workflow**:
    1. Developers run [prepare_baseline.py](../../../Tests/prepare_baseline.py) to freeze the state of Doxygen XML parsing, Pydantic IR catalogs (`.json.gz`), rendered standalone HTML, and Hugo Markdown.
    2. During continuous integration, [run_regression_tests.py](../../../Tests/run_regression_tests.py) regenerates these outputs on-the-fly and runs a multi-stage comparison (JSON structure match and directory diffing).
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
*   **Key Files**:
    *   [Tests/check_links.py](../../../Tests/check_links.py)

---

### 🔄 5. Incremental Build Integrity
This suite validates the correctness of the two-level build cache (`BuildCacheManager`), ensuring only modified files trigger file writing.
*   **Workflow**:
    1. Compiles a full project reference catalog, tracking `mtime` and SHA-256 signatures of all output files.
    2. Modifies a single source entity (XML file) and triggers an incremental compilation.
    3. Verifies that only the changed entity's page and TOC index file are updated, and other files remain untouched.
*   **Traced Tasks**: `TSK-DAT-03` (Build Cache Manager)

---

### 🧬 6. Multi-Language Cross-Link Resolver
This test tracks routing accuracy across cross-referenced API frameworks utilizing distinct language scopes.
*   **Workflow**:
    1. Parsers resolve polymorphic entities (e.g. SWIG-generated Python wrappers referencing underlying C++ core classes).
    2. The Link Checker crawls the compiled assets, verifying that references dynamically mapped between C# or Python scopes correctly navigate back to C++ source modules.
*   **Traced Tasks**: `TSK-RND-09` (Signature strategizer), `Tests/check_links.py`

---

### 🤖 7. RAG-Friendly Export Schema Validator
Ensures the machine-readable outputs generated for enterprise AI systems are mathematically correct and structured according to standard contracts.
*   **Workflow**:
    1. Triggers compilation of structured data outputs (`--format json_rag`).
    2. Reads the output JSON files and runs validation against strict JSON/Pydantic schemas.
    3. Asserts the presence of mandatory metadata keys (`entity_type`, `fully_qualified_name`, `signature_hash`, `line_range`, `dependencies`).
*   **Traced Requirements**: `REQ-FUN-05`, `REQ-BUS-04` (RAG Hierarchical Export)

---

### 🛡️ 8. Template Hot-Reload Fallback Verification
Guarantees absolute robustness of the documentation pipeline when visual layouts are missing or corrupted.
*   **Workflow**:
    1. Moves or renames the primary visual templates folder (`engine/templates/`).
    2. Runs the static HTML compilation process.
    3. Verifies that the engine does not throw unhandled exceptions, and successfully produces a readable portal built on inline default template fallbacks.
*   **Traced Tasks**: `TSK-RND-10` (Fallback Loading Strategies)

---

### 🧪 9. Robustness against Doxygen Versions
Verifies backward-compatible parsing against varied Doxygen XML dialects produced by different compiler releases.
*   **Workflow**:
    1. Runs the UDE parser engine over identical source modules pre-compiled via distinct Doxygen versions (e.g. `1.9.x`, `1.10.x`, `1.12.x`).
    2. Asserts that the resulting `ProjectCatalog` model instances are structurally identical, preventing breaking parsing regressions.
*   **Traced Requirements**: `REQ-FUN-19`, `TSK-PAR-02`
