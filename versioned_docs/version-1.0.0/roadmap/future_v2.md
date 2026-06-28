---
sidebar_position: 3
---

# Roadmap: v2.0 and Beyond

## Version 2.0 — AI-Accelerated Core & Quality Upgrade

UDE v2.0 consolidates the pipeline's internal architecture across four clusters: Infrastructure modernisation, Library API & CLI unification, Typed Intermediate Representation, and QA & Testing completeness. It does **not** change the user-facing navigation architecture or render parity — those are explicitly deferred to v3.0+.

**Prerequisite:** UDE v1.0 MVP fully delivered.

v2.0 introduces breaking changes to the IR data model and `ProjectCatalog` schema. All parsers, renderers, and tests require refactoring for the typed entity models. All other user-facing configuration files remain backward compatible with v1.0.

**Deferred to v3.0+:** `sidebar.toml` as single navigation source (GAP-06), static/inline/redirect page rendering (GAP-26), fully static document generation (GAP-30), C++/C#/Java render parity (GAP-28), Docomatic legacy compatibility (GAP-29). These items depend on the v2.0 typed IR being fully stable before the navigation layer is refactored.

---

### Cluster A — Infrastructure (4 items)

| # | Item | GAP | Description |
|---|---|---|---|
| A1 | Global Config Activation | GAP-09 | Activate `doxygen_path`, `log_level`, `log_file`, `cache_root_dir`, `global_templates_dir` from `ude_global_config.json`. Currently only `error_policy` is active in v1.0. `translation_service` remains reserved until v3.0+. |
| A2 | Unified Logging | GAP-12 | Introduce a single `logging_setup()` call at engine startup configuring `StreamHandler` (stderr always) and `FileHandler` (when `log_file` is set). Fix incorrect logger label `ude.renderers` in `interfaces.py` (HC-05). Prerequisite: GAP-09. |
| A3 | L2 Render Cache Activation | GAP-07 | Wire `BuildCacheManager` L2 render cache into all renderer `render()` calls; IR-hash-based cache invalidation; orchestrator passes `cache_dir` from `cache_root_dir`. The `BuildCacheManager` implementation exists in `storage.py` but is currently not wired to renderers. Prerequisite: GAP-09 (`cache_root_dir`). |
| A4 | Doxyfile Key-Level Merge | GAP-11 | Parse each Doxyfile source as a `key = value` dictionary; apply 3-tier explicit override semantics (T1: global template → T2: target-specific template → T3: runtime parameters). Conflicts logged at `DEBUG` level. The v1.0 interim behaviour is source concatenation with Doxygen last-value-wins. |

### Cluster B — Library API & CLI (2 items)

| # | Item | GAP | Description |
|---|---|---|---|
| B1 | UdeOrchestrator Library API | GAP-05 | Expose `parse(config) -> ProjectCatalog`, `render(catalog, config) -> None`, and `run(config) -> None` as public methods on `UdeOrchestrator`. Reduce `cli.py` to argument parsing only. Consolidate `deep_merge()` and `find_product_json()` — currently duplicated in both `cli.py` and `orchestrator.py` — into `orchestrator.py`. |
| B2 | CLI Subcommands | GAP-01 | Add `ude compile`, `ude parse`, `ude render`, and `ude audit` subcommands. Prerequisite: GAP-05. `ude parse` followed by `ude render` must produce identical output to `ude compile`. The v1.0 CLI is a flat invocation: `ude --global-config <path> --sdk-config <path> --doc-config <path>`. |

### Cluster C — Typed IR (1 item)

| # | Item | GAP | Description |
|---|---|---|---|
| C1 | Typed Entity Models | GAP-03 | Replace the v1.0 `ClassEntity` discriminated union with seven typed Pydantic models: `ClassModel`, `MethodModel`, `ParameterModel`, `EnumModel`, `VariableModel`, `ConstantModel`, `TypeAliasModel`. Extend `ProjectCatalog` with `project_name: str` and `version: str` fields (currently absent). Refactor all parsers, renderers, and tests accordingly. This is the highest-effort item and a prerequisite for the v2.0 documentation coverage gate (GAP-10). |

### Cluster D — QA & Testing (3 items)

| # | Item | GAP | Description |
|---|---|---|---|
| D1 | Documentation Coverage Gate | GAP-10 | Add two read-only enforcement modes configurable via global config: `reject-undocumented` (non-zero exit if coverage below threshold) and `allow-undocumented` (warnings only). Add `ude audit` subcommand generating a coverage report per entity type. No LLM calls in v2.0 — enrichment modes (`auto-document`, `verify-document`) are v3.0+. Prerequisite: GAP-03 (typed IR for accurate per-entity-type counting). |
| D2 | External Script Confirmation | GAP-31 | Locate, commit, or re-implement three integration scripts referenced in `integration_tests_specification.md` whose repository location is currently unconfirmed: `Tests/run_regression_tests.py` (TEST-INT-01), `Tests/verify_pages.py` (TEST-INT-03), `Tests/check_links.py` (TEST-INT-04, TEST-INT-06). No `pipeline/tests/` or `pipeline/loadtest/` directory was found during the 2026-06-28 testing audit. The in-engine equivalents `engine/tests/test_golden_master.py` and `engine/tests/test_docomatic_alignment.py` are confirmed present. |
| D3 | Per-Language Integration Suites | GAP-32 | Implement full parse → render integration test suites for each of the four supported languages, exercising Doxygen XML input through to output file structure verification. Current per-language coverage is golden master regression only. Missing coverage per language: C++ — category landing pages, overload dispatcher pages, member-type index pages; C# — interface/delegate/event rendering, namespace index pages; Java — `extends`/`implements` relationship rendering, package-level index pages; Python — `fget`/`fset` property and dunder method edge cases. |

