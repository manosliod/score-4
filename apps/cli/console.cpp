#include "console.hpp"

#include "board_text.hpp"

#include <istream>
#include <limits>
#include <ostream>
#include <string>
#include <utility>

namespace score4::cli {

namespace {

constexpr std::string_view title = "Score 4";
constexpr std::string_view colourPrompt = "Type 'R' for Red color, 'Y' for Yellow color coin: ";
constexpr std::string_view youngerPlayerOneColourPrompt = "Type 'R' for Red color, 'Y' for Yellow color: ";

std::string_view playerNumber(Player player) { return player == Player::One ? "1" : "2"; }

std::string secondColourPrompt(Player player) {
    return "\nPlayer " + std::string(playerNumber(player)) + ".\n" + std::string(colourPrompt);
}

std::string columnPrompt(Player player) {
    return "\n\nPlayer " + std::string(playerNumber(player)) +
           "\nPick the column you want to drop your coin (Between " + std::to_string(firstColumnNumber) + "-" +
           std::to_string(lastColumnNumber) + "): ";
}

}

Console::Console(std::istream &input, std::ostream &output, std::function<void()> clearScreen)
    : input_(input), output_(output), clearScreen_(std::move(clearScreen)) {}

void Console::run() {
    output_.get() << "Welcome to the game known as...\n\n" << title << "\n\n";
    output_.get() << boardText(Board{});
    auto game = setUp();
    if (!game) {
        return;
    }
    redraw(*game);
    auto outcome = Outcome{InProgress{}};
    while (std::holds_alternative<InProgress>(outcome)) {
        const auto next = playTurn(*game);
        if (!next) {
            return;
        }
        outcome = *next;
    }
    announce(outcome);
}

std::optional<Game> Console::setUp() {
    const auto playerOneAge = askAge(Player::One);
    if (!playerOneAge) {
        return std::nullopt;
    }
    const auto playerTwoAge = askAge(Player::Two);
    if (!playerTwoAge) {
        return std::nullopt;
    }
    const auto starter = startingPlayer(*playerOneAge, *playerTwoAge);
    const auto second = otherPlayer(starter);
    if (starter == Player::Two) {
        output_.get() << "\nPlayer 2 starts cause its smaller.\n";
    } else if (*playerOneAge == *playerTwoAge) {
        output_.get() << "\nPlayer 1 starts cause is first.\n";
    } else {
        output_.get() << "\nPlayer 1 starts cause its smaller.\n";
    }
    const bool playerOneIsYounger = starter == Player::One && *playerOneAge != *playerTwoAge;
    const auto starterDisc = askDisc(playerOneIsYounger ? youngerPlayerOneColourPrompt : colourPrompt);
    if (!starterDisc) {
        return std::nullopt;
    }
    const auto secondDisc = askDisc(secondColourPrompt(second), *starterDisc);
    if (!secondDisc) {
        return std::nullopt;
    }
    return starter == Player::One ? Game{*starterDisc, *secondDisc, starter} : Game{*secondDisc, *starterDisc, starter};
}

std::optional<int> Console::askNumber(std::string_view prompt) {
    while (true) {
        output_.get() << prompt;
        int number = 0;
        if (input_.get() >> number) {
            return number;
        }
        if (input_.get().eof()) {
            return std::nullopt;
        }
        input_.get().clear();
        input_.get().ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }
}

std::optional<int> Console::askAge(Player player) {
    output_.get() << "\n\nWelcome Player " << playerNumber(player) << ".\n";
    return askNumber("Give me your age: ");
}

std::optional<Disc> Console::askDisc(std::string_view prompt, std::optional<Disc> taken) {
    while (true) {
        output_.get() << prompt;
        std::string answer;
        if (!(input_.get() >> answer)) {
            return std::nullopt;
        }
        if (const auto disc = taken ? parseOtherDisc(answer, *taken) : parseDisc(answer)) {
            return disc;
        }
    }
}

std::optional<Outcome> Console::playTurn(Game &game) {
    while (true) {
        const auto column = askNumber(columnPrompt(game.turn()));
        if (!column) {
            return std::nullopt;
        }
        const auto outcome = game.drop(*column);
        if (outcome) {
            redraw(game);
            return *outcome;
        }
        if (outcome.error() == MoveError::ColumnFull) {
            output_.get() << "\n\nColumn " << *column << " is full. Pick another one.";
        }
    }
}

void Console::redraw(const Game &game) {
    clearScreen_();
    output_.get() << title << "\n\n";
    output_.get() << "Player 1 Color: " << colourName(game.discOf(Player::One)) << "\n\n";
    output_.get() << "Player 2 Color: " << colourName(game.discOf(Player::Two)) << "\n\n";
    output_.get() << boardText(game.board());
}

void Console::announce(const Outcome &outcome) {
    if (const auto *won = std::get_if<Won>(&outcome)) {
        output_.get() << "\n\nPlayer " << playerNumber(won->winner) << ", Wins!\n";
    } else if (std::holds_alternative<Tie>(outcome)) {
        output_.get() << "\n\nTie.";
    }
    output_.get().flush();
}

}
