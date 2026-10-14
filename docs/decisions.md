# Decisions

One short entry per choice that is not obvious from the code.

## Reading outside the board counts as "no match"

**Chose:** when the win check looks at a spot outside the board, it treats it as "not this colour".

**Instead of:** copying what the 2019 program did. It read memory before the start of the board, which is undefined
behaviour in C++. In practice it crashed (the `full-column` flow) or, on another compiler, could have seen garbage.

**Why:** there is no defined behaviour to keep. Every recorded flow still produces the same output up to the point
where the old program stopped.

## The 2019 bugs stay until the "complete" step

**Chose:** the restructured code keeps the old rules exactly, including the missing `/` diagonal, the unchecked top
row and the overwrite of a full column. Tests pin each of them.

**Instead of:** fixing them while moving the code.

**Why:** moving code and changing behaviour in the same step makes it impossible to tell a refactoring mistake from
a fix. The fixes come next, each with its own test.

## The age rule stays

**Chose:** the younger player starts; the same age means Player 1 starts. This is in the web demo too.

**Instead of:** a simpler "Player 1 always starts" in the web version.

**Why:** it is the original game's rule, and keeping one rule set means the console and the web play the same game.

## The recorded tie was not a tie

**Chose:** a new move list for the `tie` flow and its unit test.

**Instead of:** keeping the 2019 move list.

**Why:** that list has four Red coins on a diagonal going up to the right after move 22. The 2019 program never
checked that kind of diagonal, so it played on to a full board and printed `Tie.`. With the full win check, the same
moves end in a win for Player 1. The new list fills the board with no four in a line anywhere.
