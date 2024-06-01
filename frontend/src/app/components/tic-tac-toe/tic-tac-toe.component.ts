import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AppConfig } from '../../app-config';

@Component({
  selector: 'app-tic-tac-toe',
  templateUrl: './tic-tac-toe.component.html',
  styleUrls: ['./tic-tac-toe.component.css'],
  providers: [MessageService]
})
export class TicTacToeComponent implements OnInit {
  currencyOptions: any[] = [];
  selectedCurrency: any;
  betAmount: number;
  selectedMode: string = 'easy';  // Default selection
  board: string[] = Array(9).fill('');
  gameActive: boolean = false;
  gameOver: boolean = false;
  gameId: number;
  potentialWinnings: number = 0;

  styleInfoCard = {
    background: 'var(--info-card-background-color)',
    'border': 'none'
  };

  styleBox = {
    color: 'var(--box-text-color)',
    'background': 'var(--box-background-color)',
    'border': 'yes'
  };

  styleBoard = {
    'background': 'var(--board-card-background-color)',
    'border': 'none'
  };

  styleSmallCard = {
    'background': 'var(--small-card-background-color)',
    'width': '100%',
    'height': '100%',
    'border': 'none'
  };

  styleGem = {
    'display': 'block',
    'margin': '0 auto',
    'padding': '0'
  };

  styleBomb = {
    'display': 'block',
    'margin': '0 auto',
    'padding': '0'
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

  selectMode(mode: string) {
    this.selectedMode = mode;
  }

  startGame() {
    if (!this.selectedCurrency || this.betAmount == null || this.betAmount <= 0 || !this.selectedMode) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Input', detail: 'Please fill in all fields correctly.' });
      return;
    }

    if (this.betAmount < this.selectedCurrency.minAmount) {
      this.messageService.add({ severity: 'warn', summary: 'Bet Too Low', detail: `The minimum bet amount is ${this.selectedCurrency.minAmount} ${this.selectedCurrency.code}.` });
      this.messageService.add({ severity: 'info', summary: 'Visit Bank', detail: 'Please visit our bank to fill your account with money.' });
      return;
    }

    this.http.post(`${AppConfig.apiBaseUrl}/start_tic_tac_toe`, {
      currency: this.selectedCurrency.code,
      bet_amount: this.betAmount,
      difficulty: this.selectedMode
    }).subscribe(
      (response: any) => {
        if (response.error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
        } else {
          this.gameId = response.game_id;
          this.board = Array(9).fill('');
          this.gameActive = true;
          this.gameOver = false;
          this.potentialWinnings = this.betAmount; // Initialize potential winnings
          this.messageService.add({ severity: 'success', summary: 'Game Started', detail: 'The game has started! If you leave the page, your bet amount will be lost.' });
        }
      },
      (error: any) => {
        if (error.status === 400 && error.error.error === 'Insufficient balance') {
          this.messageService.add({ severity: 'error', summary: 'Insufficient Balance', detail: 'You do not have enough money to start the game.' });
          this.messageService.add({ severity: 'info', summary: 'Visit Bank', detail: 'Please visit our bank to fill your account with money.' });
        } else if (error.status === 400 && error.error.error === 'Bet amount is too low') {
          this.messageService.add({ severity: 'warn', summary: 'Bet Too Low', detail: `The minimum bet amount is ${this.selectedCurrency.minAmount} ${this.selectedCurrency.code}.` });
          this.messageService.add({ severity: 'info', summary: 'Visit Bank', detail: 'Please visit our bank to fill your account with money.' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred.' });
        }
      }
    );
  }

  onCellClick(index: number) {
    if (!this.gameActive || this.board[index]) return;

    this.http.post(`${AppConfig.apiBaseUrl}/tic_tac_toe_move`, {
      game_id: this.gameId,
      index: index
    }).subscribe((response: any) => {
      if (response.error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
        return;
      }

      this.board[index] = response.playerMove;
      if (response.gameOver) {
        this.gameOver = true;
        this.gameActive = false;
        this.potentialWinnings = response.winnings;
        this.messageService.add({ severity: 'success', summary: 'Game Over', detail: response.message });
      } else {
        this.board[response.computerMove] = 'O';
        if (response.computerWin) {
          this.gameOver = true;
          this.gameActive = false;
          this.messageService.add({ severity: 'error', summary: 'Game Over', detail: 'The computer won!' });
        }
      }
    });
  }

  cashOut() {
    this.http.post(`${AppConfig.apiBaseUrl}/cash_out_tic_tac_toe`, {
      game_id: this.gameId
    }).subscribe(
      (response: any) => {
        if (response.error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
        } else {
          this.gameActive = false;
          this.gameOver = true;
          this.messageService.add({ severity: 'success', summary: 'Cashed Out', detail: `You won ${response.winnings} ${this.selectedCurrency.code}!` });
          console.log('Currency:', this.selectedCurrency.code);
        }
      },
      (error: any) => {
        if (error.status === 400 && error.error.error === 'Cannot cash out without making any moves') {
          this.messageService.add({ severity: 'warn', summary: 'Invalid Action', detail: 'You must make at least one move to cash out.' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred.' });
        }
      }
    );
  }
}
