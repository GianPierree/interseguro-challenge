/**
 * @file statistics.js
 * @description Domain layer — pure business rules for matrix statistics.
 *
 * This module has ZERO external dependencies.
 * It only knows about numbers and arrays — nothing about Express or HTTP.
 *
 * Single Responsibility: each function does exactly one thing.
 * Open/Closed: add new statistics by adding new functions, not modifying existing ones.
 */

"use strict";

/**
 * Flattens a 2D matrix into a 1D array.
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function flatten(matrix) {
  return matrix.flat();
}

/**
 * Returns the maximum value across all matrix elements.
 * @param {number[][]} matrix
 * @returns {number}
 */
function maxValue(matrix) {
  return Math.max(...flatten(matrix));
}

/**
 * Returns the minimum value across all matrix elements.
 * @param {number[][]} matrix
 * @returns {number}
 */
function minValue(matrix) {
  return Math.min(...flatten(matrix));
}

/**
 * Computes the arithmetic mean of all matrix elements.
 * @param {number[][]} matrix
 * @returns {number}
 */
function average(matrix) {
  const values = flatten(matrix);
  const sum = values.reduce((acc, v) => acc + v, 0);
  return parseFloat((sum / values.length).toFixed(6));
}

/**
 * Computes the sum of all matrix elements.
 * @param {number[][]} matrix
 * @returns {number}
 */
function totalSum(matrix) {
  return parseFloat(flatten(matrix).reduce((acc, v) => acc + v, 0).toFixed(6));
}

/**
 * Checks whether a matrix is diagonal.
 * A matrix is diagonal if it is square and all off-diagonal elements
 * are within the given floating-point tolerance of zero.
 *
 * @param {number[][]} matrix
 * @param {number} [tolerance=1e-8]
 * @returns {boolean}
 */
function isDiagonal(matrix, tolerance = 1e-8) {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  if (rows !== cols) return false;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i !== j && Math.abs(matrix[i][j]) > tolerance) return false;
    }
  }
  return true;
}

/**
 * Computes full statistics over the combined Q and R matrices.
 * Global stats (max, min, avg, sum) are computed over both matrices together.
 * Diagonal checks are computed per matrix individually.
 *
 * @param {number[][]} Q - Orthogonal factor
 * @param {number[][]} R - Upper-triangular factor
 * @returns {{ max: number, min: number, average: number, sum: number, isDiagonal: { Q: boolean, R: boolean } }}
 */
function computeStatistics(Q, R) {
  const combined = [...Q, ...R];
  return {
    max: maxValue(combined),
    min: minValue(combined),
    average: average(combined),
    sum: totalSum(combined),
    isDiagonal: {
      Q: isDiagonal(Q),
      R: isDiagonal(R),
    },
  };
}

module.exports = {
  flatten,
  maxValue,
  minValue,
  average,
  totalSum,
  isDiagonal,
  computeStatistics,
};
