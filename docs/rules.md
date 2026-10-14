# Rules of Score 4

Score 4 is Connect Four for two people at one keyboard or one phone.

## The board

The board has 7 columns and 6 rows. Columns are numbered 1 to 7 from the left. A coin dropped into a column falls
to the lowest empty spot in it.

## Before the game

1. Each player types their age. Anything that is not a number is asked again.
2. **The younger player starts.** If both are the same age, Player 1 starts.
3. The player who starts picks a colour: Red (`R` or `r`) or Yellow (`Y` or `y`).
4. The other player picks the other colour. Both players can never have the same colour.

## A turn

1. The player whose turn it is picks a column from 1 to 7. Any other answer is asked again. A full column is
   refused with `Column N is full. Pick another one.` and the same player picks again.
2. Their coin drops into that column.
3. The turn passes to the other player.

## The end

- **A win**: four coins of the same colour in a line, across, up and down, or diagonally. The player with that
  colour wins.
- **A tie**: all 42 spots are full and nobody has four in a line.

## When the input runs out

If the input ends before the game does (for example `Ctrl+D`, or a file of moves that stops early), the program
stops quietly instead of asking forever.
