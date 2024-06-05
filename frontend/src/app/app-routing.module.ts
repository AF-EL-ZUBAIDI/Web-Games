import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BankComponent } from './components/bank/bank.component';
import { HomeComponent } from './components/home/home.component';
import { MinesComponent } from './components/mines/mines.component';
import { GamesComponent } from './components/games/games.component'; 
import { TicTacToeComponent } from './components/tic-tac-toe/tic-tac-toe.component';
import { DiceComponent } from './components/dice/dice.component';
import { StopWatchComponent } from './components/stop-watch/stop-watch.component';
import { WarComponent } from './components/war/war.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'games', component: GamesComponent }, 
  { path: 'games/mines', component: MinesComponent },
  { path: 'bank', component: BankComponent },
  { path: 'games/tic-tac-toe', component: TicTacToeComponent },
  { path: 'games/dice', component: DiceComponent },
  { path: 'games/stop-watch', component: StopWatchComponent },
  { path: 'games/war', component: WarComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
