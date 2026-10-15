#include "console.hpp"

#include <cstdlib>
#include <iostream>

#include <unistd.h>

int main() {
    const bool isTerminal = isatty(STDOUT_FILENO) == 1;
    score4::cli::Console console(std::cin, std::cout, [isTerminal] {
        if (isTerminal) {
            std::cout << "\x1b[2J\x1b[H";
        }
    });
    console.run();
    return EXIT_SUCCESS;
}
