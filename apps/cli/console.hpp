#pragma once

#include "score4/game.hpp"

#include <functional>
#include <iosfwd>
#include <string_view>

namespace score4::cli {

class Console {
  public:
    Console(std::istream &input, std::ostream &output, std::function<void()> clearScreen);

    void run();

  private:
    [[nodiscard]] Game setUp();
    [[nodiscard]] Disc askDisc(std::string_view prompt);
    [[nodiscard]] Disc askOtherDisc(std::string_view prompt, Disc taken);
    [[nodiscard]] Outcome playTurn(Game &game);
    void redraw(const Game &game);
    void announce(const Outcome &outcome);

    std::reference_wrapper<std::istream> input_;
    std::reference_wrapper<std::ostream> output_;
    std::function<void()> clearScreen_;
};

}
