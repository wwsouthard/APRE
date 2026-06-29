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

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * @description
 *
 * GET /channel-rating-by-month
 *
 * Fetches average customer feedback ratings by channel for a specified month.
 *
 * Example:
 * fetch('/channel-rating-by-month?month=1')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/channel-rating-by-month', (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      return next(createError(400, 'month and channel are required'));
    }

    mongo (async db => {
      const data = await db.collection('customerFeedback').aggregate([
        {
          $addFields: {
            date: { $toDate: '$date' }
          }
        },
        {
          $group: {
            _id: {
              channel: "$channel",
              month: { $month: "$date" },
            },
            ratingAvg: { $avg: '$rating'}
          }
        },
        {
          $match: {
            '_id.month': Number(month)
          }
        },
        {
          $group: {
            _id: '$_id.channel',
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channel: '$_id',
            ratingAvg: 1
          }
        },
        {
          $group: {
            _id: null,
            channels: { $push: '$channel' },
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channels: 1,
            ratingAvg: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);

  } catch (err) {
    console.error('Error in /rating-by-date-range-and-channel', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /feedback-by-year
 *
 * Fetches customer feedback data for a specified calendar year.
 * Returns average ratings grouped by month for records whose date falls
 * within the requested year. Each row is suitable for display in an
 * Angular TableComponent.
 *
 * Example:
 * fetch('/feedback-by-year?year=2024')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/feedback-by-year', (req, res, next) => {
  try {
    const { year } = req.query;

    // Require the year query parameter before querying MongoDB
    if (!year) {
      return next(createError(400, 'year is required'));
    }

    const yearNumber = Number(year);

    // Reject non-numeric or non-four-digit year values (e.g. "abcd" or "24")
    if (!Number.isInteger(yearNumber) || yearNumber < 1000 || yearNumber > 9999) {
      return next(createError(400, 'year must be a valid four-digit year'));
    }

    mongo(async db => {
      // Aggregate customerFeedback records for the selected year by calendar month
      const feedbackByYear = await db.collection('customerFeedback').aggregate([
        {
          // Normalize stored date values so $year and $month can be extracted
          $addFields: {
            date: { $toDate: '$date' }
          }
        },
        {
          // Limit results to feedback records that fall within the requested year
          $match: {
            $expr: {
              $eq: [{ $year: '$date' }, yearNumber]
            }
          }
        },
        {
          // Average customer ratings for each month in the filtered year
          $group: {
            _id: { $month: '$date' },
            averageRating: { $avg: '$rating' }
          }
        },
        {
          // Shape output records with month and averageRating fields
          $project: {
            _id: 0,
            month: '$_id',
            averageRating: 1
          }
        },
        {
          // Return months in ascending order (January through December)
          $sort: { month: 1 }
        }
      ]).toArray();

      res.send(feedbackByYear);
    }, next);
  } catch (err) {
    console.error('Error in /feedback-by-year', err);
    next(err);
  }
});

module.exports = router;
