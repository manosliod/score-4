cmake_minimum_required(VERSION 3.28)

project(score4 VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_CXX_SCAN_FOR_MODULES OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_library(score4_warnings INTERFACE)
if(MSVC)
    target_compile_options(score4_warnings INTERFACE /W4 /WX)
else()
    target_compile_options(score4_warnings INTERFACE -Wall -Wextra -Wpedantic -Wconversion -Wshadow -Werror)
endif()

add_executable(score4_legacy "Score 4/Score 4 (NoGUI)/main.cpp")
target_compile_options(score4_legacy PRIVATE -w -ftrivial-auto-var-init=zero)

include(CTest)
if(BUILD_TESTING)
    include(FetchContent)
    FetchContent_Declare(
        Catch2
        GIT_REPOSITORY https://github.com/catchorg/Catch2.git
        GIT_TAG v3.16.1
        GIT_SHALLOW TRUE
        SYSTEM)
    FetchContent_MakeAvailable(Catch2)
    include(Catch)

    add_executable(score4_cli_tests tests/cli_characterization_test.cpp)
    target_link_libraries(score4_cli_tests PRIVATE Catch2::Catch2WithMain score4_warnings)
    target_compile_definitions(
        score4_cli_tests PRIVATE SCORE4_CLI="$<TARGET_FILE:score4_legacy>"
                                 SCORE4_CLI_FIXTURES="${CMAKE_CURRENT_SOURCE_DIR}/tests/fixtures/cli")
    add_dependencies(score4_cli_tests score4_legacy)
    catch_discover_tests(score4_cli_tests PROPERTIES ENVIRONMENT "ASAN_OPTIONS=detect_leaks=0")
endif()
