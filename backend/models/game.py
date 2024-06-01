import random

class MinesGame:
    def __init__(self, size=5, mines=5):
        self.size = size
        self.mines = mines
        self.board = [['' for _ in range(size)] for _ in range(size)]
        self.mine_positions = set()
        self.generate_mines()

    def generate_mines(self):
        while len(self.mine_positions) < self.mines:
            row = random.randint(0, self.size - 1)
            col = random.randint(0, self.size - 1)
            self.mine_positions.add((row, col))
            self.board[row][col] = 'M'

    def check_tile(self, row, col):
        if (row, col) in self.mine_positions:
            return 'mine'
        else:
            self.board[row][col] = 'C'
            return 'clear'

    def get_board(self):
        return self.board
