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

---

## Global UDE Engine Settings (`ude_global.json`)

To configure system-wide behaviors that apply across all products and outputs, UDE looks for a `ude_global.json` configuration file in its installation or execution root. This file controls global environment paths, system logging, and caching rules.

### Global Configuration Schema (`ude_global.json`)

```json
{
  "doxygen_path": "C:\\Program Files\\doxygen\\bin\\doxygen.exe",
  "log_level": "INFO",
  "log_file": "./logs/ude_system.log",
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
* **`cache_root_dir`**: Specifies where UDE can write general cache files, translation artifacts, and intermediate models.

---

## Hierarchical JSON Configuration & Automation Architecture

To support multi-product, multi-language, and multi-format compilation pipelines, the Universal Document Engine utilizes a decentralized, hierarchical JSON configuration structure accompanied by automated generation scripts.

### Directory Structure

All product-specific configurations are housed under a root `ude_configs/` directory:

```text
ude_configs/
└── <product_name>/                   # Example: BimNv
    ├── product.json                  # Global product metadata and versioning
    └── outputs/                      # Configured compilation targets
        └── <output_id>/              # E.g., cpp_hugo, csharp_html
            ├── output.json           # Compilation-specific pipeline rules
            ├── Doxyfile              # Target-specific Doxygen extraction configuration
            ├── create_xml.bat        # Automated batch file to execute Doxygen and generate XML
            └── build_documentation.bat # Automated batch file to compile XML using UDE
```

### Global Configuration (`product.json`)
Contains immutable metadata identifying the product codebase:
```json
{
  "product_id": "bimnv",
  "product_name": "BimNv SDK",
  "version": "1.0.0",
  "description": "Software Development Kit for BimNv visualization databases."
}
```

### Target Configuration (`output.json`)
Specifies ingestion frontends, render targets, relative paths, and language parsers:
```json
{
  "output_id": "cpp_hugo",
  "product_config": "../../product.json",
  "source_language": "cpp",
  "parser": "doxygen_xml",
  "input_dir": "../../../engine/_xml/bimnv/doxygen",
  "output_dir": "../../../user-docs/content/cpp",
  "output_format": "HugoXML",
  "parser_options": {
    "ignore_internal": true,
    "ignore_cond": true
  },
  "renderer_options": {
    "templates_dir": "../../../engine/templates"
  }
}
```
*Supported `output_format` values*: `HugoXML`, `HTML`.

### Local Extraction Automation Scripts

Each target configuration directory contains two platform-native batch scripts to orchestrate the generation lifecycle locally:

1. **`create_xml.bat`**: Uses the local `Doxyfile` to extract parsing data from source code and place it into `input_dir`.
   ```cmd
   @echo off
   echo [UDE] Launching Doxygen XML extraction...
   doxygen Doxyfile
   echo [UDE] Extraction finished successfully.
   ```
2. **`build_documentation.bat`**: Triggers the UDE Python compilation CLI directly for the specific config.
   ```cmd
   @echo off
   echo [UDE] Starting documentation compilation...
   python -m ude.cli compile --config output.json
   echo [UDE] Compilation finished.
   ```

---

## Storage and Gzip Compression (IR)

To prevent cluttering Git commits and bloating repository storage, the IR intermediate file is aggressively compressed:
1. When `ude parse` finishes, the memory model `ProjectCatalog.model_dump_json()` is serialized to UTF-8.
2. The JSON text is compressed using the **Gzip** algorithm.
3. The compressed bytes are written directly to `<filename>.json.gz`.
4. When `ude render` starts, it reads and decompresses the Gzip archive into memory and initializes `ProjectCatalog.model_validate_json()`, completing an instant round-trip.

---

## Exit Codes

To integrate cleanly with CI/CD pipelines, the CLI returns standardized exit codes:
* `0`: Pipeline completed successfully.
* `1`: General runtime errors or unhandled exceptions.
* `2`: Pydantic/IR validation schema violation (`ValidationError`).
* `3`: Missing input files or I/O write failures (`ParserError`, `RendererError`).
* `4`: Invalid config parameters or syntax.
