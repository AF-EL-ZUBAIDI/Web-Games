import random

class MinesGame:
    def __init__(self, size, mines):
        self.size = size
        self.mines = mines
        self.board = [['' for _ in range(size)] for _ in range(size)]
        self.revealed = [[False for _ in range(size)] for _ in range(size)]
        self.place_mines()
        self.game_over = False
        self.gems_revealed = 0

    def place_mines(self):
        positions = random.sample(range(self.size * self.size), self.mines)
        for pos in positions:
            row, col = divmod(pos, self.size)
            self.board[row][col] = 'B'
        for row in range(self.size):
            for col in range(self.size):
                if self.board[row][col] != 'B':
                    self.board[row][col] = 'G'

    def reveal_cell(self, row, col):
        if self.board[row][col] == 'B':
            self.game_over = True
            return 'B'
        self.revealed[row][col] = True
        self.gems_revealed += 1
        return 'G'
