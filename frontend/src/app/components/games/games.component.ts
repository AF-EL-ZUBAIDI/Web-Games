import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {

  games = [
    {
      name: 'Mines',
      description: 'Avoid the mines and win big!',
      route: '/games/mines',
      image: 'assets/mines/mines2.png'
    },
    {
      name: 'Tic Tac Toe',
      description: 'Play Tic Tac Toe against the computer!',
      route: '/games/tic-tac-toe',
      image: 'assets/tictactoe/tic_tac_toe_board.png'
    },
    {
      name: 'Dice',
      description: 'Roll the dice and win big!',
      route: '/games/dice',
      image: 'assets/dice/dice_board.png'
    },
    {
      name: 'Stop Watch',
      description: 'Stop the watch at the right time ;)',
      route: '/games/stop-watch',
      image: 'assets/stop_watch/stop_watch_board.png'
    },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigateToGame(route: string): void {
    this.router.navigate([route]);
  }
}
