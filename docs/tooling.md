# Tooling

## Build

The project builds with CMake (3.28 or newer) and Ninja. The presets live in `CMakePresets.json`:

| Preset | What it is for |
| --- | --- |
| `debug` | Day-to-day work and CI tests. Turns on AddressSanitizer and UndefinedBehaviorSanitizer, so memory bugs and undefined behaviour stop the program with a report. |
| `release` | An optimised build of the console game. |
| `wasm` | The game core compiled to WebAssembly with Emscripten, for the web demo. Needs `EMSDK` set (run `source ~/.local/emsdk/emsdk_env.sh`). It writes `build/wasm/engine/score4_engine.js`, `.wasm` and `.d.ts`; the web app imports them from there. |

```sh
cmake --preset debug
cmake --build --preset debug
ctest --preset debug
```

Every target of ours links `score4_warnings`, which turns on `-Wall -Wextra -Wpedantic -Wconversion -Wshadow` and
treats every warning as an error.

## Formatting

`clang-format` with the LLVM style, 4-space indents and lines up to 120 characters (`.clang-format`). It is told not
to add `// namespace` after a closing brace, because we write no comments for people.

```sh
clang-format --dry-run --Werror $(git ls-files '*.cpp' '*.hpp')
```

## Linting

`clang-tidy` runs the `bugprone`, `modernize`, `performance`, `readability` and `cppcoreguidelines` groups, and any
finding fails the build. Three checks are switched off:

| Check | Why it is off |
| --- | --- |
| `modernize-use-trailing-return-type` | It asks for `auto f() -> int` everywhere. That is a style choice, not a fix, and the usual form reads better. |
| `readability-identifier-length` | It flags short names such as `row` loop counters in two-line lambdas. Our names are checked in review instead. |
| `bugprone-easily-swappable-parameters` | A board position is a row and a column, both small numbers. The core passes them together as a `Position`, and the check still fires on the few helpers that take two counts. |

```sh
run-clang-tidy.py -p build/debug
```

Tests have their own `tests/.clang-tidy`, which keeps everything above and also switches off:

| Check | Why it is off in tests |
| --- | --- |
| `cppcoreguidelines-avoid-magic-numbers`, `readability-magic-numbers` | Test data is literal on purpose: "row 5, column 0" is the clearest way to say where a coin is. |
| `modernize-use-designated-initializers` | Board spots in tests are written `{5, 0}`, the same way the rules describe them; `{.row = 5, .column = 0}` on every coin makes a test hard to read. The game code itself uses the designated form. |
| `readability-function-cognitive-complexity` | Catch2's `TEST_CASE`, `CHECK` and `GENERATE` macros expand into branches the check counts. |

One line carries `NOLINT(bugprone-command-processor)`: `tests/cli_characterization_test.cpp` starts the console
program with `popen`, which is what the test is for.

## Web app

The web app lives in `web/` and uses pnpm and Node 24 (`web/.nvmrc`). Build the engine first, then the app:

```sh
source ~/.local/emsdk/emsdk_env.sh
cd web
pnpm install
pnpm engine
pnpm dev
```

| Command | What it does |
| --- | --- |
| `pnpm lint` | ESLint, the Prettier check, and a check that no JavaScript file is tracked anywhere in the repo. |
| `pnpm typecheck` | The TypeScript compiler, without writing any files. |
| `pnpm test` | Vitest: the engine service, the stores and the board. |
| `pnpm build` | The production build, then a size check: the main script must stay under 125 kB and the styles under 12 kB, both gzipped. |
| `pnpm e2e` | Playwright plays the game in Chromium at 412 and 1024 pixels wide. |

All code is TypeScript, including the config files and the two checks in `web/scripts/`, which Node 24 runs directly.

### Why the TypeScript settings are so strict

On top of `strict`, `web/tsconfig.json` turns on:

