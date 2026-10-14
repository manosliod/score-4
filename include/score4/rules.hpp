#pragma once

#include "score4/board.hpp"

#include <array>
#include <optional>

namespace score4 {

[[nodiscard]] std::optional<int> landingRow(const Board &board, int column) noexcept;

struct Line {
    Disc disc;
    std::array<Position, lineLength> cells;

    friend constexpr bool operator==(const Line &, const Line &) noexcept = default;
};

[[nodiscard]] std::optional<Line> findLine(const Board &board) noexcept;

}
