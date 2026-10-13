#include "console.hpp"

#include <cstdlib>
#include <iostream>

int main() {
    score4::cli::Console console(std::cin, std::cout, [] {
        [[maybe_unused]] const int status = std::system("cls"); // NOLINT(bugprone-command-processor)
    });
    console.run();
    return EXIT_SUCCESS;
}
