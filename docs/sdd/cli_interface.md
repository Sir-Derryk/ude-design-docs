---
sidebar_position: 5
---

# Command Line Interface (CLI)

The Universal Document Engine provides a modular Command Line Interface (CLI) called `ude` to execute pipelines locally and offline.

## Command Structure

The CLI is structured into high-level orchestrators and low-level utility commands.

```text
ude
├── compile (or run)    # High-level orchestrator: parses and renders in one command
├── parse               # Lower-level parser: ingests XML and outputs a compressed IR (.json.gz)
└── render              # Lower-level renderer: ingests compressed IR (.json.gz) and outputs docs
```

### `ude compile`
Executes the full pipeline: ingests raw analysis data, validates IR, and renders pages in a single step.

* **Arguments**:
  * `--config, -c`: Path to configuration file (default: `./ude.toml`).
  * `--input, -i`: Path to the input directory containing analysis files (overrides config).
  * `--output, -o`: Target output directory (overrides config).
  * `--format, -f`: Output format: `hugo` or `html` (overrides config).

### `ude parse`
Performs the frontend ingestion phase only, saving the validated IR to a compressed file.

* **Arguments**:
  * `--config, -c`: Path to configuration file (default: `./ude.toml`).
  * `--input, -i`: Path to raw input files (overrides config).
  * `--output, -o`: Path to the target compressed IR file (default: `./ude_ir.json.gz`).

### `ude render`
Performs the backend rendering phase only, reading the compressed IR.

* **Arguments**:
  * `--config, -c`: Path to configuration file (default: `./ude_ir.json.gz`).
  * `--output, -o`: Target output directory (overrides config).
  * `--format, -f`: Output format: `hugo` or `html` (overrides config).

## Global UDE Engine Settings (`ude_global.json`)

To configure system-wide behaviors that apply across all products and outputs, UDE looks for a `ude_global.json` configuration file in its installation or execution root. This file controls global environment paths, system logging, caching rules, and multi-project execution resilience.

### Global Configuration Schema (`ude_global.json`)

```json
{
  "doxygen_path": "C:\\Program Files\\doxygen\\bin\\doxygen.exe",
  "log_level": "INFO",
  "log_file": "./logs/ude_system.log",
  "error_policy": "fail-fast",
  "global_templates_dir": "./templates",
  "cache_root_dir": "./.ude_cache",
  "translation_service": {
    "provider": "gemini",
    "api_endpoint": "https://generativelanguage.googleapis.com",
    "timeout_seconds": 30
  }
}
```

* **`doxygen_path`**: Absolute path or environment lookup for the system's `doxygen` binary to automate XML extractions.
* **`log_level`**: Controls logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`).
* **`log_file`**: Output filepath for unified thread-safe file logging.
* **`error_policy`**: Configures multi-target orchestration fault tolerance. Supports `fail-fast` (aborts execution at first project failure) and `continue-on-error` (logs errors, skips failed project, compiles remaining targets, summaries errors at the end).
* **`cache_root_dir`**: Specifies where UDE can write general cache files, translation artifacts, and intermediate models.

---

## Hierarchical JSON Configuration & Centralized Automation

To support multi-product, multi-language, and multi-format compilation pipelines, the Universal Document Engine utilizes a decentralized, hierarchical JSON configuration structure located under the root `ude/` folder, orchestrated by a single centralized batch script inside `engine/`.

### Directory Structure

All product-specific configurations and assets are housed under a root `ude/` directory:

```text
ude/
└── <product_name>/                   # Example: Bimnv, FacetModeler
    ├── product.json                  # Global product metadata and versioning (e.g. docs catalog)
    └── <target_id>/                  # Target compilation folder (e.g., bimnv_api_cpp, bimnv_api_cs)
        ├── ude_config.json           # Target-specific compilation pipeline settings
        └── Doxyfile                  # Doxygen extraction configuration (C++ targets only)
```

### Automation Scripts Architecture

To support granular build execution and full flexibility in local development and CI/CD pipelines, UDE provides a hierarchical script structure for automation at three levels:
1. **Central Level (`engine/generate_all.bat`)**: Sequentially triggers the Python orchestrator for all products and projects defined across the entire UDE scope.
2. **SDK / Product Level (e.g., `engine/generate_<product>.bat` or `ude/<product>/generate_all.bat`)**: Triggers the orchestrator for all targets belonging to a specific SDK/Product (such as Bimnv, FacetModeler, Map, or IGES).
3. **Project / Target Level (e.g., `engine/generate_<product>_<target>.bat` or `ude/<product>/<target>/generate_docs.bat`)**: Directly triggers the orchestrator for a single target configuration (e.g., C++ API Reference, C# API Reference).

All scripts automatically perform pre-flight checks on Python availability and auto-install any missing dependencies (`pydantic`, `lxml`, `jinja2`).

These scripts are described below.

#### 1. Central Automation Script (`engine/generate_all.bat`)

Responsible for orchestrating the sequential generation of all targets across all SDK products:

```cmd
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ============================================================
echo   ODA UDE: Multi-Target Documentation Generation Pipeline
echo ============================================================

