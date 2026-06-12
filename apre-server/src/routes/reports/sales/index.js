/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre sales report API for the sales reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');

const router = express.Router();

/**
 * @description
 *
 * GET /regions
 *
 * Fetches a list of distinct sales regions.
 *
 * Example:
 * fetch('/regions')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions', (req, res, next) => {
  try {
    mongo (async db => {
      const regions = await db.collection('sales').distinct('region');
      res.send(regions);
    }, next);
  } catch (err) {
    console.error('Error getting regions: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /regions/:region
 *
 * Fetches sales data for a specific region, grouped by salesperson.
 *
 * Example:
 * fetch('/regions/north')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions/:region', (req, res, next) => {
  try {
    mongo (async db => {
      const salesReportByRegion = await db.collection('sales').aggregate([
        { $match: { region: req.params.region } },
        {
          $group: {
            _id: '$salesperson',
            totalSales: { $sum: '$amount'}
          }
        },
        {
          $project: {
            _id: 0,
            salesperson: '$_id',
            totalSales: 1
          }
        },
        {
          $sort: { salesperson: 1 }
        }
      ]).toArray();
      res.send(salesReportByRegion);
    }, next);
  } catch (err) {
    console.error('Error getting sales data for region: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /monthly-sales
 *
 * Fetches total sales amounts grouped by calendar month across all sales records.
 * Each record in the response array contains the month number (1-12) and totalSales.
 *
 * Example:
 * fetch('/monthly-sales')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/monthly-sales', (req, res, next) => {
  try {
    mongo(async db => {
      // Aggregate sales from the sales collection, grouping totals by month
      const monthlySales = await db.collection('sales').aggregate([
        {
          // Convert stored date values to Date objects for month extraction
          $addFields: {
            date: { $toDate: '$date' }
          }
        },
        {
          // Sum sale amounts for each calendar month
          $group: {
            _id: { $month: '$date' },
            totalSales: { $sum: '$amount' }
          }
        },
        {
          // Shape output records with month and totalSales fields
          $project: {
            _id: 0,
            month: '$_id',
            totalSales: 1
          }
        },
        {
          // Return months in ascending order (January through December)
          $sort: { month: 1 }
        }
      ]).toArray();

      res.send(monthlySales);
    }, next);
  } catch (err) {
    console.error('Error getting monthly sales data: ', err);
    next(err);
  }
});

module.exports = router;