from flask import Blueprint, request, jsonify
from shared_resources import games, user_balances
from games.mines import MinesGame

mines_bp = Blueprint('mines_bp', __name__)

@mines_bp.route('/start_game', methods=['POST'])
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

@mines_bp.route('/reveal', methods=['POST'])
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
