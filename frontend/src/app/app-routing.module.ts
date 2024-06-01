import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BankComponent } from './components/bank/bank.component';
import { HomeComponent } from './components/home/home.component';
import { MinesComponent } from './components/mines/mines.component';
import { GamesComponent } from './components/games/games.component'; 
import { TicTacToeComponent } from './components/tic-tac-toe/tic-tac-toe.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'games', component: GamesComponent }, 
  { path: 'games/mines', component: MinesComponent },
  { path: 'bank', component: BankComponent },
  { path: 'games/tic-tac-toe', component: TicTacToeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }