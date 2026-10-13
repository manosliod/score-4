#include "score4/rules.hpp"

#include <array>

namespace score4 {

namespace {

struct Step {
    int rows;
    int columns;
};

constexpr int topRow = 0;
constexpr int bottomRow = rowCount - 1;
constexpr std::array discs{Disc::Red, Disc::Yellow};
constexpr Step across{.rows = 0, .columns = 1};
constexpr Step upward{.rows = -1, .columns = 0};
constexpr Step upAndLeft{.rows = -1, .columns = -1};

bool isLine(const Board &board, Position start, Step step, Disc disc) noexcept {
    for (int offset = 0; offset < lineLength; ++offset) {
        const Position position{.row = start.row + (offset * step.rows),
                                .column = start.column + (offset * step.columns)};
        if (!isOnBoard(position) || board.at(position) != cellOf(disc)) {
            return false;
        }
    }
    return true;
}

std::optional<Disc> findRowLine(const Board &board) noexcept {
    for (int row = bottomRow; row > topRow; --row) {
        for (int column = 0; column + lineLength <= columnCount; ++column) {
            for (const auto disc : discs) {
                if (isLine(board, {.row = row, .column = column}, across, disc)) {
                    return disc;
                }
            }
        }
    }
    return std::nullopt;
}

std::optional<Disc> findColumnLine(const Board &board) noexcept {
    for (int column = 0; column < columnCount; ++column) {
        for (int row = bottomRow; row > topRow; --row) {
            for (const auto disc : discs) {
                if (isLine(board, {.row = row, .column = column}, upward, disc)) {
                    return disc;
                }
            }
        }
    }
    return std::nullopt;
}

std::optional<Disc> findDiagonalLine(const Board &board) noexcept {
    for (const auto disc : discs) {
        for (int row = bottomRow; row >= lineLength - 1; --row) {
            for (int column = columnCount - 1; column >= lineLength - 1; --column) {
                if (isLine(board, {.row = row, .column = column}, upAndLeft, disc)) {
                    return disc;
                }
            }
        }
    }
    return std::nullopt;
}

}

int landingRow(const Board &board, int column) noexcept {
    for (int row = bottomRow; row > topRow; --row) {
        if (board.at({.row = row, .column = column}) == Cell::Empty) {
            return row;
        }
    }
    return topRow;
}

std::optional<Disc> findLine(const Board &board) noexcept {
    if (const auto disc = findRowLine(board)) {
        return disc;
    }
    if (const auto disc = findColumnLine(board)) {
        return disc;
    }
    return findDiagonalLine(board);
}

}
