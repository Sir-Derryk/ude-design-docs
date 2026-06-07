# Business Requirements Document (BRD) — Universal Document Engine (UDE)

## 1. Introduction
### 1.1 Document Purpose
This document defines the high-level business requirements, scope, and objectives for the **Universal Document Engine (UDE)**. It serves as the primary agreement between stakeholders and the development team.

### 1.2 Business Objectives
The primary objective of UDE is to automate and streamline the generation of modern, high-aesthetic, and high-performance developer portals and API references. It separates raw code from user-facing manuals while keeping them structurally aligned in production.

To ensure business viability, UDE must meet the following measurable success criteria:
* **High-Speed Execution (Performance Metric)**: The compiler and renderer must process raw API inputs and compile them into formatted output documentation in less than **5 seconds** on standard CI/CD runner instances for a benchmark volume of up to **10,000 API entities** (classes, methods, functions, enums) distributed across **1,000 source entities** (approx. 10 MB of raw parsed inputs), minimizing developer feedback cycles.
* **100% Git Hygiene (Zero-Pollution Metric)**: Achieve zero-pollution of source repositories by executing reference generation "on-the-fly" in the build pipeline, ensuring that absolutely zero generated files (including Markdown, HTML, XML, JSON, or temporary assets) are checked into Git.
* **AI-Powered Documentation Enrichment (Enrichment Metric)**: Automatically identify undocumented or sparsely documented public API entities and generate high-quality docstring drafts using LLMs, providing a dedicated review/export format to enable **100% human-approved** documentation expansion.
* **Zero-Effort Multilingual Delivery (Localization Metric)**: Automatically translate and localize prose across multiple locales in CI/CD using AI translation middleware, achieving **0% developer translation overhead** while employing an **incremental translation cache** and **human override schemas** to preserve manual corrections.
* **Enterprise AI Integration (RAG Ingestion Metric)**: Produce structured, semantic-dense schemas (such as RAG JSON) where **100% of parsed API classes and methods** are correctly mapped with rich metadata for immediate ingestion into vector databases.
* **Execution & Cost Reporting (Build Reporting Metric)**: Automatically generate comprehensive build reports detailing processing times, file counts, translation cache efficiency, and precise LLM token usage/costs for each CI/CD execution.
* **Documentation Coverage Audit (Coverage Metric)**: Quantify the documentation status of the entire codebase by generating detailed coverage reports (aiming for **>90% documentation coverage** of all public API entities) with customizable quality gates that can fail the CI/CD pipeline if coverage drops below the defined threshold.
* **Enterprise-Grade Data Safety (Security Compliance)**: Guarantee 100% protection of intellectual property by utilizing enterprise cloud endpoints (e.g., Google Cloud Vertex AI) governed by strict NDAs/SLAs, ensuring no source code, docstrings, or prompts are stored, logged, or used for model training.
* **Zero-Manual Action Pipeline (Automation Metric)**: Ensure 100% hands-free pipeline execution with zero mandatory manual interactions for regular builds, offering native integrations with CI/CD platforms for scheduled and event-driven automation.

---

## 2. Business Context & Pain Points
### 2.1 Current State (As-Is)
Currently, technical documentation is either:
* Generated as archaic, uncustomizable, and visually outdated HTML files (e.g., standard Doxygen HTML).
* Manually copied, edited, and maintained in disconnected wiki systems (e.g., Confluence), leading to rapid desynchronization between code and documentation.

### 2.2 Pain Points (Key Motivators)
The development and maintenance of API and technical documentation using legacy documentation systems (such as Doxygen HTML, Sphinx, or MkDocs) suffer from several critical shortcomings, categorized as follows:

* **A. UI/UX and Aesthetic Constraints (Points 1-4)**:
  * **Visually Outdated Interfaces**: Legacy generators produce archaic, non-responsive layouts that fail to align with premium, modern web design standards.
  * **Friction in Customization**: Modifying standard styles or templates is extremely difficult, requiring manual hacks of complex internal CSS and HTML generation code.
  * **Lack of Rich Interactive Features**: Default templates lack out-of-the-box interactive components, such as dynamic dark/light mode toggling or interactive multi-language code snippets.
  * **Poor Client-Side Search Experience**: Standard search bars are slow, non-fuzzy, and mix various reference docs together without advanced relevance scoring or layout division.

* **B. Build Performance & Bloated Workflows (Points 7-8)**:
  * **Unacceptable Compilation Overhead**: Rebuilding entire documentation trees for large-scale codebases (thousands of classes) is extremely slow, leading to long developer feedback loops.
  * **Bloated CI/CD Dependencies**: Legacy generators require heavy runtimes, compilers, or specific environments, increasing the complexity and execution cost of CI/CD pipelines.
  * **Excessive Manual Overhead**: Current documentation routines require numerous manual trigger and copy-paste steps due to poor automation capabilities and high rigidity of legacy generators.

