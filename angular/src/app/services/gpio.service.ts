import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GpioService {

  constructor(private http: HttpClient) { }

  turnOnOff(body: any) {
    return this.http.post(environment.apiUrl + 'gpio', body);
  }

  cleanup() {
    return this.http.delete<any>(environment.apiUrl + 'gpio');
  }

  enableButton(pinButton: number) {
    const params = new HttpParams().set("pinButton", pinButton);
    return this.http.get<any>(environment.apiUrl + 'turn-on-button', { params });
  }

  disableButton(pinButton: number) {
    const params = new HttpParams().set("pinButton", pinButton);
    return this.http.get<any>(environment.apiUrl + 'turn-off-button', { params });
  }
}

