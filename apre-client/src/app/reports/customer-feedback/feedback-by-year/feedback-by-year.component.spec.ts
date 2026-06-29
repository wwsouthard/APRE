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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FeedbackByYearComponent } from './feedback-by-year.component';
import { environment } from '../../../../environments/environment';

describe('FeedbackByYearComponent', () => {
  let component: FeedbackByYearComponent;
  let fixture: ComponentFixture<FeedbackByYearComponent>;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  const apiUrl = `${environment.apiBaseUrl}/reports/customer-feedback/feedback-by-year?year=2024`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FeedbackByYearComponent]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

    fixture = TestBed.createComponent(FeedbackByYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Verify the component is created successfully
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Verify the API is called when the user submits the year filter form
  it('should call the customer feedback by year API when a year is submitted', () => {
    spyOn(httpClient, 'get').and.callThrough();

    component.yearForm.patchValue({ year: 2024 as any });
    component.onSubmit();

    expect(httpClient.get).toHaveBeenCalledWith(apiUrl);
    httpMock.expectOne(apiUrl).flush([]);
  });

  // Verify API data is mapped and displayed in the table
  it('should display returned customer feedback data in the table', () => {
    component.yearForm.patchValue({ year: 2024 as any });
    component.onSubmit();

    const mockData = [
      { month: 1, averageRating: 4.5 },
      { month: 2, averageRating: 3.8 }
    ];

    httpMock.expectOne(apiUrl).flush(mockData);
    fixture.detectChanges();

    expect(component.feedbackData.length).toBe(2);
    expect(component.feedbackData[0]['Month']).toBe('January');
    expect(component.feedbackData[0]['Average Rating']).toBe(4.5);
    expect(component.feedbackData[1]['Month']).toBe('February');
    expect(component.feedbackData[1]['Average Rating']).toBe(3.8);

    const tableElement = fixture.nativeElement.querySelector('app-table');
    expect(tableElement).toBeTruthy();
  });

  // Verify empty API responses show a user-facing message and no table data
  it('should display an empty state message when no feedback data is returned', () => {
    component.yearForm.patchValue({ year: 2024 as any });
    component.onSubmit();

    httpMock.expectOne(apiUrl).flush([]);
    fixture.detectChanges();

    expect(component.feedbackData.length).toBe(0);
    expect(component.errorMessage).toBe('No customer feedback data found for 2024');

    const tableElement = fixture.nativeElement.querySelector('app-table');
    expect(tableElement).toBeFalsy();
  });

  // Verify invalid form input shows a validation message before calling the API
  it('should display a validation message when the year is not provided', () => {
    component.yearForm.patchValue({ year: null });
    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Please enter a valid four-digit year');
    expect(component.feedbackData.length).toBe(0);
    httpMock.expectNone(apiUrl);
  });
});
