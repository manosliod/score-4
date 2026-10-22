cmake_minimum_required(VERSION 3.28)

project(score4 VERSION 1.1.2 LANGUAGES CXX) # x-release-please-version

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

add_library(score4_core src/board.cpp src/rules.cpp src/game.cpp)
target_include_directories(score4_core PUBLIC include)
target_link_libraries(score4_core PRIVATE score4_warnings)

if(EMSCRIPTEN)
    add_executable(score4_engine web/engine/bindings.cpp)
    target_link_libraries(score4_engine PRIVATE score4_core score4_warnings)
    set_target_properties(score4_engine PROPERTIES RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/engine)
    target_link_options(
        score4_engine
        PRIVATE
        -lembind
        -sMODULARIZE=1
        -sEXPORT_ES6=1
        -sEXPORT_NAME=createEngine
        -sENVIRONMENT=web,node
        --emit-tsd
        score4_engine.d.ts)
    return()
endif()

add_executable(score4 apps/cli/main.cpp apps/cli/console.cpp apps/cli/board_text.cpp)
target_link_libraries(score4 PRIVATE score4_core score4_warnings)

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

    add_executable(score4_core_tests tests/rules_test.cpp tests/game_test.cpp)
    target_link_libraries(score4_core_tests PRIVATE score4_core Catch2::Catch2WithMain score4_warnings)
    catch_discover_tests(score4_core_tests)

    add_executable(score4_cli_tests tests/cli_characterization_test.cpp)
    target_link_libraries(score4_cli_tests PRIVATE Catch2::Catch2WithMain score4_warnings)
    target_compile_definitions(
        score4_cli_tests PRIVATE SCORE4_CLI="$<TARGET_FILE:score4>"
                                 SCORE4_CLI_FIXTURES="${CMAKE_CURRENT_SOURCE_DIR}/tests/fixtures/cli")
    add_dependencies(score4_cli_tests score4)
    catch_discover_tests(score4_cli_tests PROPERTIES ENVIRONMENT "ASAN_OPTIONS=detect_leaks=0")
endif()
