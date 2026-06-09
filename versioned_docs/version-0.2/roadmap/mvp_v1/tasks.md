---
sidebar_position: 2
---

# MVP Development Tasks (TDD Specification)

This document specifies the exact, step-by-step development tasks required to build the **Universal Documentation Engine (UDE) MVP v1.0**.

In alignment with our engineering standards, we strictly follow the **Test-Driven Development (TDD)** methodology. For every single task, development must proceed through the following lifecycle:
1. **RED Phase**: Write failing unit tests checking the specified interfaces, inputs, and validation criteria.
2. **GREEN Phase**: Implement the minimal functional code required to make the tests pass.
3. **REFACTOR Phase**: Clean up, optimize, and modularize the implementation while ensuring the test suite remains 100% green.

---

## 🛠️ Task Group 1: Testing & CI/CD Infrastructure

### `TSK-INF-01` (Dependency & Testing Harness Initialization)
*   **Part 1: Implementation Guide**:
    *   Initialize a Python project within the `engine/` submodule directory using the **Poetry** package manager.
    *   Create a standard `pyproject.toml` file.
    *   Add production dependencies: `pydantic>=2.0`, `jinja2`, `lxml` (or use standard `xml.etree` where safe).
    *   Add development dependencies: `pytest`, `pytest-cov`, `black`, `mypy`.
    *   Set up the basic directory structure: `ude/` (source code root) and `tests/` (testing suite root).
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_harness.py` asserting that `ude` is importable and that `ude.__version__` matches `"0.1.0"`. Run `poetry run pytest` (or `pytest`) to verify it fails due to the missing module.
    *   *TDD Green Phase*: Create `ude/__init__.py` declaring `__version__ = "0.1.0"`.
    *   *Verification Command*:
        ```bash
        pytest --cov=ude tests/
        ```
    *   *Expected Result*: Tests pass with 100% coverage on `__init__.py`.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest --cov=ude tests/
        ```
    *   *Expected Result*: pytest runs successfully, returning exit code 0, and showing 100% coverage for `__init__.py`.
    *   *Manual Checks*:
        *   [ ] Verify the presence of `pyproject.toml` in `engine/` containing all required production and development dependencies.
        *   [ ] Verify that the standard directories `ude/` and `tests/` are successfully created.
        *   [ ] Confirm that `ude/__init__.py` defines `__version__ = "0.1.0"`.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
