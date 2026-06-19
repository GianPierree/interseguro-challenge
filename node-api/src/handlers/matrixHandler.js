/**
 * @file matrixHandler.js
 * @description Express router for the /api/matrix/* endpoints.
 *
 * The handler layer is intentionally thin:
 *  - Parse & validate the request (using the spec)
 *  - Delegate to the agent
 *  - Serialize the response
 */

const express = require("express");
const router = express.Router();

const { validateStatsRequest } = require("../specs/matrixSpec");
const { runStatsAgent } = require("../agents/statsAgent");

/**
 * POST /api/matrix/stats
 *
 * Receives QR-factorized matrices from the Go API and returns statistics.
 *
 * @example Request body:
 * {
 *   "qrResult": {
 *     "Q": [[-0.169..., ...], ...],
 *     "R": [[-5.916..., ...], ...],
 *     "originalRows": 3,
 *     "originalCols": 2
 *   }
 * }
 *
 * @example Response:
 * {
 *   "max": 0.912,
 *   "min": -5.916,
 *   "average": -0.47,
 *   "sum": -8.46,
 *   "isDiagonal": { "Q": false, "R": false }
 * }
 */
router.post("/stats", (req, res, next) => {
  try {
    // ── 1. Validate against spec ────────────────────────────────────────────
    const { valid, error } = validateStatsRequest(req.body);
    if (!valid) {
      return res.status(400).json({ error });
    }

    // ── 2. Delegate to agent ────────────────────────────────────────────────
    const statistics = runStatsAgent(req.body.qrResult);

    // ── 3. Respond ──────────────────────────────────────────────────────────
    return res.json(statistics);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
