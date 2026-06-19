/**
 * @file matrixValidator.js
 * @description Adapter — validates raw HTTP request bodies against the
 * expected shape before passing them to the use case.
 *
 * Separated from domain types (SRP): validation is an adapter concern,
 * not a domain concern. The domain only deals with valid data.
 */

"use strict";

/**
 * Validates the body of a POST /api/matrix/stats request.
 *
 * @param {unknown} body - Raw request body
 * @returns {{ valid: boolean, error?: string }}
 */
function validateStatsRequest(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const { qrResult } = body;

  if (!qrResult) {
    return { valid: false, error: "Missing required field: qrResult" };
  }

  if (!Array.isArray(qrResult.Q) || !Array.isArray(qrResult.R)) {
    return { valid: false, error: "qrResult.Q and qrResult.R must be arrays" };
  }

  if (qrResult.Q.length === 0 || qrResult.R.length === 0) {
    return { valid: false, error: "qrResult.Q and qrResult.R must not be empty" };
  }

  const qCols = qrResult.Q[0]?.length ?? 0;
  for (const row of qrResult.Q) {
    if (!Array.isArray(row) || row.some((v) => typeof v !== "number")) {
      return { valid: false, error: "qrResult.Q must contain rows of numbers" };
    }
    if (row.length !== qCols) {
      return { valid: false, error: "qrResult.Q rows must all have the same length" };
    }
  }

  const rCols = qrResult.R[0]?.length ?? 0;
  for (const row of qrResult.R) {
    if (!Array.isArray(row) || row.some((v) => typeof v !== "number")) {
      return { valid: false, error: "qrResult.R must contain rows of numbers" };
    }
    if (row.length !== rCols) {
      return { valid: false, error: "qrResult.R rows must all have the same length" };
    }
  }

  return { valid: true };
}

module.exports = { validateStatsRequest };
