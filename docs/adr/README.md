# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the timeline-builder project. ADRs document significant technical decisions made during development, including context, options considered, and rationale.

## Format

Each ADR follows this structure:
- **Title**: Short descriptive title
- **Status**: Proposed | Accepted | Deprecated | Superseded
- **Context**: What is the issue we're trying to solve?
- **Decision**: What decision did we make?
- **Consequences**: What are the trade-offs and implications?

## Index

### Parser Design

- [ADR-001: Keyword-Based Property Recognition](./001-keyword-based-parsing.md) - Sprint 2
  - How the parser distinguishes properties from events without indentation tracking

### Future ADRs

Additional decisions will be documented as they arise during development.

## When to Write an ADR

Write an ADR when:
- Making a significant architectural decision
- Choosing between multiple viable approaches
- Solving a design problem that others might face
- Making trade-offs that have long-term implications
- Changing a previously-made decision (superseding an ADR)

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Michael Nygard's ADR Template](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/templates/decision-record-template-by-michael-nygard/index.md)
