import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AppConfig } from '../../app-config';

@Component({
  selector: 'app-stop-watch',
  templateUrl: './stop-watch.component.html',
  styleUrls: ['./stop-watch.component.css'],
  providers: [MessageService]
})
export class StopWatchComponent implements OnInit {
  currencyOptions: any[] = [];
  selectedCurrency: any;
  betAmount: number;
  gameActive: boolean = false;
  gameId: number;
  startTime: number = 0;
  displayTime: string = '00:00:000';
  timerInterval: any;
  stopwatchRunning: boolean = false;

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

  startStopwatch() {
    if (!this.selectedCurrency || this.betAmount == null || this.betAmount <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Input', detail: 'Please fill in all fields correctly.' });
      return;
    }

    this.http.post(`${AppConfig.apiBaseUrl}/start_stopwatch`, {
      currency: this.selectedCurrency.code,
      bet_amount: this.betAmount
    }).subscribe(
      (response: any) => {
        if (response.error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
        } else {
          this.gameId = response.game_id;
          this.startTime = Date.now();
          this.gameActive = true;
          this.stopwatchRunning = true;
          this.timerInterval = setInterval(() => this.updateDisplayTime(), 10);
          this.messageService.add({ severity: 'success', summary: 'Game Started', detail: 'The stopwatch has started!' });
        }
      },
      (error: any) => {
        if (error.status === 400 && error.error.error === 'Insufficient balance') {
          this.messageService.add({ severity: 'error', summary: 'Insufficient Balance', detail: 'You do not have enough money to start the game.' });
          this.messageService.add({ severity: 'info', summary: 'Visit Bank', detail: 'Please visit our bank to fill your account with money.' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred.' });
        }
      }
    );
  }

  stopStopwatch() {
    if (!this.gameActive) return;

    clearInterval(this.timerInterval);
    this.gameActive = false;
    this.stopwatchRunning = false;

    const elapsedMilliseconds = Date.now() - this.startTime;
    this.updateDisplayTime(elapsedMilliseconds);

    this.http.post(`${AppConfig.apiBaseUrl}/stop_stopwatch`, { game_id: this.gameId, elapsed_time: elapsedMilliseconds }).subscribe(
      (response: any) => {
        if (response.error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.error });
        } else {
          console.log(`Elapsed Time: ${response.elapsed_time}`);
          console.log(`Winnings: ${response.winnings}`);
          if (response.winnings > 0) {
            this.messageService.add({ severity: 'success', summary: 'You Won!', detail: `Congratulations! You won ${response.winnings} ${this.selectedCurrency.code}.` });
          } else {
            this.messageService.add({ severity: 'warn', summary: 'You Lost', detail: 'Better luck next time!' });
          }
        }
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred.' });
      }
    );
  }

  updateDisplayTime(elapsedTime?: number) {
    const time = elapsedTime ?? (Date.now() - this.startTime);
    const seconds = Math.floor(time / 1000);
    const milliseconds = time % 1000;
    this.displayTime = `${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
  }
}