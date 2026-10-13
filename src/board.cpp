#include "score4/board.hpp"

#include <algorithm>

namespace score4 {

std::size_t Board::indexOf(Position position) noexcept {
    return (static_cast<std::size_t>(position.row) * columnCount) + static_cast<std::size_t>(position.column);
}

Cell Board::at(Position position) const noexcept {
    if (!isOnBoard(position)) {
        return Cell::Empty;
    }
    return cells_.at(indexOf(position));
}

void Board::place(Position position, Disc disc) noexcept {
    if (isOnBoard(position)) {
        cells_.at(indexOf(position)) = cellOf(disc);
    }
}

bool Board::isFull() const noexcept {
    return std::ranges::none_of(cells_, [](Cell cell) { return cell == Cell::Empty; });
}

}
