---
sidebar_position: 2
---

# MVP Development Tasks (TDD Specification)

This document specifies the exact, step-by-step development tasks required to build the **Universal Document Engine (UDE) MVP v1.0**.

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
    *   Set up the basic directory structure: `universal_document_engine/` (source code root) and `tests/` (testing suite root).
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_harness.py` asserting that `universal_document_engine` is importable and that `universal_document_engine.__version__` matches `"0.1.0"`. Run `poetry run pytest` (or `pytest`) to verify it fails due to the missing module.
    *   *TDD Green Phase*: Create `universal_document_engine/__init__.py` declaring `__version__ = "0.1.0"`.
    *   *Verification Command*:
        ```bash
        pytest --cov=universal_document_engine tests/
        ```
    *   *Expected Result*: Tests pass with 100% coverage on `__init__.py`.

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

---

## 💾 Task Group 2: Intermediate Representation (IR) Schema & Storage

### `TSK-DAT-01` (Pydantic Model Schema Validation)
*   **Part 1: Implementation Guide**:
    *   Create `universal_document_engine/models.py`.
    *   Define the core Pydantic v2 schemas for representing the AST data catalog:
        *   `ProjectCatalog`: Root catalog holding list of namespaces.
        *   `NamespaceEntity`: Represents namespaces, packages, or module structures.
        *   `ClassEntity`: Represents classes, interfaces, or structs. Holds name, namespace, docstring, methods, and fields.
        *   `MethodEntity`: Represents functions, member methods, constructors. Holds name, signature, parameters, return type, and normalized docstring.
        *   `ParameterField`: Holds name, type, and description.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_models.py` declaring a complete mock `ProjectCatalog` payload with nested types, and asserting that instantiation succeeds. Write another test passing invalid datatypes (e.g., an integer for `fully_qualified_name`) and assert that a `ValidationError` is raised. Verify tests fail due to missing classes.
    *   *TDD Green Phase*: Create the Pydantic classes inheriting from `pydantic.BaseModel` in `universal_document_engine/models.py` with strict type annotations.
    *   *Verification Command*:
        ```bash
        pytest tests/test_models.py
        ```
    *   *Expected Result*: Success on valid schemas and correct exceptions thrown on validation boundary violations.

### `TSK-DAT-02` (Gzip Storage & Transparent Compression)
*   **Part 1: Implementation Guide**:
    *   Create `universal_document_engine/storage.py`.
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

---

## 🔌 Task Group 3: Modular Interfaces & Doxygen Ingestion

### `TSK-PAR-01` (Abstract Module & Interface Design)
*   **Part 1: Implementation Guide**:
    *   Create `universal_document_engine/interfaces.py`.
    *   Define `BaseParser` and `BaseRenderer` as Abstract Base Classes (ABCs) using Python's `abc` module.
    *   `BaseParser` must enforce an abstract method `.parse(self, input_path: str) -> ProjectCatalog`.
    *   `BaseRenderer` must enforce an abstract method `.render(self, catalog: ProjectCatalog, output_path: str)`.
    *   Define custom exceptions: `UdeException`, `ParserError`, `RendererError`.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_interfaces.py` asserting that trying to instantiate `BaseParser()` or `BaseRenderer()` throws `TypeError`. Assert that a dummy parser class that inherits from `BaseParser` but lacks a `.parse()` implementation fails to instantiate.
    *   *TDD Green Phase*: Implement abstract contracts and custom exceptions in `universal_document_engine/interfaces.py`.
    *   *Verification Command*:
        ```bash
        pytest tests/test_interfaces.py
        ```
    *   *Expected Result*: Interface safety checks pass, guaranteeing modular safety.

### `TSK-PAR-02` (Doxygen XML Ingestion & Extractors)
*   **Part 1: Implementation Guide**:
    *   Create `universal_document_engine/parsers/doxygen.py` inheriting from `BaseParser`.
    *   Implement parsing of the root Doxygen XML catalog (`index.xml`) to extract the list of compound files.
    *   Parse compound files to extract classes, namespaces, methods, fields, and docstring comments for **C++, C#, Java, and Python** to the unified IR schema.
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_doxygen_parser.py` asserting that feeding a mock C++ namespace compound XML returns a `ProjectCatalog` populated with C++ classes, method signatures, parameters, and access scopes. Run pytest and ensure it fails/raises exceptions.
    *   *TDD Green Phase*: Implement `DoxygenXmlParser` using Python's `lxml` or `xml.etree` libraries, traversing XML structures and mapping tags (e.g. `<compounddef>`, `<memberdef>`) to IR fields.
    *   *Verification Command*:
        ```bash
        pytest tests/test_doxygen_parser.py
        ```
    *   *Expected Result*: Accurate extraction of language-specific API structural metadata into unified schemas.

