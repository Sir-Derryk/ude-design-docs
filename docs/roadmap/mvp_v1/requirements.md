---
sidebar_position: 1
---

# MVP Requirements Scope

This document specifies the exact scope of requirements included in the **MVP (v1.0)** baseline of the Universal Documentation Engine (UDE). The focus is on establishing a robust, 100% offline, local API documentation compiler.

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
| **`REQ-NFN-01`** | Non-Functional | Execution performance (< 5s for 1000 classes) | - |
| **`REQ-NFN-02`** | Non-Functional | Modularity via abstract base classes (`BaseParser`, `BaseRenderer`) | - |
| **`REQ-NFN-03`** | Non-Functional | Maintain at least 90% unit test coverage | - |
| **`REQ-NFN-04`** | Non-Functional | Pydantic v2 core validation & Jinja2 rendering | - |
