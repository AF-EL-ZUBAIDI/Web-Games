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
      image: 'assets/mines.png'
    },
    {
      name: 'Tic Tac Toe',
      description: 'Play Tic Tac Toe against the computer!',
      route: '/games/tic-tac-toe',
      image: 'assets/tic-tac-toe.png'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigateToGame(route: string): void {
    this.router.navigate([route]);
  }
}
