# Product

## Register

product

## Users

Two groups, both on a phone more often than not:

- **Visitors from the portfolio**: a recruiter or engineer who opens the demo from a link and gives it a minute or two.
  They want to see quickly that the game works, feels good, and was built with care.
- **Two friends at one device**: hot-seat play, passing the phone or sharing a laptop. They want to set up a game in
  seconds and play several rounds without friction.

The job on every screen is the same: get to the board, take a turn, see clearly who is playing and who won.

## Product Purpose

Score 4 is a two-player Connect Four game. A 2019 console program is rebuilt as a tested C++ game core that runs both
as a console app and, compiled to WebAssembly, behind a web front end. The web demo keeps the original rules: the
younger player starts (equal ages: Player 1), players pick Red or Yellow, coins drop into one of seven columns, four in
a row in any direction wins, a full board is a tie.

Success: a visitor plays a full game on a phone without instructions, and the result is unmistakable.

## Brand Personality

Playful, tactile, clean. The joy lives in the coin falling into place and the moment four line up, not in decoration.
Voice is short and friendly ("Player 2's turn", "Red wins"), never cute or wordy.

## Anti-references

- Casino and ad-network mini-games: neon, confetti everywhere, pushy buttons.
- Skeuomorphic 3D: glossy plastic coins, wood textures.
- The generic framework tutorial demo: a bare grid and a "Reset" button with no care for states or feedback.
- Dashboard/SaaS framing: cards, stats and sidebars wrapped around a game.

## Design Principles

1. **The board is the screen.** Everything else (setup, turn, result) serves the board and stays out of its way.
2. **Feel every move.** Each drop, invalid move and win gets clear, physical feedback; nothing happens silently.
3. **One glance, one answer.** Whose turn it is and who won must be readable in a squint, without relying on colour.
4. **Same rules everywhere.** The console and the web play the exact same game, from the same tested core.
5. **Material, not costume.** Standard Material 3 components and roles; the personality comes from motion and the
   board, not from custom chrome.

## Accessibility & Inclusion

- WCAG 2.2 AA in light and dark themes.
- Colour-blind safe: the two players' coins differ by a mark or shape as well as by colour.
- Fully playable with a keyboard (choose a column, drop) and announced to screen readers (turn, move, result).
- `prefers-reduced-motion` respected: drops and win highlights fall back to instant or crossfade.
- Touch targets at least 48 dp; columns are the touch targets on the board.
