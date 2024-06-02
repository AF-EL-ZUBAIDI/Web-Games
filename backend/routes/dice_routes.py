from flask import Blueprint, request, jsonify
import random
from shared_resources import games, user_balances

dice_bp = Blueprint('dice_bp', __name__)

@dice_bp.route('/start_dice_game', methods=['POST'])
def start_dice_game():
    data = request.get_json()
    currency = data['currency']
    bet_amount = data['bet_amount']
    bet_type = data['bet_type']
    bet_number = data.get('bet_number')  # Use .get() to avoid KeyError if not provided

    if currency not in user_balances:
        return jsonify({"error": "Invalid currency"}), 400

    if bet_amount > user_balances[currency]['balance']:
        return jsonify({"error": "Insufficient balance"}), 400

    if bet_type in ['above', 'below'] and bet_number is None:
        return jsonify({"error": "Bet number must be provided for 'above' and 'below' bet types"}), 400

    user_balances[currency]['balance'] -= bet_amount

    game_id = len(games) + 1
    dice1 = random.randint(1, 6)
    dice2 = random.randint(1, 6)
    rolled_number = dice1 + dice2
    winnings = 0

    if bet_type == 'exact' and bet_number == rolled_number:
        winnings = bet_amount * 10
    elif bet_type == 'above' and rolled_number >= bet_number:
        winnings = bet_amount * 2
    elif bet_type == 'below' and rolled_number <= bet_number:
        winnings = bet_amount * 2

    user_balances[currency]['balance'] += winnings

    game_data = {
        "currency": currency,
        "bet_amount": bet_amount,
        "bet_type": bet_type,
        "bet_number": bet_number,
        "rolled_number": rolled_number,
        "winnings": winnings,
        "dice1": dice1,
        "dice2": dice2
    }

    games[game_id] = game_data

    return jsonify({
        "message": "Game started",
        "game_id": game_id,
        "rolled_number": rolled_number,
        "winnings": winnings,
        "new_balance": user_balances[currency]['balance'],
        "dice1": dice1,
        "dice2": dice2
    }), 200
