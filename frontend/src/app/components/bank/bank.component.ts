import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SelectItem } from 'primeng/api';
import { AppConfig } from '../../app-config'; 

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.css']
})
export class BankComponent implements OnInit {
  currencies = [];
  currencyOptions: SelectItem[] = [];
  selectedCurrency: any;
  styleBox = {
    color: 'var(--box-text-color)',
    background: 'var(--box-background-color)',
    'border': 'yes'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchCurrencies();
  }

  fetchCurrencies() {
    this.http.get(`${AppConfig.apiBaseUrl}/currencies`).subscribe((data: any[]) => {
      console.log("Currencies fetched:", data);
      this.currencies = data;
      this.currencyOptions = data.map(currency => ({
        label: currency.label,
        value: { ...currency, balance: 0 },
        icon: currency.icon
      }));
      this.selectedCurrency = this.currencyOptions[0]?.value;
      this.fetchBalance(this.selectedCurrency.code);
      console.log('Default Selected Currency:', this.selectedCurrency);
    }, error => {
      console.error('Error fetching currencies:', error);
    });
  }

  onCurrencyChange(event: any) {
    this.selectedCurrency = { ...event.value.value || event.value };
    this.fetchBalance(this.selectedCurrency.code);
    console.log('Currency changed:', this.selectedCurrency);
    console.log('Selected Currency Balance:', this.selectedCurrency.balance);
    console.log('Selected Currency Amounts:', this.selectedCurrency.amounts);
  }

  fetchBalance(currencyCode: string) {
    this.http.get(`${AppConfig.apiBaseUrl}/balance/${currencyCode}`).subscribe((response: any) => {
      this.selectedCurrency.balance = response.balance;
      console.log(`Balance for ${currencyCode}:`, this.selectedCurrency.balance);
    }, error => {
      console.error(`Error fetching balance for ${currencyCode}:`, error);
    });
  }

  addMoney(amount: number) {
    this.http.post(`${AppConfig.apiBaseUrl}/add_money`, {
      currency: this.selectedCurrency.code,
      amount: amount
    }).subscribe((response: any) => {
      this.selectedCurrency.balance = response['new_balance'];
      console.log('New balance:', this.selectedCurrency.balance);
    }, error => {
      console.error('Error adding money:', error);
    });
  }

  removeMoney(amount: number) {
    this.http.post(`${AppConfig.apiBaseUrl}/remove_money`, {
      currency: this.selectedCurrency.code,
      amount: amount
    }).subscribe((response: any) => {
      this.selectedCurrency.balance = response['new_balance'];
      console.log('New balance:', this.selectedCurrency.balance);
    }, error => {
      console.error('Error removing money:', error);
    });
  }
}
