# Integration and Artifact Verification Tests Specification

This document provides a comprehensive, centralized specification of the **4 specialized post-build integration and artifact verification tests** of the **Universal Documentation Engine (UDE)**. These tests operate at the integration, semantic, and artifact validation levels to ensure 100% correctness of compiled documentation without testing raw internal code logic.

---

## 📊 Summary of Verification Suites

| Test Suite / Tool | Purpose | Primary Script(s) | Traced Functional Requirement | Output / Artifact Inspected |
| :--- | :--- | :--- | :--- | :--- |
| **1. Golden Master Regression** | Verifies parsing and rendering consistency against portable baselines. | [prepare_baseline.py](../../../Tests/prepare_baseline.py)<br/>[run_regression_tests.py](../../../Tests/run_regression_tests.py) | `REQ-FUN-48` | `baseline/ir/`, `baseline/html/`, `baseline/hugo_md/` |
| **2. Docomatic Alignment** | Ensures semantic and ToC alignment with legacy Docomatic outputs. | [test_docomatic_alignment.py](../../../engine/tests/test_docomatic_alignment.py) | `REQ-FUN-49` | Compiled HTML vs `refs/Docomatic/.../contents.html` |
| **3. Page Integrity Verifier** | Ensures compiled pages physically exist on disk and contain correct heading signatures. | [verify_pages.py](../../../Tests/verify_pages.py) | `REQ-FUN-31`, `REQ-FUN-32` | `index.html` files and `#` headers in generated folders |
| **4. Post-Build Link Checker** | Crawls generated HTML to validate local pathways and external URLs. | [check_links.py](../../../Tests/check_links.py) | `REQ-FUN-31` | `<a>` href links in compiled HTML directories |

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

### 🌐 4. Post-Build Link Validation
This crawling tool ensures zero broken navigation links exist in the published portal.
*   **Workflow**:
    1. Scans all generated HTML files in the output directory.
    2. Parses anchor tags (`<a href="...">`) using a robust parser class.
    3. Resolves local path links to physical disk locations relative to the output root.
    4. Performs real-world concurrent network requests (utilizing HTTP `HEAD` with dynamic `GET` fallbacks) for external web links.
*   **Key Files**:
    *   [Tests/check_links.py](../../../Tests/check_links.py)
