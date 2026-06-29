/*
 * Author: Will Southard
 * Course: WEB 450 - Mastering the MEAN Stack
 * Assignment: Week 4 Major Development Task
 * Task: M-106 - Customer Feedback By Year Report
 * Date: June 28, 2026
 *
 * Description:
 * This file was updated to support the customer feedback by year report component.
 */

import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '../../../shared/table/table.component';

/** Shape of a single customer feedback record returned by the feedback-by-year API */
interface FeedbackByYearRecord {
  month: number;
  averageRating: number;
}

@Component({
  selector: 'app-feedback-by-year',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent],
  template: `
    <h1>Customer Feedback by Year</h1>
    <div class="region-container">
      <form class="form" [formGroup]="yearForm" (ngSubmit)="onSubmit()">

        @if (errorMessage) {
          <div class="message message--error">{{ errorMessage }}</div>
        }

        <div class="form__group">
          <label class="label" for="year">Year</label>
          <input
            class="input"
            type="number"
            formControlName="year"
            id="year"
            name="year"
            min="1000"
            max="9999"
            placeholder="Enter a four-digit year (e.g. 2024)" />
        </div>
        <div class="form__actions">
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>

      @if (feedbackData.length > 0) {
        <div class="card chart-card">
          <app-table
            [title]="'Customer Feedback by Year'"
            [data]="feedbackData"
            [headers]="['Month', 'Average Rating']"
            [sortableColumns]="['Month', 'Average Rating']"
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
export class FeedbackByYearComponent {
  feedbackData: Record<string, string | number>[] = [];
  errorMessage = '';

  // Month number to display name mapping for table rows
  private readonly monthNames: Record<number, string> = {
    1: 'January', 2: 'February', 3: 'March', 4: 'April',
    5: 'May', 6: 'June', 7: 'July', 8: 'August',
    9: 'September', 10: 'October', 11: 'November', 12: 'December'
  };

  yearForm = this.fb.group({
    year: [null, Validators.compose([
      Validators.required,
      Validators.min(1000),
      Validators.max(9999)
    ])]
  });

  constructor(private http: HttpClient, private fb: FormBuilder) { }

  /** Validates the form and fetches customer feedback data for the selected year */
  onSubmit(): void {
    if (this.yearForm.invalid) {
      this.errorMessage = 'Please enter a valid four-digit year';
      this.feedbackData = [];
      return;
    }

    const year = this.yearForm.controls['year'].value;
    this.feedbackData = [];
    this.errorMessage = '';

    this.http.get<FeedbackByYearRecord[]>(
      `${environment.apiBaseUrl}/reports/customer-feedback/feedback-by-year?year=${year}`
    ).subscribe({
      next: (data: FeedbackByYearRecord[]) => {
        if (data.length === 0) {
          this.errorMessage = `No customer feedback data found for ${year}`;
          return;
        }

        // Map API records to table row format expected by TableComponent
        this.feedbackData = data.map(record => ({
          'Month': this.monthNames[record.month] ?? record.month,
          'Average Rating': record.averageRating
        }));
      },
      error: (err) => {
        console.error('Error fetching customer feedback by year data:', err);
        this.errorMessage = 'Error loading customer feedback data';
      }
    });
  }
}
