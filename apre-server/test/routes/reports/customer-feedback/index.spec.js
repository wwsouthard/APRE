/*
 * Author: Will Southard
 * Course: WEB 450 - Mastering the MEAN Stack
 * Assignment: Week 4 Major Development Task
 * Task: M-106 - Customer Feedback By Year Report
 * Date: June 28, 2026
 *
 * Description:
 * This file was updated to support the customer feedback by year report API.
 */

// Require the modules
const request = require('supertest');
const app = require('../../../../src/app');
const { mongo } = require('../../../../src/utils/mongo');

jest.mock('../../../../src/utils/mongo');

// Test the customer feedback API
describe('Apre Customer Feedback API', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the channel-rating-by-month endpoint
  it('should fetch average customer feedback ratings by channel for a specified month', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              channels: ['Email', 'Phone'],
              ratingAvg: [4.5, 3.8]
            }
          ])
        })
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/customer-feedback/channel-rating-by-month?month=1'); // Send a GET request to the channel-rating-by-month endpoint

    // Expect a 200 status code
    expect(response.status).toBe(200);

    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        channels: ['Email', 'Phone'],
        ratingAvg: [4.5, 3.8]
      }
    ]);
  });

  // Test the channel-rating-by-month endpoint with missing parameters
  it('should return 400 if the month parameter is missing', async () => {
    const response = await request(app).get('/api/reports/customer-feedback/channel-rating-by-month'); // Send a GET request to the channel-rating-by-month endpoint with missing month
    expect(response.status).toBe(400); // Expect a 400 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'month and channel are required',
      status: 400,
      type: 'error'
    });
  });

  // Test the channel-rating-by-month endpoint with an invalid month
  it('should return 404 for an invalid endpoint', async () => {
    // Send a GET request to an invalid endpoint
    const response = await request(app).get('/api/reports/customer-feedback/invalid-endpoint');
    expect(response.status).toBe(404); // Expect a 404 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });
});

// M-106: Test the customer feedback by year report API
describe('Apre Customer Feedback API - Feedback By Year', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Verify the endpoint returns monthly average ratings for a valid year
  it('should return customer feedback data successfully for a valid year', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { month: 1, averageRating: 4.5 },
            { month: 2, averageRating: 3.8 }
          ])
        })
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/customer-feedback/feedback-by-year?year=2024');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toEqual([
      { month: 1, averageRating: 4.5 },
      { month: 2, averageRating: 3.8 }
    ]);
    expect(response.body[0]).toHaveProperty('month');
    expect(response.body[0]).toHaveProperty('averageRating');
  });

  // Verify the endpoint returns an empty array when no records match the year
  it('should return an empty array when no customer feedback records exist for the year', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/customer-feedback/feedback-by-year?year=1999');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toEqual([]);
  });

  // Verify missing year query parameter returns a 400 validation error
  it('should return 400 when the year parameter is missing', async () => {
    const response = await request(app).get('/api/reports/customer-feedback/feedback-by-year');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'year is required',
      status: 400,
      type: 'error'
    });
  });

  // Verify non-numeric or out-of-range year values return a 400 validation error
  it('should return 400 when the year parameter is invalid', async () => {
    const response = await request(app).get('/api/reports/customer-feedback/feedback-by-year?year=abcd');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'year must be a valid four-digit year',
      status: 400,
      type: 'error'
    });
  });
});
