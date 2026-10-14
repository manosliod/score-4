#include "score4/board.hpp"
#include "score4/rules.hpp"

#include <catch2/catch_test_macros.hpp>

#include <initializer_list>
#include <optional>

using score4::Board;
using score4::Cell;
using score4::Disc;
using score4::Position;

namespace {

Board boardWith(Disc disc, std::initializer_list<Position> positions) {
    Board board;
    for (const auto position : positions) {
        board.place(position, disc);
    }
    return board;
}

}

TEST_CASE("an empty board has no line and is not full", "[rules]") {
    const Board board;
    CHECK_FALSE(score4::findLine(board).has_value());
    CHECK_FALSE(board.isFull());
}

TEST_CASE("a coin lands on the lowest empty spot of its column", "[rules]") {
    Board board;
    CHECK(score4::landingRow(board, 2) == 5);
    board.place({5, 2}, Disc::Red);
    CHECK(score4::landingRow(board, 2) == 4);
    board.place({4, 2}, Disc::Yellow);
    CHECK(score4::landingRow(board, 2) == 3);
}

TEST_CASE("2019 behaviour: a full column lands on the top spot again", "[rules][legacy]") {
    Board board;
    for (int row = 0; row < score4::rowCount; ++row) {
        board.place({row, 0}, Disc::Red);
    }
    CHECK(score4::landingRow(board, 0) == 0);
}

TEST_CASE("four across wins in every row", "[rules]") {
    for (int row = 0; row < score4::rowCount; ++row) {
        for (int column = 0; column + score4::lineLength <= score4::columnCount; ++column) {
            CAPTURE(row, column);
            const auto board =
                boardWith(Disc::Yellow, {{row, column}, {row, column + 1}, {row, column + 2}, {row, column + 3}});
            CHECK(score4::findLine(board) == Disc::Yellow);
        }
    }
}

TEST_CASE("four up and down wins in every column", "[rules]") {
    for (int column = 0; column < score4::columnCount; ++column) {
        for (int top = 0; top + score4::lineLength <= score4::rowCount; ++top) {
            CAPTURE(column, top);
            const auto board =
                boardWith(Disc::Red, {{top, column}, {top + 1, column}, {top + 2, column}, {top + 3, column}});
            CHECK(score4::findLine(board) == Disc::Red);
        }
    }
}

TEST_CASE("four on a diagonal going down to the right wins", "[rules]") {
    for (int row = 0; row + score4::lineLength <= score4::rowCount; ++row) {
        for (int column = 0; column + score4::lineLength <= score4::columnCount; ++column) {
            CAPTURE(row, column);
            const auto board = boardWith(
                Disc::Yellow, {{row, column}, {row + 1, column + 1}, {row + 2, column + 2}, {row + 3, column + 3}});
            CHECK(score4::findLine(board) == Disc::Yellow);
        }
    }
}

TEST_CASE("four on a diagonal going up to the right wins", "[rules]") {
    for (int row = score4::lineLength - 1; row < score4::rowCount; ++row) {
        for (int column = 0; column + score4::lineLength <= score4::columnCount; ++column) {
            CAPTURE(row, column);
            const auto board = boardWith(
                Disc::Red, {{row, column}, {row - 1, column + 1}, {row - 2, column + 2}, {row - 3, column + 3}});
            CHECK(score4::findLine(board) == Disc::Red);
        }
    }
}

TEST_CASE("a broken line on either diagonal is not a win", "[rules]") {
    CHECK_FALSE(score4::findLine(boardWith(Disc::Red, {{5, 0}, {4, 1}, {3, 2}, {1, 4}})).has_value());
    CHECK_FALSE(score4::findLine(boardWith(Disc::Red, {{2, 0}, {3, 1}, {4, 2}, {5, 4}})).has_value());
}

TEST_CASE("three in a line is not a win", "[rules]") {
    CHECK_FALSE(score4::findLine(boardWith(Disc::Red, {{5, 0}, {5, 1}, {5, 2}})).has_value());
    CHECK_FALSE(score4::findLine(boardWith(Disc::Red, {{5, 0}, {4, 0}, {3, 0}})).has_value());
}

TEST_CASE("two equal coins at the top of a column are read safely", "[rules]") {
    const auto board = boardWith(Disc::Yellow, {{0, 0}, {1, 0}});
    CHECK_FALSE(score4::findLine(board).has_value());
}

TEST_CASE("mixed colours do not make a line", "[rules]") {
    Board board;
    board.place({5, 0}, Disc::Red);
    board.place({5, 1}, Disc::Red);
    board.place({5, 2}, Disc::Yellow);
    board.place({5, 3}, Disc::Red);
    CHECK_FALSE(score4::findLine(board).has_value());
}

TEST_CASE("a board with every spot taken is full", "[rules]") {
    Board board;
    for (int row = 0; row < score4::rowCount; ++row) {
        for (int column = 0; column < score4::columnCount; ++column) {
            board.place({row, column}, (row + column) % 2 == 0 ? Disc::Red : Disc::Yellow);
        }
    }
    CHECK(board.isFull());
}

TEST_CASE("spots outside the board read as empty and cannot be filled", "[rules]") {
    Board board;
    board.place({-1, 0}, Disc::Red);
    board.place({0, score4::columnCount}, Disc::Red);
    CHECK(board.at({-1, 0}) == Cell::Empty);
    CHECK(board.at({0, score4::columnCount}) == Cell::Empty);
}
