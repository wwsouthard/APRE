/**
 * Author: M-064
 * File: monthly-sales.service.ts
 * Description: Service for fetching monthly sales report data from the API
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** Shape of a single monthly sales record returned by the API */
export interface MonthlySalesRecord {
  month: number;
  totalSales: number;
}

@Injectable({
  providedIn: 'root'
})
export class MonthlySalesService {

  constructor(private http: HttpClient) { }

  /**
   * Fetches total sales amounts grouped by calendar month.
   * @returns Observable array of monthly sales records
   */
  getMonthlySales(): Observable<MonthlySalesRecord[]> {
    return this.http.get<MonthlySalesRecord[]>(
      `${environment.apiBaseUrl}/reports/sales/monthly-sales`
    );
  }
}
