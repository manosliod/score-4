#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <cctype>
#include <ctype.h>
#define N 6
#define M 7

using namespace std;

class GameBoard{
	private:
		char circleColor;
		std::string contains;
	public:
		GameBoard(){
		}
		void setCircleColor(char circleColor){
			this -> circleColor = circleColor;
		}
		void setContains(std::string contains){
			this -> contains= contains;
		}
		char getCircleColor(){
			return circleColor;
		}
		std::string getContains(){
			return contains;
		}
};

void setPlayers(int &player1_age, int &player2_age, int &player_turn, std::string &player1_color, std::string &player2_color){
	int col;
	cout << "\n\nWelcome Player 1.\nGive me your age: ";
	cin >> player1_age;
	
	cout << "\n\nWelcome Player 2.\nGive me your age: ";
	cin >> player2_age;
	
	if(player1_age>player2_age){
		std::cout << "\nPlayer 2 starts cause its smaller.\n";
		
		do{
			std::cout << "Type 'R' for Red color, 'Y' for Yellow color coin: ";
			std::cin >> player2_color;
			player_turn = 2;
		}while( !(player2_color == "R") && !(player2_color == "Y"));
		
		do{
			std::cout << "\nPlayer 1.\nType 'R' for Red color, 'Y' for Yellow color coin: ";
			std::cin >> player1_color;
		}while( (!(player1_color == "R") && !(player1_color == "Y")) || (player1_color == player2_color) );
	}
	else if(player1_age == player2_age){
		std::cout << "\nPlayer 1 starts cause is first.\n";
		
		do{
			std::cout << "Type 'R' for Red color, 'Y' for Yellow color coin: ";
			std::cin >> player1_color;
			player_turn = 1;
		}while( !(player1_color == "R") && !(player1_color == "Y"));
		
		do{
			std::cout << "\nPlayer 2.\nType 'R' for Red color, 'Y' for Yellow color coin: ";
			std::cin >> player2_color;
		}while( (!(player2_color == "R") && !(player2_color == "Y")) || (player2_color == player1_color) );
	}
	else{
		std::cout << "\nPlayer 1 starts cause its smaller.\n";
		do{
			std::cout << "Type 'R' for Red color, 'Y' for Yellow color: ";
			std::cin >> player1_color;
			player_turn = 1;
		}while( !(player1_color == "R") && !(player1_color == "Y"));
		
		do{
			std::cout << "\nPlayer 2.\nType 'R' for Red color, 'Y' for Yellow color coin: ";
			std::cin >> player2_color;
		}while( (!(player2_color == "R") && !(player2_color == "Y")) || (player2_color == player1_color) );
	}
}

void Game(GameBoard** &Board, std::string &player1_color, std::string &player2_color,int &player_turn){
	system("cls");
	std::cout << "Score 4\n\n";
	
	if(player1_color == "R"){
		std::cout << "Player 1 Color: Red\n\n";
	}else{
		std::cout << "Player 1 Color: Yellow\n\n";
	}
	if(player2_color == "R"){
		std::cout << "Player 2 Color: Red\n\n";
	}else{
		std::cout << "Player 2 Color: Yellow\n\n";
	}
	
	for (int i=0; i<M; i++){
		printf("%d ", i+1);
	}
	for (int i=0; i<N; i++){
		printf("\n");
		for(int j=0; j<M; j++){
			std::cout << Board[i][j].getContains();
		}
	}
}

