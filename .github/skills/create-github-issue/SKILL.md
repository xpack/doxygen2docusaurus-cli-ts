---
name: create-github-issue
description: 'Draft and open GitHub issues for bugs and enhancements in the Doxygen Documentation Converter repository (xpack/doxygen2docusaurus-cli-ts), following the project''s title, body, and label conventions. Use when the user asks to "add an issue", "open an issue", "file a bug", "create an enhancement", or to turn code-review findings into issues.'
argument-hint: 'Short description of the problem or improvement, or a list of findings; optionally the kind (bug or enhancement)'
---

# Create Issue — Doxygen Documentation Converter

## When to Use

- The user asks to add, open, create or file a GitHub issue for a bug or an
  enhancement.
- The user asks to turn the findings of a review (code, Doxygen XML
  handling, generated website) into issues, one issue per finding.

Issues are opened in `xpack/doxygen2docusaurus-cli-ts` with the `gh`
CLI, run from the repository root.

## Procedure

1. **Establish the facts.** Read the code the issue refers to, at the
   current `HEAD`, and record the exact files and the function, class,
   or member names, and, as a secondary pointer, the line numbers. Do
   not cite line numbers from memory or from an earlier version of the
   file. If the working tree has uncommitted changes in the cited
   files, cite the lines as they are in the committed version, or say
   so in the body.
2. **Reproduce, if it is a bug.** When it is practical, confirm the
   behaviour with a probe, a test run, or a conversion of the Doxygen
   XML files in `tests/playfield`, or of the project where the problem
   was found, and keep the evidence (the command, the Doxygen
   configuration, and the relevant output) to show the user in the
   message that presents the draft (step 6); the body of the issue has
   only the condensed form (see "Length"). State clearly what was
   measured and what was only estimated or inferred.
3. **Check for duplicates.** Search the open and closed issues:

   ```sh
   gh issue list --repo xpack/doxygen2docusaurus-cli-ts \
     --state all --limit 30 --search "<keywords>"
   ```

   If an issue already covers the problem, report it to the user
   instead of creating a new one, and offer to add a comment to it.
   If a related issue exists, reference it in the body (see below).

4. **Choose the labels** (see "Labels") **and the milestone, if any**
   (see "Milestone").
5. **Draft the title and the body** (see "Title" and "Body"), and write
   the body to a file in the scratchpad folder.
6. **Show the draft to the user** — the title, the labels, the
   milestone, and the full body — and wait for explicit approval.
   Opening an issue is a public action; never create one, or a
   milestone, without approval. For several issues, present all drafts
   together and let the user approve, edit, or drop each of them.
7. **Create the issue:**

   ```sh
   gh issue create --repo xpack/doxygen2docusaurus-cli-ts \
     --title "<title>" \
     --label <label> [--label <label>] \
     [--milestone "<milestone>"] \
     --assignee @me \
     --body-file <scratchpad>/issue-body.md
   ```

   Always assign the issue to the current GitHub user (`--assignee @me`,
   the account `gh` is authenticated as). Omit `--milestone` only when the
   user confirmed that no milestone applies.

8. **Report** the issue number and URL. When several issues are created,
   list them as a table (number, title, labels, milestone).

## Labels

Use only the repository labels below, unless the user asks otherwise:

- `bug` — the code behaves incorrectly: crashes, unhandled or
  unsupported Doxygen XML elements, missing or wrong content in the
  generated pages, sidebar, or indices, invalid generated Markdown or
  MDX, or behaviour that contradicts the documentation (the issue is a
  `bug` whichever of the two is wrong; the proposed change says which
  one to correct).
- `enhancement` — the code works, but can be improved: refactorings,
  duplicated code, inconsistent naming, performance, missing features,
  new options, and documentation wording.
- Both `bug` and `enhancement` — when a defect can only be fixed by a
  new feature or a new option (for example a missing configuration
  option whose absence leads to a wrong result).

The `documentation` label is not used; documentation issues are labelled
`enhancement` when the text is correct but can be improved, and `bug`
when it is wrong or contradicts the code. If the kind is
uncertain, say so and ask the user.

## Title

- State the **current problem**, not the fix: the title describes what
  is wrong or missing, in the present tense, as a full sentence.
  - Good: `The group pages do not show inner namespaces`
  - Good: `` `renderInnerIndicesToLines()` ignores inner namespaces ``
  - Bad: `Refactor the group page rendering` (describes the fix).
  - Bad: `Fix missing namespaces` (imperative, vague).
- Usually start with `The ...`, or with the code identifier in
  backticks.
- Capitalise the first word, unless it is a code identifier in
  backticks; do not end with a period.
- Keep it under 70 characters.
- Do not prefix it with the kind (`Bug:`, `[enhancement]`) or an issue
  number; the labels carry the kind.

## Body

