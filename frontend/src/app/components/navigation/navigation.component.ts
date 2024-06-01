import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  items: MenuItem[];
  styleBar = {
    color: 'var(--nav-text-color)',
    background: 'var(--nav-bar-background-color)',
    'border': 'yes',
  };

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.items = [
      {label: 'Home', routerLink: '/'},
      {label: 'Games', routerLink: '/games'},
      {label: 'Bank', routerLink: '/bank'}
    ];
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }
}
