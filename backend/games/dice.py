import random as rd

class DiceGame:
    def __init__(self):
        self.result = None

    def roll_dice(self):
        dice1 = rd.randint(1, 6)
        dice2 = rd.randint(1, 6)
        self.result = dice1 + dice2
        return dice1, dice2, self.result

    def check_bet(self, bet_number, bet_type):
        if bet_type == 'exact' and self.result == bet_number:
            return True
        elif bet_type == 'above' and self.result >= bet_number:
            return True
        elif bet_type == 'below' and self.result <= bet_number:
            return True
        return False
