/**
 * Author: M-064
 * File: monthly-sales.component.ts
 * Description: Monthly sales report component displaying sales totals by month in a table
 */

import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../../../shared/table/table.component';
import { MonthlySalesService, MonthlySalesRecord } from './monthly-sales.service';

@Component({
  selector: 'app-monthly-sales',
  standalone: true,
  imports: [TableComponent],
  template: `
    <h1>Monthly Sales</h1>
    <div class="region-container">

      @if (errorMessage) {
        <div class="message message--error">{{ errorMessage }}</div>
      }

      @if (salesData.length > 0) {
        <div class="card chart-card">
          <app-table
            [title]="'Monthly Sales'"
            [data]="salesData"
            [headers]="['Month', 'Total Sales']"
            [sortableColumns]="['Month', 'Total Sales']"
            [headerBackground]="'secondary'">
          </app-table>
        </div>
      }
    </div>
  `,
  styles: `
    .region-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .chart-card {
      width: 50%;
      margin: 20px 0;
      padding: 10px;
    }

    app-table {
      padding: 50px;
    }
  `
})
export class MonthlySalesComponent implements OnInit {
  salesData: Record<string, string | number>[] = [];
  errorMessage = '';

  // Month number to display name mapping for table rows
  private readonly monthNames: Record<number, string> = {
    1: 'January', 2: 'February', 3: 'March', 4: 'April',
    5: 'May', 6: 'June', 7: 'July', 8: 'August',
    9: 'September', 10: 'October', 11: 'November', 12: 'December'
  };

  constructor(private monthlySalesService: MonthlySalesService) { }

  ngOnInit(): void {
    this.loadMonthlySales();
  }

  /** Loads monthly sales data from the API via MonthlySalesService */
  loadMonthlySales(): void {
    this.monthlySalesService.getMonthlySales().subscribe({
      next: (data: MonthlySalesRecord[]) => {
        if (data.length === 0) {
          this.errorMessage = 'No monthly sales data found';
          this.salesData = [];
          return;
        }

        // Map API records to table row format expected by TableComponent
        this.salesData = data.map(record => ({
          'Month': this.monthNames[record.month] ?? record.month,
          'Total Sales': record.totalSales
        }));

        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error fetching monthly sales data:', err);
        this.errorMessage = 'Error loading monthly sales data';
      }
    });
  }
}
