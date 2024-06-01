import { Component, OnInit } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Chill Pearl';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Apply the initial theme
    document.body.setAttribute('data-theme', this.themeService.isDarkTheme() ? 'dark' : 'light');
  }
}
