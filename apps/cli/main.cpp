#include "console.hpp"

#include <cstdlib>
#include <iostream>

int main() {
    score4::cli::Console console(std::cin, std::cout, [] {
        static_cast<void>(std::system("cls")); // NOLINT(bugprone-command-processor)
    });
    console.run();
    return EXIT_SUCCESS;
}
