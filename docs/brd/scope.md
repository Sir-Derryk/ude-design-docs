---
sidebar_position: 4
---

# Scope and Constraints

:::info[Document Version Information]
* **Current Document Version**: `0.1`
* **Status**: `Requirements Gathering & Draft Specifications`
* **Date**: June 7, 2026
:::

## In-Scope
* Multi-source parsing (Doxygen XML baseline).
* Intermediate Representation (IR) mapping and normalization.
* Multi-format rendering (HTML, Markdown, RAG JSON, XML).
* Server-side push-gate verification policies (`reject`, `allow`, `auto-document`, `verify-document`).
* Fully hands-free, non-interactive CI/CD pipeline automation.
* Execution cost and coverage reporting.
* Gzip-transparent file compression for Git storage optimization.

## Out-of-Scope
* Writing proprietary code-compilers or complete parser frontends from scratch (for MVP).
* Direct hosting, web-server or DNS administration.
* Implementing custom web search crawlers from scratch.
* Enterprise cloud translation and multilingual localization features (deferred to Future Phase v2.0+).
