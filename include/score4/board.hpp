#pragma once

#include <array>
#include <cstddef>
#include <cstdint>

namespace score4 {

inline constexpr int rowCount = 6;
inline constexpr int columnCount = 7;
inline constexpr int lineLength = 4;

enum class Disc : std::uint8_t { Red, Yellow };

enum class Cell : std::uint8_t { Empty, Red, Yellow };

struct Position {
    int row;
    int column;
};

[[nodiscard]] constexpr bool isOnBoard(Position position) noexcept {
    return position.row >= 0 && position.row < rowCount && position.column >= 0 && position.column < columnCount;
}

[[nodiscard]] constexpr Cell cellOf(Disc disc) noexcept { return disc == Disc::Red ? Cell::Red : Cell::Yellow; }

class Board {
  public:
    [[nodiscard]] Cell at(Position position) const noexcept;
    void place(Position position, Disc disc) noexcept;
    [[nodiscard]] bool isFull() const noexcept;

  private:
    [[nodiscard]] static std::size_t indexOf(Position position) noexcept;

    std::array<Cell, static_cast<std::size_t>(rowCount) * columnCount> cells_{};
};

}
