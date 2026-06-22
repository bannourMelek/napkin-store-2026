import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

@Injectable({
  providedIn: 'root',
})
export class DataService {
  dataEmployee: Array<any> = [];
  employee: any
  constructor(private httpClient: HttpClient) { }


  getExcelFile() {
    return this.httpClient
      .get('assets/Classeur4.xlsx', { responseType: 'blob' })
  }


}
