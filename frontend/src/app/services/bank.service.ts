import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private balances: { [key: string]: number } = {
    USD: 100000, // Example starting balance
    EUR: 100000,
    BTC: 10,
    ETH: 10
  };

  getBalance(currencyCode: string): number {
    return this.balances[currencyCode] || 0;
  }

  addBalance(currencyCode: string, amount: number): void {
    if (!this.balances[currencyCode]) {
      this.balances[currencyCode] = 0;
    }
    this.balances[currencyCode] += amount;
  }

  deductBalance(currencyCode: string, amount: number): void {
    if (this.balances[currencyCode]) {
      this.balances[currencyCode] -= amount;
    }
  }
}
