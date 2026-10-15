#pragma once

#include "score4/game.hpp"

#include <functional>
#include <iosfwd>
#include <optional>
#include <string_view>

namespace score4::cli {

class Console {
  public:
    Console(std::istream &input, std::ostream &output, std::function<void()> clearScreen);

    void run();

  private:
    [[nodiscard]] std::optional<Game> setUp();
    [[nodiscard]] std::optional<int> askNumber(std::string_view prompt);
    [[nodiscard]] std::optional<int> askAge(Player player);
    [[nodiscard]] std::optional<Disc> askDisc(std::string_view prompt, std::optional<Disc> taken = std::nullopt);
    [[nodiscard]] std::optional<Outcome> playTurn(Game &game);
    void redraw(const Game &game);
    void announce(const Outcome &outcome);

    std::reference_wrapper<std::istream> input_;
    std::reference_wrapper<std::ostream> output_;
    std::function<void()> clearScreen_;
};

}
