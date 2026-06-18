---
sidebar_position: 2
---

# Functional Requirements (Traceability Core)

## Extensible Parsing Module
* **`REQ-FUN-01` (Multi-Source Ingestion & Preprocessing)**: 
  * *Version 1 (Baseline / MVP)*: The engine must support a modular preprocessing/collection stage. For all supported SDK languages in Version 1.0 (C++, C#, Java, Python), the system must invoke Doxygen as a subprocess based on a local, target-specific `Doxyfile` to compile raw source and header files into XML outputs inside a designated temporary directory, which is then parsed to build the catalog.
  * *Future Phases (v2.0+)*: The preprocessing and ingestion architectures must be loosely coupled. Subsequent versions must support direct code directory collection (with native AST-based parsers) or custom XML integrations (e.g., Doc-o-matic XML) without modifying the core pipeline or orchestrator.
  * *Traces to*: `REQ-BUS-01`

* **`REQ-FUN-22` (Automated Collector Lifecycle & Temporary Cleanup)**:
  * *Version 1 (Baseline / MVP)*: The orchestration pipeline must strictly manage the lifecycle of temporary files. Any temporary directories and intermediate XML files generated during the preprocessing/collection stage (e.g., Doxygen XML outputs) must be automatically and recursively deleted by the collector component immediately after ingestion for all supported languages. This cleanup must be guaranteed via a robust `try...finally` block, leaving the repository and CI/CD workspace completely free of intermediate garbage even if the parsing, validation, or rendering stages fail.
  * *Traces to*: `REQ-BUS-03`

* **`REQ-FUN-02` (Multi-Language API Entity Extraction)**:
  * *Version 1 (Baseline / MVP)*: The engine must parse and extract structural API elements from the preprocessed Doxygen XML output for **C++, C#, Java, and Python**, mapping them to a unified, language-agnostic Intermediate Representation (IR). Extracted entities must include namespaces, classes, structures, methods, member functions, fields, parameters, return types, access scopes (public/protected), and associated comment blocks.
  * *Real-World C++ Parsing Constraints (MVP)*: Based on real-world C++ project XML characteristics, the parsing and rendering pipelines must satisfy the following specifications:
    1. **Namespace & Class Nesting**: Handle double-colon (`::`) delimiters to correctly resolve hierarchical namespaces and nested scopes (e.g., `OdGiContextForNwDatabase::DatabaseHolder` or `OdNwObjectContainer::iterator`).
    2. **Template Parameters & Escaping**: Correctly identify template-specialized compound and member names containing angle brackets (e.g., `NwExchangeTraits< NwExchangeType::kNw2Ifc >`). All template bracket sequences must be automatically escaped in rendering modules (e.g., as `\<` and `\>`) to prevent breakage in HTML DOM interpreters or Docusaurus/VitePress Markdown parsers.
    3. **Constructors, Destructors & Typedefs**: Gracefully identify C++ constructors and destructors (including prefix `~`) as having no return type, and parse typedefs/type-aliases to ensure no loss of vital API information.
  * *Future Phases (v2.0+)*: Subsequent parser plugins must be developed to directly parse raw code files on a per-language basis using advanced technologies (including `libclang` AST, `tree-sitter` AST parsers, and custom regular expressions) to enrich the catalog.
  * *Traces to*: `REQ-BUS-01`

* **`REQ-FUN-19` (C++ Export Macro Filtering)**:
  * *Version 1 (Baseline / MVP)*: The parsing module must automatically identify and strip compiler linkage/export macros (such as `NWDBEXPORT`, `MAPEXPORT`, `FACETMODELER_EXPORT`, etc.) from C++ class, structure, and method declarations during entity extraction, preventing them from polluting the name fields of the Intermediate Representation (IR).
  * *Traces to*: `REQ-BUS-01`

* **`REQ-FUN-20` (SWIG Wrapper Internal Exclusions)**:
  * *Version 1 (Baseline / MVP)*: When processing SWIG-generated C#, Java, or Python source files, the parsing module must support an option to automatically exclude low-level plumbing methods, fields, and constructors (including `swigCPtr`, `swigCMemOwn`, `Dispose()`, `getCPtr()`, class delegates, and SwigDirector callbacks) if `exclude_swig_internals` is set to `true` in `output.json`. This ensures that only the actual public API surface is documented and audited by the Quality Gate.
  * *Traces to*: `REQ-BUS-01`, `REQ-BUS-08`

* **`REQ-FUN-14` (Comment Markup Normalization)**:
  * *Version 1 (Baseline / MVP)*: The parsing module must normalize raw extracted comment blocks and docstrings (supporting various formats such as Doxygen, Javadoc, Google docstring style, and Doc-o-matic) into a unified **CommonMark Markdown** representation within the Intermediate Representation (IR). This normalization process must parse specific tags (e.g., `\param`, `@return`, etc.) into structured schema elements, leaving only standardized Markdown in prose fields, thereby completely decoupling output templates and renderers from input-level comment markup styles.
  * *Sphinx/RST Support for SWIG Python Wrappers*: The normalizer must natively support Sphinx/RST-style docstrings widely found in SWIG-generated Python modules. This includes parsing `:param <name>: <desc>`, `:type <name>: <type_desc>`, `:return: <desc>`, and `:rtype: <type_desc>` tags. It must automatically map types from `:type` statements to their corresponding parameters and merge them into unified parameter metadata fields in the IR.
  * *Traces to*: `REQ-BUS-01`

## Multi-Format Formatting & Output Module
* **`REQ-FUN-03` (Multi-Format Rendering)**: The engine must support rendering the extracted Intermediate Representation (IR) into a configurable choice of target formats, supporting **HTML and Hugo-Tailored Markdown** in Version 1.0. Other formats such as generic Markdown, XML, and RAG JSON are planned for future phases (v2.0+).
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

* **`REQ-FUN-23` (Environment & Dependency Verification)**: 
  * *Version 1 (Baseline / MVP)*: Before initiating execution of any collector or parsing task, the orchestrator and the collector must perform strict environment pre-flight checks:
    1. Verify that Python is installed, executable, and accessible on the system PATH (since the orchestrator and parsing engine run as Python scripts).
    2. Verify the availability and execution permission of the Doxygen binary (as specified in `ude_global.json` or fallback system paths) if the project requires Doxygen preprocessing.
    3. Verify the physical presence of all required target configurations (e.g., `ude_config.json` and `Doxyfile` for Doxygen-based projects).
    4. Verify the existence, accessibility, and non-emptiness of all target source directories (`src_dir`).
    5. Verify the presence of all necessary raw source code files (e.g., `.h` files for C++, `.cs` files for C#, etc.) within those source directories required to compile or parse the specific project.
    If any checks fail, execution must be halted cleanly before subprocess spawn, throwing an environment-specific exception, writing diagnostic recommendations to stderr, and exiting with code `5`.
  * *Traces to*: `REQ-BUS-09`

* **`REQ-FUN-24` (Pipeline Fault Tolerance & Recovery)**:
  * *Version 1 (Baseline / MVP)*: The system must enforce high-reliability operational boundaries:
    1. **Multi-Project Execution Policy**: When orchestrated via `generate_all.bat`, the orchestrator must support a configurable error policy (via `ude_global.json`): `fail-fast` (abort the entire pipeline run at the first project error) or `continue-on-error` (log the target failure, skip the failed project, continue compilation of remaining projects, and print a consolidated error list at the end).
    2. **Malformed XML Protection**: If individual generated XML files are malformed or unreadable, the parser must log specific warnings and proceed to extract structural entities from other valid compounds, avoiding total pipeline crashes.
    3. **Crash Cleanup Guarantee**: If an unhandled exception or pipeline failure occurs during execution, the system must trigger automated cleanup via `finally` blocks to delete any generated temporary folders or XML files, preventing workspace contamination.
  * *Traces to*: `REQ-BUS-03`, `REQ-BUS-09`

* **`REQ-FUN-25` (Unified Logging & Auditing)**:
  * *Version 1 (Baseline / MVP)*: The engine must implement a centralized, time-stamped, and thread-safe file-logging system writing to a configured log file (e.g. `ude_system.log`). The logging module must:
    1. Document the starting parameters, timestamped progression, and duration of every lifecycle phase (Collect, Parse, Validation, Render, Cleanup).
    2. Intercept and capture Doxygen subprocess stderr logs, categorizing compiler warnings and errors into the unified UDE log stream.
    3. Log parse statistics (count of extracted namespaces, classes, methods, parameters, and entities) and rendering outputs (pages written).
    4. Support configurable logging verbosity levels (`DEBUG`, `INFO`, `WARNING`, `ERROR`).
    5. Write detailed stack traces of any occurring exceptions to the log file, while printing only high-level, clean, and developer-friendly diagnostic messages to the console stderr.
  * *Traces to*: `REQ-BUS-03`, `REQ-BUS-09`

* **`REQ-FUN-26` (Incremental Parsing Cache)**:
  * *Version 1 (Baseline / MVP)*: To prevent redundant parsing, the engine must implement incremental parsing based on file modification timestamps or content hashes (e.g. SHA-256) of input Doxygen XML files. If an XML compound (representing a class, namespace, structure, etc.) has not changed since the previous run, its corresponding entities must be loaded directly from `.build_cache.json.gz`, bypassing raw XML parsing to reduce execution time.
  * *Traces to*: `REQ-BUS-03`, `REQ-BUS-09`

* **`REQ-FUN-27` (Incremental Rendering Cache)**:
  * *Version 1 (Baseline / MVP)*: To optimize documentation rendering (preventing redundant disk writes, reducing SSD wear, and keeping Git commits of local outputs clean), the renderer must support incremental rendering. It must compare the signature hash (or content hash of the IR entity) and template hash against the previously rendered files. If neither has changed, the renderer must skip rewriting the target output file.
  * *Traces to*: `REQ-BUS-03`, `REQ-BUS-09`

* **`REQ-FUN-28` (Target Folder Isolation for Metadata and Cache)**:
  * *Version 1 (Baseline / MVP)*: All pipeline-internal files—specifically the Intermediate Representation (`intermediate_representation.json.gz`) and build/parsing caches (`.build_cache.json.gz`)—must be strictly stored within a dedicated target subdirectory under the `ude/` tree, named according to the format `<sdk>_<lang>` (e.g. `ude/Bimnv/bimnv_cpp/`, `ude/Bimnv/bimnv_cs/`). This `<sdk>_<lang>` folder is a descendant of the `ude/` root directory, is kept under git version control, and contains the target-specific batch script, `ude_config.json`, and `Doxyfile`. Intermediate and cache files must never be written to `output_dir` (which contains final user-facing files only) to ensure a clean separation between development metadata and production assets.
  * *Traces to*: `REQ-BUS-03`

* **`REQ-FUN-29` (No Hardcoded Paths & Relative Path Resolution)**:
  * *Version 1 (Baseline / MVP)*: All directory and file paths used by the UDE engine must be defined exclusively in the configuration files (`ude_global.json`, `ude_config.json`, `product.json`, etc.). Under no circumstances shall physical paths be hardcoded directly into the Python source code. Furthermore, all paths declared in the configurations must be relative (relative to the directory containing the config file). At runtime, the UDE orchestrator must automatically resolve and translate these relative paths into absolute paths, ensuring seamless portability between local developer environments and CI/CD servers.
  * *Traces to*: `REQ-BUS-09`

## Premium Layout & TOC Navigation Module
* **`REQ-FUN-30` (TOC Logical Hierarchy & Physical Flat-Mapping)**:
  * *Version 1 (Baseline / MVP)*: The rendering engine must support compiling structured API Table of Contents (TOC) trees for all base languages (C++, C#, Java, Python).
  * *Logical Hierarchy Rules*:
    * *C++*: Namespace -> Nested Namespace -> Classes/Structures/Enums/Global Functions -> Nested Classes -> Methods/Fields.
    * *C#*: Namespaces (nested by dot separation) -> Classes/Interfaces/Enums -> Nested Classes -> Methods/Properties/Fields.
    * *Java*: Packages (nested by dot separation) -> Classes/Interfaces/Enums -> Nested Classes -> Methods/Fields.
    * *Python*: Packages -> Modules -> Classes/Functions -> Nested Classes -> Methods/Properties.
  * *Physical Flat-Mapping Rules (Disk naming without deep folder nesting)*:
    * *C++*: Hierarchy levels separated by double underscore `__` (e.g., `FacetModeler::Body::faceCount` -> `FacetModeler__Body__faceCount.html`). Overloaded method signatures separated by `@` (e.g., `apply(double)` -> `...__apply@double.html`). Safe string replacements for special characters (e.g., `*` -> `_ptr`, `&` -> `_ref`, `<` -> `_lt_`, `>` -> `_gt_`).
    * *C#*: Dot package/namespace levels and nested classes separated by `__` (e.g., `Oda__Cloud__Connection.html`). Overloads separated by `@` with safety replacements.
    * *Java*: Package levels separated by a single underscore `_`, nested class members separated by `__` (e.g., `org_graphics_Oda__Class.html`). Overloads separated by `@`.
    * *Python*: Package/module dot levels and class levels separated by a single underscore `_`, member methods/properties separated by `__` (e.g., `ude_parsers_doxygen_DoxygenXmlParser__parse_file@str.html`).
  * *Traces to*: `REQ-BUS-10`

* **`REQ-FUN-31` (Multi-Format TOC Compilation & Sidebar Interactive Features)**:
  * *Hugo Markdown TOC Integration*: The renderer must compile logical TOC paths into YAML/TOML front-matter metadata headers inside individual Markdown output files (utilizing standard key schemas: `title`, `weight`, `parent`) enabling native Hugo menu hierarchy assembly.
  * *HTML Offline Sidebar (No CORS Restriction)*: Standalone HTML output must feature an offline-ready, dynamic sidebar loaded strictly via file protocols (`file:///`). To prevent browser CORS security blocks:
    1. The hierarchical TOC database must be compiled as a global JSON object (`window.UDE_NAV_DATA`) inside a dedicated JavaScript file `nav_data.js` and loaded dynamically via a `<script>` tag.
    2. The sidebar must render an interactive tree. Clicking on folder nodes collapses or expands them without triggering page reloads.
  * *Interactive Sidebar Control & Search*:
    1. **Resizable Panel Splitting**: Include a draggable vertical splitter handler (`.OdaDocSplitter`) that allows the user to resize the sidebar width. The user's custom width must be persistently stored in the browser's `localStorage` under the key `ude_sidebar_width` and automatically re-applied on subsequent page loads.
    2. **Real-Time Search Filter**: Provide a fast, client-side text input filter (`#sidebarSearch` / `#odaTocSearchInput`) that performs real-time matching against TOC entity labels, auto-expanding parent scopes to reveal search results and hiding unmatched nodes.
    3. **Active Node Focus & Auto-Scrolling (HTML & Hugo)**: On page load, the sidebar must automatically focus on the navigation node representing the currently active page. It must automatically expand all parent folders/namespaces of the active node to make it visible. Furthermore, the sidebar container must automatically scroll so that the active node is positioned as high as possible within the sidebar's visible viewport (at the top of the scrolling container) to ensure immediate context visibility. This behavior must be implemented identically for both the standalone offline HTML Help portal and the Hugo static site.
  * *Traces to*: `REQ-BUS-10`, `REQ-BUS-02`

* **`REQ-FUN-32` (Standardized Entity-Type Page Layouts)**:
  * *Version 1 (Baseline / MVP)*: The rendering templates must generate standardized layout structures for each public API entity page (classes, structures, and interfaces) across all supported languages.
  * *Page Template Anatomy*:
    1. **Visual Header**: Display the entity's fully qualified name alongside a highly visible, color-coded typographic badge designating the entity type (e.g., `[class]`, `[method]`, `[module]`).
    2. **Prose Description Block (`.OdaDocBrief`)**: Section displaying the CommonMark normalized brief and detailed documentation prose.
    3. **Metadata Panel (`.OdaDocContainerTable`)**: A clean tabular container detailing vital structural context (e.g., source file origin, enclosing parent module/namespace, access scope, and inheritance lines).
    4. **Code Prototype Block (`.OdaDocCodeProto`)**: Code declaration blocks styled with specific CSS layouts, marked with the exact language-tag required for Highlight.js code highlighting.
    5. **Expandable Member Tables**: Collate nested children (e.g., methods inside a class, fields inside a struct) into distinct, collapsible sections containing navigation tables. Each row must feature a high-fidelity visual indicator icon (such as `indicator-method-16.png`) denoting the member's specific subtype and accessibility.
    6. **Language-Specific Custom Templates**: Each target language must utilize its own distinct HTML template (or unique customization parameters) specifying how class/module declarations, methods, properties, fields, and constructors are visually presented (e.g., correct scope delimiters like `::` vs `.`, base class inheritance syntax, and parameter lists) to ensure 100% look-and-feel alignment with native coding standards.
  * *Aesthetic and Visual Matching*:
    1. **Style Compilation**: The HTML compiler must copy the reference stylesheet `main.css` and all visual indicator images from the directory specified globally in `ude_global.json` under `"stylesheet_dir"` to the output generation directory.
    2. **Styles Integration**: Each generated HTML page must reference the local `main.css` inside its `<head>` section via `<link rel="stylesheet" href="main.css">`.
    3. **Visual Look & Feel Exactness**: The overall layout appearance, color palette (employing ODA primary `#ff3100` and hover `#cc2600`), typography, responsive breakpoints, spacing, and panel sizing rules must be visually indistinguishable from the reference pages.
  * *Traces to*: `REQ-BUS-10`

* **`REQ-FUN-33` (Multi-Entity Dynamic File Prefixing & Page Coverage)**:
  * *Version 1 (Baseline / MVP)*: Standalone pages are generated for extracted high-level object-oriented entities (classes, structures, and interfaces). The physical filename of each generated page on disk, resolved by the `resolve_filename()` method in both HTML and Hugo Markdown renderers, must be dynamically prepended with the exact, lowercase entity type (`class_`, `struct_`, `interface_`) followed by an underscore (e.g. `class_MyClass.html`, `struct_MyStruct.html`, `interface_MyInterface.html`). Other high-level entities (such as namespaces, packages, modules, enums, global functions, and variables) are represented hierarchically or inline within the generated documentation rather than having separate standalone pages in this baseline version.
  * *Unified Signature*: This rule must apply universally across all supported languages (C++, C#, Java, Python) for all generated class, structure, and interface files.
  * *Excluded Entities*: Members and other non-class entities do not generate separate standalone pages.
  * *Traces to*: `REQ-BUS-02`, `REQ-BUS-10`

* **`REQ-FUN-34` (Integrated Document Catalog Link & Reference)**:
  * *Version 1 (Baseline / MVP)*: The generated technical publications must support injecting custom catalog or central index links. If configured, these links are rendered consistently inside the global navigation sidebar or footers of all compiled documentation types, allowing developers to jump to user-defined manuals and guides.
  * *Unified Access*: This catalog reference link must be rendered consistently inside the global navigation sidebar or footers of all compiled documentation types.
  * *Traces to*: `REQ-BUS-11`

* **`REQ-FUN-35` (No Empty Sidebar Sections & Auto-Linking)**:
  * *Version 1 (Baseline / MVP)*: The documentation system's sidebar generation must enforce that every sidebar category, group, or node corresponds to a real, navigable page (preventing empty collapsible headers that do not open any page). If a sidebar section is defined, it must:
    1. Direct the user to an explicit index/category page.
    2. Or link to its first-level child document (the first descendant page under that section).
    3. Or render a dynamically generated index page that lists all first-level children of that category.
    This rule applies strictly to UDE's automatic API Reference sidebar/TOC compiler to ensure that every auto-generated structural category or group resolves to a valid index page or first-level child.
  * *Target-Specific Sidebar and Folder Layouts*:
    1. **Hugo Generation (Flatter Structure and Namespace Tables)**: In the Hugo site build, intermediate virtual grouping directories (such as "Classes", "Structures", or "Interfaces") are completely omitted from both the physical folder structure and the sidebar menu. Instead, class-level and namespace-level documents are flat-mapped directly under their parent namespace, producing a direct, cleaner menu layout. To ensure seamless navigation, the compiler **MUST** dynamically generate a dedicated Markdown index page for each Namespace. This namespace index page must contain a structured table listing all child entities (classes, structures, interfaces) in that namespace. Each table row must present the entity's name (formatted as a clickable link pointing to its respective documentation page) alongside its brief description/prose (`.OdaDocBrief`), providing a clear directory landing view.
    2. **Standalone HTML Generation (Hierarchical Index Pages)**: In the standalone offline HTML Help generator, if the sidebar renders collapsible virtual category folders (such as "Classes", "Structures", or "Interfaces") based on the language configuration rules, the compiler **MUST** dynamically generate a dedicated HTML index page for each group folder. This page must visually list all compiled children within that category (e.g., providing quick links to each class) and serve as the navigable destination for that category folder, eliminating any pageless sidebar categories in offline view.
  * *Language-Specific JSON Mapping*: The generated sidebar hierarchy must dynamically conform to the rules and virtual groupings specified in the respective language-specific JSON configurations (`toc_cpp.json`, `toc_cs.json`, `toc_java.json`, `toc_py.json`). However, to avoid empty/dead folders, a virtual category node must only be created in the sidebar if there is at least one active, compiled entity of that type under the parent namespace/package scope. Any virtual category with zero entities in a compiled target must be pruned on-the-fly.
  * *Traces to*: `REQ-BUS-10`

* **`REQ-FUN-36` (Standardized Welcome Pages)**:
  * *Version 1 (Baseline / MVP)*: Both `HtmlRenderer` (rendering standalone offline HTML) and `HugoMarkdownRenderer` (rendering Markdown files for Hugo) must output an identical landing page title and description:
    1. **Page Title**: `"API Reference Welcome"`
    2. **Page Body / Description**: *"Welcome to the API Reference documentation portal. Please browse the sidebar to explore code entities."*
    This ensures that when a user first enters the API Reference section of any generated portal, they are greeted by a consistent, standardized message across all output formats.
  * *Traces to*: `REQ-BUS-10`

* **`REQ-FUN-37` (Standardized Namespace Landing Page Briefs)**:
  * *Version 1 (Baseline / MVP)*: Both HTML and Markdown compilation pipelines must generate standard, uniform introductory headers at the top of namespace index/landing pages (e.g. `_index.md` for Hugo or `namespace_<id>.html` for HTML). The brief description must consistently read: *"List of classes in the <NamespaceID> namespace."*
    The renderer must dynamically adapt the rendering of `<NamespaceID>` to match target language and format patterns (e.g., as code blocks `\`{namespace.name}\`` in Markdown, or formatting delimiters `::` to `.` for non-C++ languages).
  * *Traces to*: `REQ-BUS-10`

* **`REQ-FUN-38` (Header Branding & Dual-Portal Cross-Linking)**:
  * *Version 1 (Baseline / MVP)*: The VitePress-based operational documentation portal header configuration must strictly conform to the following branding and navigation design system:
    1. **Header Title & Logo**: The header must display the logo (loaded from `/logo.png`) alongside the text title `"Universal Documentation Engine Operational Documentation"`.
    2. **Dual-Portal Cross-Linking**: The navigation bar must include exactly two main links to bridge static user-facing docs and live-generated API Reference portals:
       - `"User Docs"` link pointing to `/docs/chapter1-quick-start` with target set to `_blank` to open in a new tab.
       - `"API Reference"` link pointing to `https://sir-derryk.github.io/ude-user-docs/api/` with target set to `_blank` to open in a new tab.
    3. **Visual Indicators**: Both links must be styled with external link icons and must open cleanly in a new browser tab with appropriate `rel="noopener noreferrer"` attributes to ensure security and performance.
  * *Traces to*: `REQ-BUS-10`

* **`REQ-FUN-39` (Multi-URL Active Sidebar Highlighting)**:
  * *Version 1 (Baseline / MVP)*: The sidebar layout templates inside the Hugo-based static website renderer must use environment-agnostic tests against the page's relative URL (`.RelPermalink`) to determine whether the main welcome navigation card is highlighted as active.
    To guarantee the active state persists regardless of whether the site is hosted on a local development server or compiled inside production root/subdirectories, the active state check for the "API Reference Welcome" card must evaluate as `true` if and only if `.RelPermalink` is exactly equivalent to either `/`, `/api/`, or `/ude-user-docs/api/`.
  * *Traces to*: `REQ-BUS-10`

* **`REQ-FUN-40` (SWIG Pointer Type Mapping & Cleanup)**:
  * *Version 1 (Baseline / MVP)*: During parsing of SWIG-generated C# and Java wrapper code, the parsing module must automatically detect low-level, generic SWIG-specific pointer types (specifically matching the pattern `SWIGTYPE_p_<type>` such as `SWIGTYPE_p_double`, `SWIGTYPE_p_void`, or platform-specific pointer handles like `HandleRef`) and map them to their clean, natural language-native equivalents:
    1. **For C#**: Convert `SWIGTYPE_p_double` to `double[]` or `ref double` (depending on API context), and `SWIGTYPE_p_void` to `System.IntPtr`.
    2. **For Java**: Convert `SWIGTYPE_p_double` to `double[]` and `SWIGTYPE_p_void` to `java.nio.ByteBuffer` or `long`.
    This cleanup must be performed inside the Intermediate Representation (IR) compiler stage, ensuring that final rendered developer documentation displays clean, natural types instead of raw SWIG plumbing types.
  * *Traces to*: `REQ-BUS-01`, `REQ-BUS-10`

* **`REQ-FUN-41` (C++ Template Parameter Extraction & Rendering)**:
  * *Version 1 (Baseline / MVP)*: The C++ parsing and normalization modules must support extracting template parameter documentation tags (specifically `\tparam` or `@tparam` directives) from comment blocks.
    1. **Extraction**: Map template parameter names and their accompanying text descriptions into structured metadata within the Intermediate Representation (IR) entity schema.
    2. **Layout Rendering**: The HTML and Hugo-Markdown rendering engines must display these template parameters inside a dedicated, highly visible metadata table or block (labeled "Template Parameters") situated directly below the class/method header and above the standard parameter list.
  * *Traces to*: `REQ-BUS-01`, `REQ-BUS-10`

