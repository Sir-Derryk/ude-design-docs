---
sidebar_position: 2
---

# Functional Requirements (Traceability Core)

## Extensible Parsing Module
* **`REQ-FUN-01` (Multi-Source Ingestion Phasing)**: 
  * *Version 1 (Baseline / MVP)*: The engine must ingest Doxygen-generated XML files (`index.xml` and compound files) as its primary input format to build the documentation catalog.
  * *Future Phases (v2.0+)*: The parser architecture must be loosely coupled, enabling subsequent ingestion of other XML sources (e.g., Doc-o-matic XML) or direct raw code files via pluggable frontends without modifying the core pipeline.
  * *Traces to*: `REQ-BUS-01`
* **`REQ-FUN-02` (Multi-Language API Entity Extraction)**:
  * *Version 1 (Baseline / MVP)*: The engine must parse and extract structural API elements from the Doxygen XML output for **C++, C#, Java, and Python**, mapping them to a unified, language-agnostic Intermediate Representation (IR). Extracted entities must include namespaces, classes, structures, methods, member functions, fields, parameters, return types, access scopes (public/protected), and associated comment blocks.
  * *Real-World C++ Parsing Constraints (MVP)*: Based on real-world C++ project XML characteristics, the parsing and rendering pipelines must satisfy the following specifications:
    1. **Namespace & Class Nesting**: Handle double-colon (`::`) delimiters to correctly resolve hierarchical namespaces and nested scopes (e.g., `OdGiContextForNwDatabase::DatabaseHolder` or `OdNwObjectContainer::iterator`).
    2. **Template Parameters & Escaping**: Correctly identify template-specialized compound and member names containing angle brackets (e.g., `NwExchangeTraits< NwExchangeType::kNw2Ifc >`). All template bracket sequences must be automatically escaped in rendering modules (e.g., as `\<` and `\>`) to prevent breakage in HTML DOM interpreters or Docusaurus/VitePress Markdown parsers.
    3. **Constructors, Destructors & Typedefs**: Gracefully identify C++ constructors and destructors (including prefix `~`) as having no return type, and parse typedefs/type-aliases to ensure no loss of vital API information.
  * *Future Phases (v2.0+)*: Subsequent parser plugins must be developed to directly parse raw code files on a per-language basis using advanced technologies (including `libclang` AST, `tree-sitter` AST parsers, and custom regular expressions) to enrich the catalog.
  * *Traces to*: `REQ-BUS-01`

* **`REQ-FUN-14` (Comment Markup Normalization)**:
  * *Version 1 (Baseline / MVP)*: The parsing module must normalize raw extracted comment blocks and docstrings (supporting various formats such as Doxygen, Javadoc, Google docstring style, and Doc-o-matic) into a unified **CommonMark Markdown** representation within the Intermediate Representation (IR). This normalization process must parse specific tags (e.g., `\param`, `@return`, etc.) into structured schema elements, leaving only standardized Markdown in prose fields, thereby completely decoupling output templates and renderers from input-level comment markup styles.
  * *Traces to*: `REQ-BUS-01`

## Multi-Format Formatting & Output Module
* **`REQ-FUN-03` (Multi-Format Rendering)**: The engine must support rendering the extracted Intermediate Representation (IR) into a configurable choice of target formats, supporting **HTML, Markdown (generic or SSG-tailored), XML, and RAG JSON**.
  * *Traces to*: `REQ-BUS-02`
* **`REQ-FUN-04` (Metadata Configuration)**: For page-based outputs (such as Markdown or HTML), the engine must allow customized metadata/front-matter layout injections (e.g. YAML/TOML blocks with title, order, and parent keys) via templates.
  * *Traces to*: `REQ-BUS-02`
