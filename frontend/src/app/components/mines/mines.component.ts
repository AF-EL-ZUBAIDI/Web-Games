import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AppConfig } from '../../app-config';  

@Component({
  selector: 'app-mines',
  templateUrl: './mines.component.html',
  styleUrls: ['./mines.component.css'],
  providers: [MessageService]
})
export class MinesComponent implements OnInit {
  currencyOptions: any[] = [];
  bombOptions: any[] = [];
  selectedCurrency: any;
  betAmount: number;
  numBombs: number = 3; // Default value to 3
  board: string[] = Array(25).fill('');
  gameActive: boolean = false;
  gameOver: boolean = false;
  gameId: number;
  potentialWinnings: number = 0; // Initialize potential winnings

  styleInfoCard = {
    background: 'var(--info-card-background-color)',
    'border': 'none'
  };

  styleBox = {
    color: 'var(--box-text-color)',
    background: 'var(--box-background-color)',
    'border': 'yes'
  };

  styleBoard = {
    background: 'var(--board-card-background-color)',
    'border': 'none'
  };

  styleSmallCard = {
    background: 'var(--small-card-background-color)',
    width: '100%',
    height: '100%',
    'border': 'none'
  };

  styleGem = {
    display: 'block',
    'margin': '0 auto',
    'padding': '0'
  };

  styleBomb = {
    display: 'block',
    'margin': '0 auto',
    'padding': '0'
  };

  constructor(private http: HttpClient, private messageService: MessageService) {}

  ngOnInit() {
    this.fetchCurrencies();
    this.populateBombOptions();
  }

  fetchCurrencies() {
    this.http.get(`${AppConfig.apiBaseUrl}/currencies`).subscribe((data: any) => {
      this.currencyOptions = data.map((currency: any) => ({
        label: `${currency.code}`,
        code: currency.code,
        icon: currency.icon,
        fullLabel: `${currency.code} (${currency.label})`,
        minAmount: currency.amounts[0]
      }));
    });
  }

  populateBombOptions() {
    this.bombOptions = Array.from({ length: 24 }, (_, i) => ({
      label: `${i + 1}`,
      value: i + 1
    }));
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
    if (!this.selectedCurrency || this.betAmount == null || this.betAmount <= 0 || this.numBombs < 1 || this.numBombs >= 25) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Input', detail: 'Please fill in all fields correctly.' });
      return;
    }

    if (this.betAmount < this.selectedCurrency.minAmount) {
      this.messageService.add({ severity: 'warn', summary: 'Bet Too Low', detail: `The minimum bet amount is ${this.selectedCurrency.minAmount} ${this.selectedCurrency.code}.` });
      this.messageService.add({ severity: 'info', summary: 'Visit Bank', detail: 'Please visit our bank to fill your account with money.' });
      return;
    }

    this.http.post(`${AppConfig.apiBaseUrl}/start_game`, {
      currency: this.selectedCurrency.code,
      bet_amount: this.betAmount,
      num_bombs: this.numBombs
    }).subscribe(
      (response: any) => {
        if (response.error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
        } else {
          this.gameId = response.game_id;
          this.board = Array(25).fill('');
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

    const row = Math.floor(index / 5);
    const col = index % 5;

    this.http.post(`${AppConfig.apiBaseUrl}/reveal`, {
      game_id: this.gameId,
      row: row,
      col: col
    }).subscribe((response: any) => {
      if (response.error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
        return;
      }

      this.board[index] = response.result;
      if (response.result === 'B') {
        this.gameOver = true;
        this.gameActive = false;
        this.messageService.add({ severity: 'error', summary: 'Game Over', detail: 'You hit a bomb!' });
      } else {
        this.potentialWinnings += this.betAmount * 0.1; // Adjust multiplier as needed
      }
    });
  }

  cashOut() {
    this.http.post(`${AppConfig.apiBaseUrl}/cash_out`, {
      game_id: this.gameId
    }).subscribe(
      (response: any) => {
        if (response.error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
        } else {
          this.gameActive = false;
          this.gameOver = true;
          this.messageService.add({ severity: 'success', summary: 'Cashed Out', detail: `You won ${response.winnings} ${this.selectedCurrency.code}!` });
        }
      },
      (error: any) => {
        if (error.status === 400 && error.error.error === 'Cannot cash out without revealing any gems') {
          this.messageService.add({ severity: 'warn', summary: 'Invalid Action', detail: 'You must reveal at least one gem to cash out.' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred.' });
        }
      }
    );
  }
}
