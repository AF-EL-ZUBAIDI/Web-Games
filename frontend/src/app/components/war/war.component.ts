import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AppConfig } from '../../app-config';

@Component({
  selector: 'app-war',
  templateUrl: './war.component.html',
  styleUrls: ['./war.component.css'],
  providers: [MessageService]
})
export class WarComponent implements OnInit {
  currencyOptions: any[] = [];
  selectedCurrency: any;
  betAmount: number;
  gameActive: boolean = false;
  gameId: number;
  playerDeck: any[] = [];
  computerDeck: any[] = [];
  playerCard: any;
  computerCard: any;
  playerWonCardsCount: number = 0;
  computerWonCardsCount: number = 0;
  boardBackgroundUrl: string = 'assets/war/war_board.png';

  styleInfoCard = {
    background: 'var(--info-card-background-color)',
    border: 'none'
  };

  styleBox = {
    color: 'var(--box-text-color)',
    background: 'var(--box-background-color)',
    border: 'yes'
  };

  constructor(private http: HttpClient, private messageService: MessageService) {}

  ngOnInit() {
    this.fetchCurrencies();
  }

  fetchCurrencies() {
    this.http.get(`${AppConfig.apiBaseUrl}/currencies`).subscribe((data: any) => {
      this.currencyOptions = data.map((currency: any) => ({
        label: `${currency.icon} ${currency.code} (${currency.label})`,
        code: currency.code,
        icon: currency.icon,
        fullLabel: `${currency.code} (${currency.label})`,
        minAmount: currency.amounts[0]
      }));
    });
  }

  setMaxBet() {
    if (!this.selectedCurrency) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a currency first.' });
      return;
    }
    this.http.get(`${AppConfig.apiBaseUrl}/max_bet/${this.selectedCurrency.code}`).subscribe(
      (response: any) => {
        if (response.error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
        } else {
          this.betAmount = response.max_bet;
        }
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching the max bet amount.' });
      }
    );
  }

  startGame() {
    if (!this.selectedCurrency || this.betAmount == null || this.betAmount <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Input', detail: 'Please fill in all fields correctly.' });
      return;
    }

    const payload = {
      currency: this.selectedCurrency.code,
      bet_amount: this.betAmount
    };

    this.http.post(`${AppConfig.apiBaseUrl}/start_war_game`, payload).subscribe(
      (response: any) => {
        if (response.error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
          this.gameActive = false;
        } else {
          this.gameId = response.game_id;
          this.playerDeck = response.player_deck || [];
          this.computerDeck = response.computer_deck || [];
          this.gameActive = true;
          this.messageService.add({ severity: 'success', summary: 'Game Started', detail: 'The game has started!' });
        }
      },
      (error: any) => {
        if (error.status === 400 && error.error.error === 'Insufficient balance') {
          this.messageService.add({ severity: 'error', summary: 'Insufficient Balance', detail: 'You do not have enough money to start the game.' });
          this.messageService.add({ severity: 'info', summary: 'Visit Bank', detail: 'Please visit our bank to fill your account with money.' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred.' });
        }
        this.gameActive = false;
      }
    );
  }

  selectPlayerCard(index: number) {
    if (this.playerCard) return; // Prevent selecting multiple cards at once
    this.playerCard = this.playerDeck.splice(index, 1)[0];
    this.playTurn();
  }

  playTurn() {
    if (!this.playerCard) {
      this.messageService.add({ severity: 'warn', summary: 'Select a Card', detail: 'Please select a card to play.' });
      return;
    }

    const payload = { game_id: this.gameId, player_card: this.playerCard };

    this.http.post(`${AppConfig.apiBaseUrl}/play_war_turn`, payload).subscribe(
      (response: any) => {
        console.log('Response from server:', response);
        this.computerCard = response.computer_card;
        this.computerDeck.shift();

        // Display both cards in the middle for 1 second
        setTimeout(() => {
          this.playerCard = null;
          this.computerCard = null;

          this.playerWonCardsCount = response.player_won_cards_count;
          this.computerWonCardsCount = response.computer_won_cards_count;

          this.checkGameStatus(response.message, response.winner);

        }, 1000);
      },
      (error: any) => {
        console.error('Error from server:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred.' });
        this.gameActive = false;
      }
    );
  }

  checkGameStatus(message: string, winner: string) {
    console.log('Checking game status. Player deck count:', this.playerDeck.length, 'Computer deck count:', this.computerDeck.length);
    if (this.playerDeck.length === 0 || this.computerDeck.length === 0) {
      this.gameActive = false;
      if (message === "Game over") {
        const winnerMessage = `Game over. Winner: ${winner}`;
        if (winner === 'player') {
          this.messageService.add({ severity: 'success', summary: 'You Won!', detail: `${winnerMessage}. You won ${(this.betAmount + this.betAmount * 1.5).toFixed(2)} ${this.selectedCurrency.code}` });
        } else if (winner === 'computer') {
          this.messageService.add({ severity: 'error', summary: 'Game Over', detail: winnerMessage });
        } else if (winner === 'draw') {
          this.messageService.add({ severity: 'info', summary: 'Game Over', detail: 'It\'s a draw!' });
        }
      }
    }
  }
}