---

### Breaking Changes from v1.0

| Area | v1.0 | v2.0 |
|---|---|---|
| IR entity type | `ClassEntity` discriminated union | 7 typed Pydantic models |
| `ProjectCatalog` | `(namespaces, metadata)` | `(project_name, version, namespaces)` |
| CLI | Flat flags: `ude --global-config ... --sdk-config ... --doc-config ...` | Subcommands: `ude compile / parse / render / audit` |
| Global config | Only `error_policy` active | All fields active (`translation_service` reserved until v3.0+) |
| Logging | Default stderr WARNING | Configurable via `log_level` / `log_file` |
| `sidebar.toml` | Optional (graceful fallback to API Reference only) | Optional — unchanged in v2.0 |
| `toc_<ClassName>.json` | Required (nav tree source + flat-mapping algorithm) | Required — unchanged in v2.0 |

---

## Version 3.0+ — Deferred Roadmap

The following items are explicitly deferred to v3.0+. They depend on the v2.0 typed IR and architecture being fully stable, represent major infrastructure investments, or require direct v2.0 prerequisites.

**Prerequisite:** UDE v2.0 fully delivered.

### Navigation Architecture

* **`sidebar.toml` as Single Navigation Source (GAP-06)**: `sidebar.toml` becomes **required** in every SDK project configuration directory. Absent file terminates UDE with a clear error. `sidebar.toml` becomes the sole authoritative source for the complete sidebar, supporting `api_reference`, `static`, `inline`, and `redirect` node types. The `toc_<ClassName>.json` files in `SidebarStructures/` are removed. The `recovered_toc_algorithm` (flat-mapping rules, virtual group folder definitions) is embedded as class-level attributes in each of the 16 concrete renderer classes. **Breaking change surface:** every SDK project must add a `sidebar.toml`; `toc_<ClassName>.json` files must be migrated; `recovered_toc_algorithm` becomes non-user-configurable.

* **Static, Inline, and Redirect Page Rendering (GAP-26)**: Full rendering support for `type = "static"` (reads a file at `source_path`), `type = "inline"` (writes embedded `content` string), and `type = "redirect"` (generates `<meta http-equiv="refresh">` in HTML, `redirect_url` front-matter in Hugo) sidebar nodes across all 16 concrete renderer classes. Prerequisite: GAP-06.

* **Fully Static Document Generation (GAP-30)**: Complete self-contained static site composition from composed `static` / `inline` / `redirect` node hierarchies with nested child nodes. `source_path` in `static` nodes resolved relative to the `sidebar.toml` file location. Prerequisites: GAP-06, GAP-26.

### Language Parity & Legacy Compatibility

* **C++, C#, Java Render Parity (GAP-28)**: Equivalent rendering of category landing pages, namespace-level index pages, overload dispatcher pages (`!!OVERLOADED_*`), and member-type index pages (`!!MEMBERTYPE_*`) for all four languages. Currently only Python's `_post_render` generates these pages. Language-specific rules: C++ — `::` separator, `__` flat-mapping, pointer/reference substitution; C# — interface/delegate/event entity types; Java — `extends`/`implements` relationship rendering; Python — dunder method preservation, `fget`/`fset` property rendering. Prerequisite: GAP-03 typed IR must be stable.

* **Docomatic Legacy HTML Compatibility (GAP-29)**: The 8 HTML Legacy renderer classes (`CppHtmlLegacyRenderer`, `CsHtmlLegacyRenderer`, `JavaHtmlLegacyRenderer`, `PyHtmlLegacyRenderer`) validated and aligned against a Docomatic-generated reference HTML baseline. Hugo Markdown Legacy renderers are not bound by Docomatic HTML visual conventions.

### AI-Powered Documentation Enrichment

* **LLM Docstring Generation (REQ-BUS-05)**: `auto-document` mode writes LLM-generated English docstrings back to source files directly. `verify-document` mode generates PR proposals or draft branches requiring developer approval before merge. Both modes are non-interactive and CI/CD compatible. Prerequisite: v2.0 coverage gate (GAP-10).

* **Multi-Language Translation (REQ-BUS-06)**: Incremental gzip-compressed translation cache committed to Git, storing approved translations keyed by source string hash. Human override files for quality control. Activation of the `translation_service` field in `ude_global_config.json` (reserved in v1.0 and v2.0). Zero developer overhead for standard compilation runs. Prerequisite: v2.0 global config activation + v3.0+ LLM enrichment infrastructure.