---

## 📝 Task Group 4: Docstring Normalization & Ignore Filters

### `TSK-NML-01` (Comment Markup Normalizer)
*   **Part 1: Implementation Guide**:
    *   Create `universal_document_engine/normalizer.py`.
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

### `TSK-NML-02` (Ignore Tags & Range Exclusion Filters)
*   **Part 1: Implementation Guide**:
    *   Extend `DoxygenXmlParser` to handle exclusion comments (`REQ-FUN-13`):
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

---

## 🎨 Task Group 5: Template-Based Rendering Engine

### `TSK-RND-01` (Jinja2 Markdown Compilation & Hugo Layouts)
*   **Part 1: Implementation Guide**:
    *   Create `universal_document_engine/renderers/hugo_markdown.py` inheriting from `BaseRenderer`.
    *   Configure a Jinja2 template loader to locate layout templates (e.g., Markdown layouts with front-matter blocks).
    *   Serialize `ProjectCatalog` elements, injecting YAML/TOML metadata front-matter (such as `title`, `sidebar_position`) at the top of each page file (`REQ-FUN-04`).
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_hugo_renderer.py` instantiating `HugoMarkdownRenderer`, passing a valid catalog, and asserting that the written markdown starts with a valid YAML header containing correct keys and that the compiled body utilizes correct headings.
    *   *TDD Green Phase*: Implement `HugoMarkdownRenderer` using standard `jinja2.Environment` compiler structures.
    *   *Verification Command*:
        ```bash
        pytest tests/test_hugo_renderer.py
        ```
    *   *Expected Result*: Standardized and beautiful Hugo-compatible Markdown generated on disk.

### `TSK-RND-02` (Direct Static HTML Compilation)
*   **Part 1: Implementation Guide**:
    *   Create `universal_document_engine/renderers/static_html.py` inheriting from `BaseRenderer`.
    *   Write standalone HTML/CSS templates in Jinja2.
    *   Compile the intermediate representation catalog directly into an organized structure of local static HTML files (`REQ-FUN-03`).
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_html_renderer.py` asserting that rendering a mock catalog results in static HTML pages containing correct navigation headers, class detail links, and valid DOM elements.
    *   *TDD Green Phase*: Implement `HtmlRenderer` compiling catalog objects directly to HTML layouts via Jinja2.
    *   *Verification Command*:
        ```bash
        pytest tests/test_html_renderer.py
        ```
    *   *Expected Result*: Compilation of direct offline-viewable static HTML pages.

---

## 🚀 Task Group 6: Automation & Integration Gates

### `TSK-CLI-01` (Non-Interactive CLI Core)
*   **Part 1: Implementation Guide**:
    *   Create `universal_document_engine/cli.py` containing the main entry point logic.
    *   Configure `argparse` to parse:
        *   `--input <dir>` (Doxygen XML directory).
        *   `--format <html|markdown>` (output rendering format).
        *   `--output <dir>` (directory for compiled files).
    *   Ensure that any execution error catches standard exceptions, prints short diagnostics to stderr, and exits with code **`1`**, while successful completion exits with code **`0`** (`REQ-FUN-07`).
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_cli.py` simulating standard sysargv inputs. Assert that passing invalid parameters raises a `SystemExit` exception with code `1` or `2`, and valid arguments exit with `0`.
    *   *TDD Green Phase*: Implement arguments parsing and pipeline orchestration in `cli.py`.
    *   *Verification Command*:
        ```bash
        pytest tests/test_cli.py
        ```
    *   *Expected Result*: Clean non-interactive automation compatibility with exit status validation.

### `TSK-CLI-02` (End-to-End Pipeline & Coverage Verification)
*   **Part 1: Implementation Guide**:
    *   Create a complete end-to-end integration test file `tests/test_integration_pipeline.py`.
    *   Load all mock files from `tests/assets/doxygen/`, run the parser, write Gzip files, reload, compile to Hugo Markdown and HTML layouts, and verify structural files on disk.
    *   Refactor and optimize test files across the engine until the aggregate test coverage reaches `>= 90%` (`REQ-NFN-03`).
*   **Part 2: Verification Guide**:
    *   *TDD Red Phase*: Write `tests/test_integration_pipeline.py` executing the entire pipeline flow and asserting compiled HTML structures. Run pytest-cov to check current coverage.
    *   *TDD Green Phase*: Refactor parser helper routines, handle edge cases, and add coverage tests.
    *   *Verification Command*:
        ```bash
        pytest --cov=universal_document_engine tests/
        ```
    *   *Expected Result*: Complete green status across all E2E integration suites, and aggregate coverage calculated strictly **`>= 90%`**.
