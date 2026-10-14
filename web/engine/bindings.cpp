#include "score4/board.hpp"
#include "score4/game.hpp"

#include <emscripten/bind.h>

#include <array>
#include <cstdint>
#include <optional>
#include <variant>

namespace {

using score4::Cell;
using score4::Disc;
using score4::Game;
using score4::Player;
using score4::Position;
using WinningLine = std::array<Position, score4::lineLength>;

enum class MoveResult : std::uint8_t { Playing, Won, Tie, ColumnFull, ColumnOutOfRange };

class Match {
  public:
    Match(Disc playerOneDisc, Disc playerTwoDisc, Player starter) : game_(playerOneDisc, playerTwoDisc, starter) {}

    MoveResult drop(int columnNumber) {
        const auto result = game_.drop(columnNumber);
        if (!result) {
            return result.error() == score4::MoveError::ColumnFull ? MoveResult::ColumnFull
                                                                   : MoveResult::ColumnOutOfRange;
        }
        if (const auto *won = std::get_if<score4::Won>(&*result)) {
            winner_ = won->winner;
            winningLine_ = won->line;
            return MoveResult::Won;
        }
        return std::holds_alternative<score4::Tie>(*result) ? MoveResult::Tie : MoveResult::Playing;
    }

    [[nodiscard]] Cell cellAt(int row, int column) const { return game_.board().at({.row = row, .column = column}); }
    [[nodiscard]] Player turn() const { return game_.turn(); }
    [[nodiscard]] Disc discOf(Player player) const { return game_.discOf(player); }
    [[nodiscard]] std::optional<Player> winner() const { return winner_; }
    [[nodiscard]] std::optional<WinningLine> winningLine() const { return winningLine_; }

  private:
    Game game_;
    std::optional<Player> winner_;
    std::optional<WinningLine> winningLine_;
};

}

EMSCRIPTEN_BINDINGS(score4) {
    namespace em = emscripten;

    em::constant("rowCount", score4::rowCount);
    em::constant("columnCount", score4::columnCount);

    em::enum_<Disc>("Disc").value("Red", Disc::Red).value("Yellow", Disc::Yellow);
    em::enum_<Cell>("Cell").value("Empty", Cell::Empty).value("Red", Cell::Red).value("Yellow", Cell::Yellow);
    em::enum_<Player>("Player").value("One", Player::One).value("Two", Player::Two);
    em::enum_<MoveResult>("MoveResult")
        .value("Playing", MoveResult::Playing)
        .value("Won", MoveResult::Won)
        .value("Tie", MoveResult::Tie)
        .value("ColumnFull", MoveResult::ColumnFull)
        .value("ColumnOutOfRange", MoveResult::ColumnOutOfRange);

    em::value_object<Position>("Position").field("row", &Position::row).field("column", &Position::column);
    em::value_array<WinningLine>("WinningLine")
        .element(em::index<0>())
        .element(em::index<1>())
        .element(em::index<2>())
        .element(em::index<3>());
    em::register_optional<Player>();
    em::register_optional<WinningLine>();

    em::function("startingPlayer", &score4::startingPlayer);

    em::class_<Match>("Match")
        .constructor<Disc, Disc, Player>()
        .function("drop", &Match::drop)
        .function("cellAt", &Match::cellAt)
        .function("turn", &Match::turn)
        .function("discOf", &Match::discOf)
        .function("winner", &Match::winner)
        .function("winningLine", &Match::winningLine);
}