* **XLIFF Integration**: CLI subcommands to export and import standard `.xlf` translation packets to professional translation services.

### Expanded Output Formats

* **RAG Hierarchical Export (REQ-BUS-04)**: Structured, metadata-rich hierarchical JSON (`--format json_rag`) for AI semantic search and developer chatbots. Fields per entity: entity type, fully qualified name, source file path and line range, signature hash, dependency relations, docstring in normalized CommonMark.

* **Structured XML Output (REQ-BUS-02)**: API catalog rendered as structured XML with a documented, stable schema.

* **Build and Execution Reporting (REQ-BUS-07)**: Post-compilation report: wall-clock time per pipeline stage, file counts, cache hit ratios (L1 and L2), API token usage and estimated cost for LLM calls.

### Advanced Parsing

* **SWIG Wrapper-Aware Parsing**: Identifies SWIG-generated files by convention; maps wrapper entities back to originating C++ API using SWIG transformation rules; extracts the consumer-facing public API rather than SWIG scaffolding. Integrates with `DoxygenXmlParser` as a selectable dialect. The existing `exclude_swig_internals` flag remains available. May be promoted to v2.0.

* **Native Language Parsers (REQ-BUS-01)**: Direct source code parsing without invoking Doxygen, using `tree-sitter` and `libclang` AST frontends. Produces the same `ProjectCatalog` IR as the Doxygen-based pipeline. Doxygen pipeline retained in parallel. May be promoted to v2.0.

### Advanced QA & Testing

* **CSS Visual Regression Testing (TEST-INT-10)**: Headless browser (Playwright or Selenium) screenshot pixel-diff checks against pre-approved PNG baselines. Flags layout shifts exceeding 0.1% threshold. Primary target: **Python**. Prerequisite: stable HTML template architecture — v2.0 `sidebar.toml` refactor and custom page rendering must be complete before baselines are meaningful.

* **Search Index Integrity & Anchor Verifier (TEST-INT-11)**: Validates search index JSON entries map to physical generated pages and resolves anchor references (`#ClassName`) to confirm matching `id`/`name` attributes exist. Primary spec target: Delphi; preferred fallback: Python. Traced: `REQ-FUN-31`.

* **Wrapper Boundary Parameter Integrity (TEST-INT-12)**: Validates parameter lists, data types, and default values across C++ → Python/Java/C# SWIG transformation boundary; alerts on renames, drops, or type remappings. Primary target: Python. Prerequisite: v3.0+ SWIG wrapper-aware parser. Traced: `TSK-RND-09`.

---

## Consolidated Deferred Requirements Reference

| ID | Version | Category | Description |
| :--- | :--- | :--- | :--- |
| GAP-01 | v2.0 | CLI | Subcommands (`compile / parse / render / audit`) |
| GAP-03 | v2.0 | IR | Typed Pydantic entity models (7 models replacing `ClassEntity`) |
| GAP-05 | v2.0 | Architecture | `UdeOrchestrator` library API; `cli.py` as thin wrapper |
| GAP-07 | v2.0 | Caching | L2 render cache activation |
| GAP-09 | v2.0 | Config | Global config field activation |
| GAP-10 | v2.0 | QA | Documentation coverage gate (read-only modes + `ude audit`) |
| GAP-11 | v2.0 | Collector | Doxyfile key-level 3-tier merge |
| GAP-12 | v2.0 | Infra | Unified logging (`logging_setup()`) |
| GAP-31 | v2.0 | QA | External integration scripts — confirm or re-implement |
| GAP-32 | v2.0 | QA | Per-language integration test suites |
| GAP-06 | v3.0+ | Navigation | `sidebar.toml` as single navigation source; `toc_*.json` removal |
| GAP-26 | v3.0+ | Rendering | Static / inline / redirect page rendering |
| GAP-28 | v3.0+ | Rendering | C++ / C# / Java render parity |
| GAP-29 | v3.0+ | Rendering | Docomatic legacy HTML compatibility |
| GAP-30 | v3.0+ | Rendering | Fully static document generation |
| REQ-BUS-01 | v3.0+ | Parsing | Native language parsers (Doxygen-independent) |
| REQ-BUS-02 | v3.0+ | Output | Structured XML output format |
| REQ-BUS-04 | v3.0+ | Output | RAG hierarchical JSON export |
| REQ-BUS-05 | v3.0+ | AI | LLM docstring enrichment (`auto-document` / `verify-document`) |
| REQ-BUS-06 | v3.0+ | AI | Multi-language translation cache + XLIFF integration |
| REQ-BUS-07 | v3.0+ | Reporting | Build and execution cost reporting |
| TEST-INT-10 | v3.0+ | QA | CSS visual regression testing |
| TEST-INT-11 | v3.0+ | QA | Search index integrity & anchor verifier |
| TEST-INT-12 | v3.0+ | QA | Wrapper boundary parameter integrity |
