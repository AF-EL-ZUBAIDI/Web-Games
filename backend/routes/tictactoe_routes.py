from flask import Blueprint, request, jsonify
from shared_resources import tic_tac_toe_games, user_balances
from games.tictactoe import TicTacToeGame

tictactoe_bp = Blueprint('tictactoe_bp', __name__)

@tictactoe_bp.route('/start_tic_tac_toe', methods=['POST'])
def start_tic_tac_toe():
    data = request.get_json()
    currency = data['currency']
    bet_amount = data['bet_amount']
    difficulty = data['difficulty']
    player_symbol = data.get('player_symbol', 'X')  # Default to 'X' if not provided

    if currency not in user_balances:
        return jsonify({"error": "Invalid currency"}), 400

    if bet_amount > user_balances[currency]['balance']:
        return jsonify({"error": "Insufficient balance"}), 400

    user_balances[currency]['balance'] -= bet_amount

    game_id = len(tic_tac_toe_games) + 1
    game = TicTacToeGame(difficulty, player_symbol)
    tic_tac_toe_games[game_id] = {
        "game": game,
        "currency": currency,
        "bet_amount": bet_amount,
        "difficulty": difficulty  # Save the difficulty level
    }

    if player_symbol == 'O':
        computer_move = game.computer_move()
        game.make_move(computer_move, game.computer_symbol)
        return jsonify({"message": "Game started", "game_id": game_id, "computerMove": computer_move}), 200

    return jsonify({"message": "Game started", "game_id": game_id}), 200

@tictactoe_bp.route('/tic_tac_toe_move', methods=['POST'])
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

    if not game.make_move(index, game.player_symbol):
        return jsonify({"error": "Invalid move"}), 400

    if game.check_winner():
        if game.winner == game.player_symbol:
            difficulty_multiplier = 3 if game_data["difficulty"] == 'hard' else 1
            winnings = game_data["bet_amount"] * (1 + 0.1 * difficulty_multiplier)
        elif game.winner == 'draw':
            winnings = game_data["bet_amount"]
        else:
            winnings = 0
        game_data["winnings"] = winnings
        user_balances[game_data["currency"]]['balance'] += winnings  # Update the user's balance with the winnings
        return jsonify({
            "message": "Game over",
            "playerMove": game.player_symbol,
            "gameOver": True,
            "winnings": winnings,
            "balance": user_balances[game_data["currency"]]['balance'],
            "winner": game.winner
        }), 200

    computer_move = game.computer_move()
    game.make_move(computer_move, game.computer_symbol)

    if game.check_winner():
        return jsonify({
            "message": "Computer won",
            "playerMove": game.player_symbol,
            "computerMove": computer_move,
            "gameOver": True,
            "computerWin": True,
            "winner": game.winner
        }), 200

    return jsonify({
        "message": "Move made",
        "playerMove": game.player_symbol,
        "computerMove": computer_move,
        "gameOver": False
    }), 200