* **`REQ-FUN-05` (Hierarchical RAG Export Specification)**: The engine must support exporting a semantic, highly structured JSON dataset (`--format json_rag`) in a single JSON file. This format must strictly adhere to the following specifications:
  * *Target Release*: Future Phase (v2.0+)
  * *Hierarchical Structure*: The export must represent the complete code hierarchy as a tree structure (e.g., Module/Namespace -> Class/Interface/Struct -> Methods/Properties/Fields/Constants).
  * *Metadata Requirements*: Each entity in the tree must contain the following metadata fields:
    1. `entity_type`: The structural type of the entity (e.g., `namespace`, `class`, `interface`, `method`, `function`, `field`, `constant`, `enum`, `struct`).
    2. `fully_qualified_name`: The unique, fully qualified name of the entity within the codebase (e.g., `Namespace.ClassName.MethodName`).
    3. `line_range`: The physical range of lines occupied by the entity in the source file, represented as an object or string (e.g., `120-145` or `{"start": 120, "end": 145}`).
    4. `signature_hash`: A cryptographic or deterministic hash of the entity's signature/declaration to enable change-tracking and incremental indexing.
    5. `dependencies`: A list of fully qualified names of related entities or call references to allow external systems to reconstruct code dependency graphs.
  * *Traces to*: `REQ-BUS-04`

## Localization & Enrichment Module
* **`REQ-FUN-06` (AI Translation Lifecycle & States)**: 
  * *Target Release*: Future Phase (v2.0+)
  * *Translation Lifecycle Statuses*: Each translation entry in the cache database must support a state metadata flag: `draft` (default for AI-generated translations) or `verified` (marked after Translation Manager manual review/override or XLIFF import).
  * *Translation Pipeline Triggers*: The translation generator module must execute strictly upon commits or merges into the primary production branch (**`master`**). Standard feature-branch builds are restricted from making live translation API calls and must execute in secure Read-Only mode.
  * *Traces to*: `REQ-BUS-06`

* **`REQ-FUN-18` (Asynchronous Non-Blocking Translation CLI)**:
  * *Target Release*: Future Phase (v2.0+)
  * *Decoupled Non-Blocking Workflow*: The translation review cycle must be decoupled from code integration. Standard development builds must render `draft` translations (optionally displaying a configurable "AI-translated draft" warning banner) or fall back to the source English language, ensuring developer velocity is not impacted by manual localization checks.
  * *Access Control Modes*: The CLI must support a `--read-only-cache` flag (active by default for general CI/CD builds) to parse and render using existing translation files without making writes, and a `--write-cache` flag (restricted to authorized Translation Manager sessions in CI/CD) to safely commit updates and state promotion (from `draft` to `verified`) to the translation database.
  * *Traces to*: `REQ-BUS-06`
* **`REQ-FUN-08` (Server-Side Push-Gate Enforcement Modes)**: 
  * *Target Release*: Future Phase (v2.0+)
  * *Server-Side Modes*: Under `--push-gate-mode`, the gate enforces policies (`reject`, `allow`, `auto-document`, `verify-document`).
  * *Traces to*: `REQ-BUS-08`

* **`REQ-FUN-15` (Quality Gate Scope & Completeness Criteria)**:
  * *Target Release*: Future Phase (v2.0+)
  * *Quality Gate Scope*: The Quality Gate calculates documentation coverage over all public (`public`) and protected (`protected`) API entities (including classes, interfaces, methods, functions, properties, fields, enums, structs, constants, constructors, etc.) within the scope of code ingestion.
  * *Documentation Completeness Criteria*: An entity is classified as fully "documented" if and only if:
    1. It has a non-empty, meaningful prose description in its docstring.
    2. If the entity is a method or function containing parameters or a return value, every single parameter and the return value must also have non-empty, associated descriptions in the docstring schema.
  * *Traces to*: `REQ-BUS-08`