int coinDrop(GameBoard** &Board, std::string &player1_color, std::string &player2_color, int &player_turn){
	int k=0;
	int col;
	do{
		if(player_turn == 1){
			std::cout << "\n\nPlayer 1\nPick the column you want to drop your coin (Between 1-7): ";
			std::cin >> col;
		}else{
			std::cout << "\n\nPlayer 2\nPick the column you want to drop your coin (Between 1-7): ";
			std::cin >> col;
		}
	}while(col < 1 || col > 7);
	col = col -1;
	
	if( !(Board[N-1][col].getContains() == "R|") && !(Board[N-1][col].getContains() == "Y|") ){
		
		if(player_turn == 1){
			Board[N-1][col].setContains(player1_color + "|");
			player_turn = 2;
		}else{
			Board[N-1][col].setContains(player2_color + "|");
			player_turn = 1;
		}
		Game(Board, player1_color, player2_color, player_turn);
				
	}else if( !(Board[N-2][col].getContains() == "R|") && !(Board[N-2][col].getContains() == "Y|") ){
		if(player_turn == 1){
			Board[N-2][col].setContains(player1_color + "|");
			player_turn = 2;
		}else{
			Board[N-2][col].setContains(player2_color + "|");
			player_turn = 1;
		}
		Game(Board, player1_color, player2_color, player_turn);
				
	}else if( !(Board[N-3][col].getContains() == "R|") && !(Board[N-3][col].getContains() == "Y|") ){
				
		if(player_turn == 1){
			Board[N-3][col].setContains(player1_color + "|");
			player_turn = 2;
		}else{
			Board[N-3][col].setContains(player2_color + "|");
			player_turn = 1;
		}
		Game(Board, player1_color, player2_color, player_turn);
				
	}else if( !(Board[N-4][col].getContains() == "R|") && !(Board[N-4][col].getContains() == "Y|") ){
				
		if(player_turn == 1){
			Board[N-4][col].setContains(player1_color + "|");
			player_turn = 2;
		}else{
			Board[N-4][col].setContains(player2_color + "|");
			player_turn = 1;
		}
		Game(Board, player1_color, player2_color, player_turn);
				
	}else if( !(Board[N-5][col].getContains() == "R|") && !(Board[N-5][col].getContains() == "Y|") ){
				
		if(player_turn == 1){
			Board[N-5][col].setContains(player1_color + "|");
			player_turn = 2;
		}else{
			Board[N-5][col].setContains(player2_color + "|");
			player_turn = 1;
		}
		Game(Board, player1_color, player2_color, player_turn);
				
	}else {
				
		if(player_turn == 1){
			Board[N-6][col].setContains(player1_color + "|");
			player_turn = 2;
		}else{
			Board[N-6][col].setContains(player2_color + "|");
			player_turn = 1;
		}
		Game(Board, player1_color, player2_color, player_turn);
	}
	
	for(int i=N-1; i>0; i--){
		for(int j=0; j<M-3; j++){
			if( (Board[i][j].getContains() == "R|" && Board[i][j+1].getContains() == "R|" && Board[i][j+2].getContains() == "R|" && Board[i][j+3].getContains() == "R|") ){
				if(player1_color == "R"){
					std::cout << "\n\nPlayer 1, Wins!\n";
				}else{
					std::cout << "\n\nPlayer 2, Wins!\n";
				}
			return 1;
			}
		
			if( (Board[i][j].getContains() == "Y|" && Board[i][j+1].getContains() == "Y|" && Board[i][j+2].getContains() == "Y|" && Board[i][j+3].getContains() == "Y|")){
					if(player1_color == "Y"){
						std::cout << "\n\nPlayer 1, Wins!\n";
					}else{
						std::cout << "\n\nPlayer 2, Wins!\n";
					}
				return 1;
			}
		}
	}
	
	for(int i=0; i<M; i++){
		for(int j=N-1; j>0; j--){
			if( (Board[j][i].getContains() == "R|" && Board[j-1][i].getContains() == "R|" && Board[j-2][i].getContains() == "R|" && Board[j-3][i].getContains() == "R|")){
				if(player1_color == "R"){
					std::cout << "\n\nPlayer 1, Wins!\n";
				}else{
					std::cout << "\n\nPlayer 2, Wins!\n";
				}
			return 1;
			}
			
			if( (Board[j][i].getContains() == "Y|" && Board[j-1][i].getContains() == "Y|" && Board[j-2][i].getContains() == "Y|" && Board[j-3][i].getContains() == "Y|")){
				if(player1_color == "Y"){
					std::cout << "\n\nPlayer 1, Wins!\n";
				}else{
					std::cout << "\n\nPlayer 2, Wins!\n";
				}
			return 1;
			}
		}
	}
	
	
	if( (Board[5][6].getContains() == "R|" && Board[4][5].getContains() == "R|" && Board[3][4].getContains() == "R|" && Board[2][3].getContains() == "R|") ||
		(Board[5][5].getContains() == "R|" && Board[4][4].getContains() == "R|" && Board[3][3].getContains() == "R|" && Board[2][2].getContains() == "R|") ||
		(Board[5][4].getContains() == "R|" && Board[4][3].getContains() == "R|" && Board[3][2].getContains() == "R|" && Board[2][1].getContains() == "R|") ||
		(Board[5][3].getContains() == "R|" && Board[4][2].getContains() == "R|" && Board[3][1].getContains() == "R|" && Board[2][0].getContains() == "R|") ||
		(Board[4][6].getContains() == "R|" && Board[3][5].getContains() == "R|" && Board[2][4].getContains() == "R|" && Board[1][3].getContains() == "R|") ||
		(Board[4][5].getContains() == "R|" && Board[3][4].getContains() == "R|" && Board[2][3].getContains() == "R|" && Board[1][2].getContains() == "R|") ||
		(Board[4][4].getContains() == "R|" && Board[3][3].getContains() == "R|" && Board[2][2].getContains() == "R|" && Board[1][1].getContains() == "R|") ||
		(Board[4][3].getContains() == "R|" && Board[3][2].getContains() == "R|" && Board[2][1].getContains() == "R|" && Board[1][0].getContains() == "R|") ||
		(Board[3][6].getContains() == "R|" && Board[2][5].getContains() == "R|" && Board[1][4].getContains() == "R|" && Board[0][3].getContains() == "R|") ||
		(Board[3][5].getContains() == "R|" && Board[2][4].getContains() == "R|" && Board[1][3].getContains() == "R|" && Board[0][2].getContains() == "R|") ||
		(Board[3][4].getContains() == "R|" && Board[2][3].getContains() == "R|" && Board[1][2].getContains() == "R|" && Board[0][1].getContains() == "R|") ||
		(Board[3][3].getContains() == "R|" && Board[2][2].getContains() == "R|" && Board[1][1].getContains() == "R|" && Board[0][0].getContains() == "R|") ){
			if(player1_color == "R"){
				std::cout << "\n\nPlayer 1, Wins!\n";
			}else{
				std::cout << "\n\nPlayer 2, Wins!\n";
			}
		return 1;
	}
	if( (Board[5][6].getContains() == "Y|" && Board[4][5].getContains() == "Y|" && Board[3][4].getContains() == "Y|" && Board[2][3].getContains() == "Y|") ||
		(Board[5][5].getContains() == "Y|" && Board[4][4].getContains() == "Y|" && Board[3][3].getContains() == "Y|" && Board[2][2].getContains() == "Y|") ||
		(Board[5][4].getContains() == "Y|" && Board[4][3].getContains() == "Y|" && Board[3][2].getContains() == "Y|" && Board[2][1].getContains() == "Y|") ||
		(Board[5][3].getContains() == "Y|" && Board[4][2].getContains() == "Y|" && Board[3][1].getContains() == "Y|" && Board[2][0].getContains() == "Y|") ||
		(Board[4][6].getContains() == "Y|" && Board[3][5].getContains() == "Y|" && Board[2][4].getContains() == "Y|" && Board[1][3].getContains() == "Y|") ||
		(Board[4][5].getContains() == "Y|" && Board[3][4].getContains() == "Y|" && Board[2][3].getContains() == "Y|" && Board[1][2].getContains() == "Y|") ||
		(Board[4][4].getContains() == "Y|" && Board[3][3].getContains() == "Y|" && Board[2][2].getContains() == "Y|" && Board[1][1].getContains() == "Y|") ||
		(Board[4][3].getContains() == "Y|" && Board[3][2].getContains() == "Y|" && Board[2][1].getContains() == "Y|" && Board[1][0].getContains() == "Y|") ||
		(Board[3][6].getContains() == "Y|" && Board[2][5].getContains() == "Y|" && Board[1][4].getContains() == "Y|" && Board[0][3].getContains() == "Y|") ||
		(Board[3][5].getContains() == "Y|" && Board[2][4].getContains() == "Y|" && Board[1][3].getContains() == "Y|" && Board[0][2].getContains() == "Y|") ||
		(Board[3][4].getContains() == "Y|" && Board[2][3].getContains() == "Y|" && Board[1][2].getContains() == "Y|" && Board[0][1].getContains() == "Y|") ||
		(Board[3][3].getContains() == "Y|" && Board[2][2].getContains() == "Y|" && Board[1][1].getContains() == "Y|" && Board[0][0].getContains() == "Y|") ){
			if(player1_color == "Y"){
				std::cout << "\n\nPlayer 1, Wins!\n";
			}else{
				std::cout << "\n\nPlayer 2, Wins!\n";
			}
		return 1;
	}
	
	for(int i = 0; i<N; i++){
		for(int j = 0; j<M; j++){
			if(	Board[i][j].getContains() == "R|" || Board[i][j].getContains() == "Y|")
				k = k + 1;
				if(k==42){
					std::cout << "\n\nTie.";
					return 1;
			}
		}
	}
	return 0;
}

int main(){
	int player1_age, player2_age, player_turn, end;
	std::string player1_color, player2_color;
	
	GameBoard **Board = new GameBoard*[N];
	std::cout << "Welcome to the game known as...\n\n";
	std::cout << "Score 4\n\n";
	for(int i=0; i<N; i++){
		Board[i] = new GameBoard[M];
	}
	
	for (int i=0; i<N; i++){
		for(int j=0; j<M; j++){
			Board[i][j].setContains("_|");
		}
	}
	for (int i=0; i<M; i++){
		printf("%d ", i+1);
	}
	for (int i=0; i<N; i++){
		printf("\n");
		for(int j=0; j<M; j++){
			std::cout << Board[i][j].getContains();
		}
	}
	
	setPlayers(player1_age, player2_age, player_turn, player1_color, player2_color);
	
	Game(Board, player1_color, player2_color, player_turn);
	
	while(end == 0){
		end = coinDrop(Board, player1_color, player2_color, player_turn);
	}
}