* **C. Source Control and Git Hygiene (Point 12)**:
  * **Repository Pollution and Diff Noise**: Committing auto-generated documentation files (HTML or Markdown) directly to Git repositories bloats repository size, creates massive merge conflicts, and obscures meaningful code changes in pull requests.

* **D. Search Fragmentation & Link Refactoring (Points 18 & 20)**:
  * **Mixed and Incoherent Search Scopes**: Inability to separate search databases between administrative docs, user guides, and reference manuals, leading to a cluttered and confusing search experience.
  * **Broken Cross-References During Refactoring**: Renaming classes, packages, or namespaces silently breaks internal links and cross-references in manual documentation pages, requiring tedious manual repairs.

* **E. Rigidity & Template Coupling (Points 22-26)**:
  * **Tight Parser-Renderer Coupling**: The parsing logic is deeply intertwined with the output rendering code, making it highly complex to adapt templates.
  * **No Language-Agnostic Intermediate Representation**: The lack of a standardized Intermediate Representation (IR) prevents clean decoupling of code parsing from target formatting.
  * **Rigid Custom Page Support**: Difficulty in generating custom operational pages or custom HTML layouts from the same source structure.
  * **Extensibility Overhead**: Adapting the documentation pipeline to support new programming languages or target engines requires major structural rewrites.
  * **Tooling Stagnation and EOL**: Current generation tools (e.g., old versions of parsers or proprietary tools) have ceased active development, resulting in failure to support modern language standards (e.g., C++14/17/20/23 compiler keywords, attributes, and templates).

* **F. AI/RAG Compatibility & Semantic Gaps (Points 27-30)**:
  * **Unstructured Outputs for AI Consumption**: Raw generated pages are difficult for LLMs and AI scrapers to ingest, chunk, and interpret with high precision.
  * **Missing Rich Semantic Metadata**: Key information (such as scope, namespace, variable access levels, and parent relationships) is not represented as structured metadata, preventing accurate embedding generation.
  * **No Native JSON RAG Exporter**: Lack of a dedicated, high-density JSON export format specifically optimized for Retrieval-Augmented Generation (RAG) pipelines.
  * **Coarse-Grained Context Retrieval**: Standard layouts cannot easily be chunked at the logical block level (e.g., individual method signatures), resulting in bloated or incomplete context injection in AI assistants.

### 2.3 Desired State (To-Be)
A modular, pipeline-based system (UDE) that:
1. Automatically parses structure from code (via Doxygen XML).
2. Generates clean, SEO-optimized, highly aesthetic documentation.
3. Integrates seamlessly into modern static hosting providers (GitHub/GitLab Pages).
4. Employs independent pipelines for project, operational, and reference docs.

---

