#include "board_text.hpp"

namespace score4::cli {

namespace {

std::string cellText(Cell cell) {
    switch (cell) {
    case Cell::Red:
        return "R|";
    case Cell::Yellow:
        return "Y|";
    case Cell::Empty:
        break;
    }
    return "_|";
}

}

std::string boardText(const Board &board) {
    std::string text;
    for (int column = 0; column < columnCount; ++column) {
        text += std::to_string(column + 1) + " ";
    }
    for (int row = 0; row < rowCount; ++row) {
        text += "\n";
        for (int column = 0; column < columnCount; ++column) {
            text += cellText(board.at({.row = row, .column = column}));
        }
    }
    return text;
}

std::string colourName(Disc disc) { return disc == Disc::Red ? "Red" : "Yellow"; }

}