:: 1. Verify Python availability
where python >nul 2>nul
if !errorlevel! neq 0 (
    echo [ERROR] Python is not installed or not added to PATH.
    echo Please install Python 3.8 or higher.
    exit /b 5
)

:: 2. Verify and install required library dependencies
echo [INFO] Verifying required Python libraries...
set "REQS=pydantic lxml jinja2"
for %%p in (%REQS%) do (
    python -c "import %%p" >nul 2>nul
    if !errorlevel! neq 0 (
        echo [INFO] Library '%%p' is missing. Installing...
        python -m pip install %%p
        if !errorlevel! neq 0 (
            echo [ERROR] Failed to install '%%p' library.
            exit /b 5
        )
    )
)

set "UDE_ROOT=%~dp0..\ude"

:: Define all project targets to be sequentially orchestrated
set "TARGETS="
set "TARGETS=!TARGETS! !UDE_ROOT!\Bimnv\bimnv_cpp\ude_config.json"
set "TARGETS=!TARGETS! !UDE_ROOT!\Bimnv\bimnv_cs\ude_config.json"
set "TARGETS=!TARGETS! !UDE_ROOT!\FacetModeler\facetmodeler_cpp\ude_config.json"

for %%t in (%TARGETS%) do (
    echo.
    echo [BUILD] Invoking UDE Orchestrator for target configuration: %%t
    python -m oda_ude.orchestrator "%%t"
    
    if !errorlevel! neq 0 (
        echo [ERROR] Pipeline execution failed for target configuration: %%t
        exit /b 1
    )
)

echo.
echo ============================================================
echo   [SUCCESS] All documentation compilation targets completed.
echo ============================================================
endlocal
```

#### 2. SDK / Product Automation Script (e.g., `engine/generate_bimnv.bat` or `ude/Bimnv/generate_all.bat`)

Responsible for generating all target documentations belonging to a single SDK product (e.g., Bimnv):

```cmd
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ============================================================
echo   ODA UDE: BimNv Product Documentation Pipeline
echo ============================================================

:: 1. Verify Python availability
where python >nul 2>nul
if !errorlevel! neq 0 (
    echo [ERROR] Python is not installed or not added to PATH.
    echo Please install Python 3.8 or higher.
    exit /b 5
)

:: 2. Verify and install dependencies
echo [INFO] Verifying required Python libraries...
set "REQS=pydantic lxml jinja2"
for %%p in (%REQS%) do (
    python -c "import %%p" >nul 2>nul
    if !errorlevel! neq 0 (
        echo [INFO] Library '%%p' is missing. Installing...
        python -m pip install %%p
        if !errorlevel! neq 0 (
            echo [ERROR] Failed to install '%%p' library.
            exit /b 5
        )
    )
)

set "UDE_ROOT=%~dp0..\ude"

:: Define all targets specifically for this SDK
set "TARGETS="
set "TARGETS=!TARGETS! !UDE_ROOT!\Bimnv\bimnv_cpp\ude_config.json"
set "TARGETS=!TARGETS! !UDE_ROOT!\Bimnv\bimnv_cs\ude_config.json"
set "TARGETS=!TARGETS! !UDE_ROOT!\Bimnv\bimnv_java\ude_config.json"

for %%t in (%TARGETS%) do (
    echo.
    echo [BUILD] Processing target: %%t
    python -m oda_ude.orchestrator "%%t"
    
    if !errorlevel! neq 0 (
        echo [ERROR] Build failed for target: %%t
        exit /b 1
    )
)

echo.
echo ============================================================
echo   [SUCCESS] BimNv product documentation finished.
echo ============================================================
endlocal
```

#### 3. Project / Target Automation Script (e.g., `engine/generate_bimnv_cpp.bat` or `ude/Bimnv/bimnv_cpp/generate_docs.bat`)

Responsible for generating documentation for a single specific target (e.g., Bimnv C++ API Reference):

```cmd
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 1. Verify Python availability
where python >nul 2>nul
if !errorlevel! neq 0 (
    echo [ERROR] Python is not installed or not added to PATH.
    echo Please install Python 3.8 or higher.
    exit /b 5
)

:: 2. Verify and install dependencies
echo [INFO] Verifying required Python libraries...
set "REQS=pydantic lxml jinja2"
for %%p in (%REQS%) do (
    python -c "import %%p" >nul 2>nul
    if !errorlevel! neq 0 (
        echo [INFO] Library '%%p' is missing. Installing...
        python -m pip install %%p
        if !errorlevel! neq 0 (
            echo [ERROR] Failed to install '%%p' library.
            exit /b 5
        )
    )
)

set "SCRIPT_DIR=%~dp0"
:: Path to Python modules in engine
set "PYTHON_ROOT=%SCRIPT_DIR%..\..\..\..\Src\Python"
set "CONFIG=%SCRIPT_DIR%ude_config.json"

echo ============================================================
echo   ODA UDE: BimNv C++ API Reference Compilation
echo ============================================================

set "PYTHONPATH=%PYTHON_ROOT%"
python -m oda_ude.orchestrator "%CONFIG%"

