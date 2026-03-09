# Task: Sprint Reviewer (Sprint 3)

**Role:** sprint-reviewer
**Sprint:** 3
**Responsibilities:** Testing, review, documentation, sprint coordination

## Overview

You are the sprint reviewer responsible for ensuring quality, running tests, documenting progress, and creating the final Sprint Letter 03. You coordinate with all developers to ensure work meets standards and is properly committed.

---

## Primary Responsibilities

### 1. Code Review
- Review all code from interval-solver, graph-builder, graph-algorithms
- Check for code quality, TypeScript best practices, documentation
- Verify test coverage meets >80% target
- Request fixes if issues found

### 2. Testing
- Run full test suite after each task completion
- Verify all tests pass: `npm test`
- Check coverage: `npm run test:coverage`
- Run tests on integrated code (all tasks together)

### 3. Sprint Letter Creation
- Create `docs/SPRINT_LETTER_03.md` following Sprint 01/02 template
- Document each completed feature with details
- Capture technical decisions and ADRs
- Document challenges and solutions
- Include retrospective

### 4. Git Coordination
- Ensure each completed task is committed atomically
- Verify commit messages follow convention
- Check for Co-Authored-By tags
- Verify no uncommitted work remains at sprint end

### 5. Sprint Cleanup
- Update BACKLOG.md task statuses (mark P2.1-P2.4 complete)
- Update CHANGES.md with Sprint 3 changes
- Verify all documentation is complete
- Report final status to sprint-lead

---

## Sprint Letter Structure

Follow the template from Sprint 01 and Sprint 02. Include:

### Required Sections

**1. Header**
```markdown
# Sprint 3: Constraint Solver Foundation

**Sprint Date:** 2026-03-09
**Sprint Goal:** Implement interval arithmetic and constraint graph infrastructure for the constraint solver.
```

**2. Table of Contents**
```markdown
## Table of Contents
- [Features Completed](#features-completed)
- [Details](#details)
- [Technical Decisions](#technical-decisions)
- [Challenges and Solutions](#challenges-and-solutions)
- [Test Results](#test-results)
- [Next Steps](#next-steps)
```

**3. Features Completed**
- List all tasks: P2.1, P2.2, P2.3, P2.4

**4. Details**
For each task, write 2-4 paragraphs covering:
- What was implemented
- Key design decisions
- Files created/modified
- Testing approach
- Example usage (optional)

**5. Technical Decisions**
Document major decisions made during sprint:
```markdown
### TD-1: Decision Title

**Context:** What problem needed to be solved?
**Problem:** Specific issue
**Options Considered:** List alternatives
**Decision:** What was chosen
**Rationale:** Why this option
**Impact:** Consequences
**Related ADRs:** Link to docs/adr/ if created
```

**6. Challenges and Solutions**
Document any bugs or issues encountered:
```markdown
### Challenge 1: Issue Title

**Problem:** Description
**Root Cause:** Why it happened
**Solution:** How it was fixed
**Developer:** Who fixed it
**Commit:** Git commit hash
**Result:** Outcome
```

**7. Test Results**
```markdown
### Coverage Summary
[Paste test output]

### Test Breakdown
- Interval tests: X tests
- Graph tests: Y tests
- Algorithm tests: Z tests

### Quality Metrics
- Test pass rate
- Coverage percentage
- Performance notes
```

**8. Next Steps**
- Recommend Sprint 4 tasks
- Identify blockers or follow-ups
- Suggest improvements

**9. Retrospective**
- What went well
- What could be improved
- Lessons learned

---

## Review Checklist

### For Each Completed Task

**Code Quality**
- [ ] TypeScript strict mode compliance
- [ ] JSDoc comments on all public functions
- [ ] No console.log or debug code
- [ ] Follows existing code style
- [ ] Proper error handling

**Testing**
- [ ] Tests cover happy path
- [ ] Tests cover edge cases
- [ ] Tests cover error cases
- [ ] Test descriptions are clear
- [ ] Coverage >80% for the module

**Documentation**
- [ ] README updated if needed
- [ ] Types exported properly
- [ ] Examples are clear

**Git**
- [ ] Code is committed
- [ ] Commit message follows convention
- [ ] Co-Authored-By tag present
- [ ] No uncommitted changes

---

## Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- interval.test.ts

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch

# Type checking
npm run typecheck

# Linting
npm run lint

# Build verification
npm run build
```

---

## Coordination Protocol

### When Developer Reports Task Complete

1. **Acknowledge receipt:**
   - "Received completion notice for P2.X, beginning review"

2. **Run tests:**
   ```bash
   npm test
   npm run test:coverage
   ```

3. **Review code:**
   - Read implementation
   - Check tests
   - Verify documentation

4. **If issues found:**
   - Document specific issues
   - Request fixes from developer
   - Wait for fixes and re-review

5. **If review passes:**
   - Verify commit exists
   - Document in sprint letter
   - Mark task as complete
   - Notify sprint-lead

### When All Tasks Complete

1. **Final integration test:**
   - Run full test suite
   - Verify all modules work together
   - Check overall coverage

2. **Complete sprint letter:**
   - Fill in all sections
   - Add test results
   - Write retrospective

3. **Update project files:**
   - BACKLOG.md (mark tasks complete)
   - CHANGES.md (add Sprint 3 entry)

4. **Final commit:**
   - Commit sprint letter and updates
   - Message: "Sprint 3 complete: Constraint solver foundation"

5. **Report to sprint-lead:**
   - Summary of sprint
   - Any blockers or follow-ups
   - Recommendation for Sprint 4

---

## Technical Decision Documentation

Watch for these types of decisions that should be documented:

1. **Architecture Choices**
   - Data structure selection (adjacency list vs matrix)
   - Algorithm choice (Kahn's vs DFS topological sort)

2. **API Design**
   - Function signatures
   - Error handling strategy
   - Edge case handling

3. **Trade-offs**
   - Performance vs simplicity
   - Flexibility vs constraints
   - Current needs vs future extensibility

If a decision is significant enough, create an ADR:
```markdown
docs/adr/00X-decision-title.md
```

Follow ADR template from previous sprints.

---

## Quality Standards

### Coverage Targets
- Interval arithmetic: >80%
- Constraint graph: >80%
- Graph algorithms: >80%
- Overall: >80%

### Test Requirements
- All public functions tested
- Edge cases covered
- Error cases tested
- Integration tests included

### Documentation Requirements
- JSDoc on all public APIs
- Examples in JSDoc where helpful
- README updated if API changes
- Sprint letter complete and detailed

---

## Timeline

**Day 1-2:** Review P2.1, P2.2, P2.3 as they complete
**Day 3:** Review P2.4
**Day 4:** Integration testing, sprint letter, cleanup

---

## Questions or Blockers?

- If test failures are unclear, coordinate with developer
- If coverage is below target, request additional tests
- If design decisions need documentation, ask developer for details
- Report any blockers to sprint-lead immediately

---

## Success Criteria

✅ All tasks reviewed and approved
✅ All tests passing
✅ Coverage >80% for all modules
✅ Sprint letter complete and detailed
✅ BACKLOG.md and CHANGES.md updated
✅ All work committed with proper messages
✅ No uncommitted changes in repo

---

## Reference Documents

- Sprint 01 Letter: `docs/SPRINT_LETTER_01.md`
- Sprint 02 Letter: `docs/SPRINT_LETTER_02.md`
- Sprint Process: `SPRINT_PROCESS_PROMPT.md`
- BACKLOG: `BACKLOG.md` (Phase 2 tasks)
- Code Style: Existing code in `src/types/`, `src/parser/`