| Setting | What it catches |
| --- | --- |
| `noUncheckedIndexedAccess` | Reading `board[7]` or `ages[3]` may give nothing; the code has to say what happens then. |
| `exactOptionalPropertyTypes` | "Not given" and "given as `undefined`" are different, so a missing prop cannot silently become `undefined`. |
| `noPropertyAccessFromIndexSignature` | Names that may not exist (like `process.env['CI']`) are written with brackets, so it is clear they are a guess. |
| `noImplicitOverride`, `noFallthroughCasesInSwitch` | A method that replaces another, or a `switch` case that runs into the next, has to say so. |
| `verbatimModuleSyntax`, `erasableSyntaxOnly`, `isolatedModules` | Every file can be turned into JavaScript just by deleting the types. That is what Vite and Node do, so no TypeScript feature that needs real code generation (like `enum`) is allowed. |

### Lint rules for the web app

ESLint runs `typescript-eslint` (strictest type-aware rules), the React hooks and React Compiler rules, accessibility
rules for JSX, and these project rules:

| Rule | Why |
| --- | --- |
| No `useEffect`, `useLayoutEffect` or `useInsertionEffect` outside `src/shared/hooks/` | Code runs because the player did something, not "after render". The folder is empty in this project. |
| Setup and game may not import each other; Forest and Shared may not import features or the app | Keeps each part replaceable and lets Forest move to a shared package. |
| Type aliases (`type`), not `interface` | One way to write types. |
| Kebab-case file and folder names, no default exports | Community convention; named exports keep names the same everywhere. |

The accessibility rules come from `eslint-plugin-jsx-a11y-x`, a maintained fork of `eslint-plugin-jsx-a11y`, because
the original does not support ESLint 10 yet.

## CI

`.github/workflows/ci.yml` runs on every push and pull request:

1. **no-comments**: the shared check from [`manosliod/dev-tooling`](https://github.com/manosliod/dev-tooling),
   pinned to `@v1.1`. Run it locally with
   `uvx --from git+https://github.com/manosliod/dev-tooling@v1.1 check-no-comments`.
2. **cpp** on Ubuntu 26.04 (GCC 15): format check, configure, clang-tidy, build, tests with sanitizers, then a
   release build and its tests. The downloaded test library (Catch2) is cached between runs. CMake writes the
   folder it was built in into that cache, so the cache name includes the repository name: after a rename, CI starts
   with a fresh cache instead of failing on the old folder.
3. **web**: installs Emscripten 6.0.12 (cached), builds the engine, then runs `pnpm lint`, `typecheck`, `test`,
   `build` and `e2e`.
4. **deploy**: only on a push to `master`, and only once the three jobs above pass. It builds the web app with
   `SCORE4_BASE=/score-4/`, so every file is loaded from the project's GitHub Pages address, and publishes `web/dist`
   to <https://manosliod.github.io/score-4/>. It is the only job that may write to GitHub Pages.

The exact versions of clang-format, clang-tidy, CMake and Ninja are pinned in `requirements-tools.txt`, so the
format check gives the same answer on a laptop and in CI. Install them locally with
`uv tool install clang-format==23.1.3` (and the same for the others), or `pip install -r requirements-tools.txt`.

## Claude Code hooks

`.claude/settings.json` runs `scripts/claude_hook.py` at two moments:

| When | What happens |
| --- | --- |
| After Claude edits a `.cpp` or `.hpp` file | `clang-format -i` on that file, so it always matches the format check. |
| When Claude is about to finish its turn | If anything under `include/`, `src/`, `apps/`, `tests/` or the CMake files is changed and not committed, it configures, builds and runs the debug tests. If any step fails, Claude has to keep working. If it fails a second time in a row, the failure is shown but Claude may stop, so it can never get stuck in a loop. |

The comment check (`check-no-comments --hook`, from `dev-tooling`) runs on every edit from the settings one folder
up, in `~/Sites/manosliod/.claude/settings.json`.
