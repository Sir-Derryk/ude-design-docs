---
sidebar_position: 4
---

# Component Contracts (Class Interfaces)

This document defines the strict Python interfaces and class contracts for the core components of the Universal Document Engine (UDE) to ensure loose coupling and modular extensibility.

> [!IMPORTANT]
> **Strict Portability Principle**: Physical file and directory paths must never be hardcoded inside any of the component classes or engine implementation code. All paths must be loaded from configurations as relative paths (relative to the configuration file location) and resolved dynamically to absolute paths by the UDE Orchestrator at startup before being passed to components.

## Exception Hierarchy

All custom errors in UDE inherit from a unified base exception to enable robust CLI error reporting.

```python
class UdeError(Exception):
    """Base exception for all Universal Document Engine errors."""
    pass

class ParserError(UdeError):
    """Raised when parsing fails or input files are corrupted."""
    pass

class ValidationError(UdeError):
    """Raised when the Intermediate Representation fails Pydantic schema validation."""
    pass

class RendererError(UdeError):
    """Raised when template compilation or output generation fails."""
    pass

class EnvironmentError(UdeError):
    """Raised when required software binaries (e.g. Doxygen) or configurations are missing."""
    pass
```

## Collector Interface (Preprocessing / Ingestion)

The Collector component is responsible for retrieving, compiling, or organizing the raw source files into a unified format for ingestion. For example, compiling C++ headers into Doxygen XML in a temporary directory, and cleaning it up after parsing.

```python
from abc import ABC, abstractmethod
from pathlib import Path

class BaseCollector(ABC):
    """Abstract base class for all preprocessing and ingestion data collectors."""

    @abstractmethod
    def validate_environment(self, config_path: Path) -> None:
        """
        Performs pre-flight checks on software binaries, configurations, and source paths.

        Args:
            config_path: Path to the target's configuration schema.

        Raises:
            EnvironmentError: If required software (e.g. Doxygen) or paths are missing.
        """
        pass

    @abstractmethod
    def collect(self, config_path: Path) -> Path:
        """
        Preprocesses or gathers the target code resources.
        Creates temporary folders/structures if required.

        Args:
            config_path: Path to the target's configuration schema.

        Returns:
            Path to the directory containing files prepared for the Parser.
        """
        pass

    @abstractmethod
    def cleanup(self, temp_path: Path) -> None:
        """
        Cleans up any temporary directories, files, or system artifacts created.

        Args:
            temp_path: Path returned by the collect() method.
        """
        pass
```

### Concrete Implementations

