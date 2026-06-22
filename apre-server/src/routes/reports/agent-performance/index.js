/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre agent performance API for the agent performance reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * @description
 *
 * GET /call-duration-by-date-range
 *
 * Fetches call duration data for agents within a specified date range.
 *
 * Example:
 * fetch('/call-duration-by-date-range?startDate=2023-01-01&endDate=2023-01-31')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/call-duration-by-date-range', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, 'Start date and end date are required'));
    }

    console.log('Fetching call duration report for date range:', startDate, endDate);

    mongo(async db => {
      const data = await db.collection('agentPerformance').aggregate([
        {
          $match: {
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'agentId',
            foreignField: 'agentId',
            as: 'agentDetails'
          }
        },
        {
          $unwind: '$agentDetails'
        },
        {
          $group: {
            _id: '$agentDetails.name',
            totalCallDuration: { $sum: '$callDuration' }
          }
        },
        {
          $project: {
            _id: 0,
            agent: '$_id',
            callDuration: '$totalCallDuration'
          }
        },
        {
          $group: {
            _id: null,
            agents: { $push: '$agent' },
            callDurations: { $push: '$callDuration' }
          }
        },
        {
          $project: {
            _id: 0,
            agents: 1,
            callDurations: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /call-duration-by-date-range', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /performance-by-month
 *
 * Fetches average agent performance metrics for a specified calendar month.
 * Returns a row array suitable for display in an Angular TableComponent, with
 * each record containing the agent name and average performance score.
 *
 * Example:
 * fetch('/performance-by-month?month=1')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/performance-by-month', (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      return next(createError(400, 'month is required'));
    }

    console.log('Fetching agent performance report for month:', month);

    mongo(async db => {
      // Aggregate agentPerformance records for the selected month and join agent names
      const agentPerformanceByMonth = await db.collection('agentPerformance').aggregate([
        {
          // Normalize stored date values so $month can extract the calendar month
          $addFields: {
            date: { $toDate: '$date' }
          }
        },
        {
          // Limit results to records that fall within the requested month (1-12)
          $match: {
            $expr: {
              $eq: [{ $month: '$date' }, Number(month)]
            }
          }
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'agentId',
            foreignField: 'agentId',
            as: 'agentInfo'
          }
        },
        {
          $unwind: '$agentInfo'
        },
        {
          // Average performance metric values per agent for the filtered month
          $group: {
            _id: '$agentInfo.name',
            averagePerformance: {
              $avg: {
                $avg: '$performanceMetrics.value'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            agent: '$_id',
            averagePerformance: 1
          }
        },
        {
          $sort: { agent: 1 }
        }
      ]).toArray();

      res.send(agentPerformanceByMonth);
    }, next);
  } catch (err) {
    console.error('Error in /performance-by-month', err);
    next(err);
  }
});

module.exports = router;