## 3. High-Level Business Requirements (Traceability Core)
* **`REQ-BUS-01` (Extensible Multi-Language Input)**: The engine must support multi-language parsing (with **C++, C#, Java, and Python** as the initial base set) utilizing a decoupled frontend architecture. 
  * *Version 1 Baseline*: Ingest Doxygen-generated XML outputs as the baseline source of code structures and docstrings.
  * *Future Phases*: Expand ingestion via pluggable modules supporting alternative XML schemas (e.g., Doc-o-matic) and direct AST/code parsing (via `tree-sitter`, `Clang` AST, and regex) to ensure complete compatibility with modern, evolving compiler standards.
* **`REQ-BUS-02` (Multi-Format Rendering Engine)**: The engine must support rendering its language-agnostic Intermediate Representation (IR) into multiple configurable target formats including, but not limited to, **HTML, Markdown (generic and optimized for SSGs like Hugo or VitePress), RAG JSON, and structured XML** to fulfill diverse publishing requirements.
* **`REQ-BUS-03` (Git Integrity & Storage Optimization)**: Automated API Reference generation must run "on-the-fly" in CI/CD without polluting Git repositories with compiled Markdown/HTML, except for necessary inputs like translation caches and manual override database files. To minimize repository size, storage footprint, and git network bandwidth, all intermediate data and cache files stored in Git (such as translation caches and Intermediate Representation databases) must be persisted in a compressed file format (specifically Gzip-compressed JSON `.json.gz`), transparently handled by the engine.
* **`REQ-BUS-04` (RAG Optimization)**: The engine must support exporting structured, metadata-rich JSON files specifically optimized to feed enterprise AI semantic search engines and developer chat-bots.
* **`REQ-BUS-05` (AI-Powered Enrichment & Push-Gate Control)**: The engine must support identifying undocumented or sparsely documented public API elements during code ingestion (excluding elements marked with ignore tags like `\cond` or `DOC-IGNORE`). The base language for all docstrings and primary documentation is strictly **English**. It must run on a secure server-side gate (CI/CD check or server hook) and support four configurable execution modes, strictly separating read-only gate-validation from write-enabled code modification:
  * **Reject Mode (`reject-undocumented`)**: The core orchestrator runs in read-only mode, performs a documentation coverage audit against the defined gate threshold, and strictly blocks the push/merge of undocumented code (exiting with an error code) without invoking live LLM APIs.
  * **Allow/Warn Mode (`allow-undocumented`)**: The core orchestrator generates detailed warnings and coverage audits in English but permits the push/merge.
  * **Auto-Document Mode (`auto-document`)**: If undocumented code is detected, the pipeline triggers an independent, write-enabled enrichment tool (`ude-enrich` or subcommand `ude document`). This tool requests English docstrings from the secure LLM and writes them back to the source codebase in a hands-free manner.
  * **Verify-Document Mode (`verify-document`)**: If undocumented code is detected, the pipeline triggers the `ude-enrich` tool to generate draft AI docstrings in English and inject them as non-blocking proposals (e.g., Pull Request Suggestions or dedicated draft branches), blocking merge completion until a developer reviews and approves them.
  * *Context-Rich Ingestion*: To ensure high documentation fidelity, the `ude-enrich` tool must extract and transmit both the **entity declaration (signature)** and the **entity definition (implementation body)** to the LLM, giving the AI full semantic context of the business logic, state mutations, and raised exceptions, while writing back only the generated docstrings.
  * *Offline Local Execution*: Local execution of the core UDE orchestrator by developers must operate offline by default, utilizing local caches or mock placeholders without invoking live AI API requests to safeguard operational budgets.
* **`REQ-BUS-06` (Zero-Effort Localization & Asynchronous Translation Governance)**: The documentation system must support high-quality multi-language generation with zero developer translation overhead, employing English as the source and an **incremental translation cache** for other target languages, supporting **human override schemas** (committed to Git) for manual quality control.
  * *XLIFF Industry Standard Integration*: The Translation Manager must have the ability to export the source English documentation together with any AI-proposed draft translations in standard **XLIFF (`.xlf`)** format. This package can be sent to external translators and subsequently imported back, seamlessly updating the translation cache with professional-grade localized segments.
  * *Asynchronous Verification*: Because human translation verification is asynchronous and can take a long time, the translation review cycle must be fully decoupled from developer velocity:
    1. Developers push and verify code in English without being blocked by translation audits.
    2. The UDE pipeline asynchronously generates draft AI translations for any new English docstrings and stores them in the Translation Cache with a `draft` status, triggering strictly upon successful merges/commits into the **`master`** branch (or other protected branches) to prevent costly translations of volatile feature-branch code.
    3. The Translation Manager reviews, refines, or promotes translation entries (manually or via XLIFF import/export) from `draft` to `verified` at their own pace.
    4. Until verified, the rendering system falls back to the source English or displays the target language with an explicit "AI-translated draft" badge, depending on project configuration.
  * *Write Gating*: Write access to update the remote translation cache database remains strictly restricted to authorized Translation Manager accounts/roles via CI/CD secrets and Git `CODEOWNERS`.
* **`REQ-BUS-07` (Build & Execution Reporting)**: The engine must generate comprehensive performance, file, and API token usage/cost metrics after every compilation run to track operational footprint.
* **`REQ-BUS-08` (Documentation Coverage Audit)**: The engine must quantify the documentation status of all public API entities, providing detailed coverage metrics and CI/CD quality gate enforcement.
* **`REQ-BUS-09` (Seamless Pipeline Automation)**: The system must be fully automatible inside standard containerized and serverless CI/CD environments (GitHub Actions, GitLab CI, Jenkins, etc.), removing any requirements for interactive steps or manual intervention during standard compilation runs.

---

## 4. Scope and Constraints
* **In-Scope**: Multi-source parsing (Doxygen XML, Doc-o-matic XML, direct source files via tree-sitter/Clang/regex) for C++, C#, Java, Python; Intermediate Representation (IR) mapping; Multi-format rendering (HTML, Markdown, RAG JSON, XML); Enterprise-compliant secure cloud translation; Hands-free CI/CD pipeline automation; Execution and coverage reporting.
* **Out-of-Scope**: Writing proprietary code-compilers, direct hosting/DNS management, implementing custom web search crawlers from scratch.
