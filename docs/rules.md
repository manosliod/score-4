# Rules of Score 4

Score 4 is Connect Four for two people at one keyboard or one phone.

## The board

The board has 7 columns and 6 rows. Columns are numbered 1 to 7 from the left. A coin dropped into a column falls
to the lowest empty spot in it.

## Before the game

1. Each player types their age.
2. **The younger player starts.** If both are the same age, Player 1 starts.
3. The player who starts picks a colour: Red (`R`) or Yellow (`Y`).
4. The other player picks the other colour. Both players can never have the same colour.

## A turn

1. The player whose turn it is picks a column from 1 to 7. Any other number is asked again.
2. Their coin drops into that column.
3. The turn passes to the other player.

## The end

- **A win**: four coins of the same colour in a line, across, up and down, or diagonally. The player with that
  colour wins.
- **A tie**: all 42 spots are full and nobody has four in a line.

## What the 2019 program does differently

These are the gaps between the rules above and the original program. They are kept, and tested, until the fixes in
the next step of the refresh (see `docs/portfolio/audit.md` for the full list):

- It only sees diagonals that go down to the right (`\`), never up to the right (`/`).
- It never checks the top row for four across.
- A coin dropped into a full column replaces the top coin.
- Typing letters where it expects a number makes it repeat the same question forever.
