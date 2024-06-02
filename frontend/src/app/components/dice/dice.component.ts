import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AppConfig } from '../../app-config';

@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.css'],
  providers: [MessageService]
})
export class DiceComponent implements OnInit {
  currencyOptions: any[] = [];
  selectedCurrency: any;
  betAmount: number;
  selectedBetType: string = 'exact';
  betNumber: number;
  gameActive: boolean = false;
  rolling: boolean = false;
  currentDiceImage1: string = 'assets/dice/dice1.png';
  currentDiceImage2: string = 'assets/dice/dice1.png';

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
    'background': 'var(--board-background-color)',
    'border': 'none'
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

  selectBetType(type: string) {
    this.selectedBetType = type;
  }

  startGame() {
    if (!this.selectedCurrency || this.betAmount == null || this.betAmount <= 0 || !this.selectedBetType) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Input', detail: 'Please fill in all fields correctly.' });
      return;
    }

    const payload: any = {
      currency: this.selectedCurrency.code,
      bet_amount: this.betAmount,
      bet_type: this.selectedBetType
    };

    if (this.selectedBetType === 'exact') {
      if (!this.betNumber || this.betNumber < 2 || this.betNumber > 12) {
        this.messageService.add({ severity: 'warn', summary: 'Invalid Bet Number', detail: 'Please select a bet number between 2 and 12.' });
        return;
      }
      payload.bet_number = this.betNumber;
    } else if (this.selectedBetType === 'above') {
      if (!this.betNumber || this.betNumber < 3 || this.betNumber > 12) {
        this.messageService.add({ severity: 'warn', summary: 'Invalid Bet Number', detail: 'Please select a bet number between 3 and 12 for "above" bets.' });
        return;
      }
      payload.bet_number = this.betNumber;
    } else if (this.selectedBetType === 'below') {
      if (!this.betNumber || this.betNumber < 2 || this.betNumber > 11) {
        this.messageService.add({ severity: 'warn', summary: 'Invalid Bet Number', detail: 'Please select a bet number between 2 and 11 for "below" bets.' });
        return;
      }
      payload.bet_number = this.betNumber;
    }

    this.gameActive = true;
    this.rolling = true;
    this.http.post(`${AppConfig.apiBaseUrl}/start_dice_game`, payload).subscribe(
      (response: any) => {
        if (response.error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
          this.rolling = false;
          this.gameActive = false;
        } else {
          setTimeout(() => {
            this.currentDiceImage1 = `assets/dice/dice${response.dice1}.png`;
            this.currentDiceImage2 = `assets/dice/dice${response.dice2}.png`;
            this.rolling = false;
            if (response.winnings > 0) {
              this.messageService.add({ severity: 'success', summary: 'You Won!', detail: `Congratulations! You won ${response.winnings} ${this.selectedCurrency.code}.` });
            } else {
              this.messageService.add({ severity: 'error', summary: 'You Lost', detail: 'Better luck next time!' });
            }
          }, 2); // Simulate rolling time
        }
      },
      (error: any) => {
        if (error.status === 400 && error.error.error === 'Insufficient balance') {
          this.messageService.add({ severity: 'error', summary: 'Insufficient Balance', detail: 'You do not have enough money to start the game.' });
          this.messageService.add({ severity: 'info', summary: 'Visit Bank', detail: 'Please visit our bank to fill your account with money.' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred.' });
        }
        this.rolling = false;
        this.gameActive = false;
      }
    );
  }
}
