import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme = new BehaviorSubject<boolean>(false);
  themeChanged = this.darkTheme.asObservable();

  toggleTheme() {
    const isDark = !this.darkTheme.value;
    this.darkTheme.next(isDark);
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  isDarkTheme(): boolean {
    return this.darkTheme.value;
  }
}
