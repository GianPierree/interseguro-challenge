/**
 * @file matrixRouter.js
 * @description Adapter — Express router for /api/matrix/* endpoints.
 *
 * This is the interface adapter layer: it translates HTTP requests
 * into use case inputs and use case outputs into HTTP responses.
 * No business logic lives here.
 *
 * Single Responsibility: handle HTTP concerns only (parse, validate, respond).
 * Dependency Inversion: depends on use case and validator, not on domain directly.
 */

"use strict";

const express = require("express");
const router = express.Router();

const { validateStatsRequest } = require("../validators/matrixValidator");
const computeStatsUseCase = require("../../usecases/computeStats");

/**
 * POST /api/matrix/stats
 *
 * Receives QR-factorized matrices from the Go API and returns statistics.
 *
 * @example Request
 * {
 *   "qrResult": {
 *     "Q": [[-0.169, 0.897], [-0.507, 0.276], [-0.845, -0.345]],
 *     "R": [[-5.916, -7.437], [0, 0.828]]
 *   }
 * }
 *
 * @example Response
 * {
 *   "max": 0.897,
 *   "min": -7.437,
 *   "average": -1.083,
 *   "sum": -13.0,
 *   "isDiagonal": { "Q": false, "R": false }
 * }
 */
router.post("/stats", (req, res, next) => {
  try {
    // ── 1. Validate (adapter concern) ────────────────────────────────────────
    const { valid, error } = validateStatsRequest(req.body);
    if (!valid) {
      return res.status(400).json({ error });
    }

    // ── 2. Execute use case (business concern) ───────────────────────────────
    const result = computeStatsUseCase.execute(req.body.qrResult);

    // ── 3. Respond ───────────────────────────────────────────────────────────
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
