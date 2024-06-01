from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__, static_folder='../frontend/dist/frontend')
CORS(app)

# Simulating a simple 'database' structure for user balances
user_balances = {
    "USD": {"balance": 100000, "max_limit": 100000000},
    "EUR": {"balance": 100000, "max_limit": 100000000},
    "BTC": {"balance": 100, "max_limit": 21000000},
    "ETH": {"balance": 100, "max_limit": 21000000}
}

games = {}

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

# Define the currencies data
@app.route('/currencies', methods=['GET'])
def get_currencies():
    currencies = [
        {'label': 'Dollar', 'code': 'USD', 'icon': 'pi pi-dollar', 'max': 100000000, 'amounts': [100, 10000, 100000, 1000000]},
        {'label': 'Euro', 'code': 'EUR', 'icon': 'pi pi-euro', 'max': 100000000, 'amounts': [100, 10000, 100000, 1000000]},
        {'label': 'Bitcoin', 'code': 'BTC', 'icon': 'pi pi-bitcoin', 'max': 21000000, 'amounts': [1, 10, 100, 1000]},
        {'label': 'Ethereum', 'code': 'ETH', 'icon': 'pi pi-ethereum', 'max': 21000000, 'amounts': [1, 10, 100, 1000]}
    ]
    return jsonify(currencies)

@app.route('/add_money', methods=['POST'])
def add_money():
    data = request.get_json()
    currency = data['currency']
    amount = data['amount']
    
    if currency in user_balances:
        current_balance = user_balances[currency]['balance']
        max_limit = user_balances[currency]['max_limit']
        
        if current_balance + amount > max_limit:
            return jsonify({"error": "Transaction exceeds maximum balance limit"}), 400
        
        user_balances[currency]['balance'] += amount
        return jsonify({"message": "Balance updated", "new_balance": user_balances[currency]['balance']}), 200
    
    return jsonify({"error": "Invalid currency"}), 400

@app.route('/remove_money', methods=['POST'])
def remove_money():
    data = request.get_json()
    currency = data['currency']
    amount = data['amount']
    
    if currency in user_balances:
        current_balance = user_balances[currency]['balance']
        
        if current_balance - amount < 0:
            return jsonify({"error": "Transaction would result in negative balance"}), 400
        
        user_balances[currency]['balance'] -= amount
        return jsonify({"message": "Balance updated", "new_balance": user_balances[currency]['balance']}), 200
    
    return jsonify({"error": "Invalid currency"}), 400

@app.route('/balance/<currency>', methods=['GET'])
def get_balance(currency):
    if currency in user_balances:
        return jsonify({"currency": currency, "balance": user_balances[currency]['balance']}), 200
    
    return jsonify({"error": "Invalid currency"}), 400

@app.route('/start_game', methods=['POST'])
def start_game():
    data = request.get_json()
    currency = data['currency']
    bet_amount = data['bet_amount']
    num_bombs = data['num_bombs']
    
    if currency not in user_balances:
        return jsonify({"error": "Invalid currency"}), 400
    
    if bet_amount < 1 or (currency in ['BTC', 'ETH'] and bet_amount < 0.1):
        return jsonify({"error": "Bet amount is too low"}), 400
    
    if bet_amount > user_balances[currency]['balance']:
        return jsonify({"error": "Insufficient balance"}), 400

    user_balances[currency]['balance'] -= bet_amount

    game_id = len(games) + 1
    game = MinesGame(size=5, mines=num_bombs)
    games[game_id] = {
        "game": game,
        "currency": currency,
        "bet_amount": bet_amount
    }

    return jsonify({"message": "Game started", "game_id": game_id}), 200

@app.route('/reveal', methods=['POST'])
def reveal():
    data = request.get_json()
    game_id = data['game_id']
    row = data['row']
    col = data['col']

    if game_id not in games:
        return jsonify({"error": "Game not found"}), 400

    game_data = games[game_id]
    game = game_data["game"]

    if game.game_over:
        return jsonify({"error": "Game over"}), 400

    result = game.reveal_cell(row, col)
    if result == 'B':
        return jsonify({"message": "Hit a bomb", "result": result}), 200
    return jsonify({"message": "Found a gem", "result": result, "gems_revealed": game.gems_revealed}), 200

@app.route('/cash_out', methods=['POST'])
def cash_out():
    data = request.get_json()
    game_id = data['game_id']

    if game_id not in games:
        return jsonify({"error": "Game not found"}), 400

    game_data = games[game_id]
    game = game_data["game"]
    currency = game_data["currency"]
    bet_amount = game_data["bet_amount"]

    if game.gems_revealed == 0:
        return jsonify({"error": "Cannot cash out without revealing any gems"}), 400

    winnings = bet_amount * (1 + 0.1 * game.gems_revealed)
    user_balances[currency]['balance'] += winnings

    del games[game_id]

    return jsonify({"message": "Cashed out", "winnings": winnings, "new_balance": user_balances[currency]['balance']}), 200

