import random as rd

class TicTacToeGame:
    def __init__(self, difficulty, player_symbol):
        self.board = ['' for _ in range(9)]
        self.difficulty = difficulty
        self.player_symbol = player_symbol
        self.computer_symbol = 'O' if player_symbol == 'X' else 'X'
        self.game_over = False
        self.winner = None

    def make_move(self, index, player):
        if self.board[index] == '':
            self.board[index] = player
            return True
        return False

    def check_winner(self, update_state=True):
        winning_combinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # columns
            [0, 4, 8], [2, 4, 6]             # diagonals
        ]
        for combo in winning_combinations:
            if self.board[combo[0]] == self.board[combo[1]] == self.board[combo[2]] != '':
                if update_state:
                    self.game_over = True
                    self.winner = self.board[combo[0]]
                return True
        if '' not in self.board:
            if update_state:
                self.game_over = True
                self.winner = 'draw'
            return True
        return False

    def computer_move(self):
        available_moves = [i for i, cell in enumerate(self.board) if cell == '']

        if self.difficulty == 'easy':
            return rd.choice(available_moves)

        elif self.difficulty == 'hard':
            # Check for immediate winning move
            for move in available_moves:
                self.board[move] = self.computer_symbol
                if self.check_winner(update_state=False):
                    self.board[move] = ''
                    return move
                self.board[move] = ''

            # Block the opponent's immediate winning move
            for move in available_moves:
                self.board[move] = self.player_symbol
                if self.check_winner(update_state=False):
                    self.board[move] = ''
                    return move
                self.board[move] = ''

            t = rd.randint(1, 10)
            if t <= 5:  # 50% chance for a random move
                return rd.choice(available_moves)
            else:
                # 50% chance for the best move using minimax
                best_score = float('-inf')
                best_move = None
                for i in available_moves:
                    self.board[i] = self.computer_symbol
                    score = self.minimax(0, False)
                    self.board[i] = ''
                    if score > best_score:
                        best_score = score
                        best_move = i
                return best_move

    def minimax(self, depth, is_maximizing):
        if self.check_winner(update_state=False):
            if self.winner == self.computer_symbol:
                return 1
            elif self.winner == self.player_symbol:
                return -1
            else:
                return 0

        if is_maximizing:
            best_score = float('-inf')
            for i in range(9):
                if self.board[i] == '':
                    self.board[i] = self.computer_symbol
                    score = self.minimax(depth + 1, False)
                    self.board[i] = ''
                    best_score = max(score, best_score)
            return best_score
        else:
            best_score = float('inf')
            for i in range(9):
                if self.board[i] == '':
                    self.board[i] = self.player_symbol
                    score = self.minimax(depth + 1, True)
                    self.board[i] = ''
                    best_score = min(score, best_score)
            return best_score
