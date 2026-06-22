/**
 * Author: M-085
 * File: performance-by-month.component.ts
 * Description: Agent performance by month report component displaying average
 * performance metrics per agent in a sortable table for the selected month.
 */

import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '../../../shared/table/table.component';

/** Shape of a single agent performance record returned by the API */
interface AgentPerformanceRecord {
  agent: string;
  averagePerformance: number;
}

@Component({
  selector: 'app-performance-by-month',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent],
  template: `
    <h1>Agent Performance by Month</h1>
    <div class="region-container">
      <form class="form" [formGroup]="monthForm" (ngSubmit)="onSubmit()">

        @if (errorMessage) {
          <div class="message message--error">{{ errorMessage }}</div>
        }

        <div class="form__group">
          <label class="label" for="month">Month</label>
          <select class="select" formControlName="month" id="month" name="month">
            @for (month of months; track month.value) {
              <option value="{{ month.value }}">{{ month.name }}</option>
            }
          </select>
        </div>
        <div class="form__actions">
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>

      @if (performanceData.length > 0) {
        <div class="card chart-card">
          <app-table
            [title]="'Agent Performance by Month'"
            [data]="performanceData"
            [headers]="['Agent', 'Average Performance']"
            [sortableColumns]="['Agent', 'Average Performance']"
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
    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
      padding: 10px;
    }

    app-table {
      padding: 50px;
    }
  `
})
export class PerformanceByMonthComponent {
  performanceData: Record<string, string | number>[] = [];
  errorMessage = '';

  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  monthForm = this.fb.group({
    month: [null, Validators.compose([Validators.required])]
  });

  constructor(private http: HttpClient, private fb: FormBuilder) { }

  /** Validates the form and fetches agent performance data for the selected month */
  onSubmit(): void {
    if (this.monthForm.invalid) {
      this.errorMessage = 'Please select a month';
      this.performanceData = [];
      return;
    }

    const month = this.monthForm.controls['month'].value;
    this.performanceData = [];
    this.errorMessage = '';

    this.http.get<AgentPerformanceRecord[]>(
      `${environment.apiBaseUrl}/reports/agent-performance/performance-by-month?month=${month}`
    ).subscribe({
      next: (data: AgentPerformanceRecord[]) => {
        if (data.length === 0) {
          const selectedMonth = this.months.find(m => m.value === Number(month));
          this.errorMessage = `No agent performance data found for ${selectedMonth?.name ?? month}`;
          return;
        }

        // Map API records to table row format expected by TableComponent
        this.performanceData = data.map(record => ({
          'Agent': record.agent,
          'Average Performance': record.averagePerformance
        }));
      },
      error: (err) => {
        console.error('Error fetching agent performance by month data:', err);
        this.errorMessage = 'Error loading agent performance data';
      }
    });
  }
}
