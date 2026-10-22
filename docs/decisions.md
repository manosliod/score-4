# Decisions

One short entry per choice that is not obvious from the code.

## Reading outside the board counts as "no match"

**Chose:** when the win check looks at a spot outside the board, it treats it as "not this colour".

**Instead of:** copying what the 2019 program did. It read memory before the start of the board, which is undefined
behaviour in C++. In practice it crashed (the `full-column` flow) or, on another compiler, could have seen garbage.

**Why:** there is no defined behaviour to keep. Every recorded flow still produces the same output up to the point
where the old program stopped.

## The 2019 bugs were fixed one at a time

**Chose:** the restructured code first kept the old rules exactly, each pinned by a test. Each bug was then fixed in
its own commit, with the test changed to the correct rule in that same commit.

**Instead of:** fixing them while moving the code.

**Why:** moving code and changing behaviour in the same step makes it impossible to tell a refactoring mistake from
a fix. The console flows in `tests/fixtures/cli/` show the output stayed the same up to the point each fix changes.

## The age rule stays

**Chose:** the younger player starts; the same age means Player 1 starts. This is in the web demo too.

**Instead of:** a simpler "Player 1 always starts" in the web version.

**Why:** it is the original game's rule, and keeping one rule set means the console and the web play the same game.

## The recorded tie was not a tie

**Chose:** a new move list for the `tie` flow and its unit test.

**Instead of:** keeping the 2019 move list.

**Why:** that list has four Red coins on a diagonal going up to the right after move 29. The 2019 program never
checked that kind of diagonal, so it played on to a full board and printed `Tie.`. With the full win check, the same
moves end in a win for Player 1. The new list fills the board with no four in a line anywhere.

## The screen is cleared with an ANSI code, and only on a terminal

**Chose:** `ESC[2J ESC[H` (clear, then cursor to the top left), written only when standard output is a terminal
(`isatty`).

**Instead of:** `system("cls")`, which only works on Windows and starts a shell for every move.

**Why:** the code works in every terminal on Linux and macOS, and in Windows Terminal. Skipping it when the output is
a file keeps recorded runs readable and lets the tests compare them as plain text. `isatty` comes from POSIX, so the
console program builds on Linux and macOS; the web demo does not use it.

## The web app is React, with no effects

**Chose:** React 19 with the React Compiler, small Zustand stores created per screen, and no `useEffect` at all.

**Instead of:** Vue (an earlier draft), or a global store with effects that sync it.

**Why:** React is what this portfolio shows. Without effects every change has a clear cause: the engine loads through
`use()` and `<Suspense>`, a move is an event, a new game is a new `key`. The compiler handles memoisation, so there is
no hand-written `useMemo` or `useCallback`.

## The setup screen is hidden, not removed, during a game

**Chose:** `<Activity mode="hidden">` around the setup screen while a game is on.

**Instead of:** removing it and keeping its values somewhere else.

**Why:** Back from a game returns to the exact colour choice, without copying setup state up to the app. New players
gives the setup a new `key`, which starts it fresh.

## Engine matches are freed when they are garbage collected

**Chose:** each WebAssembly match is registered with a `FinalizationRegistry` and deleted when its wrapper is
collected.

**Instead of:** deleting it in an effect when the game screen goes away.

**Why:** there are no effects, and React may create a store twice in development. A match is a few dozen bytes, so
freeing it "some time later" costs nothing.

## A failed download stays failed until the player asks again

**Chose:** when the engine or a piece of the game screen fails to download, the failure is kept. Only Continue,
Try again or the preload on Continue start a new download.

**Instead of:** forgetting the failure at once so the next call downloads again.

**Why:** React draws a waiting screen again when a download finishes. If the failure were forgotten, that redraw
would start a new download instead of showing the error, and the player would wait for ever on "Getting ready".

## The game refuses moves once it is over

**Chose:** after a win or a tie, the game core answers every move with `GameOver` and changes nothing.

**Instead of:** leaving it to each front end to stop asking.

**Why:** the rules belong in the core. The 2019 program ended at the first win; now the core itself makes sure of
that, for the console, the web and anything else that uses it.

## A tap on a full column is still sent to the game

**Chose:** a full column is marked disabled for screen readers and skipped by the arrow keys, but a tap on it still
reaches the game, which refuses it with "Column N is full. Pick another column."

**Instead of:** ignoring the tap.

