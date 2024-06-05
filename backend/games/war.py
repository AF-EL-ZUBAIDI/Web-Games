import random as rd

def initialize_deck():
    suits = ['hearts', 'diamonds', 'clubs', 'spades']
    values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A']
    deck = [{'value': value, 'suit': suit} for suit in suits for value in values]
    rd.shuffle(deck)
    return deck

def card_rank(card):
    if isinstance(card['value'], int):
        return card['value']
    return {'J': 11, 'Q': 12, 'K': 13, 'A': 14}[card['value']]
