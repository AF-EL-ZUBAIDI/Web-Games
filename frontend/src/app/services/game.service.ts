import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  makeMove(row: number, col: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/move`, { row, col });
  }
}
