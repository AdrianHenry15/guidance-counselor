# Guidance Counselor V1 Regression Checklist

## Transcript upload

- [ ] A selectable-text PDF uploads successfully.
- [ ] TXT and CSV uploads are accepted.
- [ ] Files larger than 10 MB are rejected.
- [ ] Unsupported file types are rejected.
- [ ] Empty files are rejected.
- [ ] Scanned PDFs show a clear manual-entry fallback.
- [ ] Original file bytes are not retained in client state.

## Transcript review

- [ ] Extracted courses appear under Transcript courses.
- [ ] Manual courses appear under Added courses.
- [ ] Course title can be corrected.
- [ ] Subject area can be changed.
- [ ] Credits can be changed.
- [ ] Completion status can be changed.
- [ ] Courses can be included or excluded.
- [ ] Removing the final course restores the empty state.
- [ ] Generation is blocked for blank included course titles.
- [ ] Generation is blocked for zero-credit included courses.

## Plan preferences

- [ ] Academic program selection uses a valid program ID.
- [ ] Start term is respected.
- [ ] Start year is respected.
- [ ] Fall and spring credit targets are respected.
- [ ] Summer credit target is respected.
- [ ] Disabling summer removes summer terms.
- [ ] Summer cannot be the start term when summer is disabled.

## Generated plan

- [ ] Program name is displayed dynamically.
- [ ] Earned credits are correct.
- [ ] Applied credits are correct.
- [ ] Unapplied credits are visible.
- [ ] Planned credits are correct.
- [ ] Applied plus planned equals the degree total.
- [ ] Degree-audit totals match applied credits.
- [ ] Estimated graduation is displayed.
- [ ] Validation summary is displayed.
- [ ] Every scheduled course appears exactly once.

## Plan editing

- [ ] Up arrow moves a course to the previous semester.
- [ ] Down arrow moves a course to the next semester.
- [ ] First-semester up arrows are disabled.
- [ ] Last-semester down arrows are disabled.
- [ ] Course-specific prerequisite errors appear on the course.
- [ ] Semester overload warnings appear on the semester.
- [ ] Reset plan restores the original schedule.
- [ ] Reset plan becomes disabled after restoration.

## Navigation and recovery

- [ ] Editing the transcript clears the stale plan.
- [ ] Uploading another transcript clears the stale plan.
- [ ] Opening Generated Plan without a plan shows recovery UI.
- [ ] Refreshing clearly communicates that in-memory data was lost.
- [ ] Dashboard states match the current workflow state.

## Presentation

- [ ] Mobile layout remains usable.
- [ ] Dark mode remains readable.
- [ ] Keyboard focus is visible.
- [ ] Arrow buttons have useful accessible labels.
- [ ] No duplicate move controls appear.
- [ ] Advisory disclaimers are visible.
