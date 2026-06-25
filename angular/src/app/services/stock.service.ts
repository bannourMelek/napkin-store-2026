import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Stock } from '../entities/stock';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  constructor(private http: HttpClient) {}

  getStock(): Observable<{ stock: Stock }> {
    return this.http.get<{ stock: Stock }>(environment.apiUrl + 'stock');
  }

  updateStock(body: Stock): Observable<{ message: string; stock: Stock }> {
    return this.http.put<{ message: string; stock: Stock }>(environment.apiUrl + 'stock', body);
  }
}