### `TSK-INF-02` (Mock XML Asset Ingestion Harness)
*   **Part 1: Implementation Guide**:
    *   Create a testing asset manager helper class `MockAssetLoader` in `tests/utils.py`.
    *   Set up a mock asset directory: `tests/assets/doxygen/`.
    *   Create mock XML files:
        *   `index.xml`: Structure mapping a project namespaces catalog.
        *   `class_definition.xml`: Mock XML representing a C++ class with fields and public methods.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write a unit test `tests/test_assets.py` trying to instantiate `MockAssetLoader().load_xml("index.xml")` and asserting that it returns an XML string. Verify it fails because `tests/utils.py` does not exist.
    *   *TDD Green Phase*: Implement `MockAssetLoader` in `tests/utils.py` using standard file I/O to read from `tests/assets/doxygen/`.
    *   *Verification Command*:
        ```bash
        pytest tests/test_assets.py
        ```
    *   *Expected Result*: Green assertions confirming that mock files are correctly located and loaded as string/binary.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_assets.py
        ```
    *   *Expected Result*: All unit tests in `test_assets.py` pass cleanly.
    *   *Manual Checks*:
        *   [ ] Confirm that `MockAssetLoader` is defined inside `tests/utils.py`.
        *   [ ] Verify that physical mock files `index.xml` and `class_definition.xml` exist inside `tests/assets/doxygen/`.
        *   [ ] Ensure that tests successfully read and load these mock files as XML strings.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
---

## 💾 Task Group 2: Intermediate Representation (IR) Schema & Storage

### `TSK-DAT-01` (Pydantic Model Schema Validation)
*   **Part 1: Implementation Guide**:
    *   Create `ude/models.py`.
    *   Define the core Pydantic v2 schemas for representing the AST data catalog:
        *   `ProjectCatalog`: Root catalog holding list of namespaces.
        *   `NamespaceEntity`: Represents namespaces, packages, or module structures.
        *   `ClassEntity`: Represents classes, interfaces, or structs. Holds name, namespace, docstring, methods, and fields.
        *   `MethodEntity`: Represents functions, member methods, constructors. Holds name, signature, parameters, return type, and normalized docstring.
        *   `ParameterField`: Holds name, type, and description.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_models.py` declaring a complete mock `ProjectCatalog` payload with nested types, and asserting that instantiation succeeds. Write another test passing invalid datatypes (e.g., an integer for `fully_qualified_name`) and assert that a `ValidationError` is raised. Verify tests fail due to missing classes.
    *   *TDD Green Phase*: Create the Pydantic classes inheriting from `pydantic.BaseModel` in `ude/models.py` with strict type annotations.
    *   *Verification Command*:
        ```bash
        pytest tests/test_models.py
        ```
    *   *Expected Result*: Success on valid schemas and correct exceptions thrown on validation boundary violations.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_models.py
        ```
    *   *Expected Result*: All schema validation tests pass with green status.
    *   *Manual Checks*:
        *   [ ] Verify that Pydantic v2 schemas (`ProjectCatalog`, `NamespaceEntity`, `ClassEntity`, `MethodEntity`, `ParameterField`) are defined in `ude/models.py`.
        *   [ ] Verify that schema models enforce strict types and successfully raise `ValidationError` when passed invalid types.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
### `TSK-DAT-02` (Gzip Storage & Transparent Compression)
*   **Part 1: Implementation Guide**:
    *   Create `ude/storage.py`.
    *   Implement saving and loading helper functions:
        *   `save_compressed_ir(catalog: ProjectCatalog, file_path: str)`: Serializes the Pydantic catalog into JSON, compresses it using the native `gzip` algorithm, and writes it to disk with `.json.gz` extension.
        *   `load_compressed_ir(file_path: str) -> ProjectCatalog`: Reads a compressed file, decompresses on-the-fly, parses the JSON back into the typed `ProjectCatalog` schema.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_storage.py` asserting that a sample catalog is written to `tests/scratch/temp_ir.json.gz`, that the file on disk is binary/compressed, and that reading it back restores an identical `ProjectCatalog` object.
    *   *TDD Green Phase*: Implement `save_compressed_ir` and `load_compressed_ir` using standard Python modules `gzip` and `json`.
    *   *Verification Command*:
        ```bash
        pytest tests/test_storage.py
        ```
    *   *Expected Result*: Successful compression and decompression with 100% data fidelity.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_storage.py
        ```
    *   *Expected Result*: Tests pass successfully, demonstrating lossless compression/decompression.
    *   *Manual Checks*:
        *   [ ] Confirm that `save_compressed_ir` and `load_compressed_ir` are implemented in `ude/storage.py`.
        *   [ ] Verify that the serialized IR file is physically compressed with a `.json.gz` extension.
        *   [ ] Confirm that reading the file back decompressses it and restores an identical Pydantic catalog object.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
### `TSK-DAT-03` (Two-Level Incremental Caching)
*   **Part 1: Implementation Guide**:
    *   In `ude/storage.py` implement `BuildCacheManager`, saving caching metadata to a compressed `.build_cache.json.gz` inside the target directory.
    *   **Level 1 (Parsing Cache)**: Store file paths, modification times (`mtime`), content hashes, and serialized IR subtrees. Skip re-parsing of unchanged files.
    *   **Level 2 (Rendering Cache)**: Track output file content signatures and template hashes. Skip physical file writes if the generated contents haven't changed.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_caching.py`. Assert that running parse/render phases sequentially twice yields zero XML parser calls and zero physical file writes on the second run. Verify it fails.
    *   *TDD Green Phase*: Implement the `BuildCacheManager` and integrate cache lookups into parser and renderer.
    *   *Verification Command*:
        ```bash
        pytest tests/test_caching.py
        ```
    *   *Expected Result*: Fast incremental builds with zero repeated I/O operations for unmodified sources.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_caching.py
        ```
    *   *Expected Result*: Unit tests pass, proving that the incremental build cache behaves correctly.
    *   *Manual Checks*:
        *   [ ] Verify that `BuildCacheManager` is defined inside `ude/storage.py`.
        *   [ ] Verify that running the compilation twice in succession with unchanged files results in 0 repeated XML parse calls or file writes.
        *   [ ] Confirm that cache metadata is stored inside a compressed `.build_cache.json.gz` file.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
---

## 🔌 Task Group 3: Modular Interfaces & Doxygen Ingestion

### `TSK-PAR-01` (Abstract Module & Interface Design)
*   **Part 1: Implementation Guide**:
    *   Create `ude/interfaces.py`.
    *   Define `BaseParser` and `BaseRenderer` as Abstract Base Classes (ABCs) using Python's `abc` module.
    *   `BaseParser` must enforce an abstract method `.parse(self, input_path: str) -> ProjectCatalog`.
    *   `BaseRenderer` must enforce an abstract method `.render(self, catalog: ProjectCatalog, output_path: str)`.
    *   Define custom exceptions: `UdeException`, `ParserError`, `RendererError`.
    *   Implement traceability tracking: add structured docstrings referencing requirement IDs (e.g., `Satisfies REQ-FUN-02`).
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_interfaces.py` asserting that trying to instantiate `BaseParser()` or `BaseRenderer()` throws `TypeError`. Assert that a dummy parser class that inherits from `BaseParser` but lacks a `.parse()` implementation fails to instantiate. Check docstrings for `Satisfies` strings.
    *   *TDD Green Phase*: Implement abstract contracts and custom exceptions in `ude/interfaces.py`.
    *   *Verification Command*:
        ```bash
        pytest tests/test_interfaces.py
        ```
    *   *Expected Result*: Interface safety checks pass, guaranteeing modular safety.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_interfaces.py
        ```
    *   *Expected Result*: All modular safety interface assertions pass.
    *   *Manual Checks*:
        *   [ ] Confirm that abstract base classes `BaseParser`, `BaseRenderer`, and collector contracts exist in `ude/interfaces.py`.
        *   [ ] Check for custom exceptions: `UdeException`, `ParserError`, `RendererError`.
        *   [ ] Ensure docstrings have requirement mapping tags (e.g., `Satisfies REQ-FUN-02`).
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
### `TSK-PAR-02` (Doxygen XML Ingestion & Extractors)
*   **Part 1: Implementation Guide**:
    *   Create `ude/parsers/doxygen.py` inheriting from `BaseParser`.
    *   Implement parsing of the root Doxygen XML catalog (`index.xml`) to extract the list of compound files.
    *   Parse compound files to extract classes, namespaces, methods, fields, and docstring comments for **C++, C#, Java, and Python** to the unified IR schema.
    *   Support real C++ constructs: nested namespaces (separated by `::`), constructors/destructors, template definitions, typedefs, compiler export macros (e.g. `NWDBEXPORT`), and SWIG wrapper filtration if `exclude_swig_internals` is active.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_doxygen_parser.py` asserting that feeding a mock C++ namespace compound XML returns a `ProjectCatalog` populated with C++ classes, method signatures, parameters, and access scopes. Check that SWIG internal methods are ignored and export macros are stripped.
    *   *TDD Green Phase*: Implement `DoxygenXmlParser` using Python's `lxml` or `xml.etree` libraries, traversing XML structures and mapping tags (e.g. `<compounddef>`, `<memberdef>`) to IR fields.
    *   *Verification Command*:
        ```bash
        pytest tests/test_doxygen_parser.py
        ```
    *   *Expected Result*: Accurate extraction of language-specific API structural metadata into unified schemas.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_doxygen_parser.py
        ```
    *   *Expected Result*: All parser unit tests pass with clean assertions.
    *   *Manual Checks*:
        *   [ ] Verify that `DoxygenXmlParser` is implemented inside `ude/parsers/doxygen.py`.
        *   [ ] Confirm that C++, C#, Java, and Python compound definitions are successfully parsed.
        *   [ ] Verify that compiler-specific macros and SWIG wrapper internals are filtered out during ingestion.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
### `TSK-COL-01` (Preprocessing Environment & Doxygen Collectors)
*   **Part 1: Implementation Guide**:
    *   Define `BaseCollector` in `ude/interfaces.py` with abstract methods: `validate_environment(config_path)`, `collect(config_path) -> Path`, and `cleanup(temp_path)`.
    *   Implement `DoxygenXmlCollector` in `ude/collectors/doxygen.py`.
    *   `validate_environment` checks Python, Doxygen paths, the presence of `Doxyfile` and the target source directories.
    *   `collect` executes a Doxygen subprocess on-the-fly, generating temporary configuration profiles per-language and writing raw XML files to an isolated temporary directory.
    *   `cleanup` safely and recursively deletes the temporary workspace. Add strong guard clauses (ValueError on empty, root, current or parent directory cleanups) to prevent accidental data deletion.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_doxygen_collector.py`. Assert that invalid cleanup directory inputs (like `/`, `.`, parent paths) trigger a `ValueError`. Verify it fails.
    *   *TDD Green Phase*: Implement `DoxygenXmlCollector` with strict path validation rules.
    *   *Verification Command*:
        ```bash
        pytest tests/test_doxygen_collector.py
        ```
    *   *Expected Result*: Successful pre-flight environment checks, secure subprocess invocations, and highly resilient/safe directory cleanup loops.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_doxygen_collector.py
        ```
    *   *Expected Result*: Collector environment validations, subprocess runs, and cleanup safety tests pass.
    *   *Manual Checks*:
        *   [ ] Verify that `DoxygenXmlCollector` is implemented inside `ude/collectors/doxygen.py`.
        *   [ ] Confirm that the `cleanup` method includes safety checks raising `ValueError` on empty, root, or parent folders.
        *   [ ] Verify that Doxygen is executed as a subprocess inside `collect`.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
---

## 📝 Task Group 4: Docstring Normalization & Ignore Filters

### `TSK-NML-01` (Comment Markup Normalizer)
*   **Part 1: Implementation Guide**:
    *   Create `ude/normalizer.py`.
    *   Implement `CommentNormalizer` to parse docstrings:
        *   Convert different comment style markers (e.g., Javadoc `@param`, Doxygen `\param`, `@return`, `\return`) into structured schemas.
        *   Strips markers and transforms the rest of the text into standard **CommonMark Markdown**.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_normalizer.py` passing a Javadoc string containing `@param count Number of objects` and `@return boolean` and assert that parameter names and descriptions are correctly isolated and mapped to metadata fields, leaving only clean Markdown prose in the description field.
    *   *TDD Green Phase*: Implement the normalizer using regular expression substitution patterns and metadata dictionary builders.
    *   *Verification Command*:
        ```bash
        pytest tests/test_normalizer.py
        ```
    *   *Expected Result*: Docstrings are decoupled from style, generating uniform CommonMark output.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_normalizer.py
        ```
    *   *Expected Result*: Docstring normalization tests pass cleanly.
    *   *Manual Checks*:
        *   [ ] Verify that `CommentNormalizer` is defined inside `ude/normalizer.py`.
        *   [ ] Confirm that Javadoc and Doxygen tag formats are successfully converted into structured metadata.
        *   [ ] Confirm that the main comment text is stripped of tags and normalized to CommonMark markdown.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
### `TSK-NML-02` (Ignore Tags & Range Exclusion Filters)
*   **Part 1: Implementation Guide**:
    *   Extend `DoxygenXmlParser` to handle exclusion comments:
        *   Identify range exclusions: Skip all XML elements and code blocks situated between `DOM-IGNORE-BEGIN` and `DOM-IGNORE-END` comments.
        *   Identify conditional exclusions: Skip elements bounded by `\cond`/`@cond` and `\endcond`/`@endcond`.
        *   Identify internal exclusions: Skip elements containing `\internal` or `@internal` tags.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_exclusions.py` feeding a Doxygen XML string where one class contains the `\internal` tag and another class is placed between `DOM-IGNORE-BEGIN` and `DOM-IGNORE-END` comments. Assert that the resulting parsed `ProjectCatalog` contains zero reference to these classes.
    *   *TDD Green Phase*: Implement filter checks within the parser loops that skip compound parsing when exclusion tags or active range flags are encountered.
    *   *Verification Command*:
        ```bash
        pytest tests/test_exclusions.py
        ```
    *   *Expected Result*: Strict execution of exclusion policies, ensuring zero unapproved data leaks.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_exclusions.py
        ```
    *   *Expected Result*: Tag/range exclusion tests pass with 100% information isolation.
    *   *Manual Checks*:
        *   [ ] Verify that elements within `DOM-IGNORE-BEGIN` ... `DOM-IGNORE-END` blocks are excluded from parsing.
        *   [ ] Verify that internal components marked with `\internal` or `\cond` are skipped from the final catalog.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
---

## 🎨 Task Group 5: Template-Based Rendering Engine

### `TSK-RND-01` (Jinja2 Markdown Compilation & Hugo Layouts)
*   **Part 1: Implementation Guide**:
    *   Create `ude/renderers/hugo_markdown.py` inheriting from `BaseRenderer`.
    *   Configure a Jinja2 template loader to locate layout templates (e.g., Markdown layouts with front-matter blocks).
    *   Serialize `ProjectCatalog` elements, injecting YAML/TOML metadata front-matter (such as `title`, `sidebar_position`) at the top of each page file.
    *   Automatically escape C++ template characters `< >` in method/class declarations to prevent broken HTML outputs.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_hugo_renderer.py` instantiating `HugoMarkdownRenderer`, passing a valid catalog, and asserting that the written markdown starts with a valid YAML header containing correct keys and that the compiled body utilizes correct headings. Check template bracket escaping.
    *   *TDD Green Phase*: Implement `HugoMarkdownRenderer` using standard `jinja2.Environment` compiler structures.
    *   *Verification Command*:
        ```bash
        pytest tests/test_hugo_renderer.py
        ```
    *   *Expected Result*: Standardized and beautiful Hugo-compatible Markdown generated on disk.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_hugo_renderer.py
        ```
    *   *Expected Result*: Hugo rendering tests pass with green assertions.
    *   *Manual Checks*:
        *   [ ] Verify that `HugoMarkdownRenderer` is implemented inside `ude/renderers/hugo_markdown.py`.
        *   [ ] Confirm that the generated Markdown begins with a valid front-matter header containing `title` and `sidebar_position`.
        *   [ ] Confirm that C++ template tags `< >` are escaped during rendering to prevent web-layout breakage.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
### `TSK-RND-02` (Direct Static HTML Compilation)
*   **Part 1: Implementation Guide**:
    *   Create `ude/renderers/static_html.py` inheriting from `BaseRenderer`.
    *   Write standalone HTML/CSS templates in Jinja2.
    *   Compile the intermediate representation catalog directly into an organized structure of local static HTML files.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_html_renderer.py asserting that rendering a mock catalog results in static HTML pages containing correct navigation headers, class detail links, and valid DOM elements.
    *   *TDD Green Phase*: Implement `HtmlRenderer` compiling catalog objects directly to HTML layouts via Jinja2.
    *   *Verification Command*:
        ```bash
        pytest tests/test_html_renderer.py
        ```
    *   *Expected Result*: Compilation of direct offline-viewable static HTML pages.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_html_renderer.py
        ```
    *   *Expected Result*: Direct static HTML rendering tests pass successfully.
    *   *Manual Checks*:
        *   [ ] Verify that `HtmlRenderer` is implemented inside `ude/renderers/static_html.py`.
        *   [ ] Confirm that the renderer outputs full static pages containing functional navigation links, CSS stylings, and lists.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
