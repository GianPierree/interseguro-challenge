/**
 * @file statistics.test.js
 * @description Unit tests for the domain statistics module.
 * Tests are isolated — no HTTP, no Express, pure functions only.
 */

const {
  flatten,
  maxValue,
  minValue,
  average,
  totalSum,
  isDiagonal,
  computeStatistics,
} = require("../../src/domain/statistics");

describe("domain/statistics", () => {
  const sampleMatrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  describe("flatten", () => {
    it("flattens a 2D matrix into a 1D array", () => {
      expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });
  });

  describe("maxValue", () => {
    it("returns the maximum value", () => {
      expect(maxValue(sampleMatrix)).toBe(9);
    });
    it("handles negative values", () => {
      expect(maxValue([[-5, -1], [-3, -2]])).toBe(-1);
    });
  });

  describe("minValue", () => {
    it("returns the minimum value", () => {
      expect(minValue(sampleMatrix)).toBe(1);
    });
    it("handles negative values", () => {
      expect(minValue([[-5, -1], [-3, -2]])).toBe(-5);
    });
  });

  describe("average", () => {
    it("computes the arithmetic mean", () => {
      expect(average([[1, 2], [3, 4]])).toBe(2.5);
    });
    it("handles a single element", () => {
      expect(average([[42]])).toBe(42);
    });
  });

  describe("totalSum", () => {
    it("sums all elements", () => {
      expect(totalSum([[1, 2], [3, 4]])).toBe(10);
    });
    it("returns 0 for a zero matrix", () => {
      expect(totalSum([[0, 0], [0, 0]])).toBe(0);
    });
  });

  describe("isDiagonal", () => {
    it("returns true for a diagonal matrix", () => {
      expect(isDiagonal([[5, 0, 0], [0, 3, 0], [0, 0, 7]])).toBe(true);
    });
    it("returns false for a non-diagonal matrix", () => {
      expect(isDiagonal(sampleMatrix)).toBe(false);
    });
    it("returns false for non-square matrices", () => {
      expect(isDiagonal([[1, 2, 3], [4, 5, 6]])).toBe(false);
    });
    it("returns true for a 1x1 matrix", () => {
      expect(isDiagonal([[7]])).toBe(true);
    });
    it("uses floating-point tolerance", () => {
      expect(isDiagonal([[1, 1e-10], [0, 2]])).toBe(true);
    });
  });

  describe("computeStatistics", () => {
    const Q = [[1, 0], [0, 1]];
    const R = [[2, 3], [0, 4]];

    it("returns correct max across both matrices", () => {
      expect(computeStatistics(Q, R).max).toBe(4);
    });
    it("returns correct min across both matrices", () => {
      expect(computeStatistics(Q, R).min).toBe(0);
    });
    it("correctly identifies Q as diagonal (identity)", () => {
      expect(computeStatistics(Q, R).isDiagonal.Q).toBe(true);
    });
    it("correctly identifies R as non-diagonal", () => {
      expect(computeStatistics(Q, R).isDiagonal.R).toBe(false);
    });
  });
});
