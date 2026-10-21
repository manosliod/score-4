# Score 4

Connect Four for two players, from a tested C++ core running in the browser.

![Score 4](docs/portfolio/cover.png)

Score 4 is Connect Four for two people at one keyboard or one phone. The rules live in one small, tested C++23
library. It runs as a console game, and, compiled to WebAssembly, behind a mobile-first React app designed in Figma
on Material 3. The console and the web play the exact same game, because there is only one implementation of it.

[Play the demo](https://manosliod.github.io/score-4/) · [Design (Figma)](https://www.figma.com/design/Qs0Ang2VyFUpVXaoHzgdr6?node-id=1-7) · [Case study](docs/portfolio/case-study.md)

## Features

- Seven columns, six rows; four in a line across, up and down, or on either diagonal wins; a full board is a tie.
- The younger player starts (the same age: Player 1) and picks Red or Yellow.
- A full column is refused with a clear message, and the same player picks again.
- Web app: phone and desktop layouts, reduced motion respected, and a Theme button to pick System, Light or Dark;
  the choice is remembered and applied before the page first shows.
- Colour-blind safe coins (a circle on Red, a star on Yellow), full keyboard play and screen-reader announcements.

## Stack

- **Game core and console app**: C++23, CMake 4 with Ninja, Catch2 v3, GCC 15 with AddressSanitizer and
  UndefinedBehaviorSanitizer in debug builds, clang-format and clang-tidy.
- **Engine**: the same core compiled to WebAssembly with Emscripten 6 and embind.
- **Web app**: React 19 with the React Compiler, TypeScript, Vite 8, Zustand, Base UI, Tailwind CSS 4.
- **Web tests**: Vitest with Testing Library, Playwright.
- **Design**: Figma, Material 3 Design Kit.

## Getting started

### Console game

```bash
cmake --version && ninja --version
cmake --preset release
cmake --build --preset release
./build/release/score4
```

### Web app

```bash
node -v && pnpm -v
source ~/.local/emsdk/emsdk_env.sh
cd web
pnpm install
pnpm engine
pnpm dev
```

`pnpm engine` builds the WebAssembly engine from the C++ core. It needs [Emscripten](https://emscripten.org/) 6
installed in `~/.local/emsdk`. Node 24 is pinned in `web/.nvmrc`.

## Development

### C++

| Task | Command |
| --- | --- |
| Format | `clang-format --dry-run --Werror $(git ls-files '*.cpp' '*.hpp')` |
| Lint | `run-clang-tidy.py -p build/debug` |
| Test | `cmake --preset debug && cmake --build --preset debug && ctest --preset debug` |
| Build | `cmake --preset release && cmake --build --preset release` |

### Web (from `web/`)

| Task | Command |
| --- | --- |
| Format | `pnpm format` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Test | `pnpm test` and `pnpm e2e` |
| Build | `pnpm build` |

Tool versions, the CI jobs and every switched-off lint rule are explained in [`docs/tooling.md`](docs/tooling.md).

## Project structure

```
include/score4/   the game core's public headers: board, rules, game
src/              the game core: no input, no output
apps/cli/         the console game around the core
tests/            unit tests and the recorded console flows
web/
  engine/         the embind binding that exposes the core to JavaScript
  src/app/        switches between setup and game
  src/features/   setup and game: screens, hooks and stores
  src/forest/     Material 3 components, independent of Score 4
  src/shared/     board, coins, player tags and the engine service
  e2e/            Playwright tests at the phone and desktop widths
docs/             rules, architecture, decisions, tooling, case study
```

## History

Originally written in 2019 as a student project: one C++ file for the Windows console. Rebuilt in 2026 with a tested
game core, its bugs fixed, and a web app on WebAssembly designed in Figma. The before/after is in the
[case study](docs/portfolio/case-study.md).

## License

MIT © 2026 Manos Liodakis · [LinkedIn](https://www.linkedin.com/in/emmanouil-liodakis/) · [GitHub](https://github.com/manosliod)
