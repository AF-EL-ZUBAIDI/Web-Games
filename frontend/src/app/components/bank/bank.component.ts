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
  balances: { [key: string]: number } = {};
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
      //console.log("Currencies fetched:", data);
      this.currencies = data;
      this.currencyOptions = data.map(currency => ({
        label: currency.code,
        value: { ...currency, balance: 0 },
        icon: currency.icon
      }));
      this.currencyOptions.forEach(currency => {
        this.fetchBalance(currency.value.code);
      });
      if (this.currencyOptions.length > 0) {
        this.selectedCurrency = this.currencyOptions[0].value;
        this.fetchBalance(this.selectedCurrency.code);
      }
    }, error => {
      console.error('Error fetching currencies:', error);
    });
  }

  onCurrencyChange(event: any) {
    this.selectedCurrency = { ...event.value.value || event.value };
    this.fetchBalance(this.selectedCurrency.code);
  }

  fetchBalance(currencyCode: string) {
    this.http.get(`${AppConfig.apiBaseUrl}/balance/${currencyCode}`).subscribe((response: any) => {
      this.balances[currencyCode] = response.balance;
      if (this.selectedCurrency.code === currencyCode) {
        this.selectedCurrency.balance = response.balance;
      }
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
      this.balances[this.selectedCurrency.code] = response['new_balance'];
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
      this.balances[this.selectedCurrency.code] = response['new_balance'];
    }, error => {
      console.error('Error removing money:', error);
    });
  }

  getCurrencyPlaceholder() {
    return this.selectedCurrency ? `${this.selectedCurrency.code}` : 'Select a Currency';
  }

}
