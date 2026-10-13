#pragma once

#include "score4/board.hpp"

#include <cstdint>
#include <expected>
#include <optional>
#include <string_view>
#include <variant>

namespace score4 {

enum class Player : std::uint8_t { One, Two };

struct InProgress {};

struct Won {
    Player winner;
};

struct Tie {};

using Outcome = std::variant<InProgress, Won, Tie>;

enum class MoveError : std::uint8_t { ColumnOutOfRange };

inline constexpr int firstColumnNumber = 1;
inline constexpr int lastColumnNumber = columnCount;

[[nodiscard]] Player startingPlayer(int playerOneAge, int playerTwoAge) noexcept;

[[nodiscard]] std::optional<Disc> parseDisc(std::string_view text) noexcept;

[[nodiscard]] std::optional<Disc> parseOtherDisc(std::string_view text, Disc taken) noexcept;

[[nodiscard]] constexpr Player otherPlayer(Player player) noexcept {
    return player == Player::One ? Player::Two : Player::One;
}

class Game {
  public:
    Game(Disc playerOneDisc, Disc playerTwoDisc, Player starter) noexcept;

    [[nodiscard]] std::expected<Outcome, MoveError> drop(int columnNumber) noexcept;

    [[nodiscard]] const Board &board() const noexcept { return board_; }
    [[nodiscard]] Player turn() const noexcept { return turn_; }
    [[nodiscard]] Disc discOf(Player player) const noexcept;

  private:
    [[nodiscard]] Player ownerOf(Disc disc) const noexcept;

    Board board_;
    Disc playerOneDisc_;
    Disc playerTwoDisc_;
    Player turn_;
};

}
