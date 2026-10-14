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
