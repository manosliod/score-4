# Design

The source of truth is the Figma page [↳ score-4](https://www.figma.com/design/Qs0Ang2VyFUpVXaoHzgdr6?node-id=1-7),
built from the Material 3 Design Kit. This file mirrors its values so the web demo can be built without opening
Figma. If the two disagree, Figma wins and this file is updated.

## Theme

Kit colour mode **Blue**: a classic blue board. The user picks the theme: System (follows `prefers-color-scheme`,
the default), Light or Dark (see "Theme choice").

The two coins borrow the kit's **Red** and **Yellow** modes. Each coin uses the same three roles (Primary Container fill,
Primary ring, On Primary Container mark), read from its own mode. That keeps every colour a kit value: the Blue mode
has no true red or yellow.

## Colour roles

### Blue (app and board)

| Role | Light | Dark | Used for |
| --- | --- | --- | --- |
| Primary | `#485E92` | `#B0C6FF` | Board |
| On Primary | `#FFFFFF` | `#152E60` | Ring around a winning cell |
| Primary Container | `#ADC3FE` | `#2E4578` |  |
| On Primary Container | `#324574` | `#D9E2FF` |  |
| Secondary | `#585F72` | `#C0C6DC` | Focus ring of a column |
| Secondary Container | `#D9DFF6` | `#404659` |  |
| On Secondary Container | `#404659` | `#DCE2F9` |  |
| Surface | `#FAF8FF` | `#121318` |  |
| Surface Container Lowest | `#FFFFFF` | `#0C0E13` | Empty holes |
| Surface Container Low | `#F4F3FA` | `#1A1B21` |  |
| Surface Container High | `#E8E7EF` | `#282A2F` |  |
| On Surface | `#1A1B21` | `#E2E2E9` |  |
| On Surface Variant | `#44464F` | `#C5C6D0` |  |
| Outline | `#757780` | `#8F909A` |  |
| Outline Variant | `#C5C6D0` | `#44464F` |  |
| Inverse Surface | `#282A2F` | `#E2E2E9` |  |
| Inverse On Surface | `#EEEDF4` | `#33343A` |  |
| Error | `#B3261E` | `#F2B8B5` | Input errors |
| Scrim | `#000000` at 32% | `#000000` at 32% | Behind dialogs |

### Coins

| Role | Red light | Red dark | Yellow light | Yellow dark |
| --- | --- | --- | --- | --- |
| Primary Container (fill) | `#FDA499` | `#73342C` | `#FFD57D` | `#6D5000` |
| Primary (ring) | `#914B43` | `#FFA79B` | `#795A0C` | `#E9C16C` |
| On Primary Container (mark) | `#73332C` | `#FFDAD5` | `#544522` | `#FFF7EF` |

Each coin also carries a mark, so the two players never differ by colour alone: Red has a **circle**, Yellow a
**star**.

### State layers

On the board, state layers use On Primary: 8% for hover, 10% for focus and pressed. A focused column also gets a 3 dp
Secondary ring. Elsewhere they use On Surface at 10%.

## Board

| Part | Compact | Expanded |
| --- | --- | --- |
| Board | 376 × 332, 6 dp padding, corner Large (16) | 528 × 468, 12 dp padding, corner Extra-large (28) |
| Column (touch target) | 52 × 320, 4 dp top and bottom, corner Full | 72 × 444, 6 dp top and bottom, corner Full |
| Cell | 52 × 52, hole 44 | 72 × 72, hole 62 |
| Coin | 44 × 44, 3 dp ring, mark 16 (circle) / 26 (star) | 62 × 62, 4 dp ring, mark 22 / 36 |

A small coin (24 × 24, 2 dp ring, mark 9 / 14) marks each player in the player tags.

- **Column states**: Enabled, Hovered, Focused, Pressed, Disabled. The column is the touch target, so it is at least
  48 dp wide at every size.
- **Win**: each of the four winning cells gets a 3 dp On Primary ring around its hole (white on the light board, dark
  navy on the dark one). The ring is per cell rather than around the column, because a win can be a row or either
  diagonal, and the column outline already means "you will drop here".