@app.route('/max_bet/<currency>', methods=['GET'])
def get_max_bet(currency):
    if currency in user_balances:
        return jsonify({"max_bet": user_balances[currency]['balance']}), 200
    return jsonify({"error": "Invalid currency"}), 400

tic_tac_toe_games = {}

class TicTacToeGame:
    def __init__(self, difficulty):
        self.board = ['' for _ in range(9)]
        self.difficulty = difficulty
        self.game_over = False
        self.winner = None

    def make_move(self, index, player):
        if self.board[index] == '':
            self.board[index] = player
            return True
        return False

    def check_winner(self):
        winning_combinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # columns
            [0, 4, 8], [2, 4, 6]             # diagonals
        ]
        for combo in winning_combinations:
            if self.board[combo[0]] == self.board[combo[1]] == self.board[combo[2]] != '':
                self.game_over = True
                self.winner = self.board[combo[0]]
                return True
        if '' not in self.board:
            self.game_over = True
            self.winner = 'draw'
            return True
        return False

    def computer_move(self):
        if self.difficulty == 'easy':
            available_moves = [i for i, cell in enumerate(self.board) if cell == '']
            return random.choice(available_moves)
        elif self.difficulty == 'hard':
            # Implement a basic minimax algorithm for hard mode
            best_score = float('-inf')
            best_move = None
            for i in range(9):
                if self.board[i] == '':
                    self.board[i] = 'O'
                    score = self.minimax(0, False)
                    self.board[i] = ''
                    if score > best_score:
                        best_score = score
                        best_move = i
            return best_move

    def minimax(self, depth, is_maximizing):
        if self.check_winner():
            if self.winner == 'O':
                return 1
            elif self.winner == 'X':
                return -1
            else:
                return 0

        if is_maximizing:
            best_score = float('-inf')
            for i in range(9):
                if self.board[i] == '':
                    self.board[i] = 'O'
                    score = self.minimax(depth + 1, False)
                    self.board[i] = ''
                    best_score = max(score, best_score)
            return best_score
        else:
            best_score = float('inf')
            for i in range(9):
                if self.board[i] == '':
                    self.board[i] = 'X'
                    score = self.minimax(depth + 1, True)
                    self.board[i] = ''
                    best_score = min(score, best_score)
            return best_score

@app.route('/start_tic_tac_toe', methods=['POST'])
def start_tic_tac_toe():
    data = request.get_json()
    currency = data['currency']
    bet_amount = data['bet_amount']
    difficulty = data['difficulty']

    if currency not in user_balances:
        return jsonify({"error": "Invalid currency"}), 400

    if bet_amount > user_balances[currency]['balance']:
        return jsonify({"error": "Insufficient balance"}), 400

    user_balances[currency]['balance'] -= bet_amount

    game_id = len(tic_tac_toe_games) + 1
    game = TicTacToeGame(difficulty)
    tic_tac_toe_games[game_id] = {
        "game": game,
        "currency": currency,
        "bet_amount": bet_amount
    }

    return jsonify({"message": "Game started", "game_id": game_id}), 200

@app.route('/tic_tac_toe_move', methods=['POST'])
def tic_tac_toe_move():
    data = request.get_json()
    game_id = data['game_id']
    index = data['index']

    if game_id not in tic_tac_toe_games:
        return jsonify({"error": "Game not found"}), 400

    game_data = tic_tac_toe_games[game_id]
    game = game_data["game"]

    if game.game_over:
        return jsonify({"error": "Game over"}), 400

    if not game.make_move(index, 'X'):
        return jsonify({"error": "Invalid move"}), 400

    if game.check_winner():
        if game.winner == 'X':
            winnings = game_data["bet_amount"] * (1 + 0.1 * 1)  
        elif game.winner == 'draw':
            winnings = game_data["bet_amount"]
        else:
            winnings = 0
        game_data["winnings"] = winnings
        return jsonify({
            "message": "Game over",
            "playerMove": 'X',
            "gameOver": True,
            "winnings": winnings
        }), 200

    computer_move = game.computer_move()
    game.make_move(computer_move, 'O')

    if game.check_winner():
        return jsonify({
            "message": "Computer won",
            "playerMove": 'X',
            "computerMove": computer_move,
            "gameOver": True,
            "computerWin": True
        }), 200

    return jsonify({
        "message": "Move made",
        "playerMove": 'X',
        "computerMove": computer_move,
        "gameOver": False
    }), 200

@app.route('/cash_out_tic_tac_toe', methods=['POST'])
def cash_out_tic_tac_toe():
    data = request.get_json()
    game_id = data['game_id']

    if game_id not in tic_tac_toe_games:
        return jsonify({"error": "Game not found"}), 400

    game_data = tic_tac_toe_games[game_id]
    currency = game_data["currency"]
    winnings = game_data.get("winnings", 0)
    user_balances[currency]['balance'] += winnings

    del tic_tac_toe_games[game_id]

    return jsonify({"message": "Cashed out", "winnings": winnings, "new_balance": user_balances[currency]['balance']}), 200


if __name__ == "__main__":
    app.run(debug=True)
