/**
 * @file matrixSpec.js
 * @description SDD Spec — defines the data contracts for the matrix statistics workflow.
 *
 * In Spec-Driven Development, specs act as the source of truth for what
 * data enters and exits each agent. Agents are built to satisfy specs,
 * and tests validate against specs.
 */

/**
 * @typedef {Object} QRResult
 * @property {number[][]} Q  - Orthogonal factor matrix
 * @property {number[][]} R  - Upper-triangular factor matrix
 * @property {number} originalRows
 * @property {number} originalCols
 */

/**
 * @typedef {Object} StatsRequest
 * @property {QRResult} qrResult - Matrices received from Go API
 */

/**
 * @typedef {Object} DiagonalCheck
 * @property {boolean} Q - Whether Q is diagonal
 * @property {boolean} R - Whether R is diagonal
 */

/**
 * @typedef {Object} StatsResponse
 * @property {number} max          - Maximum value across both matrices
 * @property {number} min          - Minimum value across both matrices
 * @property {number} average      - Average of all values
 * @property {number} sum          - Sum of all values
 * @property {DiagonalCheck} isDiagonal - Diagonal check per matrix
 */

/**
 * Validates that a StatsRequest has the required shape.
 * @param {unknown} body
 * @returns {{ valid: boolean, error?: string }}
 */
function validateStatsRequest(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const { qrResult } = body;
  if (!qrResult) {
    return { valid: false, error: "Missing field: qrResult" };
  }
  if (!Array.isArray(qrResult.Q) || !Array.isArray(qrResult.R)) {
    return { valid: false, error: "qrResult.Q and qrResult.R must be arrays" };
  }
  if (qrResult.Q.length === 0 || qrResult.R.length === 0) {
    return { valid: false, error: "Q and R matrices must not be empty" };
  }
  return { valid: true };
}

module.exports = { validateStatsRequest };
