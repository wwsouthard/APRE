/**
 * Author: M-064
 * File: monthly-sales.component.spec.ts
 * Description: Unit tests for the monthly sales report component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MonthlySalesComponent } from './monthly-sales.component';
import { MonthlySalesService } from './monthly-sales.service';
import { environment } from '../../../../environments/environment';

describe('MonthlySalesComponent', () => {
  let component: MonthlySalesComponent;
  let fixture: ComponentFixture<MonthlySalesComponent>;
  let httpMock: HttpTestingController;
  let monthlySalesService: MonthlySalesService;

  const apiUrl = `${environment.apiBaseUrl}/reports/sales/monthly-sales`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MonthlySalesComponent],
      providers: [MonthlySalesService]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    monthlySalesService = TestBed.inject(MonthlySalesService);

    fixture = TestBed.createComponent(MonthlySalesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Verify the component is created successfully
  it('should create', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush([]);
    expect(component).toBeTruthy();
  });

  // Verify the monthly sales service is called when the component initializes
  it('should call the monthly sales service on initialization', () => {
    spyOn(monthlySalesService, 'getMonthlySales').and.callThrough();
    fixture.detectChanges();
    expect(monthlySalesService.getMonthlySales).toHaveBeenCalled();
    httpMock.expectOne(apiUrl).flush([]);
  });

  // Verify API data is mapped and displayed in the table
  it('should display monthly sales data correctly', () => {
    fixture.detectChanges();

    const mockData = [
      { month: 1, totalSales: 10000 },
      { month: 2, totalSales: 15000 }
    ];

    httpMock.expectOne(apiUrl).flush(mockData);
    fixture.detectChanges();

    expect(component.salesData.length).toBe(2);
    expect(component.salesData[0]['Month']).toBe('January');
    expect(component.salesData[0]['Total Sales']).toBe(10000);
    expect(component.salesData[1]['Month']).toBe('February');
    expect(component.salesData[1]['Total Sales']).toBe(15000);

    const tableElement = fixture.nativeElement.querySelector('app-table');
    expect(tableElement).toBeTruthy();
  });
});
