#include <catch2/catch_test_macros.hpp>
#include <catch2/generators/catch_generators.hpp>

#include <array>
#include <cstddef>
#include <cstdio>
#include <fstream>
#include <memory>
#include <optional>
#include <sstream>
#include <string>
#include <string_view>

namespace {

struct Flow {
    std::string_view name;
    std::optional<std::string_view> stopMarker;
    std::size_t stopCount;
};

constexpr std::string_view promptEnd = ": ";
constexpr std::string_view columnPrompt = "Pick the column";

std::string readFile(const std::string &path) {
    std::ifstream file(path, std::ios::binary);
    REQUIRE(file.good());
    std::ostringstream content;
    content << file.rdbuf();
    return content.str();
}

std::optional<std::size_t> cutPoint(const std::string &output, std::string_view marker, std::size_t count) {
    std::size_t position = 0;
    for (std::size_t seen = 0; seen < count; ++seen) {
        position = output.find(marker, seen == 0 ? 0 : position + 1);
        if (position == std::string::npos) {
            return std::nullopt;
        }
    }
    const auto end = output.find(promptEnd, position);
    if (end == std::string::npos) {
        return std::nullopt;
    }
    return end + promptEnd.size();
}

struct PipeCloser {
    void operator()(std::FILE *pipe) const noexcept { pclose(pipe); }
};

std::string runCli(const Flow &flow) {
    const std::string command = std::string("'") + SCORE4_CLI + "' < '" + SCORE4_CLI_FIXTURES + "/" +
                                std::string(flow.name) + ".in' 2>/dev/null";
    const std::unique_ptr<std::FILE, PipeCloser> pipe(
        popen(command.c_str(), "r")); // NOLINT(bugprone-command-processor)
    REQUIRE(pipe != nullptr);
    std::string output;
    std::array<char, 4096> buffer{};
    while (const auto read = std::fread(buffer.data(), 1, buffer.size(), pipe.get())) {
        output.append(buffer.data(), read);
        if (flow.stopMarker) {
            if (const auto cut = cutPoint(output, *flow.stopMarker, flow.stopCount)) {
                output.resize(*cut);
                return output;
            }
        }
    }
    return output;
}

}

TEST_CASE("console flows match the recorded 2019 output", "[cli][characterization]") {
    const auto flow =
        GENERATE(Flow{"vertical-win", std::nullopt, 0}, Flow{"horizontal-win", std::nullopt, 0},
                 Flow{"diagonal-win", std::nullopt, 0}, Flow{"tie", std::nullopt, 0},
                 Flow{"anti-diagonal-missed", columnPrompt, 12}, Flow{"column-out-of-range", columnPrompt, 5},
                 Flow{"full-column", columnPrompt, 8}, Flow{"non-numeric-input", "Type 'R'", 4});
    CAPTURE(flow.name);
    const auto expected = readFile(std::string(SCORE4_CLI_FIXTURES) + "/" + std::string(flow.name) + ".txt");
    CHECK(runCli(flow) == expected);
}