if !errorlevel! neq 0 (
    echo [ERROR] UDE Target Pipeline failed.
    exit /b 1
)

echo [OK]    Target documentation generated successfully.
echo.
endlocal
```

### Product Configuration (`product.json`)
Contains general metadata identifying the product catalog:
```json
{
  "product_name": "FacetModeler",
  "docs": [
    {
      "type": "guide",
      "id": "facetmodeler",
      "title": "Developer's Guide",
      "devguide_lang_suffix": "",
      "path": "facetmodeler",
      "main_page": "fm_dev_guide.html"
    },
    {
      "type": "api",
      "id": "facetmodeler_api_cpp",
      "title": "C++ API Reference",
      "lang": "cpp",
      "devguide_lang_suffix": "",
      "path": "facetmodeler_api_cpp",
      "main_page": "index.html"
    }
  ]
}
```

### Target Configuration (`ude_config.json`)
Specifies target-specific properties, language parsers, and custom preprocessing collectors:
```json
{
  "project_name": "ODA BimNv C++ API Reference",
  "src_dir": ["../main/BimNv/Include"],
  "static_pages_dir": "./",
  "output_dir": "bimnv_api_cpp",
  "copyright_start_year": 2002,
  "collector": {
    "type": "doxygen",
    "doxyfile": "./Doxyfile",
    "temp_xml_dir": "./_temp_xml"
  },
  "parser": {
    "type": "doxygen_xml",
    "incremental": true
  },
  "renderer": {
    "type": "hugo_markdown",
    "incremental": true
  },
  "max_workers": 8
}
```
*   **`collector`**: Configures the preprocessing stage:
    *   `type`: Identifies the `BaseCollector` implementation. Use `doxygen` for Doxygen-based preprocessing across all supported languages (C++, C#, Java, Python).
    *   `doxyfile`: Relative path to the Doxygen configuration file.
    *   `temp_xml_dir`: Directory where intermediate Doxygen XML files are compiled, which is automatically parsed and then deleted upon completion.
*   **`parser`**: Configures the ingestion and parsing stage:
    *   `type`: Identifies the `BaseParser` implementation (e.g., `doxygen_xml`).
    *   `incremental`: If `true`, enables incremental parsing based on input file hashes.
*   **`renderer`**: Configures the output rendering stage:
    *   `type`: Identifies the `BaseRenderer` implementation (e.g., `hugo_markdown` or `html`).
    *   `incremental`: If `true`, enables incremental rendering to skip writing unchanged files.

---

## Target Folder Isolation & Caching (IR and Caches)

To prevent cluttering Git commits of output directories, keep code workspaces completely clean, and optimize execution speeds:
1. **Target Folder Isolation**: All pipeline-internal artifacts, specifically the Intermediate Representation Gzip file (`intermediate_representation.json.gz`) and the incremental build caches (`.build_cache.json.gz`), must be strictly stored in the dedicated target subdirectory under the `ude/` tree named after `<sdk>_<lang>` (e.g. `ude/Bimnv/bimnv_cpp/`). This `<sdk>_<lang>` folder is a direct descendant of `ude/`, is kept under version control, and hosts the target-specific batch script, `ude_config.json`, and `Doxyfile`. They are completely isolated from `output_dir` (which contains final user-facing static Hugo markdown or HTML files only).
2. **No Hardcoded Paths & Relative Path Resolution**: To achieve absolute portability across developer workstations and CI/CD agents, all directory and file paths used by the UDE engine must be specified exclusively within the configuration files (e.g., `ude_global.json`, `ude_config.json`, etc.). Physical paths must never be hardcoded directly into the Python source code. All paths configured in settings must be defined relative to the directory containing the config file. At startup, the orchestrator must dynamically resolve and convert them to absolute paths.
3. **Transparent Compression**: The Intermediate Representation (IR) is aggressively compressed. When the parse phase finishes, the Pydantic memory model `ProjectCatalog.model_dump_json()` is serialized, compressed via the standard **Gzip** algorithm, and written directly to `<sdk>_<lang>/intermediate_representation.json.gz`. The rendering phase decompresses this archive directly into memory.
4. **Incremental Parsing Cache**: The parser tracks source/XML file timestamps and content hashes inside `.build_cache.json.gz`. During parsing, any entity whose underlying source XML has not changed is loaded from cache, bypassing raw XML processing.
5. **Incremental Rendering Cache**: The renderer compares the current IR signature/content hashes and template hashes against previously generated static files. If an entity remains unchanged, writing to the disk is skipped, minimizing disk IO.

---

## Exit Codes

To integrate cleanly with CI/CD pipelines, the CLI returns standardized exit codes:
* `0`: Pipeline completed successfully.
* `1`: General runtime errors or unhandled exceptions.
* `2`: Pydantic/IR validation schema violation (`ValidationError`).
* `3`: Missing input files or I/O write failures (`ParserError`, `RendererError`).
* `4`: Invalid config parameters or syntax.
* `5`: Environment or missing dependency verification failure (`EnvironmentError`).
