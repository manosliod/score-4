#pragma once

#include "score4/board.hpp"

#include <string>

namespace score4::cli {

[[nodiscard]] std::string boardText(const Board &board);

[[nodiscard]] std::string colourName(Disc disc);

}