## Type scale

Roboto throughout, from the kit's M3 text styles.

| Style | Size / line height | Weight | Tracking |
| --- | --- | --- | --- |
| Display large | 57 / 64 | 400 | −0.25 |
| Display small | 36 / 44 | 400 | 0 |
| Headline medium | 28 / 36 | 400 | 0 |
| Headline small | 24 / 32 | 400 | 0 |
| Title large | 22 / 28 | 400 | 0 |
| Title medium | 16 / 24 | 500 | 0.15 |
| Body large | 16 / 24 | 400 | 0.5 |
| Body medium | 14 / 20 | 400 | 0.25 |
| Body small | 12 / 16 | 400 | 0.4 |
| Label large | 14 / 20 | 500 | 0.1 |

## Shape

Corners come from the kit: Medium 12, Large 16, Extra-large 28, Full for coins, holes and columns.

## Layout

Mobile first. Compact (designed at 412) stacks everything in one column around the board. Medium reuses the compact
column. Expanded (designed at 1024) puts a 360 dp side pane (players, turn, actions) next to the board pane.

## Theme choice

The Forest pattern **Theme picker** ([Patterns](https://www.figma.com/design/Qs0Ang2VyFUpVXaoHzgdr6?node-id=76-1156)):
one M3 single-select segmented button with three segments, each with icon and label. The selected segment shows a check
mark in place of its icon.

| Segment | Icon | Stored value |
| --- | --- | --- |
| System (default) | `brightness_auto` | `system` |
| Light | `light_mode` | `light` |
| Dark | `dark_mode` | `dark` |

- **Theme button**: a standard icon button (kit Icon button, Small, Round) labelled "Theme" is the last trailing action
  of the top app bar on every screen, at every width, after New game on game screens. Its icon is the current choice. It
  is never disabled.
- **Compact (below 600 dp)**: the button opens the Forest **Theme sheet** (modal bottom sheet with drag handle, title
  "Theme", the picker) over the 32 % scrim. Scrim tap, swipe down or Escape close it. Frames: "Game · Theme sheet
  · Compact · Light/Dark".
- **Medium and expanded (600 dp and up)**: the button opens the Forest **Theme dialog** (basic dialog, centred, headline
  "Theme", the picker, one text button "Done") over the 32 % scrim. Done, Escape or scrim tap close it. There is no
  Cancel/OK pair because the choice applies at once, and M3 allows a single dialog action only as an acknowledgement.
  Frames: "Game · Theme dialog · Expanded · Light/Dark"; medium shows the same centred dialog over the compact column.
- **Choosing**: the theme changes as soon as a segment is chosen. Choosing does not close the sheet or the dialog, so
  the new theme is visible behind it and can be changed back.
- **Keyboard and screen readers**: the picker is a radio group named "Theme" with radios System, Light and Dark. Tab
  enters the group on the selected radio, arrow keys move, Space or Enter selects. When the sheet or dialog opens, focus
  goes to the selected radio; Tab moves between the picker and Done; on close, focus returns to the Theme button.
- **Loading and failure**: a press opens the sheet or dialog at once. While the picker downloads it is in its Loading
  state: same surface, scrim and title "Theme", with the Forest loading indicator labelled "Loading Theme" in a
  310 × 48 slot where the picker goes; the dialog keeps Done. The picker replaces the indicator in the same surface and
  focus stays where it was. Closing it while loading cancels the open. If the download fails, no panel stays open and a
  snackbar says "Couldn’t open Theme. Try again."; the next press tries again. Frames: "Game · Theme sheet · Compact ·
  Loading · Light", "Game · Theme dialog · Expanded · Loading · Light", "Game · Theme load failed · Compact · Light".
- **Persistence**: the choice is stored in `localStorage` under `theme`. An inline script in `index.html` sets
  `data-theme` on `<html>` before first paint, so the page never shows the wrong theme. `<meta name="theme-color">`
  follows the applied theme (Blue LT or Blue DT Surface).
