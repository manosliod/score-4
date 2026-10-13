cmake_minimum_required(VERSION 3.28)

project(score4 VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_library(score4_warnings INTERFACE)
if(MSVC)
    target_compile_options(score4_warnings INTERFACE /W4 /WX)
else()
    target_compile_options(score4_warnings INTERFACE -Wall -Wextra -Wpedantic -Wconversion -Wshadow -Werror)
endif()

add_executable(score4_legacy "Score 4/Score 4 (NoGUI)/main.cpp")
target_compile_options(score4_legacy PRIVATE -w -ftrivial-auto-var-init=zero)
