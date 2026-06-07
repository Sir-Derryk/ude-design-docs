# Software Requirements Specification (SRS) — Universal Document Engine (UDE)

## 1. Introduction
### 1.1 Document Purpose
This document specifies the complete functional and non-functional requirements for the **Universal Document Engine (UDE)**.

### 1.2 System Overview
UDE is a command-line interface (CLI) tool written in Python. It parses structural API metrics and documentation from multiple configurable sources, maps them into an internal language-agnostic Intermediate Representation (IR), and outputs them into multiple target document and schema formats.

---

## 2. Functional Requirements (Traceability Core)

### 2.1 Extensible Parsing Module
* **`REQ-FUN-01` (Multi-Source Ingestion Phasing)**: 
  * *Target Release*: v1.0 (MVP) (Doxygen XML); Future Phase (v2.0+) (custom frontends)
  * *Version 1 (Baseline)*: The engine must ingest Doxygen-generated XML files (`index.xml` and compound files) as its primary input format to build the documentation catalog.
  * *Future Phases*: The parser architecture must be loosely coupled, enabling subsequent ingestion of other XML sources (e.g., Doc-o-matic XML) or direct raw code files via pluggable frontends without modifying the core pipeline.
  * *Traces to*: `REQ-BUS-01`
* **`REQ-FUN-02` (Multi-Language API Entity Extraction)**:
  * *Target Release*: v1.0 (MVP) (C++, C#, Java, Python parser; Normalization to CommonMark); Future Phase (v2.0+) (libclang, tree-sitter AST)
  * *Version 1 (Baseline)*: The engine must parse and extract structural API elements from the Doxygen XML output for **C++, C#, Java, and Python**, mapping them to a unified, language-agnostic Intermediate Representation (IR). Extracted entities must include namespaces, classes, structures, methods, member functions, fields, parameters, return types, access scopes (public/protected), and associated docstrings/comment blocks.
  * *Comment Markup Normalization*: The parsing module must normalize raw extracted comment blocks and docstrings (supporting various formats such as Doxygen, Javadoc, Google docstring style, and Doc-o-matic) into a unified **CommonMark Markdown** representation within the Intermediate Representation (IR). This normalization process must parse specific tags (e.g., `\param`, `@return`, etc.) into structured schema elements, leaving only standardized Markdown in prose fields, thereby completely decoupling output templates and renderers from input-level comment markup styles.
  * *Future Phases*: Subsequent parser plugins must be developed to directly parse raw code files on a per-language basis using advanced technologies (including `libclang` AST, `tree-sitter` AST parsers, and custom regular expressions) to enrich the catalog.
  * *Traces to*: `REQ-BUS-01`

### 2.2 Multi-Format Formatting & Output Module
* **`REQ-FUN-03` (Multi-Format Rendering)**: The engine must support rendering the extracted Intermediate Representation (IR) into a configurable choice of target formats, supporting **HTML, Markdown (generic or SSG-tailored), XML, and RAG JSON**.
  * *Target Release*: v1.0 (MVP)
  * *Traces to*: `REQ-BUS-02`
* **`REQ-FUN-04` (Metadata Configuration)**: For page-based outputs (such as Markdown or HTML), the engine must allow customized metadata/front-matter layout injections (e.g. YAML/TOML blocks with title, order, and parent keys) via templates.
  * *Target Release*: v1.0 (MVP)
  * *Traces to*: `REQ-BUS-02`
* **`REQ-FUN-05` (Structured RAG Export)**: The engine must support exporting a semantic JSON dataset (`--format json_rag`) containing fully mapped code hierarchies and semantic descriptions, optimized for vector database ingestion.
  * *Target Release*: v1.0 (MVP)
  * *Traces to*: `REQ-BUS-04`

### 2.3 Localization & Enrichment Module
* **`REQ-FUN-06` (AI-Powered Translation & Asynchronous Lifecycle)**: The engine must provide an optional post-processing or IR-level step that translates prose and description content from the base English language using an enterprise-compliant LLM API interface (e.g., Google Cloud Vertex AI / Gemini API) under an enterprise NDA while strictly preserving syntax, type signatures, and code block formatting.
  * *Target Release*: Future Phase (v2.0+) (DEFERRED - OUT OF SCOPE FOR V1.0)
  * *Translation Lifecycle Statuses*: Each translation entry in the cache database must support a state metadata flag: `draft` (default for AI-generated translations) or `verified` (marked after Translation Manager manual review/override or XLIFF import).
  * *Decoupled Non-Blocking Workflow*: The translation review cycle must be decoupled from code integration. Standard development builds must render `draft` translations (optionally displaying a configurable "AI-translated draft" warning banner) or fall back to the source English language, ensuring developer velocity is not impacted by manual localization checks.
  * *Translation Pipeline Triggers*: The translation generator module must execute strictly upon commits or merges into the primary production branch (**`master`**). Standard feature-branch builds are restricted from making live translation API calls and must execute in secure Read-Only mode.
  * *Access Control Modes*: The CLI must support a `--read-only-cache` flag (active by default for general CI/CD builds) to parse and render using existing translation files without making writes, and a `--write-cache` flag (restricted to authorized Translation Manager sessions in CI/CD) to safely commit updates and state promotion (from `draft` to `verified`) to the translation database.
  * *Traces to*: `REQ-BUS-06`

* **`REQ-FUN-08` (Server-Side Push-Gate Verification Modes & Decoupled Enrichment)**: The UDE CLI and its dedicated enrichment script must manage public API entities (not marked with ignore tags) that are undocumented in English. The main UDE orchestrator must support a `--push-gate-mode` flag accepting one of four values, executing the corresponding verification policy:
  * *Target Release*: v1.0 (MVP)
  * 1. `reject`: The orchestrator runs in read-only mode, performs a documentation coverage audit, exits with error code `1` and prints a detailed report of undocumented entities if coverage falls below the defined threshold, blocking the server-side push/merge check. No code modifications or LLM API calls are executed.
  * 2. `allow` (default): The orchestrator exits with code `0`, outputting warning logs and a coverage audit report without blocking the pipeline.
  * 3. `auto-document`: If the orchestrator detects undocumented entities, the pipeline triggers a separate write-enabled tool/subcommand (`ude-enrich` or `ude document`). This tool requests docstrings in English from the secure LLM, rewrites the source files with the generated docstrings, and exits with code `0`, enabling automated, decoupled git commits back to the branch.
  * 4. `verify-document`: If the orchestrator detects undocumented entities, the pipeline triggers the `ude-enrich` tool to request docstrings in English from the secure LLM and generate a PR change-request structure (e.g., standard Git diff or PR Suggestion payloads) in a separate branch, exiting with code `2` (blocked/pending human review), preventing merge completion until those draft docstrings are committed/approved by a developer.
  * *Offline Local Execution*: When executed outside a CI/CD environment (detected via environment variables or explicitly passed CLI flags), UDE must enforce an offline-by-default execution policy, utilizing local cache databases or mock placeholders instead of billing live LLM APIs.
  * *Traces to*: `REQ-BUS-05`

* **`REQ-FUN-09` (Context-Rich Source Ingestion & Decoupled Tooling)**: The `ude-enrich` module/script must extract both the **declaration (signature)** and the **definition (implementation body/block)** for any undocumented code entity. When sending a prompt to the LLM for English docstring generation, this tool must construct a composite payload containing both the declaration and the full implementation body as context, ensuring that the generated docstrings accurately reflect the internal logic, thrown exceptions, and side-effects of the code. The tool must write back only the resulting docstrings to the source code or output documentation without altering any functional logic.
  * *Target Release*: v1.0 (MVP)
  * *Traces to*: `REQ-BUS-05`

* **`REQ-FUN-10` (XLIFF Export and Import CLI Commands)**: The UDE CLI must support standard subcommands for exporting and importing localization files in XML Localisation Interchange File Format (XLIFF, `.xlf` format, version 1.2 or 2.0) to enable integration with professional translators:
  * *Target Release*: Future Phase (v2.0+) (DEFERRED - OUT OF SCOPE FOR V1.0)
  * *Export Command (`ude translation export <lang> --output <file.xlf>`)*: Extract all source English docstrings and prose blocks alongside their corresponding AI-proposed translation segments with a status of `draft`, formatting them into a standard XLIFF translation unit (`<trans-unit>`) containing `<source>` and `<target>` nodes.
  * *Import Command (`ude translation import <file.xlf>`)*: Ingest a translated `.xlf` file back into the local translation cache, updating translation strings and automatically promoting their lifecycle status from `draft` to `verified`.
  * *Traces to*: `REQ-BUS-06`
* **`REQ-FUN-07` (Non-Interactive CLI Automation)**: The CLI engine must support execution in completely non-interactive mode with standard exit codes, configurable via command-line arguments and environment variables, for hands-free automation in CI/CD pipelines.
  * *Target Release*: v1.0 (MVP)
  * *Traces to*: `REQ-BUS-09`

* **`REQ-FUN-11` (Transparent Compression of JSON Artifacts)**: The engine must store and manage all persistent JSON artifacts—specifically the Intermediate Representation (IR) files and the Translation Cache database—in a compressed format using the standard Gzip algorithm (with file extension `.json.gz`). The CLI orchestrator and modular subcommands must transparently decompress these files into memory upon startup or ingestion, and compress them back to disk upon execution completion or export, ensuring zero uncompressed JSON pollution in repository storage.
  * *Target Release*: v1.0 (MVP) (Intermediate Representation compression); Future Phase (v2.0+) (Translation Cache compression)
  * *Traces to*: `REQ-BUS-03`

---

## 3. Non-Functional Requirements (NFR)
* **`REQ-NFN-01` (Execution Performance)**: The parser and renderer must process and output documentation for up to 1,000 API classes in less than 5 seconds on a standard GitHub Actions runner.
  * *Target Release*: v1.0 (MVP)
* **`REQ-NFN-02` (Modularity)**: The system must define rigid abstract base classes (`BaseParser`, `BaseRenderer`) allowing independent plugins to be loaded at runtime via dynamic Python imports.
  * *Target Release*: v1.0 (MVP)
* **`REQ-NFN-03` (Test Coverage)**: All critical core modules, especially XML element extractors and IR converters, must maintain at least 90% unit test coverage.
  * *Target Release*: v1.0 (MVP)
* **`REQ-NFN-04` (Core Technologies & Validation)**:
  * *Target Release*: v1.0 (MVP) (Pydantic validation for IR, Jinja2 template engine); Future Phase (v2.0+) (Pydantic validation for Translation Caches)
  * The system's data-parsing, validation, and serialization modules for the Intermediate Representation (IR) and translation caches must be implemented using **Pydantic v2** to ensure extremely fast execution and robust, typed validation of deeply nested AST structures.
  * The rendering and formatting engine must utilize the **Jinja2** template engine to compile structural documentation pages and allow stakeholder/developer-facing customization of Markdown, HTML, and XML layouts.
