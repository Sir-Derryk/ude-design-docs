---
sidebar_position: 1
---

# Release Planning & Document History

This section details how the business and software requirements of the **Universal Documentation Engine (UDE)** are distributed across developmental release milestones, and tracks the version history of this specification document.

## Document Version History

We track the revisions of these specifications using a structured versioning schema:

| Doc Version | Date | Phase Description | Lead Author | Status |
| :--- | :--- | :--- | :--- | :--- |
| **`0.2`** | **2026-06-08** | **Planning MVP** | **Sir Derryk** | **Approved (Current)** |
| **`0.1`** | **2026-06-07** | **Requirements gathering** | **Sir Derryk** | **Approved (Superceded)** |

* **Version 0.2 Scope**: Granular scheduling of 12 TDD tasks across 5 weeks, preparing executable development task specifications, and updating Docusaurus navigation layouts.
* **Version 0.1 Scope**: Gathering high-level business goals (BRD), defining system functional/non-functional constraints (SRS), drafting the pipeline design (SDD), and mapping out the implementation schedule.

---

## Release Planning Summary

To guarantee a fast, stable, and highly predictable development process, the implementation of UDE is structured into two main releases:

```mermaid
gantt
    title UDE Roadmap Phasing
    dateFormat  YYYY-MM-DD
    section MVP (v1.0)
    Infra, Storage & Parsing (W1-2) :active, 2026-06-08, 2026-06-21
    Normalization & Ignore Tags (W3):active, 2026-06-22, 2026-06-28
    Jinja2 Markdown & HTML (W4)     :active, 2026-06-29, 2026-07-05
    CLI Automation & E2E (W5)       :active, 2026-07-06, 2026-07-12
    section Future Releases (v2.0+)
    Localization & AI Translate     : 2026-07-13, 2026-07-30
    Advanced AST Parsers            : 2026-07-31, 2026-08-15
```

1. **[MVP (v1.0) Release Plan](./mvp_v1/requirements.md)**: Focuses on core parsing, AST extraction, CommonMark rendering, push-gating, and complete local execution.
2. **[Future Releases (v2.0+)](./future_v2.md)**: Introduces AI translation workflows, asynchronous translation lifecycle status databases, XLIFF import/export subcommands, and tree-sitter direct code parsers.
