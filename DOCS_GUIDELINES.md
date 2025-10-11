# DOCS-GUIDELINES.md  
> How to produce a domain-specific or component-specific Markdown doc file  
> (e.g. docs for subsystems, modules, infra components)  

## Purpose & Scope  
This document defines how an agent should generate **`.md` documents** that describe structure, usage, and modifiability of parts of a software project. It is *not* about guiding code design or logic, only documentation generation.  

The scope of these documents will be a delimited section of the aplication. They should provide enough context and information to ensure reliable and coherent code modifications. Do not include repeated global information about the project, defined in the `AGENTS.md` file.

Do **not** use this guide for writing a global project README, monolithic design spec, or code-level instructions (beyond referring to modules or files).  

---

## Pre-generation analysis: what the agent must inspect

Before producing a doc, the agent should:

1. **Interiorice the philosophy**
   - Programing principles and good practices (e.g. KISS, SOLID, DRY, Clean Code...).
   - Architecture and design patterns.
   - Intention, scope and context
  
2. **Identify the boundaries**  
   - Directory path, namespace or module name (e.g. `packages/auth/`, `services/payment/`).  
   - Key files: entry file, interfaces, API surface.

3. **Collect usage surfaces**  
   - Public APIs / functions / endpoints the component exposes.  
   - Config or initialization parameters if they exist (e.g. env vars, config objects).  
   - Expected interactions with other modules (dependencies, callers, data contracts).

4. **Discover how modifications are made**  
   - Where in the code one would modify behavior (hooks, override points, template files).  
   - Migration scripts or upgrade paths if configuration changes.

5. **Note constraints and invariants**  
   - Runtime constraints (e.g. “must run before X”, “thread-safe”, “single instance”).  
   - Version dependencies, compatibility notes.  
   - Preconditions, assumptions (e.g. “this module assumes user identity is validated upstream”).

6. **Detect examples / templates**  
   - Any existing reference usage in the repo (tests, sample code, stubs).  
   - Default configuration snippets (YAML, JSON, code) already present.

If any of the above is missing or ambiguous, the doc should include a “**Assumptions & gaps**” section stating what was uncertain.

---

## Document file naming & metadata (frontmatter)

- Use a clear filename, e.g. `XYZ-Component.md` or `Module-XYZ.md`.  
- Optionally start with YAML frontmatter, e.g.:

  ```yaml
  ---
  title: "Component XYZ"
  generated_by: agent
  date: 2025-10-11
  version: 1.0
  ---
  After frontmatter, start with a short Summary / TL;DR section (2–3 sentences) describing what the component is and when one reads this doc.
  ```

## Suggested Sections & Subsections

Here is a neutral skeleton the agent should try to follow (omit sections which do not apply):

### 1. Overview

Purpose: What this component/subsystem does.
Context: Where it fits (caller, dependencies, role).
Boundaries: What it does not cover.

### 2. Architecture & Structure

Directory / file layout (tree snippet).
Key modules / classes / files and their responsibilities.
Interfaces / public APIs: signatures, endpoints, config.

### 3. Usage & Examples

How consumers should use this component (snippet code, CLI, import).
Sample configuration / init call / YAML / env var usage.
Error cases or edge usage (if known).


### 4. Modification & Extension

Points of extension: hooks, plugin interfaces, override layers.
Where to make changes for custom behavior.
Upgrade / migration advice (if relevant).

### 5. Dependencies & Interactions

Downstream callers and upstream dependencies.
Data contracts or schemas exchanged.
Assumptions about external systems (e.g. “assumes DB is PostgreSQL 15+”).

### 6. Constraints, Invariants & Warnings

Runtime constraints (timeouts, concurrency, memory).
Known limitations, gotchas, anti-patterns.
Compatibility or versioning constraints.

### 7. Assumptions & Gaps
What was unclear or missing in source analysis.
Areas for human review or confirmation.

### 8. Checklist / Review Notes

A short bullet checklist to validate the doc (for reviewer).
Examples: completeness of usage examples, correctness of paths, omissions flagged.
Output formatting rules
Use Markdown only (plus optional YAML frontmatter).
Use ## for main sections, ### for subsections.
Use code fences with language hints (```js ```, yaml ).
Provide minimal runnable or copy-paste examples.
Use relative file paths with backticks, e.g. `services/auth/index.ts`
Avoid verbosity: each main section ~2–5 paragraphs, examples short.
Do not include secret values; only mention environment variable names or config keys.
When skipping a section (because not applicable), the agent may omit it but note “(not applicable)” or leave a placeholder comment.

##  Agent behavior & decisions

If component analysis yields no public API surface, the agent should mention it and perhaps skip “Usage” section.
Always include “Assumptions & Gaps” if any uncertainty arises.
In borderline cases (e.g. multiple possible extension points), the agent may propose alternatives and tag them for human review.
Try to keep the document focused, avoid drifting into design debates or code logic.
If a doc becomes too large (> ~800 words), suggest splitting into sub-docs (e.g. “modify vs usage”) or generating an index file.