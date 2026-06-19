/**
 * @file statisticsService.js
 * @description Pure statistics functions over 2D number matrices.
 *
 * All functions are side-effect-free and independently testable.
 */

/**
 * Flattens a 2D matrix into a 1D array of numbers.
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function flatten(matrix) {
  return matrix.flat();
}

/**
 * Returns the maximum value across all elements of a matrix.
 * @param {number[][]} matrix
 * @returns {number}
 */
function maxValue(matrix) {
  return Math.max(...flatten(matrix));
}

/**
 * Returns the minimum value across all elements of a matrix.
 * @param {number[][]} matrix
 * @returns {number}
 */
function minValue(matrix) {
  return Math.min(...flatten(matrix));
}

/**
 * Computes the arithmetic mean of all elements in a matrix.
 * @param {number[][]} matrix
 * @returns {number}
 */
function average(matrix) {
  const values = flatten(matrix);
  const sum = values.reduce((acc, v) => acc + v, 0);
  return parseFloat((sum / values.length).toFixed(6));
}

/**
 * Computes the sum of all elements in a matrix.
 * @param {number[][]} matrix
 * @returns {number}
 */
function totalSum(matrix) {
  return flatten(matrix).reduce((acc, v) => acc + v, 0);
}

/**
 * Checks whether a matrix is diagonal.
 * A square matrix is diagonal if all off-diagonal elements are (near) zero.
 * Non-square matrices are never diagonal.
 *
 * @param {number[][]} matrix
 * @param {number} [tolerance=1e-8]  Floating-point tolerance for zero comparison
 * @returns {boolean}
 */
function isDiagonal(matrix, tolerance = 1e-8) {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  if (rows !== cols) return false; // must be square

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i !== j && Math.abs(matrix[i][j]) > tolerance) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Computes full statistics over both Q and R matrices combined,
 * plus individual diagonal checks for each.
 *
 * @param {number[][]} Q
 * @param {number[][]} R
 * @returns {import('../specs/matrixSpec').StatsResponse}
 */
function computeStatistics(Q, R) {
  // Combine both matrices for global statistics
  const combined = [...Q, ...R];

  return {
    max: maxValue(combined),
    min: minValue(combined),
    average: average(combined),
    sum: parseFloat(totalSum(combined).toFixed(6)),
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