---

## 🚀 Task Group 6: Automation & Integration Gates

### `TSK-CLI-01` (Non-Interactive CLI Core)
*   **Part 1: Implementation Guide**:
    *   Create `ude/cli.py` containing the main entry point logic.
    *   Configure `argparse` to parse:
        *   `--config <file>` (UDE config JSON).
        *   `--input <dir>` (Doxygen XML directory override).
        *   `--format <hugo_markdown|html>` (output rendering format override).
        *   `--output <dir>` (directory override for compiled files).
    *   Orchestrate relative path resolutions from the file path location of the configuration JSON.
    *   Ensure that any execution error catches standard exceptions, prints short diagnostics to stderr, and exits with code **`1`**, while successful completion exits with code **`0`**.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_cli.py` simulating standard sysargv inputs. Assert that passing invalid parameters raises a `SystemExit` exception with code `1` or `2`, and valid arguments exit with `0`.
    *   *TDD Green Phase*: Implement arguments parsing and pipeline orchestration in `cli.py`.
    *   *Verification Command*:
        ```bash
        pytest tests/test_cli.py
        ```
    *   *Expected Result*: Clean non-interactive automation compatibility with exit status validation.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_cli.py
        ```
    *   *Expected Result*: All CLI automation tests pass with green exit status.
    *   *Manual Checks*:
        *   [ ] Verify that `ude/cli.py` parses `--config`, `--input`, `--output`, and `--format` using `argparse`.
        *   [ ] Confirm that relative paths are resolved relative to the configuration file's physical directory.
        *   [ ] Verify that the CLI exit codes are standard: `0` for success, non-zero (e.g., `1`) for errors.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
