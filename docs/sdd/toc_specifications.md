---
sidebar_position: 6
---

# Appendix: Table of Contents & Flat-Mapping Specifications

This specification serves as the official System Design Document (SDD) Appendix (Variant A), outlining the logical hierarchies, Table of Contents (TOC) schemas, and logical-to-physical disk flat-mapping file conventions of the Universal Documentation Engine (UDE) across all four supported target SDK languages (**C++, C#, Java, Python**).

---

## 📐 1. Decoupling and Rendering Architecture

To preserve modular clean design, UDE strictly separates rendering targets. Different formatting rules are applied depending on the renderer component in use:

1. **`HugoMarkdownRenderer`**:
   * Generates standard Markdown outputs for static site generators.
   * Compiles the logical TOC hierarchy directly into YAML/TOML front-matter metadata blocks (`title`, `weight`, `parent`) within individual `.md` files. This allows the SSG (Hugo/VitePress) to automatically build its own sidebar.
   * Markdown formatting and front-matter rules apply **strictly** to this renderer.

2. **`HtmlRenderer`**:
   * Generates offline-friendly standalone flat-mapped `.html` files.
   * Stores the complete, cross-linked TOC tree structure inside a single global JSON object `window.UDE_NAV_DATA` in `nav_data.js`.
   * Integrates an interactive search and resizable sidebar directly inside the DOM without CORS protocol blocks.
   * HTML, visual CSS, and DOM-specific interaction rules apply **strictly** to this renderer.

---

## 🌲 2. Language-Specific TOC & Flat-Mapping Specifications

To prevent links breaking and compatibility issues on Windows, IIS, Apache, and Nginx, UDE maps complex logical namespace/package nesting to a flat, safe file directory structure on disk.

### 2.1 C++ SDK Specification

#### 📁 Logical Hierarchy (Nested Namespaces)
C++ supports arbitrary multi-level nested namespaces. The logical TOC structure represents this nesting, grouping entities (classes, functions, structures, enums) under each namespace.

```text
▲ API Reference (C++)
  ├── [Namespace] MyNamespace
  │     ├── [Namespace] MyNamespace::Features
  │     │     ├── [Namespace] MyNamespace::Features::Parting
  │     │     │     ├── [Folder] Classes
  │     │     │     │     ├── [Class] PartingLine
  │     │     │     │     │     ├── [Constructor] PartingLine
  │     │     │     │     │     ├── [Destructor] ~PartingLine
  │     │     │     │     │     ├── [Folder] Methods
  │     │     │     │     │     │     ├── [Method] apply (double)
  │     │     │     │     │     │     └── [Method] getResult
  │     │     │     │     │     └── [Folder] Variables
  │     │     │     │     │           └── [Field] m_draftAngle
  │     │     │     │     └── [Class] PartingSurface
  │     │     │     ├── [Folder] Functions
  │     │     │     │     └── [Function] createPartingLine (const Body&)
  │     │     │     └── [Folder] Enumerations
  │     │     │           └── [Enum] PartingType
```

#### 💾 Physical Disk Flat-Mapping Rules (C++)
1. **Namespace Scope**: Double colons `::` are mapped to double underscores `__`.
2. **Class-Namespace Nesting**: Linked via double underscores `__`.
3. **Class Members (Methods, Fields)**: Separated from the enclosing class via double underscores `__`.
4. **Overload Signatures**: Parameters are appended after the member name, prefixed and separated by the commercial at `@` character. Specifiers like pointer `*` and reference `&` are replaced with `_ptr` and `_ref` respectively.

| Logical API Path | Physical Flat-Mapped Filename |
| :--- | :--- |
| `MyNamespace` (Namespace) | `MyNamespace.html` |
| `MyNamespace::Features` (Namespace) | `MyNamespace__Features.html` |
| `MyNamespace::Features::Parting::PartingLine` (Class) | `class_MyNamespace__Features__Parting__PartingLine.html` |
| `PartingLine` (Constructor with double) | `class_MyNamespace__Features__Parting__PartingLine__PartingLine@double.html` |
| `apply(double)` (Method) | `class_MyNamespace__Features__Parting__PartingLine__apply@double.html` |
| `getResult()` (Method) | `class_MyNamespace__Features__Parting__PartingLine__getResult.html` |
| `createPartingLine(const Body&)` (Global function)| `MyNamespace__Features__Parting__createPartingLine@const_Body_ref.html` |

---

### 2.2 C# (.NET) SDK Specification

#### 📁 Logical Hierarchy (Nested Namespaces)
C# namespaces are organized hierarchically using dot separation. The TOC mirrors this directory-style structure, grouping classes, interfaces, delegates, enums, and events.

```text
▲ API Reference (C#)
  └── [Namespace] MyCompany
        └── [Namespace] MyCompany.MyProduct
              └── [Namespace] MyCompany.MyProduct.Core
                    ├── [Namespace] MyCompany.MyProduct.Core.Geom
                    │     ├── [Folder] Classes
                    │     │     ├── [Class] Vector3D
                    │     │     │     ├── [Constructor] Vector3D (double, double, double)
                    │     │     │     ├── [Folder] Properties
                    │     │     │     │     ├── [Property] X (get; set;)
                    │     │     │     │     └── [Property] Y (get; set;)
                    │     │     │     └── [Folder] Methods
                    │     │     │           ├── [Method] Length()
                    │     │     │           └── [Method] DotProduct(Vector3D)
                    │     │     └── [Class] Point3D
                    │     ├── [Folder] Interfaces
                    │     │     └── [Interface] IGeometry3D
                    │     └── [Folder] Enumerations
                    │           └── [Enum] CoordinateSystem
```

#### 💾 Physical Disk Flat-Mapping Rules (C#)
1. **Namespace Scope**: Dot separators `.` are mapped to double underscores `__`.
2. **Class-Namespace Nesting**: Linked via double underscores `__`.
3. **Class Members (Properties, Methods, Events, Fields)**: Separated from the enclosing class via double underscores `__`.
4. **Overload Signatures**: Parameters are appended after the member name, prefixed and separated by the commercial at `@` character.

| Logical API Path | Physical Flat-Mapped Filename |
| :--- | :--- |
| `MyCompany.MyProduct` (Namespace) | `MyCompany__MyProduct.html` |
| `MyCompany.MyProduct.Core.Geom.Vector3D` (Class) | `class_MyCompany__MyProduct__Core__Geom__Vector3D.html` |
| `Vector3D` (Constructor with 3 doubles) | `class_MyCompany__MyProduct__Core__Geom__Vector3D__Vector3D@double@double@double.html` |
| `X` (Property of `Vector3D`) | `class_MyCompany__MyProduct__Core__Geom__Vector3D__X.html` |
| `DotProduct(Vector3D)` (Method) | `class_MyCompany__MyProduct__Core__Geom__Vector3D__DotProduct@Vector3D.html` |
| `IGeometry3D` (Interface) | `interface_MyCompany__MyProduct__Core__Geom__IGeometry3D.html` |

---

### 2.3 Java SDK Specification

#### 📁 Logical Hierarchy (Nested Packages)
Java modules rely on nested package trees. The TOC displays every package as a directory containing sub-packages, classes, interfaces, and enums.

```text
▲ API Reference (Java)
  └── [Package] com
        └── [Package] com.example
              └── [Package] com.example.product
                    ├── [Package] com.example.product.features
                    │     ├── [Package] com.example.product.features.parting
                    │     │     ├── [Folder] Classes
                    │     │     │     ├── [Class] PartingTool
                    │     │     │     │     ├── [Constructor] PartingTool (double)
                    │     │     │     │     ├── [Folder] Methods
                    │     │     │     │     │     ├── [Method] execute()
                    │     │     │     │     │     └── [Method] setTolerance(double)
                    │     │     │     │     └── [Folder] Fields
                    │     │     │     │           └── [Field] DEFAULT_TOLERANCE
                    │     │     │     └── [Class] PartingVerifier
                    │     │     ├── [Folder] Interfaces
                    │     │     │     └── [Interface] IPartingOperation
                    │     │     └── [Folder] Enumerations
                    │     │           └── [Enum] VerificationResult
```

#### 💾 Physical Disk Flat-Mapping Rules (Java)
1. **Package Nesting**: In contrast to C++ and C#, Java package dot separators `.` are mapped to a **single underscore** `_`.
2. **Class-Package Scope**: Linked via a single underscore `_`.
3. **Class Members (Methods, Fields)**: Separated from the enclosing class via double underscores `__`.
4. **Overload Signatures**: Parameters are appended after the member name, prefixed and separated by the commercial at `@` character.

| Logical API Path | Physical Flat-Mapped Filename |
| :--- | :--- |
| `com.example.product` (Package) | `com_example_product.html` |
| `com.example.product.features.parting.PartingTool` (Class) | `class_com_example_product_features_parting_PartingTool.html` |
| `PartingTool(double)` (Constructor) | `class_com_example_product_features_parting_PartingTool__PartingTool@double.html` |
| `execute()` (Method) | `class_com_example_product_features_parting_PartingTool__execute.html` |
| `setTolerance(double)` (Method) | `class_com_example_product_features_parting_PartingTool__setTolerance@double.html` |
| `IPartingOperation` (Interface) | `interface_com_example_product_features_parting_IPartingOperation.html` |

---

### 2.4 Python SDK Specification

#### 📁 Logical Hierarchy (Packages and Modules)
Python structures APIs through packages, sub-packages, and modules. The logical TOC groups classes, module-level functions, and exceptions.

```text
▲ API Reference (Python)
  └── [Package] ude
        ├── [Package] ude.parsers
        │     ├── [Module] doxygen
        │     │     ├── [Folder] Classes
        │     │     │     ├── [Class] DoxygenXmlParser
        │     │     │     │     ├── [Method] __init__ (self, config_path: str)
        │     │     │     │     ├── [Folder] Methods
        │     │     │     │     │     ├── [Method] parse_file (self, file_path: str)
        │     │     │     │     │     └── [Method] cleanup (self)
        │     │     │     │     └── [Folder] Properties
        │     │     │     │           └── [Property] version (fget)
        │     │     │     └── [Class] ParserConfig
        │     │     └── [Folder] Functions
        │     │           └── [Function] get_default_parser()
```

#### 💾 Physical Disk Flat-Mapping Rules (Python)
1. **Module & Package Scope**: Dot separators `.` are mapped to a **single underscore** `_`.
2. **Class-Module Scope**: Linked via a single underscore `_`.
3. **Class Members (Methods, Properties)**: Separated from the enclosing class via double underscores `__`.
4. **Overload Signatures**: Parameters are appended after the member name, prefixed and separated by the commercial at `@` character. Dunder (built-in) methods preserve their native double underscores.

| Logical API Path | Physical Flat-Mapped Filename |
| :--- | :--- |
| `ude.parsers` (Package) | `ude_parsers.html` |
| `ude.parsers.doxygen.DoxygenXmlParser` (Class) | `class_ude_parsers_doxygen_DoxygenXmlParser.html` |
| `__init__(self, config_path: str)` (Constructor) | `class_ude_parsers_doxygen_DoxygenXmlParser____init__@str.html` |
| `parse_file(self, file_path: str)` (Method) | `class_ude_parsers_doxygen_DoxygenXmlParser__parse_file@str.html` |
| `version` (Property) | `class_ude_parsers_doxygen_DoxygenXmlParser__version.html` |
| `get_default_parser()` (Global function) | `ude_parsers_doxygen_get_default_parser.html` |

---

## 🗃️ 3. Declarative Sidebar JSON Structure

At runtime, UDE organizes navigation and hierarchy conforming to declarative sidebar layouts. These definitions are stored in JSON schemas inside `SidebarStructures/default/` (e.g., `toc_cpp.json`, `toc_py.json`).

### 3.1 Layout JSON Schema Specification

Each sidebar structure defines a language's structural order, listing how namespaces, packages, classes, and members should be nested and visual icons mapped.

```json
{
  "language": "cpp",
  "root_label": "C++ API Reference",
  "hierarchy": {
    "namespace": {
      "nesting": "recursive",
      "icon": "fas fa-code",
      "groups": {
        "classes": {
          "label": "Classes",
          "icon": "fas fa-cube",
          "prefix": "class_"
        },
        "structs": {
          "label": "Structures",
          "icon": "fas fa-th-large",
          "prefix": "struct_"
        },
        "interfaces": {
          "label": "Interfaces",
          "icon": "fas fa-shield-alt",
          "prefix": "interface_"
        },
        "enums": {
          "label": "Enumerations",
          "icon": "fas fa-list",
          "prefix": "enum_"
        },
        "functions": {
          "label": "Functions",
          "icon": "fas fa-cogs",
          "prefix": "func_"
        }
      }
    }
  }
}
```

This layout schema guarantees that UDE compiles identical navigation bars in MVP v1.0, and establishes a extensible base for dynamic parsing in v2.0+.
