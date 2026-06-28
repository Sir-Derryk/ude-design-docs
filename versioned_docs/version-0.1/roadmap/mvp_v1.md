---
sidebar_position: 2
---

# MVP (v1.0) Release Plan

The **MVP (v1.0)** of the Universal Documentation Engine (UDE) focuses on building a robust, fully automated, offline documentation compiler using Doxygen XML as the primary ingestion format, and outputting beautifully formatted Hugo Markdown and static HTML pages.

## Scope of MVP (v1.0)

### Ingestion, Ignore Tags & Core Extraction
* **Doxygen XML Parsing**: Full support for ingesting Doxygen-generated `index.xml` and parsing compound XML documents.
* **Supported Languages**: Multi-language extraction of API structures from C++, C#, Java, and Python.
* **CommonMark Normalization**: Normalizing various comment styles (Javadoc, Google, etc.) into structured CommonMark Markdown.
* **Ignore Tags (`REQ-FUN-13`)**: The parser strictly respects code block range exclusions (`DOM-IGNORE-BEGIN`/`DOM-IGNORE-END`), conditional directives (`\cond`/`\endcond`), and internal modifiers (`\internal`) to completely omit these blocks from the Intermediate Representation (IR).
* **Pydantic Validation**: Utilizing Pydantic v2 to validate and serialize Intermediate Representation (IR) files in memory.

### Multi-Format Rendering
* **Jinja2 Templates**: Leveraging Jinja2 for custom, flexible rendering.
* **Hugo Markdown**: Generating structured markdown files tailored for the Hugo SSG, including customizable YAML/TOML front-matter metadata layout injections.
* **Static HTML**: Direct compilation of the IR into local static HTML documentation pages.

### Git Hygiene & Optimization
* **IR Database Compression**: Transparent compression/decompression of IR databases using the Gzip algorithm (`.json.gz`).
* **On-the-Fly Compilation**: Ensure zero compiled documentation files are checked into Git by rendering dynamically in CI/CD.

## Included Requirements

| Requirement ID | Type | Description |
| :--- | :--- | :--- |
| **`REQ-BUS-01`** | Business | Extensible Input Ingestion (Baseline: Doxygen XML) |
| **`REQ-BUS-02`** | Business | Multi-Format Rendering (HTML, Hugo Markdown) |
| **`REQ-BUS-03`** | Business | Gzip-compressed IR database storage |
| **`REQ-BUS-09`** | Business | Seamless Pipeline CI/CD Automation |
| **`REQ-FUN-01`** | Functional | Doxygen XML parser frontend |
| **`REQ-FUN-02`** | Functional | Multi-language API extraction (C++, C#, Java, Python) & CommonMark normalizer |
| **`REQ-FUN-03`** | Functional | HTML and Hugo Markdown rendering |
| **`REQ-FUN-04`** | Functional | Front-matter metadata templates |
| **`REQ-FUN-07`** | Functional | Non-interactive CLI flags & codes |
| **`REQ-FUN-11`** | Functional | Gzip IR compression (`.json.gz`) |
| **`REQ-FUN-13`** | Functional | Ignore Tags & Range Boundaries |
| **`REQ-NFN-01`** | Non-Functional | Execution performance (< 5s for 1000 classes) |
| **`REQ-NFN-02`** | Non-Functional | Modularity via abstract base classes (`BaseParser`, `BaseRenderer`) |
| **`REQ-NFN-03`** | Non-Functional | At least 90% unit test coverage |
| **`REQ-NFN-04`** | Non-Functional | Pydantic v2 core validation & Jinja2 rendering |
