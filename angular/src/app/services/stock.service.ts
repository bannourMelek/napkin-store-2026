import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  constructor(private http: HttpClient) {}

  getStock() {
    return this.http.get<any>(environment.apiUrl + 'stock');
  }

  updateStock(body: any) {
    return this.http.put(environment.apiUrl + 'stock', body);
  }

}
