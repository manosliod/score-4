#pragma once

#include "score4/board.hpp"

#include <optional>

namespace score4 {

[[nodiscard]] std::optional<int> landingRow(const Board &board, int column) noexcept;

[[nodiscard]] std::optional<Disc> findLine(const Board &board) noexcept;

}
