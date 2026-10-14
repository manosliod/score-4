#include "score4/rules.hpp"

#include <array>
#include <cstddef>

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
constexpr std::array diagonals{upAndLeft, Step{.rows = -1, .columns = 1}};

std::optional<Line> lineAt(const Board &board, Position start, Step step, Disc disc) noexcept {
    Line line{.disc = disc, .cells = {}};
    for (int offset = 0; offset < lineLength; ++offset) {
        const Position position{.row = start.row + (offset * step.rows),
                                .column = start.column + (offset * step.columns)};
        if (!isOnBoard(position) || board.at(position) != cellOf(disc)) {
            return std::nullopt;
        }
        line.cells.at(static_cast<std::size_t>(offset)) = position;
    }
    return line;
}

std::optional<Line> findRowLine(const Board &board) noexcept {
    for (int row = bottomRow; row >= topRow; --row) {
        for (int column = 0; column + lineLength <= columnCount; ++column) {
            for (const auto disc : discs) {
                if (const auto line = lineAt(board, {.row = row, .column = column}, across, disc)) {
                    return line;
                }
            }
        }
    }
    return std::nullopt;
}

std::optional<Line> findColumnLine(const Board &board) noexcept {
    for (int column = 0; column < columnCount; ++column) {
        for (int row = bottomRow; row >= lineLength - 1; --row) {
            for (const auto disc : discs) {
                if (const auto line = lineAt(board, {.row = row, .column = column}, upward, disc)) {
                    return line;
                }
            }
        }
    }
    return std::nullopt;
}

std::optional<Line> findDiagonalLine(const Board &board) noexcept {
    for (const auto disc : discs) {
        for (int row = bottomRow; row >= lineLength - 1; --row) {
            for (int column = 0; column < columnCount; ++column) {
                for (const auto step : diagonals) {
                    if (const auto line = lineAt(board, {.row = row, .column = column}, step, disc)) {
                        return line;
                    }
                }
            }
        }
    }
    return std::nullopt;
}

}

std::optional<int> landingRow(const Board &board, int column) noexcept {
    for (int row = bottomRow; row >= topRow; --row) {
        if (board.at({.row = row, .column = column}) == Cell::Empty) {
            return row;
        }
    }
    return std::nullopt;
}

std::optional<Line> findLine(const Board &board) noexcept {
    if (const auto line = findRowLine(board)) {
        return line;
    }
    if (const auto line = findColumnLine(board)) {
        return line;
    }
    return findDiagonalLine(board);
}

}
