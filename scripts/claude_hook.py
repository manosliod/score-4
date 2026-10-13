#!/usr/bin/env python3
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CPP_SUFFIXES = {".cpp", ".hpp"}
BUILD_INPUTS = ("include/", "src/", "apps/", "tests/", "CMakeLists.txt", "CMakePresets.json")
BLOCK = 2


def read_event():
    try:
        return json.load(sys.stdin)
    except json.JSONDecodeError:
        return {}


def format_edited_file(event):
    path = Path(event.get("tool_input", {}).get("file_path", ""))
    if path.suffix not in CPP_SUFFIXES or not path.is_file() or ROOT not in path.resolve().parents:
        return 0
    formatter = shutil.which("clang-format")
    if formatter is None:
        print("clang-format is not on PATH; the file was not formatted", file=sys.stderr)
        return 0
    subprocess.run([formatter, "-i", str(path)], cwd=ROOT, check=False)
    return 0


def changed_build_inputs():
    status = subprocess.run(
        ["git", "status", "--porcelain", "--untracked-files=all"], cwd=ROOT, capture_output=True, text=True, check=False
    )
    paths = [line[3:] for line in status.stdout.splitlines()]
    return any(path.startswith(BUILD_INPUTS) for path in paths)


def run(command):
    return subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)


def test_before_stop(event):
    if not changed_build_inputs():
        return 0
    steps = (
        ["cmake", "--preset", "debug"],
        ["cmake", "--build", "--preset", "debug"],
        ["ctest", "--preset", "debug"],
    )
    for step in steps:
        result = run(step)
        if result.returncode != 0:
            report = (result.stdout + result.stderr)[-4000:]
            print(f"`{' '.join(step)}` failed:\n{report}", file=sys.stderr)
            return 0 if event.get("stop_hook_active") else BLOCK
    return 0


def main():
    event = read_event()
    handlers = {"format": format_edited_file, "test": test_before_stop}
    handler = handlers.get(sys.argv[1] if len(sys.argv) > 1 else "")
    if handler is None:
        print("usage: claude_hook.py format|test", file=sys.stderr)
        return 1
    return handler(event)


if __name__ == "__main__":
    sys.exit(main())
