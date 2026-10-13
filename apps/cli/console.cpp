#include "console.hpp"

#include "board_text.hpp"

#include <istream>
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

int askAge(std::istream &input, std::ostream &output, Player player) {
    output << "\n\nWelcome Player " << playerNumber(player) << ".\nGive me your age: ";
    int age = 0;
    input >> age;
    return age;
}

}

Console::Console(std::istream &input, std::ostream &output, std::function<void()> clearScreen)
    : input_(input), output_(output), clearScreen_(std::move(clearScreen)) {}

void Console::run() {
    output_.get() << "Welcome to the game known as...\n\n" << title << "\n\n";
    output_.get() << boardText(Board{});
    auto game = setUp();
    redraw(game);
    auto outcome = Outcome{InProgress{}};
    while (std::holds_alternative<InProgress>(outcome)) {
        outcome = playTurn(game);
    }
    announce(outcome);
}

Game Console::setUp() {
    const int playerOneAge = askAge(input_.get(), output_.get(), Player::One);
    const int playerTwoAge = askAge(input_.get(), output_.get(), Player::Two);
    const auto starter = startingPlayer(playerOneAge, playerTwoAge);
    const auto second = otherPlayer(starter);
    if (starter == Player::Two) {
        output_.get() << "\nPlayer 2 starts cause its smaller.\n";
    } else if (playerOneAge == playerTwoAge) {
        output_.get() << "\nPlayer 1 starts cause is first.\n";
    } else {
        output_.get() << "\nPlayer 1 starts cause its smaller.\n";
    }
    const bool playerOneIsYounger = starter == Player::One && playerOneAge != playerTwoAge;
    const auto starterDisc = askDisc(playerOneIsYounger ? youngerPlayerOneColourPrompt : colourPrompt);
    const auto secondDisc = askOtherDisc(secondColourPrompt(second), starterDisc);
    return starter == Player::One ? Game{starterDisc, secondDisc, starter} : Game{secondDisc, starterDisc, starter};
}

Disc Console::askDisc(std::string_view prompt) {
    while (true) {
        output_.get() << prompt;
        std::string answer;
        input_.get() >> answer;
        if (const auto disc = parseDisc(answer)) {
            return *disc;
        }
    }
}

Disc Console::askOtherDisc(std::string_view prompt, Disc taken) {
    while (true) {
        output_.get() << prompt;
        std::string answer;
        input_.get() >> answer;
        if (const auto disc = parseOtherDisc(answer, taken)) {
            return *disc;
        }
    }
}

Outcome Console::playTurn(Game &game) {
    int column = 0;
    while (true) {
        output_.get() << "\n\nPlayer " << playerNumber(game.turn())
                      << "\nPick the column you want to drop your coin (Between " << firstColumnNumber << "-"
                      << lastColumnNumber << "): ";
        input_.get() >> column;
        if (const auto outcome = game.drop(column)) {
            redraw(game);
            return *outcome;
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
