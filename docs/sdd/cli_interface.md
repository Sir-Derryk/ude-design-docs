---
sidebar_position: 5
---

# Command Line Interface (CLI)

:::info[Document Version Information]
* **Current Document Version**: `0.1`
* **Status**: `Draft Specifications`
* **Date**: June 8, 2026
:::

The Universal Document Engine provides a modular Command Line Interface (CLI) called `ude` to execute pipelines locally and offline.

## 1. Command Structure

The CLI is structured into high-level orchestrators and low-level utility commands.

```text
ude
├── compile (or run)    # High-level orchestrator: parses and renders in one command
├── parse               # Lower-level parser: ingests XML and outputs a compressed IR (.json.gz)
└── render              # Lower-level renderer: ingests compressed IR (.json.gz) and outputs docs
```

### 1.1 `ude compile`
Executes the full pipeline: ingests raw analysis data, validates IR, and renders pages in a single step.

* **Arguments**:
  * `--config, -c`: Path to configuration file (default: `./ude.toml`).
  * `--input, -i`: Path to the input directory containing analysis files (overrides config).
  * `--output, -o`: Target output directory (overrides config).
  * `--format, -f`: Output format: `hugo` or `html` (overrides config).

### 1.2 `ude parse`
Performs the frontend ingestion phase only, saving the validated IR to a compressed file.

* **Arguments**:
  * `--config, -c`: Path to configuration file (default: `./ude.toml`).
  * `--input, -i`: Path to raw input files (overrides config).
  * `--output, -o`: Path to the target compressed IR file (default: `./ude_ir.json.gz`).

### 1.3 `ude render`
Performs the backend rendering phase only, reading the compressed IR.

* **Arguments**:
  * `--config, -c`: Path to configuration file (default: `./ude_ir.json.gz`).
  * `--output, -o`: Target output directory (overrides config).
  * `--format, -f`: Output format: `hugo` or `html` (overrides config).

---

## 2. Configuration File (`ude.toml`)

Users can control the pipeline execution using a standard `ude.toml` configuration file in their repository root:

```toml
[project]
name = "Universal Document Engine"
version = "1.0.0"

[parser]
type = "doxygen_xml"
input_dir = "docs/doxygen/xml"
ignore_internal = true
ignore_cond = true

[renderer]
format = "hugo"          # "hugo" or "html"
output_dir = "docs/content"
templates_dir = "templates"
```

---

## 3. Storage and Gzip Compression (IR)

To prevent cluttering Git commits and bloating repository storage, the IR intermediate file is aggressively compressed:
1. When `ude parse` finishes, the memory model `ProjectCatalog.model_dump_json()` is serialized to UTF-8.
2. The JSON text is compressed using the **Gzip** algorithm.
3. The compressed bytes are written directly to `<filename>.json.gz`.
4. When `ude render` starts, it reads and decompresses the Gzip archive into memory and initializes `ProjectCatalog.model_validate_json()`, completing an instant round-trip.

---

## 4. Exit Codes

To integrate cleanly with CI/CD pipelines, the CLI returns standardized exit codes:
* `0`: Pipeline completed successfully.
* `1`: General runtime errors or unhandled exceptions.
* `2`: Pydantic/IR validation schema violation (`ValidationError`).
* `3`: Missing input files or I/O write failures (`ParserError`, `RendererError`).
* `4`: Invalid config parameters or syntax.
