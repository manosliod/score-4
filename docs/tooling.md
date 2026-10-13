# Tooling

## Build

The project builds with CMake (3.28 or newer) and Ninja. The presets live in `CMakePresets.json`:

| Preset | What it is for |
| --- | --- |
| `debug` | Day-to-day work and CI tests. Turns on AddressSanitizer and UndefinedBehaviorSanitizer, so memory bugs and undefined behaviour stop the program with a report. |
| `release` | An optimised build of the console game. |
| `wasm` | The game core compiled to WebAssembly with Emscripten, for the web demo. Needs `EMSDK` set (see `~/.local/emsdk`). |

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

Two lines carry `NOLINT(bugprone-command-processor)`:

- `apps/cli/main.cpp` clears the screen with `system("cls")`, exactly as the 2019 program did. It is replaced in the
  "complete" step.
- `tests/cli_characterization_test.cpp` starts the console program with `popen`, which is what the test is for.

## CI

`.github/workflows/ci.yml` runs on every push and pull request:

1. **no-comments**: `scripts/check_no_comments.py` (a copy of the studio script; never edit it here).
2. **cpp** on Ubuntu 26.04 (GCC 15): format check, configure, clang-tidy, build, tests with sanitizers, then a
   release build and its tests.

The exact versions of clang-format, clang-tidy, CMake and Ninja are pinned in `requirements-tools.txt`, so the
format check gives the same answer on a laptop and in CI. Install them locally with
`uv tool install clang-format==23.1.3` (and the same for the others), or `pip install -r requirements-tools.txt`.

## Claude Code hooks

`.claude/settings.json` runs `scripts/claude_hook.py` at two moments:

| When | What happens |
| --- | --- |
| After Claude edits a `.cpp` or `.hpp` file | `clang-format -i` on that file, so it always matches the format check. |
| When Claude is about to finish its turn | If anything under `include/`, `src/`, `apps/`, `tests/` or the CMake files is changed and not committed, it configures, builds and runs the debug tests. If any step fails, Claude has to keep working. If it fails a second time in a row, the failure is shown but Claude may stop, so it can never get stuck in a loop. |

The comment check (`check_no_comments.py --hook`) runs on every edit from the settings one folder up, in
`~/Sites/manosliod/.claude/settings.json`.