Write the body as plain Markdown prose, kept short (see "Length"), in
British English, formal, with no contractions, the Oxford comma, and the
lines wrapped at 72 characters. Use backticks for file names,
identifiers, options, configuration names, Doxygen XML elements, and
commit hashes. Do not use headings or templates (no "Steps to
reproduce" / "Expected" / "Actual" sections); the information is given
as connected sentences, in this order, merged into the two paragraphs
allowed by "Length", with only the parts that the issue needs:

1. **Location.** Open with the file and the function, class, or member,
   and, when it helps, the line numbers, followed by a colon, for
   example: `` `src/docusaurus/view-model/compound-base-vm.ts`,
   `CompoundBase.renderInnerIndicesToLines()`, lines 623 to 630: `` or
   `` `src/docusaurus/view-model/groups-vm.ts`, `Group.renderToLines()`: ``.
   The function, class, or member name is required; the line numbers
   are not, because they change with the first edit of the file.
   Paths are relative to the repository root.
2. **Observation.** What the code does, precisely: the Doxygen
   configuration and the command, the observed output or fault, and the
   cause, if known. For a bug, include the evidence from the
   reproduction and mark estimates as estimates. Mention a related
   commit by its short hash only when it bears on the cause (it
   introduced the problem, or it is not the cause).
3. **Scope.** Only when it changes the decision: which other Doxygen
   versions, compound kinds, or files are, or may be, affected, and why
   a passing case does not prove the absence of the problem.
4. **Proposed change.** In the imperative (`Remove it.`, `Add to the
   renderer a case for ...`, `Measure ..., and then either ...`). When
   several solutions are possible, list them and state the trade-offs;
   do not pretend that one is obviously right. Mention any test to add,
   and any generated file whose source or template must be changed
   instead (for example the files under `templates/`, or the website
   commons).
5. **References**, if any, as a final short paragraph, for example
   `Found while fixing #134.` or `Decide together with #118.`

### Length

Issues are read by the maintainer, who knows the code: keep them short.

- The body has at most two paragraphs (the location and the observation
  together, then the proposed change), plus the final reference line,
  and normally no more than 12 lines of 72 characters. When a list of
  alternative solutions requires more, the list takes precedence over
  the line limit, but the issue stays as short as the content allows.
- Cite the location once, with the primary file and the first line or
  the function name; do not list every affected line, file, or
  declaration.
- State the evidence in a clause (the failing expression and the
  result, with the configuration in brackets), not as a narrative; give
  the full output only when it is needed to understand the problem.
- Omit what the reader can see in the code or in the title, the
  background of the feature, the scope, and the trade-offs, unless they
  change the decision (the scope and the trade-offs of the proposed
  change are the only such cases); the proposal is a single sentence,
  or a short list when there are several solutions.
- Do not describe the work already done on the fix.

A simple finding is a single paragraph of two to four lines.

## Milestone

Issues are normally assigned to the milestone of the release that will
fix them; the milestones are named after the version (`2.2.3`). Older
issues without a milestone exist, but do not take them as the rule.

- List all the milestones, closed ones included, to see the naming and
  which are still open:

  ```sh
  gh api 'repos/xpack/doxygen2docusaurus-cli-ts/milestones?state=all' \
    --jq '.[] | "\(.title)\t\(.state)\t\(.description)"'
  ```

- If an open milestone applies, propose it in the draft and assign it
  with `--milestone`.
- If none is open, derive the next release from the `version` in
  `package.json` (`2.2.7-pre` means the milestone `2.2.7`; a breaking
  change belongs to the next major release), and propose creating it
  with an empty description, like the existing ones. Do not omit the
  milestone just because none is open.
- Creating a milestone is a public action: show its title and
  description in the draft, wait for approval, and then create it with:

  ```sh
  gh api --method POST \
    repos/xpack/doxygen2docusaurus-cli-ts/milestones \
    -f title="<title>"
  ```

  Omit the milestone only when the user says that none applies.

## Issues from Review Findings

When the findings of a review (a review document, if the user provides
one, or the output of a code review) are turned into issues:

- Write one issue per finding, and do not group independent findings;
  each issue is self-contained and does not rely on the review document,
  which may be uncommitted. Do not cite the number of the finding in the
  title or in the body (it is not a GitHub number, and would be confused
  with one).
- Take the location, the evidence, and the proposed change from the
  finding, and check them against the current `HEAD` (step 1), because
  the review may be older than the code.
- Check for duplicates for each finding (step 3).
- If the findings come from a document in the repository, the number of
  the issue is recorded in that document, as described under "Review
  Documents" in `.github/skills/github-commit/SKILL.md`; ask the user
  before editing the document.

## Example

Title: `The group pages do not show inner namespaces`

Labels: `bug`

```markdown
`src/docusaurus/view-model/compound-base-vm.ts`,
`CompoundBase.renderInnerIndicesToLines()`: when a
group contains namespaces, the conversion prints `innerNamespaces not
processed for <group>` and the generated group page has no namespaces
list (`micro-os-plus-micro-test-plus-cpp-api-deprecated` in the
`tests/playfield` project). Render the inner namespaces in the group
pages, as is done for the other compound kinds, and add a group with a
namespace to the playfield.

Found while fixing #NNN.
```

(The example is illustrative; the function and file names must be
checked against the current code, as required by step 1.)

## After the Issue Is Fixed

The fix is committed with the `github-commit` skill, which also adds
the closing comment to the issue (see its "Issue Comment" section); the
issue is not closed by hand.
