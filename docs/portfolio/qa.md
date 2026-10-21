# score-4 — QA

## Theme choice (KAN-27)

Checked with Playwright at the Figma widths, 412 × 917 (compact) and 1024 × 768 (expanded), in light and dark, against
these Figma frames: Theme picker 76-1156, Theme sheet 89-1587, Theme dialog 89-1620, "Game · Theme sheet · Compact"
81-4267 and 81-4311, "Game · Theme dialog · Expanded" 91-4741 and 91-4822, and the expanded setup frame 29-627.

### Behaviour

| Behaviour | Checked by |
| --- | --- |
| Theme button in the app bar on every screen and width, after New game on game screens; icon = current choice | `theme-button.test.tsx`, `e2e/theme.spec.ts`, screenshots |
| Compact opens a bottom sheet (no Done); medium and up open a dialog with Done | `theme-button.test.tsx`, `e2e/theme.spec.ts` |
| Choosing applies at once and does not close | both |
| Done, Escape, scrim tap and a swipe down close; focus returns to the Theme button | `e2e/theme.spec.ts` |
| Radio group named "Theme"; focus starts on the selected radio; arrow keys move the choice | `e2e/theme.spec.ts` |
| Stored under `theme`, survives a reload, applied before the app script runs | `theme-service.test.ts`, `e2e/theme.spec.ts` (app script blocked) |
| `theme-color` meta and `color-scheme` follow the resolved theme, including a live system change on System | `theme-service.test.ts`, `e2e/theme.spec.ts` |
| Storage that throws falls back to System | `theme-service.test.ts`, `e2e/theme.spec.ts` |
| A choice made in another tab reaches open tabs | `theme-store.test.ts`, `e2e/theme.spec.ts` |
| A failed Theme panel download shows "Couldn’t open Theme. Try again." and the next press retries (loading state: see below) | `theme-panel-loading.test.tsx`, `e2e/theme.spec.ts` |
| The sheet or dialog chosen on open stays until it closes, even if the window crosses 600 dp; focus returns to the Theme button | `theme-button.test.tsx`, `e2e/theme.spec.ts` |
| The pre-paint script in `index.html` gives the same `data-theme` and `theme-color` result as the theme service for every stored value, and leaves no global | `app/pre-paint.test.ts` |
| `dark:` utilities work on elements inside the page, not only on `<html>` | `styles/tokens.test.ts` |
| The New game dialog keeps its 24 dp margins on a 320 px phone | `e2e/game.spec.ts` |

### Fixed during QA

- The sheet focused itself on open; it now focuses the selected radio, as the design says.
- The picker was 17 px narrower than Figma and sat 8 px low in the sheet: segments now use the kit padding (12 leading,
  16 trailing) and the picker keeps its 48 dp touch band.
- Picker segments are Base UI `span` radios, which missed the button touch rules (long-press selected the label, taps
  waited for a double tap); they now get them.

### Fixed after code review

- The shared dialog surface forced a 312 px minimum width, so the New game dialog overflowed a 320 px phone; only the
  Theme dialog keeps it, from medium up.
- The `dark` variant matched only the element carrying `data-theme`, so `dark:` on any child was wrong.
- Pressing Theme while its panel was still downloading, or after the download failed, gave no feedback.
- Crossing 600 dp with the panel open swapped sheet and dialog and lost the focus return.
- "Back" was listed as a way to close the sheet, but nothing handles it; removed from DESIGN.md and the Figma Handoff
  note rather than adding history handling.

### Accepted differences

| Difference | Why |
| --- | --- |
| The gap between the picker and Done is 24 px; Figma shows 28 px | 24 dp is the M3 dialog spacing the New game dialog already uses; both dialogs share one surface. |
| Below 342 px (a 320 px phone) the sheet's picker shrinks to fit, with equal segments | Figma is drawn at 412 and says the sheet fits 360; shrinking avoids sideways scrolling on smaller phones. |
| There is no Medium frame for the dialog | The Handoff says medium shows the same centred dialog over the compact column; checked at 600 px. |
| Changing theme switches colours instantly, without a cross-fade | A cross-fade would mean animating the colour of every element on the page; the change is the user's own and happens behind the open panel. |

### Needs a real phone

Swipe-down feel and release speed, the home-indicator inset under the sheet, the status bar colour following the
choice, and long-press on the picker cannot be judged in desktop Chromium.

## Theme loading state (KAN-27)

Checked with Playwright at 412 × 917 and 1024 × 768 against "Game · Theme sheet · Compact · Loading" 114-19176,
"Game · Theme dialog · Expanded · Loading" 114-19237 and "Game · Theme load failed · Compact" 114-19306. Sheet 412 ×
164 at y 753, dialog 358 × 208 at 333, 280, indicator slot 310 × 48, snackbar 380 × 48 at 16, 845: all as in Figma.
Captures: `~/Sites/portfolio-studio/qa-captures/score-4-theme-loading-2026-10-19/`.

| Behaviour | Checked by |
| --- | --- |
| A press opens the sheet or dialog at once with "Loading Theme"; the picker replaces it in the same surface | `theme-panel-loading.test.tsx`, `e2e/theme.spec.ts` |
| Focus is on the sheet (compact) or Done (dialog) while loading and stays there when the picker arrives | `theme-panel-loading.test.tsx`, `e2e/theme.spec.ts` |
| Escape or Done while loading closes it and the late download does not reopen it | `theme-panel-loading.test.tsx`, `e2e/theme.spec.ts` |
| A failed download closes the surface, returns focus to Theme and shows the snackbar | `theme-panel-loading.test.tsx`, `e2e/theme.spec.ts` |
| New game cannot open a second modal while Theme is downloading | `e2e/theme.spec.ts` |

| Difference | Why |
| --- | --- |
| The Loading state shows at once; the Figma component description says after 250 ms | The surface has to open at once to block a second modal; a picker already downloaded shows with no Loading state. |
| The indicator looks lighter in the capture | Playwright runs with reduced motion, where the shape pulses its opacity; the capture caught a low point. |

### Fixed during QA

- The picker followed its text (306 px); it is now the Figma 310 px, the width of the Loading slot, so the surface keeps
  its size when the picker arrives.
