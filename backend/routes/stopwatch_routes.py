from flask import Blueprint, request, jsonify
import time
from shared_resources import games, user_balances

stopwatch_bp = Blueprint('stopwatch_bp', __name__)

@stopwatch_bp.route('/start_stopwatch', methods=['POST'])
def start_stopwatch():
    data = request.get_json()
    currency = data['currency']
    bet_amount = data['bet_amount']

    if currency not in user_balances:
        return jsonify({"error": "Invalid currency"}), 400

    if bet_amount > user_balances[currency]['balance']:
        return jsonify({"error": "Insufficient balance"}), 400

    user_balances[currency]['balance'] -= bet_amount

    game_id = len(games) + 1
    start_time = time.time()

    games[game_id] = {
        "currency": currency,
        "bet_amount": bet_amount,
        "start_time": start_time,
        "game_active": True
    }

    return jsonify({
        "message": "Game started",
        "game_id": game_id
    }), 200

@stopwatch_bp.route('/stop_stopwatch', methods=['POST'])
def stop_stopwatch():
    data = request.get_json()
    game_id = data['game_id']
    elapsed_time = data['elapsed_time'] / 1000.0  # Convert milliseconds to seconds

    if game_id not in games:
        return jsonify({"error": "Game not found"}), 400

    game = games[game_id]

    if not game['game_active']:
        return jsonify({"error": "Game already ended"}), 400

    game['game_active'] = False

    winnings = 0
    if elapsed_time == 10.000:
        winnings = game['bet_amount'] * 100
        user_balances[game['currency']]['balance'] += winnings

    elif 9.980 <= elapsed_time <= 10.020:
        winnings = game['bet_amount'] * 10
        user_balances[game['currency']]['balance'] += winnings

    elif 9.950 <= elapsed_time <= 10.050:
        winnings = game['bet_amount'] * 5
        user_balances[game['currency']]['balance'] += winnings

    elif 9.900 <= elapsed_time <= 10.100:
        winnings = game['bet_amount'] * 3
        user_balances[game['currency']]['balance'] += winnings

    elif 9.800 <= elapsed_time <= 10.200:
        winnings = game['bet_amount'] * 2
        user_balances[game['currency']]['balance'] += winnings

    game['elapsed_time'] = elapsed_time
    game['winnings'] = winnings

    return jsonify({
        "elapsed_time": elapsed_time,
        "winnings": winnings
    }), 200