In Version 1.0, all supported SDK languages (C++, C#, Java, Python) use Doxygen as the unified preprocessing and XML-extraction backend. Therefore, the single collector implementation used is `DoxygenXmlCollector`.

#### `DoxygenXmlCollector`
* **Responsibilities**:
  1. **`validate_environment()`**:
     - Verifies Python is installed, executable, and accessible on system PATH.
     - Verifies that the `doxygen` binary is installed and executable (checks system PATH and paths specified in `ude_global.json`).
     - Ensures that the `Doxyfile` exists.
     - Verifies that the source directories (`src_dir`) specified in the config exist, are accessible, and contain the required raw source code files matching the target language (e.g., C++ headers `.h`/`.hpp`, C# `.cs` files, Java `.java` files, or Python `.py` files) needed for Doxygen XML compilation.
  2. Runs `doxygen Doxyfile` as a subprocess inside the project target directory.
  3. Directs Doxygen XML output to an isolated temporary directory.
  4. Deletes the entire temporary XML folder recursively during the `cleanup` phase inside a `finally` block for all languages.

#### `NativeSourceCollector` (Deferred to v2.0+)
* **Responsibilities**:
  1. **`validate_environment()`**:
     - Verifies Python is installed, executable, and accessible on system PATH.
     - Verifies that the source directories (`src_dir`) specified in the config actually exist, are accessible, and contain the required raw source code files needed for parsing.
  2. Simply returns the absolute path to the local source directory directly (e.g. `src_dir`).
  3. Performs no preprocessing actions and has a no-op `cleanup()` phase.

---

## Parser Interface

The Parser component is responsible for reading static source analysis files (e.g., Doxygen XML) and returning a fully populated and validated `ProjectCatalog`.

```python
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional
from .data_model import ProjectCatalog

class BaseParser(ABC):
    """Abstract base class for all documentation parser frontends."""

    def __init__(self, ignore_internal: bool = True, ignore_cond: bool = True):
        """
        Args:
            ignore_internal: If True, blocks marked \internal will be flagged as ignored.
            ignore_cond: If True, blocks enclosed in \cond/\endcond will be ignored.
        """
        self.ignore_internal = ignore_internal
        self.ignore_cond = ignore_cond

    @abstractmethod
    def parse(self, input_dir: Path, cache_dir: Optional[Path] = None) -> ProjectCatalog:
        """
        Parses raw code analysis output from input_dir and constructs the IR model.

        Args:
            input_dir: Path to the directory containing analysis source files (e.g. XMLs).
            cache_dir: Optional path to the target `<sdk>_<lang>` directory where `.build_cache.json.gz` is stored.

        Returns:
            A validated ProjectCatalog root model.

        Raises:
            ParserError: If files are missing, unreadable, or invalid.
            ValidationError: If the constructed data violates the IR Pydantic schema.
        """
        pass
```

### Concrete Implementation: `DoxygenXmlParser`
* **Inherits from**: `BaseParser`
* **Responsibilities**:
  1. Locates `index.xml` in `input_dir` to map namespaces, classes, structs, and globals.
  2. Parses compound XML files (e.g., `class*.xml`, `namespace*.xml`) using optimized XML streaming (`lxml` or `xml.etree`).
  3. Detects ignore comments (such as `DOM-IGNORE-BEGIN`/`DOM-IGNORE-END`, `@cond`, and `@internal`) to mark entities as `is_ignored = True`.
  4. Parses method signatures, parameters, return types, variables, and type aliases.
  5. Translates Doxygen XML tags (e.g., `<para>`, `<parameterlist>`) into normalized **CommonMark Markdown** blocks inside the descriptions.

---

## Renderer Interface

The Renderer component accepts a validated `ProjectCatalog` IR and converts it into physical documentation files using **Jinja2** templates.

```python
class BaseRenderer(ABC):
    """Abstract base class for all documentation rendering backends."""

    def __init__(self, templates_dir: Optional[Path] = None):
        """
        Args:
            templates_dir: Optional path to custom Jinja2 templates.
                           If None, default built-in templates are utilized.
        """
        self.templates_dir = templates_dir

    @abstractmethod
    def render(self, catalog: ProjectCatalog, output_dir: Path, cache_dir: Optional[Path] = None) -> None:
        """
        Renders the ProjectCatalog IR into the target output directory.

        Args:
            catalog: The validated ProjectCatalog IR data.
            output_dir: Target directory path where output files will be created.
            cache_dir: Optional path to the target `<sdk>_<lang>` directory where `.build_cache.json.gz` is stored.

        Raises:
            RendererError: If directory creation, template compiling, or rendering fails.
        """
        pass
```

### Concrete Implementations

#### `HugoMarkdownRenderer`
* **Inherits from**: `BaseRenderer`
* **Key Tasks**: 
  - Compiles the hierarchy into markdown files structured for Hugo (e.g., namespace and class folders with `_index.md` files).
  - Automatically injects configurable Front-Matter YAML blocks (e.g., `title`, `draft`, `sidebar_position`).
  - Processes method and class lists into clean Markdown tables.

#### `HtmlRenderer`
* **Inherits from**: `BaseRenderer`
* **Key Tasks**:
  - Compiles the entire model into a single-page or multi-page static HTML portal.
  - Injects pre-compiled, premium CSS styles directly into pages to achieve a wow-effect without external framework dependencies.
  - Generates responsive tables and sidebar navigation lists.

---

## Incremental Caching System

To minimize execution time and prevent unnecessary file writes during local development and CI/CD runs, UDE implements a two-level caching system (Parsing Cache and Rendering Cache) using a unified cache file `.build_cache.json.gz` stored inside the `<sdk>_<lang>` directory.

### 1. Incremental Parsing Cache

The parsing caching system operates as follows:
* **Storage Location**: `<sdk>_<lang>/.build_cache.json.gz` (automatically created, read, and updated).
* **Metadata Tracked**:
  - `file_path`: Relative or absolute path to the input XML file (e.g., `class_od_gi_context.xml`).
  - `last_modified`: File modification timestamp (float).
  - `sha256`: SHA-256 content hash of the input XML file.
  - `parsed_entities`: List of generated IR entities mapped to this input file.
* **Process Flow**:
  1. At startup, the Orchestrator checks if `"incremental": true` is enabled in `ude_config.json`.
  2. If enabled, the Orchestrator reads and decompresses `<sdk>_<lang>/.build_cache.json.gz`.
  3. The `BaseParser` processes input XML files from the temporary directory. For each XML file:
     - It calculates the SHA-256 hash or checks the modification timestamp.
     - If the file exists in the cache and the hash/timestamp matches, it loads the previously parsed entities directly from the cached IR, skipping XML parsing entirely.
     - If the file is new or has been modified, it performs full XML parsing, extracts the entities, and updates the cache record.
  4. The updated cache is compressed and saved back to `<sdk>_<lang>/.build_cache.json.gz`.

### 2. Incremental Rendering Cache

The rendering caching system optimizes disk operations and avoids rewriting static documentation files:
* **Storage Location**: Shared inside `<sdk>_<lang>/.build_cache.json.gz`.
* **Metadata Tracked**:
  - `output_file`: Path to the generated output file (e.g., `namespaces/od_gi_context/_index.md`).
  - `entity_hash`: Content/signature hash of the corresponding IR entity.
  - `template_hash`: SHA-256 hash of the Jinja2 template file used to render this entity.
* **Process Flow**:
  1. The Orchestrator checks if `"incremental": true` is enabled for the renderer.
  2. When `BaseRenderer.render()` is invoked, for each entity in the `ProjectCatalog`:
     - It determines the target output filepath.
     - It computes the composite hash (entity data hash + template file hash).
     - It compares this composite hash against the cached record in `.build_cache.json.gz`.
     - If the hash matches and the output file physically exists on disk in `output_dir`, the renderer **skips writing to disk**, leaving the file untouched.
     - If the hash does not match, or if the file is missing from the disk, the renderer executes template compilation, writes the rendered content to `output_dir`, and updates the cache record.
  3. This ensures that only modified API entities trigger physical disk I/O, which keeps Hugo's incremental build fast and keeps Git commits of static documentation extremely clean.
