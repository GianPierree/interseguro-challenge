/**
 * @file computeStats.js
 * @description Use case — orchestrates the statistics computation workflow.
 *
 * Use cases contain application-specific business rules.
 * This use case knows about the domain but nothing about Express or HTTP.
 *
 * Single Responsibility: coordinate the computation of matrix statistics.
 * Dependency Inversion: depends on the domain module, not on infrastructure.
 */

"use strict";

const { computeStatistics } = require("../domain/statistics");

/**
 * @typedef {Object} ComputeStatsInput
 * @property {number[][]} Q - Orthogonal matrix from QR decomposition
 * @property {number[][]} R - Upper-triangular matrix from QR decomposition
 */

/**
 * Executes the statistics computation use case.
 *
 * @param {ComputeStatsInput} input
 * @returns {{ max: number, min: number, average: number, sum: number, isDiagonal: { Q: boolean, R: boolean } }}
 */
function execute(input) {
  const { Q, R } = input;
  return computeStatistics(Q, R);
}

module.exports = { execute };
