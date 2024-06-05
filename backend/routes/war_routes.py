from flask import Blueprint, request, jsonify
from shared_resources import war_games, user_balances
from games.war import initialize_deck, card_rank

war_bp = Blueprint('war_bp', __name__)

@war_bp.route('/start_war_game', methods=['POST'])
def start_war_game():
    data = request.get_json()
    currency = data['currency']
    bet_amount = data['bet_amount']

    if currency not in user_balances:
        return jsonify({"error": "Invalid currency"}), 400

    if bet_amount < 1 or (currency in ['BTC', 'ETH'] and bet_amount < 0.1):
        return jsonify({"error": "Bet amount is too low"}), 400

    if bet_amount > user_balances[currency]['balance']:
        return jsonify({"error": "Insufficient balance"}), 400

    user_balances[currency]['balance'] -= bet_amount

    game_id = len(war_games) + 1
    deck = initialize_deck()
    player_deck = deck[:26]
    computer_deck = deck[26:]

    war_games[game_id] = {
        'currency': currency,
        'bet_amount': bet_amount,
        'player_deck': player_deck,
        'computer_deck': computer_deck,
        'player_won_cards': [],
        'computer_won_cards': [],
        'battle_stack': [],
        'status': 'ongoing',
        'winner': ''
    }

    print(f"Game {game_id} started with decks: Player: {player_deck}, Computer: {computer_deck}")

    return jsonify({
        "message": "Game started",
        "game_id": game_id,
        "player_deck": player_deck,
        "computer_deck": computer_deck
    }), 200

@war_bp.route('/play_war_turn', methods=['POST'])
def play_war_turn():
    data = request.get_json()
    game_id = data['game_id']
    player_card = data.get('player_card')
    winner = ''

    if game_id not in war_games:
        return jsonify({"error": "Game not found"}), 400

    game = war_games[game_id]

    if not player_card:
        return jsonify({"error": "No player card selected"}), 400

    if not game['player_deck'] or not game['computer_deck']:
        game['status'] = 'finished'
        if len(game['player_won_cards']) > len(game['computer_won_cards']):
            winner = 'player'
            user_balances[game['currency']]['balance'] += game['bet_amount'] + game['bet_amount'] * 1.5
        elif len(game['player_won_cards']) < len(game['computer_won_cards']):
            winner = 'computer'
        else:
            winner = 'draw'
        return jsonify({
            "message": "Game over",
            "player_won_cards_count": len(game['player_won_cards']),
            "computer_won_cards_count": len(game['computer_won_cards']),
            "winner": winner
        }), 200

    computer_card = game['computer_deck'].pop(0)
    game['battle_stack'].extend([player_card, computer_card])

    player_rank = card_rank(player_card)
    computer_rank = card_rank(computer_card)

    if player_rank > computer_rank:
        game['player_won_cards'].extend(game['battle_stack'])
        game['battle_stack'] = []
    elif player_rank < computer_rank:
        game['computer_won_cards'].extend(game['battle_stack'])
        game['battle_stack'] = []
    else:
        game['player_won_cards'].append(player_card)
        game['computer_won_cards'].append(computer_card)
        game['battle_stack'] = []

    # Check if game should be over
    if not game['player_deck'] or not game['computer_deck']:
        game['status'] = 'finished'
        if len(game['player_won_cards']) > len(game['computer_won_cards']):
            winner = 'player'
            user_balances[game['currency']]['balance'] += game['bet_amount'] + game['bet_amount'] * 1.5
        elif len(game['player_won_cards']) < len(game['computer_won_cards']):
            winner = 'computer'
        else:
            winner = 'draw'
        return jsonify({
            "message": "Game over",
            "player_won_cards_count": len(game['player_won_cards']),
            "computer_won_cards_count": len(game['computer_won_cards']),
            "winner": winner,
            "computer_card": computer_card if not game['computer_deck'] else None # Send last card if it's the end of the game
        }), 200

    return jsonify({
        "message": "Turn played",
        "player_card": player_card,
        "computer_card": computer_card,
        "player_deck_count": len(game['player_deck']),
        "computer_deck_count": len(game['computer_deck']),
        "player_won_cards_count": len(game['player_won_cards']),
        "computer_won_cards_count": len(game['computer_won_cards']),
        "battle_stack_count": len(game['battle_stack'])
    }), 200
