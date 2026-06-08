---
sidebar_position: 3
---

# Future Releases (v2.0+)

Future releases (including **v2.0** and beyond) expand UDE's ecosystem into AI-powered docstring enrichment, quality gates and documentation coverage audits, multi-language localization workflows, professional translator integrations, and direct AST-level source parsing.

## Scope of Future Releases (v2.0+)

### 1. Quality Gate & Documentation Coverage Audits
* **Documentation Coverage CLI**: Adding a standalone subcommand (e.g., `ude coverage`) to audit API documentation coverage and output reports in CLI, Markdown, and JSON.
* **Gate Exclusions**: Automatically excluding overridden methods and trivial property getters/setters (such as C# auto-properties) from coverage math.
* **Completeness Criteria**: Requiring both a prose description and descriptions for all parameters and return values to consider an entity fully documented.
* **Server-Side Push-Gate Modes**: Implementing the `--push-gate-mode` flag inside CI/CD with policies including:
  * `reject`: Blocking integrations if coverage falls below configured thresholds.
  * `allow`: Emitting warning logs without blocking integration.

### 2. Context-Rich AI-Powered Docstring Enrichment
* **Context Extraction**: Analyzing both the signature and full implementation body (definition) of undocumented methods to feed context to the LLM.
* **Automated Enrichment**: Implementing `ude-enrich` / `ude document` subcommands to request English docstrings from secure LLMs and safely write them back to source files in a hands-free manner.
* **Interactive AI Workflows**: Supporting `verify-document` mode to generate pull request change proposals or suggestion structures for developer approval.

### 3. Zero-Effort Multi-Language Localization
* **Asynchronous AI Translation**: Translating English docstrings and prose blocks using secure LLMs strictly upon merges to the `master` branch.
* **Incremental Cache**: Utilizing a localized database cache so identical strings are never translated twice.
* **Translation Lifecycle Status**: Tagging cache records as `draft` (default) or `verified` (manually reviewed or imported).
* **Developer Unblocking**: Rendering draft translations with warning banners, or falling back to English to avoid blocking developer commits.
* **XLIFF Integrations**: Providing CLI commands to export and import standard translation packets (`.xlf`) to professional translation services.

### 4. RAG-Structured Semantic Export
* **Hierarchical RAG Export**: Exporting a semantic, highly structured JSON dataset (`--format json_rag`) in a single JSON file.
* **Granular Metadata**: Enriching the export with entity types, fully qualified names, exact code line ranges, deterministic signature hashes, and code-dependency references for vector database ingestion and advanced Graph-RAG architectures.

### 5. Native AST Source Parsers
* **Pluggable Direct Frontends**: Implementing standalone parsers utilizing `tree-sitter` and `libclang` AST to directly analyze source directories.
* **Direct Parsing Extensibility**: Parsing source code directly for C++, C#, Java, and Python, removing the mandatory Doxygen dependency.

### 6. Performance & Compression
* **Translation Cache Compression**: Storing translation databases as `.json.gz` Gzip-compressed archives to minimize repository size.
* **Pydantic Validation for Cache**: Leveraging Pydantic v2 to validate translation cache and localization schema files.

## Deferred Requirements (v2.0+)

| Requirement ID | Type | Description |
| :--- | :--- | :--- |
| **`REQ-BUS-01`** | Business | Custom native parser frontends (direct code parsing) |
| **`REQ-BUS-03`** | Business | Compressed translation cache storage |
| **`REQ-BUS-04`** | Business | RAG Ingestion Format Support (Hierarchical JSON) |
| **`REQ-BUS-05`** | Business | Push-Gate Gating and LLM English Enrichment |
| **`REQ-BUS-06`** | Business | Incremental Translation Cache, XLIFF, Async review lifecycle |
| **`REQ-BUS-07`** | Business | Token Cost Reporting |
| **`REQ-BUS-08`** | Business | Documentation Coverage & Quality Gate Separation |
| **`REQ-FUN-01`** | Functional | Non-Doxygen direct XML/AST parser inputs |
| **`REQ-FUN-02`** | Functional | Native parsers using `libclang` and `tree-sitter` |
| **`REQ-FUN-05`** | Functional | `--format json_rag` structured export |
| **`REQ-FUN-06`** | Functional | Translation state metadata (`draft`/`verified`), async CI triggers |
| **`REQ-FUN-08`** | Functional | Push-gate execution modes (`reject`, `allow`, `auto-document`, `verify-document`) |
| **`REQ-FUN-09`** | Functional | Context-rich signature + definition LLM ingestion |
| **`REQ-FUN-10`** | Functional | XLIFF Export & Import CLI subcommands |
| **`REQ-FUN-11`** | Functional | Gzip Translation Cache compression |
| **`REQ-FUN-12`** | Functional | Standalone Coverage Reporting Command |
| **`REQ-NFN-04`** | Non-Functional | Pydantic v2 validation for translation caches |
