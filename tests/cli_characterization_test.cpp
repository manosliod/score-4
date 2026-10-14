#include <catch2/catch_test_macros.hpp>
#include <catch2/generators/catch_generators.hpp>

#include <array>
#include <cstdio>
#include <fstream>
#include <memory>
#include <sstream>
#include <string>
#include <string_view>

namespace {

std::string readFile(const std::string &path) {
    std::ifstream file(path, std::ios::binary);
    REQUIRE(file.good());
    std::ostringstream content;
    content << file.rdbuf();
    return content.str();
}

struct PipeCloser {
    void operator()(std::FILE *pipe) const noexcept { pclose(pipe); }
};

std::string runCli(std::string_view flow) {
    const std::string command =
        std::string("'") + SCORE4_CLI + "' < '" + SCORE4_CLI_FIXTURES + "/" + std::string(flow) + ".in' 2>/dev/null";
    const std::unique_ptr<std::FILE, PipeCloser> pipe(
        popen(command.c_str(), "r")); // NOLINT(bugprone-command-processor)
    REQUIRE(pipe != nullptr);
    std::string output;
    std::array<char, 4096> buffer{};
    while (const auto read = std::fread(buffer.data(), 1, buffer.size(), pipe.get())) {
        output.append(buffer.data(), read);
    }
    return output;
}

}

TEST_CASE("console flows match the recorded output", "[cli][characterization]") {
    const auto flow = GENERATE(as<std::string_view>{}, "vertical-win", "horizontal-win", "diagonal-win", "tie",
                               "anti-diagonal-win", "column-out-of-range", "full-column", "non-numeric-input");
    CAPTURE(flow);
    const auto expected = readFile(std::string(SCORE4_CLI_FIXTURES) + "/" + std::string(flow) + ".txt");
    CHECK(runCli(flow) == expected);
}