**Why:** that is the Figma flow ("column full → snackbar, same player again"), and silence would look broken.

## Narrow screens get narrower columns

**Chose:** the board shrinks to fit below 412 pixels wide and in phone landscape (columns 33–45 pixels wide).

**Instead of:** keeping the 52-pixel columns from Figma and letting the page scroll sideways.

**Why:** each column is one tap target the full height of the board, still well above the 24-pixel minimum of WCAG
2.5.8, and a game that scrolls sideways is harder to play than one with slightly narrower columns.

## The full-column message closes on the next move

**Chose:** the "Column N is full" snackbar closes as soon as the game accepts a move.

**Instead of:** leaving it on screen for its full four seconds.

**Why:** the message is about the move that was refused. Once a coin drops it is out of date, and on a small phone a
game that ends within those seconds would have it covering Play again and New players.

## The theme choice is one store for the whole app

**Chose:** a module-level store in `web/src/shared/stores/`, read by the Theme button in both app bars.

**Instead of:** a store per screen, or a feature folder for the theme.

**Why:** the choice belongs to the whole app (`standards/react.md`, "State"), and both setup and game show the button.
Features may not import each other, so the button and its store live in `shared/`.

## Dark colours are written once

**Chose:** a Tailwind `dark` custom variant used once around the dark token values. It matches an element when the page
(or an ancestor) has `data-theme='dark'`, and, under `@media (prefers-color-scheme: dark)`, when the page is not set to
Light: `:where([data-theme='dark'], [data-theme='dark'] *)` and `:where(:root:not([data-theme='light']),
:root:not([data-theme='light']) *)`. On `:root` these are the two rules `standards/web.md` asks for.

**Instead of:** copying the dark values into two blocks, or `light-dark()`.

**Why:** one copy of the Figma values cannot drift, and the same variant makes `dark:` utilities right on any element,
not only on `<html>`. `web/src/styles/tokens.test.ts` compiles a `dark:` utility and checks it on a child element.

## The theme-color tags switch by `media`, not by colour

**Chose:** for Light or Dark, the matching `<meta name="theme-color">` gets `media="all"` and the other `not all`;
System puts the two `prefers-color-scheme` queries back.

**Instead of:** writing a colour into the tag from script.

**Why:** the colours stay in `index.html` once, the script holds no colour values, and on System the browser follows a
change of the device theme by itself.

## The Theme picker downloads on its own; the sheet and dialog do not

**Chose:** the Theme picker is its own chunk, fetched when the pointer or focus reaches the Theme button. The sheet and
dialog (the Base UI drawer and dialog) are in the first download, so a press opens one at once, in its Loading state
while the picker downloads. The entry budget goes from 125 kB to 135 kB gzip.

**Instead of:** the whole panel as one chunk, opened when its download finished while the Theme button showed itself
busy; or waiting 250 ms before showing the Loading state, as battleship does.

**Why:** the Figma frames "Game · Theme sheet · Compact · Loading" and "Game · Theme dialog · Expanded · Loading" show
the surface open while the picker downloads, so its code must already be there. Opening at once also puts the scrim
over the screen straight away, so New game cannot open a second modal while Theme is downloading. The surfaces cost
about 16.5 kB gzip in the first download (entry 117.2 kB before, 133.7 kB after). The indicator slot and the picker
are both `--spacing-theme-picker` (310 px, the Figma Loading slot) wide, so the surface keeps its size when the picker
arrives.

## The segment ends are found by element type

**Chose:** the segmented button rounds its first and last segment with `first-of-type` and `last-of-type`, and draws
the divider on every segment but the first of its type.

**Instead of:** `first` and `last`.

**Why:** Base UI puts a hidden input after each radio, so the last segment is never the last child and kept square
corners, which showed when Dark (Theme picker) or Yellow (colour choice) was checked. The segments are the only
elements of their type in the group. The e2e check `expectSegmentEnds` in `web/e2e/segmented-button.ts` compares the ends with the
group's rounding and checks the dividers, for both pickers.

## Icons come from the Material Symbols package

**Chose:** `Icon` imports each icon from `@material-symbols/svg-400`.

**Instead of:** SVG files exported from Figma and copied into `web/src/forest/assets/icons/`.

**Why:** The copies were Material Symbols already, so each new icon meant another file and nothing tied them to a
version. They are the outlined set (`error` filled) and are still drawn as a CSS mask, so they follow the colour tokens.
