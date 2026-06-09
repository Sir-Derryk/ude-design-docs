---
sidebar_position: 4
---

# Component Contracts (Class Interfaces)

This document defines the strict Python interfaces and class contracts for the core components of the Universal Document Engine (UDE) to ensure loose coupling and modular extensibility.

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

#### `DoxygenXmlCollector`
* **Responsibilities**:
  1. **`validate_environment()`**:
     - Verifies Python is installed, executable, and accessible on system PATH.
     - Verifies that the `doxygen` binary is installed and executable (checks system PATH and paths specified in `ude_global.json`).
     - Ensures that the `Doxyfile` exists.
     - Verifies that the source directories (`src_dir`) specified in the config exist, are accessible, and contain the required raw source code files (e.g. C++ header files `.h`) needed for Doxygen XML compilation.
  2. Runs `doxygen Doxyfile` as a subprocess inside the project target directory.
  3. Directs Doxygen XML output to an isolated temporary directory.
  4. Deletes the entire temporary XML folder recursively during the `cleanup` phase.

#### `NativeSourceCollector`
* **Responsibilities**:
  1. **`validate_environment()`**:
     - Verifies Python is installed, executable, and accessible on system PATH.
     - Verifies that the source directories (`src_dir`) specified in the config actually exist, are accessible, and contain the required raw source code files (e.g. C# `.cs`, Java `.java`, or Python `.py` files) needed for parsing.
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
    def parse(self, input_dir: Path) -> ProjectCatalog:
        """
        Parses raw code analysis output from input_dir and constructs the IR model.

        Args:
            input_dir: Path to the directory containing analysis source files (e.g. XMLs).

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
    def render(self, catalog: ProjectCatalog, output_dir: Path) -> None:
        """
        Renders the ProjectCatalog IR into the target output directory.

        Args:
            catalog: The validated ProjectCatalog IR data.
            output_dir: Target directory path where output files will be created.

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
