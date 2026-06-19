/**
 * @file statsAgent.js
 * @description SDD Agent — orchestrates the statistics computation workflow.
 *
 * An agent in SDD:
 *  1. Accepts a validated, spec-conformant input
 *  2. Delegates work to one or more services
 *  3. Returns a spec-conformant output
 *
 * Agents know nothing about HTTP — they are pure workflow coordinators.
 */

const { computeStatistics } = require("../services/statisticsService");

/**
 * Runs the statistics pipeline over Q and R matrices.
 *
 * @param {{ Q: number[][], R: number[][] }} qrResult
 * @returns {import('../specs/matrixSpec').StatsResponse}
 */
function runStatsAgent(qrResult) {
  const { Q, R } = qrResult;
  return computeStatistics(Q, R);
}

module.exports = { runStatsAgent };
