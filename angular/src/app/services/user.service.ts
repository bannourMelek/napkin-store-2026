import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  signin(badge_id: string) {
    const params = new HttpParams().set("badge_id", badge_id);
    return this.http.get<any>(environment.apiUrl + 'user', { params });
  }

  signup(body: any) {
    return this.http.post(environment.apiUrl + 'user', body);
  }

  update(body: any) {
    return this.http.put(environment.apiUrl + 'user', body);
  }
}
