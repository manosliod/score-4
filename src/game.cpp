#include "score4/game.hpp"

#include "score4/rules.hpp"

namespace score4 {

Player startingPlayer(int playerOneAge, int playerTwoAge) noexcept {
    return playerOneAge > playerTwoAge ? Player::Two : Player::One;
}

std::optional<Disc> parseDisc(std::string_view text) noexcept {
    if (text == "R") {
        return Disc::Red;
    }
    if (text == "Y") {
        return Disc::Yellow;
    }
    return std::nullopt;
}

std::optional<Disc> parseOtherDisc(std::string_view text, Disc taken) noexcept {
    const auto disc = parseDisc(text);
    if (disc == taken) {
        return std::nullopt;
    }
    return disc;
}

Game::Game(Disc playerOneDisc, Disc playerTwoDisc, Player starter) noexcept
    : playerOneDisc_(playerOneDisc), playerTwoDisc_(playerTwoDisc), turn_(starter) {}

Disc Game::discOf(Player player) const noexcept { return player == Player::One ? playerOneDisc_ : playerTwoDisc_; }

Player Game::ownerOf(Disc disc) const noexcept { return disc == playerOneDisc_ ? Player::One : Player::Two; }

std::expected<Outcome, MoveError> Game::drop(int columnNumber) noexcept {
    if (columnNumber < firstColumnNumber || columnNumber > lastColumnNumber) {
        return std::unexpected(MoveError::ColumnOutOfRange);
    }
    const int column = columnNumber - firstColumnNumber;
    board_.place({.row = landingRow(board_, column), .column = column}, discOf(turn_));
    turn_ = otherPlayer(turn_);
    if (const auto disc = findLine(board_)) {
        return Won{ownerOf(*disc)};
    }
    if (board_.isFull()) {
        return Tie{};
    }
    return InProgress{};
}

}