* **`REQ-FUN-16` (Quality Gate Automatic Exclusions)**:
  * *Target Release*: Future Phase (v2.0+)
  * *Automatic Exclusions*: The following elements are automatically excluded from the Quality Gate denominator:
    1. Overridden methods that are explicitly inherited without structural changes from base classes or external system libraries (e.g., `Equals`, `GetHashCode`, `ToString` in Java/C#, or `__str__`, `__repr__` in Python).
    2. Trivial property getters and setters (e.g., automatic properties `get; set;` in C#) containing no custom user logic.
  * *Traces to*: `REQ-BUS-05`, `REQ-BUS-08`

* **`REQ-FUN-17` (Offline Local Gate Fallbacks)**:
  * *Target Release*: Future Phase (v2.0+)
  * *Offline Local Execution*: When executed outside a CI/CD environment (detected via environment variables or explicitly passed CLI flags), UDE must enforce an offline-by-default execution policy, utilizing local cache databases or mock placeholders instead of billing live LLM APIs.
  * *Traces to*: `REQ-BUS-05`

* **`REQ-FUN-12` (Standalone Coverage Reporting Command)**:
  * *Target Release*: Future Phase (v2.0+)
  * *Independent CLI Execution*: The UDE CLI must support a dedicated, standalone subcommand (e.g., `ude coverage`) to audit documentation coverage and output reports. This command must be fully executable independently of the main documentation compilation and rendering workflow.
  * *Reporting Formats*: The coverage command must generate structural reports detailing:
    1. Total audited entities, total documented entities, and the aggregate coverage percentage.
    2. A comprehensive list of specific undocumented or partially documented entities (with file names and line numbers).
    3. Outputs in multiple formats, including human-readable CLI terminal prints, detailed Markdown summaries, and structured JSON for integration with external dashboards.
  * *Traces to*: `REQ-BUS-08`

* **`REQ-FUN-13` (Ignore Tags & Range Boundaries)**:
  * *Structural Exclusions*: The parser, quality gate, and coverage modules must completely ignore any code blocks or entities demarcated by the following tags:
    1. **Block Range Exclusions**: All code and entities situated between `DOM-IGNORE-BEGIN` and `DOM-IGNORE-END` comments.
    2. **Conditional Block Exclusions**: All code and entities situated between `\cond` (or `@cond`) and `\endcond` (or `@endcond`) directives.
    3. **Internal Tag Exclusions**: Any entity containing or marked with the `\internal` (or `@internal`) tag.
  * *Traces to*: `REQ-BUS-05`, `REQ-BUS-08`

* **`REQ-FUN-09` (Context-Rich Source Ingestion & Decoupled Tooling)**: The `ude-enrich` module/script must extract both the **declaration (signature)** and the **definition (implementation body/block)** for any undocumented code entity. When sending a prompt to the LLM for English docstring generation, this tool must construct a composite payload containing both the declaration and the full implementation body as context, ensuring that the generated docstrings accurately reflect the internal logic, thrown exceptions, and side-effects of the code. The tool must write back only the resulting docstrings to the source code or output documentation without altering any functional logic.
  * *Target Release*: Future Phase (v2.0+)
  * *Traces to*: `REQ-BUS-05`

* **`REQ-FUN-10` (XLIFF Export and Import CLI Commands)**: The UDE CLI must support standard subcommands for exporting and importing localization files in XML Localisation Interchange File Format (XLIFF, `.xlf` format, version 1.2 or 2.0) to enable integration with professional translators:
  * *Target Release*: Future Phase (v2.0+)
  * *Export Command (`ude translation export <lang> --output <file.xlf>`)*: Extract all source English docstrings and prose blocks alongside their corresponding AI-proposed translation segments with a status of `draft`, formatting them into a standard XLIFF translation unit (`<trans-unit>`) containing `<source>` and `<target>` nodes.
  * *Import Command (`ude translation import <file.xlf>`)*: Ingest a translated `.xlf` file back into the local translation cache, updating translation strings and automatically promoting their lifecycle status from `draft` to `verified`.
  * *Traces to*: `REQ-BUS-06`

* **`REQ-FUN-07` (Non-Interactive CLI Automation)**: The CLI engine must support execution in completely non-interactive mode with standard exit codes, configurable via command-line arguments and environment variables, for hands-free automation in CI/CD pipelines.
  * *Traces to*: `REQ-BUS-09`

* **`REQ-FUN-11` (Transparent Compression of JSON Artifacts)**: The engine must store and manage all persistent JSON artifacts—specifically the Intermediate Representation (IR) files and the Translation Cache database—in a compressed format using the standard Gzip algorithm (with file extension `.json.gz`). The CLI orchestrator and modular subcommands must transparently decompress these files into memory upon startup or ingestion, and compress them back to disk upon execution completion or export, ensuring zero uncompressed JSON pollution in repository storage.
  * *Baseline (MVP v1.0)*: Intermediate Representation compression.
  * *Future Phase (v2.0+)*: Translation Cache compression.
  * *Traces to*: `REQ-BUS-03`
