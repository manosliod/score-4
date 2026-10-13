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
