---
sidebar_position: 3
---

# Future Releases (v2.0+)

Future releases (including **v2.0** and beyond) expand UDE's ecosystem into multi-language localization workflows, professional translator integrations, and direct AST-level source parsing.

## Scope of Future Releases (v2.0+)

### 1. Zero-Effort Multi-Language Localization
* **Asynchronous AI Translation**: Translating English docstrings and prose blocks using secure LLMs strictly upon merges to the `master` branch.
* **Incremental Cache**: Utilizing a localized database cache so identical strings are never translated twice.
* **Translation Lifecycle Status**: Tagging cache records as `draft` (default) or `verified` (manually reviewed or imported).
* **Developer Unblocking**: Rendering draft translations with warning banners, or falling back to English to avoid blocking developer commits.
* **XLIFF Integrations**: Providing CLI commands to export and import standard translation packets (`.xlf`) to professional translation services.

### 2. Native AST Source Parsers
* **Pluggable Direct Frontends**: Implementing standalone parsers utilizing `tree-sitter` and `libclang` AST to directly analyze source directories.
* **Direct Parsing Extensibility**: Parsing source code directly for C++, C#, Java, and Python, removing the mandatory Doxygen dependency.

### 3. Performance & Compression
* **Translation Cache Compression**: Storing translation databases as `.json.gz` Gzip-compressed archives to minimize repository size.
* **Pydantic Validation for Cache**: Leveraging Pydantic v2 to validate translation cache and localization schema files.

## Deferred Requirements (v2.0+)

| Requirement ID | Type | Description |
| :--- | :--- | :--- |
| **`REQ-BUS-01`** | Business | Custom native parser frontends (direct code parsing) |
| **`REQ-BUS-03`** | Business | Compressed translation cache storage |
| **`REQ-BUS-06`** | Business | Incremental Translation Cache, XLIFF, Async review lifecycle |
| **`REQ-FUN-01`** | Functional | Non-Doxygen direct XML/AST parser inputs |
| **`REQ-FUN-02`** | Functional | Native parsers using `libclang` and `tree-sitter` |
| **`REQ-FUN-06`** | Functional | Translation state metadata (`draft`/`verified`), async CI triggers |
| **`REQ-FUN-10`** | Functional | XLIFF Export & Import CLI subcommands |
| **`REQ-FUN-11`** | Functional | Gzip Translation Cache compression |
| **`REQ-NFN-04`** | Non-Functional | Pydantic v2 validation for translation caches |
