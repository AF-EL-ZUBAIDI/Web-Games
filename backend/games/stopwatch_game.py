import time
import random as rd

class StopwatchGame:
    def __init__(self):
        self.start_time = None
        self.target_time = 10  # Target time in seconds
        self.allowed_diff = 0.2  # Allowed difference in seconds (200ms)
        self.bet_amount = 0
        self.currency = ""

    def start(self, bet_amount, currency):
        self.start_time = time.time()
        self.bet_amount = bet_amount
        self.currency = currency

    def stop(self):
        if not self.start_time:
            raise Exception("Stopwatch not started")
        elapsed_time = time.time() - self.start_time
        return elapsed_time, self.calculate_winnings(elapsed_time)

    def calculate_winnings(self, elapsed_time):
        if abs(elapsed_time - self.target_time) <= self.allowed_diff:
            return self.bet_amount * 2
        return 0
