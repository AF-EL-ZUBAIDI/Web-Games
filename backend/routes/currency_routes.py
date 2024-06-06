from flask import Blueprint, request, jsonify
from shared_resources import user_balances, games

currency_bp = Blueprint('currency_bp', __name__)

@currency_bp.route('/currencies', methods=['GET'])
def get_currencies():
    currencies = [
        {'label': 'Dollar', 'code': 'USD', 'icon': 'pi pi-dollar', 'max': 1000000000, 'amounts': [100, 10000, 100000, 1000000, 10000000]},
        {'label': 'Euro', 'code': 'EUR', 'icon': 'pi pi-euro', 'max': 1000000000, 'amounts': [100, 10000, 100000, 1000000, 10000000]},
        {'label': 'Bitcoin', 'code': 'BTC', 'icon': 'pi pi-bitcoin', 'max': 21000000, 'amounts': [1, 10, 100, 1000, 10000]},
        {'label': 'Ethereum', 'code': 'ETH', 'icon': 'pi pi-ethereum', 'max': 21000000, 'amounts': [1, 10, 100, 1000, 10000]}
    ]
    return jsonify(currencies)

@currency_bp.route('/add_money', methods=['POST'])
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

@currency_bp.route('/remove_money', methods=['POST'])
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

@currency_bp.route('/balance/<currency>', methods=['GET'])
def get_balance(currency):
    if currency in user_balances:
        return jsonify({"currency": currency, "balance": user_balances[currency]['balance']}), 200
    
    return jsonify({"error": "Invalid currency"}), 400

@currency_bp.route('/max_bet/<currency>', methods=['GET'])
def get_max_bet(currency):
    if currency in user_balances:
        return jsonify({"max_bet": user_balances[currency]['balance']}), 200
    return jsonify({"error": "Invalid currency"}), 400

@currency_bp.route('/cash_out', methods=['POST'])
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

    winnings = bet_amount * (1 + 0.5 * game.gems_revealed)
    user_balances[currency]['balance'] += winnings

    del games[game_id]

    return jsonify({"message": "Cashed out", "winnings": winnings, "new_balance": user_balances[currency]['balance']}), 200
