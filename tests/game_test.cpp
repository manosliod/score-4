#include "score4/game.hpp"

#include <catch2/catch_test_macros.hpp>

#include <array>
#include <initializer_list>
#include <variant>

using score4::Cell;
using score4::Disc;
using score4::Game;
using score4::MoveError;
using score4::Outcome;
using score4::Player;

namespace {

Outcome playAll(Game &game, std::initializer_list<int> columns) {
    Outcome outcome = score4::InProgress{};
    for (const int column : columns) {
        const auto result = game.drop(column);
        REQUIRE(result.has_value());
        outcome = *result;
    }
    return outcome;
}

}

TEST_CASE("the younger player starts, the same age means Player 1", "[game]") {
    CHECK(score4::startingPlayer(20, 30) == Player::One);
    CHECK(score4::startingPlayer(30, 20) == Player::Two);
    CHECK(score4::startingPlayer(25, 25) == Player::One);
    CHECK(score4::startingPlayer(0, -3) == Player::Two);
}

TEST_CASE("a colour is R or Y in either case", "[game]") {
    CHECK(score4::parseDisc("R") == Disc::Red);
    CHECK(score4::parseDisc("Y") == Disc::Yellow);
    CHECK(score4::parseDisc("r") == Disc::Red);
    CHECK(score4::parseDisc("y") == Disc::Yellow);
    CHECK_FALSE(score4::parseDisc("G").has_value());
    CHECK_FALSE(score4::parseDisc("").has_value());
    CHECK_FALSE(score4::parseDisc("RY").has_value());
}

TEST_CASE("the second player cannot take the first player's colour", "[game]") {
    CHECK_FALSE(score4::parseOtherDisc("R", Disc::Red).has_value());
    CHECK_FALSE(score4::parseOtherDisc("r", Disc::Red).has_value());
    CHECK(score4::parseOtherDisc("Y", Disc::Red) == Disc::Yellow);
    CHECK_FALSE(score4::parseOtherDisc("x", Disc::Red).has_value());
}

TEST_CASE("columns outside 1 to 7 are refused and the turn stays", "[game]") {
    Game game(Disc::Red, Disc::Yellow, Player::One);
    for (const int column : {0, 8, -3}) {
        CAPTURE(column);
        const auto result = game.drop(column);
        REQUIRE_FALSE(result.has_value());
        CHECK(result.error() == MoveError::ColumnOutOfRange);
        CHECK(game.turn() == Player::One);
    }
}

TEST_CASE("a move drops the player's coin and passes the turn", "[game]") {
    Game game(Disc::Yellow, Disc::Red, Player::Two);
    const auto result = game.drop(4);
    REQUIRE(result.has_value());
    CHECK(std::holds_alternative<score4::InProgress>(*result));
    CHECK(game.board().at({5, 3}) == Cell::Red);
    CHECK(game.turn() == Player::One);
}

TEST_CASE("the winner is the player who owns the winning colour", "[game]") {
    Game game(Disc::Yellow, Disc::Red, Player::Two);
    const auto outcome = playAll(game, {1, 2, 1, 2, 1, 2, 1});
    REQUIRE(std::holds_alternative<score4::Won>(outcome));
    CHECK(std::get<score4::Won>(outcome).winner == Player::Two);
    CHECK(std::get<score4::Won>(outcome).line ==
          std::array<score4::Position, score4::lineLength>{{{5, 0}, {4, 0}, {3, 0}, {2, 0}}});
}

TEST_CASE("a full board with no line is a tie", "[game]") {
    Game game(Disc::Red, Disc::Yellow, Player::One);
    const auto outcome = playAll(game, {1, 2, 1, 2, 1, 1, 3, 1, 3, 1, 4, 2, 2, 2, 7, 2, 7, 4, 4, 4, 4,
                                        3, 4, 5, 5, 3, 5, 3, 3, 5, 5, 6, 5, 7, 6, 6, 7, 7, 6, 7, 6, 6});
    CHECK(std::holds_alternative<score4::Tie>(outcome));
}

TEST_CASE("a full column is refused and the turn stays", "[game]") {
    Game game(Disc::Red, Disc::Yellow, Player::One);
    static_cast<void>(playAll(game, {7, 1, 1, 1, 1, 1, 1}));
    REQUIRE(game.board().at({0, 0}) == Cell::Red);
    REQUIRE(game.turn() == Player::Two);
    const auto result = game.drop(1);
    REQUIRE_FALSE(result.has_value());
    CHECK(result.error() == MoveError::ColumnFull);
    CHECK(game.board().at({0, 0}) == Cell::Red);
    CHECK(game.turn() == Player::Two);
}

TEST_CASE("no move is taken after a win or a tie", "[game]") {
    Game won(Disc::Red, Disc::Yellow, Player::One);
    static_cast<void>(playAll(won, {1, 2, 1, 2, 1, 2, 1}));
    const auto afterWin = won.drop(3);
    REQUIRE_FALSE(afterWin.has_value());
    CHECK(afterWin.error() == MoveError::GameOver);
    CHECK(won.board().at({5, 2}) == Cell::Empty);

    Game tied(Disc::Red, Disc::Yellow, Player::One);
    static_cast<void>(playAll(tied, {1, 2, 1, 2, 1, 1, 3, 1, 3, 1, 4, 2, 2, 2, 7, 2, 7, 4, 4, 4, 4,
                                     3, 4, 5, 5, 3, 5, 3, 3, 5, 5, 6, 5, 7, 6, 6, 7, 7, 6, 7, 6, 6}));
    const auto afterTie = tied.drop(1);
    REQUIRE_FALSE(afterTie.has_value());
    CHECK(afterTie.error() == MoveError::GameOver);
}
