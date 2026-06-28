---
sidebar_position: 1
---

# MVP Requirements Scope

This document specifies the exact scope of requirements included in the **MVP (v1.0)** baseline of the Universal Documentation Engine (UDE). The focus is on establishing a robust, 100% offline, local API documentation compiler.

:::info Requirements Audit Status — 2026-06-28
A full requirements audit was completed on 2026-06-28, cross-referencing this document against the engine source code and test suite. All confirmed implementations are listed in the [Confirmed Features](#confirmed-features) section below. Deviations from earlier drafts are documented in the gap analysis matrix (`.antigravitycli/gap_analysis_matrix.md`).
:::

---

## 📐 Scope of MVP (v1.0)

### 1. Ingestion, Ignore Tags & Core Extraction
*   **Doxygen XML Ingestion**: Ingest and parse Doxygen-generated `index.xml` and compound files (`REQ-FUN-01`).
*   **Supported Languages**: Map structural entities (namespaces, classes, structures, methods, fields, parameters, constants, enums, type aliases) for **C++, C#, Java, and Python** to a unified, language-agnostic Intermediate Representation (IR) (`REQ-FUN-02`). Specifically for real-world C++, the parser must handle double-colon scopes (`::`), constructors/destructors (`~`), and renderers must escape angle brackets (`< >`) of template specializations to avoid breaking Docusaurus compilation.
*   **CommonMark Normalization**: Standardize comments and docstrings (Javadoc, Google, etc.) into structured CommonMark Markdown prose and fields (`REQ-FUN-14`).
*   **Ignore Tags**: Parse and strictly respect comment-level block range exclusions (`DOM-IGNORE-BEGIN`/`DOM-IGNORE-END`), directives (`\cond`/`\endcond`), and internal modifiers (`\internal`), ensuring matching code segments are completely omitted from the Intermediate Representation (`REQ-FUN-13`).
*   **Pydantic Validation**: Utilize Pydantic v2 to serialize and validate the generated Intermediate Representation (IR) catalog in memory (`REQ-NFN-04`).

### 2. Multi-Format Rendering
*   **Jinja2 Templates**: Utilize Jinja2 templates for customized documentation rendering (`REQ-NFN-04`).
*   **Hugo Markdown**: Compile the Intermediate Representation (IR) into structural Markdown files formatted specifically for the Hugo static site generator (`REQ-FUN-03`).
*   **Metadata Injector**: Support automatic YAML/TOML front-matter metadata layout injections into page headers (`REQ-FUN-04`).
*   **Static HTML**: Compile the Intermediate Representation (IR) directly into standalone static HTML documentation files (`REQ-FUN-03`).

### 3. Git Hygiene & Optimization
*   **IR Database Compression**: Store and read all Intermediate Representation (IR) files using transparent, on-the-fly Gzip compression (`.json.gz` format) (`REQ-FUN-11`).
*   **Zero-Check-In Policy**: Ensure zero compiled output files are checked into the code repository by running the compiler dynamically on server-side environments.

### 4. Automated Quality & Alignment Testing
*   **Golden Master Regression Testing**: Implement automated tests that compile sample projects for all supported languages (C++, C#, Java, Python) and compare the generated Intermediate Representation (IR), HTML pages, and Hugo Markdown outputs against established, pre-compiled static baseline files (`REQ-FUN-48`).
*   **Docomatic Semantic Alignment & Difference Tracking**: Assert structural and semantic identity between the UDE output and the legacy Docomatic reference documentation by running structural sidebar hierarchy and text-block extraction tests. To maintain flexible development workflows, deviations are logged into git-ignored `difference_mock_sdk_*.json` files; tests fail in strict mode (`STRICT_ALIGNMENT=1` in CI gates) but generate soft warnings in dev setups (`REQ-FUN-49`).

---

## 📊 Requirements Matrix

The MVP baseline includes the following subset of requirements from the SRS and BRD:

| Requirement ID | Type | Description | Traces to |
| :--- | :--- | :--- | :--- |
| **`REQ-BUS-01`** | Business | Extensible Input Ingestion (Baseline: Doxygen XML) | - |
| **`REQ-BUS-02`** | Business | Multi-Format Rendering (HTML, Hugo Markdown) | - |
| **`REQ-BUS-03`** | Business | Gzip-compressed IR database storage | - |
| **`REQ-BUS-09`** | Business | Seamless Pipeline CI/CD Automation | - |
| **`REQ-FUN-01`** | Functional | Doxygen XML parser frontend | `REQ-BUS-01` |
| **`REQ-FUN-02`** | Functional | Multi-language API extraction (C++, C#, Java, Python) | `REQ-BUS-01` |
| **`REQ-FUN-14`** | Functional | Comment Markup Normalization (CommonMark) | `REQ-BUS-01` |
| **`REQ-FUN-03`** | Functional | HTML and Hugo Markdown rendering | `REQ-BUS-02` |
| **`REQ-FUN-04`** | Functional | Front-matter metadata templates | `REQ-BUS-02` |
| **`REQ-FUN-07`** | Functional | Non-interactive CLI flags & codes | `REQ-BUS-09` |
| **`REQ-FUN-11`** | Functional | Gzip IR compression (`.json.gz`) | `REQ-BUS-03` |
| **`REQ-FUN-13`** | Functional | Ignore Tags & Range Boundaries | `REQ-BUS-08` |
| **`REQ-FUN-19`** | Functional | C++ compiler export macro filtering | `REQ-BUS-01` |
| **`REQ-FUN-20`** | Functional | SWIG wrapper low-level internal exclusions | `REQ-BUS-01`, `REQ-BUS-08` |
| **`REQ-FUN-22`** | Functional | Automated collector temporary directory cleanup | `REQ-BUS-03` |
| **`REQ-FUN-23`** | Functional | Environment pre-flight & dependency checks | `REQ-BUS-09` |
| **`REQ-FUN-24`** | Functional | Multi-project pipeline fault tolerance policies | `REQ-BUS-09` |
| **`REQ-FUN-25`** | Functional | Centralized logging & Doxygen stderr capture | `REQ-BUS-09` |
| **`REQ-FUN-26`** | Functional | Level-1 incremental parsing cache | `REQ-BUS-03`, `REQ-BUS-09` |
| **`REQ-FUN-27`** | Functional | Level-2 incremental rendering cache | `REQ-BUS-03`, `REQ-BUS-09` |
| **`REQ-FUN-28`** | Functional | Target folder metadata and cache isolation | `REQ-BUS-03` |
| **`REQ-FUN-29`** | Functional | Portable configuration relative path resolution | `REQ-BUS-09` |
| **`REQ-FUN-48`** | Functional | Golden Master Regression Testing | `REQ-BUS-08` |
| **`REQ-FUN-49`** | Functional | Docomatic Semantic Alignment & Difference Tracking | `REQ-BUS-08`, `REQ-BUS-10` |
| **`REQ-NFN-01`** | Non-Functional | Execution performance (< 5s for 1000 classes) | - |
| **`REQ-NFN-02`** | Non-Functional | Modularity via abstract base classes (`BaseParser`, `BaseRenderer`) | - |
| **`REQ-NFN-03`** | Non-Functional | Maintain at least 98% unit test coverage | - |
| **`REQ-NFN-04`** | Non-Functional | Pydantic v2 core validation & Jinja2 rendering | - |

---

## Confirmed Features

The following requirements are fully implemented in v1.0 and verified during the 2026-06-28 audit:

| Requirement | Code Location | Description |
|---|---|---|
| REQ-FUN-50 | `engine/ude/SidebarStructures/default/` | All 16 `toc_<RendererClassName>.json` files present |
| REQ-FUN-35 | Renderer classes | Empty sidebar sections pruned at render time |
| REQ-FUN-34 | Orchestrator / Renderers | `catalog_links` injected into navigation tree |
| REQ-FUN-29 | `orchestrator.py` | All paths resolved relative to config file directory |
| REQ-FUN-24 | `orchestrator.py` | Fault tolerance via `error_policy` (`fail-fast` / `continue-on-error`) |
| REQ-FUN-11 | `engine/ude/storage.py` | Gzip JSON compression for IR (L1 cache) |
| REQ-FUN-22 | `engine/ude/collectors/doxygen.py` | Auto cleanup of Doxygen temp files in `finally` block |
| REQ-FUN-14 | `engine/ude/normalizer.py` | CommonMark normalization (Javadoc/Doxygen/Sphinx-RST/Google/NumPy) |
| REQ-FUN-19/20 | `engine/ude/parsers/` | C++ export macro stripping and SWIG internal filtering |
| REQ-FUN-42 | `engine/ude/formatters/signatures.py` | Language-specific signature formatting via strategy dispatch |
| REQ-FUN-44 | `engine/ude/parsers/doxygen.py` | Backward-compatible `DoxygenXmlParser` router facade |
| REQ-FUN-45/46 | `orchestrator.py` / `cli.py` | 3-way deep_merge config cascade with combined output path resolution |

### Renderer Architecture (v1.0 Actual)

The v1.0 codebase provides **16 concrete renderer classes** — not the 2 generic classes (`HugoMarkdownRenderer`, `HtmlRenderer`) referenced in some earlier SDD drafts. The naming pattern is `<Lang><Output><ID>Renderer` (GAP-13):

| Lang | HtmlDefault | HugoDefault | HtmlLegacy | HugoLegacy |
|------|-------------|-------------|------------|------------|
| Cpp  | `CppHtmlDefaultRenderer`  | `CppHugoDefaultRenderer`  | `CppHtmlLegacyRenderer`  | `CppHugoLegacyRenderer`  |
| Cs   | `CsHtmlDefaultRenderer`   | `CsHugoDefaultRenderer`   | `CsHtmlLegacyRenderer`   | `CsHugoLegacyRenderer`   |
| Java | `JavaHtmlDefaultRenderer` | `JavaHugoDefaultRenderer` | `JavaHtmlLegacyRenderer` | `JavaHugoLegacyRenderer` |
| Py   | `PyHtmlDefaultRenderer`   | `PyHugoDefaultRenderer`   | `PyHtmlLegacyRenderer`   | `PyHugoLegacyRenderer`   |

### CLI Invocation (v1.0 Actual)

The v1.0 CLI is a flat command — no subcommands (GAP-01):

```
ude --global-config <path> --sdk-config <path> --doc-config <path>
```

CLI subcommands (`ude compile`, `ude parse`, `ude render`, `ude audit`) are planned for v2.0.

### sidebar.toml (v1.0 Behavior)

`sidebar.toml` is **optional** in v1.0. When absent, the system builds and renders the API Reference tree only, with no exception raised (GAP-06 fix: `orchestrator.py` must be aligned with `cli.py` graceful fallback behavior). When present, `sidebar.toml` acts as a navigation overlay.

### QA & Testing Infrastructure

The v1.0 engine ships with a **23-file test suite** in `engine/tests/`, covering unit, functional, integration, golden master, Docomatic alignment, and performance benchmarks:

| Test File | Coverage Area |
|---|---|
| `test_performance_benchmark.py` | Cold/warm build performance benchmarks (L1/L2 cache) — `REQ-NFN-01` |
| `test_golden_master.py` | Golden master regression for parser + all 4 renderer families |
| `test_docomatic_alignment.py` | Docomatic semantic alignment vs Legacy HTML output |
| `test_integration_pipeline.py` | End-to-end pipeline (parse + render without collector subprocess) |
| `test_orchestrator.py` | Multi-target pipeline, `error_policy`, config cascade |
| `test_static_pages.py` | `sidebar.toml` loading, graceful fallback, static page types |
| `test_cli.py` | CLI arg parsing, `deep_merge`, `find_product_json` |
| *(15 additional unit/functional tests)* | Interfaces, models, storage, caching, parsers, renderers, normalizers, signatures |

Test assets in `engine/tests/assets/` include 4 mock Doxygen XML fixtures, golden master HTML baselines for all 4 languages, HTML Legacy baselines for C++/C#/Java, and ~100 Docomatic-generated reference HTML pages for C++ alignment testing.