### `TSK-CLI-02` (End-to-End Pipeline & Coverage Verification)
*   **Part 1: Implementation Guide**:
    *   Create a complete end-to-end integration test file `tests/test_integration_pipeline.py`.
    *   Load all mock files from `tests/assets/doxygen/`, run the parser, write Gzip files, reload, compile to Hugo Markdown and HTML layouts, and verify structural files on disk.
    *   Refactor and optimize test files across the engine until the aggregate test coverage reaches `>= 90%`.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_integration_pipeline.py` executing the entire pipeline flow and asserting compiled HTML structures. Run pytest-cov to check current coverage.
    *   *TDD Green Phase*: Refactor parser helper routines, handle edge cases, and add coverage tests.
    *   *Verification Command*:
        ```bash
        pytest --cov=ude tests/
        ```
    *   *Expected Result*: Complete green status across all E2E integration suites, and aggregate coverage calculated strictly **`>= 90%`**.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest --cov=ude tests/
        ```
    *   *Expected Result*: Integration tests pass and overall test coverage report confirms >= 90% coverage.
    *   *Manual Checks*:
        *   [ ] Confirm that a complete integration pipeline test `tests/test_integration_pipeline.py` is present.
        *   [ ] Verify that the overall code coverage of `ude/` is calculated and strictly meets or exceeds **`90%`**.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
