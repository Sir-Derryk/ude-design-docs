---
sidebar_position: 2
---

# MVP (v1.0) Release Plan

The **MVP (v1.0)** of the Universal Document Engine (UDE) focuses on building a robust, fully automated documentation pipeline using Doxygen XML as the primary ingestion format, and outputting formatted Hugo/VitePress Markdown and RAG JSON.

## Scope of MVP (v1.0)

### 1. Ingestion & Core Extraction
* **Doxygen XML Parsing**: Full support for ingesting Doxygen-generated `index.xml` and parsing compound XML documents.
* **Supported Languages**: Multi-language extraction of API structures from C++, C#, Java, and Python.
* **CommonMark Normalization**: Normalizing various comment styles (Javadoc, Google, Javadoc, etc.) into structured CommonMark Markdown.
* **Pydantic Validation**: Utilizing Pydantic v2 to validate and serialize Intermediate Representation (IR) files.

### 2. Multi-Format Rendering
* **Jinja2 Templates**: Leveraging Jinja2 for custom rendering.
* **Hugo/VitePress Markdown**: Generating static markdown files with customizable YAML/TOML metadata layout injections.
* **Structured RAG Export**: Generating semantic JSON schemas (`json_rag`) containing fully mapped structures and docstrings with high-density metadata.

### 3. Localization Gating & Enrichment
* **Server-Side Push-Gate**: Full execution of `--push-gate-mode` supporting:
  * `reject`: Blocks push/merge on low coverage without making AI calls.
  * `allow`: Logs warnings and coverage details.
  * `auto-document`: Runs `ude-enrich` to fetch English docstrings and write them back.
  * `verify-document`: Generates suggestions and PR change structures in a draft branch.
* **Context-Rich Enrichment**: Extracting signature declarations + definition bodies to prompt LLMs for English docstrings.
* **Offline Gating**: Safe offline fallback and mock support during local execution.

### 4. Git Hygiene & Optimization
* **IR Database Compression**: Transparent compression/decompression of IR databases using the Gzip algorithm (`.json.gz`).
* **On-the-Fly Compilation**: Ensure zero compiled files are checked into Git by rendering dynamically in CI/CD.

## Included Requirements

| Requirement ID | Type | Description |
| :--- | :--- | :--- |
| **`REQ-BUS-01`** | Business | Extensible Input Ingestion (Baseline: Doxygen XML) |
| **`REQ-BUS-02`** | Business | Multi-Format Rendering (HTML, Markdown, RAG JSON, XML) |
| **`REQ-BUS-03`** | Business | Gzip-compressed IR database storage |
| **`REQ-BUS-04`** | Business | RAG Ingestion Format Support |
| **`REQ-BUS-05`** | Business | Push-Gate Gating and LLM English Enrichment |
| **`REQ-BUS-07`** | Business | Performance and Token Cost Reporting |
| **`REQ-BUS-08`** | Business | Documentation Coverage Auditing |
| **`REQ-BUS-09`** | Business | Seamless Pipeline CI/CD Automation |
| **`REQ-FUN-01`** | Functional | Doxygen XML parser frontend |
| **`REQ-FUN-02`** | Functional | Multi-language API extraction (C++, C#, Java, Python) & CommonMark normalizer |
| **`REQ-FUN-03`** | Functional | HTML, Markdown, XML, JSON rendering |
| **`REQ-FUN-04`** | Functional | Front-matter metadata templates |
| **`REQ-FUN-05`** | Functional | `--format json_rag` structured export |
| **`REQ-FUN-08`** | Functional | Push-gate execution modes (`reject`, `allow`, `auto-document`, `verify-document`) |
| **`REQ-FUN-09`** | Functional | Context-rich signature + definition LLM ingestion |
| **`REQ-FUN-07`** | Functional | Non-interactive CLI flags & codes |
| **`REQ-FUN-11`** | Functional | Gzip IR compression (`.json.gz`) |
| **`REQ-NFN-01`** | Non-Functional | Execution performance (< 5s for 1000 classes) |
| **`REQ-NFN-02`** | Non-Functional | Modularity via abstract base classes |
| **`REQ-NFN-03`** | Non-Functional | At least 90% unit test coverage |
| **`REQ-NFN-04`** | Non-Functional | Pydantic v2 core validation & Jinja2 rendering |
