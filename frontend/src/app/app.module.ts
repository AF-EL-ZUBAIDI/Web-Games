import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MinesComponent } from './components/mines/mines.component';
import { BankComponent } from './components/bank/bank.component';
import { HomeComponent } from './components/home/home.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { GameService } from './services/game.service';
import { GamesComponent } from './components/games/games.component';
import { TicTacToeComponent } from './components/tic-tac-toe/tic-tac-toe.component';
import { CommonModule } from '@angular/common';
import { DiceComponent } from './components/dice/dice.component';
import { StopWatchComponent } from './components/stop-watch/stop-watch.component';

@NgModule({
  declarations: [
    AppComponent,
    MinesComponent,
    BankComponent,
    HomeComponent,
    NavigationComponent,
    GamesComponent,
    TicTacToeComponent,
    DiceComponent,
    StopWatchComponent
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MenubarModule,
    ButtonModule,
    DropdownModule,
    CardModule,
    InputTextModule,
    ToastModule,
    CommonModule
  ],
  providers: [GameService, provideHttpClient(withInterceptorsFromDi()), MessageService]
})
export class AppModule { }
