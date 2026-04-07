# Feedback & Issues

This file captures feedback from users, stakeholders, and sprint retrospectives.

---

## High Priority

**HIGH-1: Unified command for parse → solve → visualize**
- **Reported:** 2026-04-02
- **Reporter:** Eric
- **Description:** Need a convenient CLI workflow that processes a .tl file end-to-end and opens the visualization in one command
- **Current State:** Users must manually run `tl-parse solve file.tl` → save JSON → load into web UI
- **Proposed Solution:** Add command like `tl-parse view <file.tl>` or `tl-parse open <file.tl>` that:
  - Parses the .tl file
  - Runs the solver
  - Launches dev server (or uses production build)
  - Opens browser to visualization with the timeline loaded
- **Impact:** Significantly improves developer/user experience for viewing timelines
- **Status:** Backlogged for future sprint
- **Notes:** Could be implemented after Phase 3 visualization is complete. May need to decide between:
  - Temporary dev server approach (runs `npm run dev` in viz package)
  - Bundled approach (includes viz in CLI package somehow)
  - Server-based approach (CLI starts simple HTTP server serving viz)

---

## Medium Priority

(none yet)

---

## Low Priority / Future Enhancements

(none yet)

---

## Process Improvements

(none yet)

---

## Resolved Items

(none yet)
