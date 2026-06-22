/**
 * Author: M-085
 * File: performance-by-month.component.spec.ts
 * Description: Unit tests for the agent performance by month report component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PerformanceByMonthComponent } from './performance-by-month.component';
import { environment } from '../../../../environments/environment';

describe('PerformanceByMonthComponent', () => {
  let component: PerformanceByMonthComponent;
  let fixture: ComponentFixture<PerformanceByMonthComponent>;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  const apiUrl = `${environment.apiBaseUrl}/reports/agent-performance/performance-by-month?month=1`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, PerformanceByMonthComponent]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

    fixture = TestBed.createComponent(PerformanceByMonthComponent);
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

  // Verify the API is called when the user submits the month filter form
  it('should call the agent performance API/service when the component loads or report is requested', () => {
    spyOn(httpClient, 'get').and.callThrough();

    component.monthForm.patchValue({ month: 1 as any });
    component.onSubmit();

    expect(httpClient.get).toHaveBeenCalledWith(apiUrl);
    httpMock.expectOne(apiUrl).flush([]);
  });

  // Verify API data is mapped and displayed in the table
  it('should display returned agent performance data in the table', () => {
    component.monthForm.patchValue({ month: 1 as any });
    component.onSubmit();

    const mockData = [
      { agent: 'Agent A', averagePerformance: 4.5 },
      { agent: 'Agent B', averagePerformance: 3.8 }
    ];

    httpMock.expectOne(apiUrl).flush(mockData);
    fixture.detectChanges();

    expect(component.performanceData.length).toBe(2);
    expect(component.performanceData[0]['Agent']).toBe('Agent A');
    expect(component.performanceData[0]['Average Performance']).toBe(4.5);
    expect(component.performanceData[1]['Agent']).toBe('Agent B');
    expect(component.performanceData[1]['Average Performance']).toBe(3.8);

    const tableElement = fixture.nativeElement.querySelector('app-table');
    expect(tableElement).toBeTruthy();
  });
});