### `TSK-CLI-03` (Centralized Multi-Target Orchestrator)
*   **Part 1: Implementation Guide**:
    *   Create `ude/orchestrator.py` and implement the `UdeOrchestrator` class.
    *   Configure it to load the project configuration files (`ude_config.json`) and dynamically resolve all configured relative paths (`src_dir`, `output_dir`) **relative to the config file's physical directory** rather than the process working directory (`REQ-FUN-29`). Hardcoding absolute physical paths in code is strictly prohibited.
    *   Coordinate pipeline stages: instantiate the designated collector, parse the sources into Gzip-compressed IR, run the template renderer, and ensure resource cleanups are executed inside `finally` blocks.
    *   Adhere to the global `error_policy` (`fail-fast` or `continue-on-error`).
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_orchestrator.py`. Assert that executing the pipeline from different CWD working paths yields identical, correctly resolved absolute paths to source XMLs and output pages. Verify it fails.
    *   *TDD Green Phase*: Implement `UdeOrchestrator` with robust config-based path resolution.
    *   *Verification Command*:
        ```bash
        pytest tests/test_orchestrator.py
        ```
    *   *Expected Result*: Fully portable build orchestration with absolute path isolation and complete exception safety.
*   **Part 3: User Acceptance Scenario**:
    *   *Verification Command*:
        ```bash
        cd engine
poetry run pytest tests/test_orchestrator.py
        ```
    *   *Expected Result*: Orchestrator portability and safety assertions pass cleanly.
    *   *Manual Checks*:
        *   [ ] Verify that `UdeOrchestrator` is defined inside `ude/orchestrator.py`.
        *   [ ] Verify that the orchestrator resolves paths relative to the loaded config file, regardless of current working directory.
        *   [ ] Confirm that temporary file cleanup is always performed inside `finally` blocks during errors.
        *   [ ] Verify that all file and directory paths are fully dynamic and portable (no absolute hardcoded developer paths).
        *   [ ] Verify that the central compliance registry at `design-docs/docs/srs/task_compliance.md` is updated to reflect task completion.
