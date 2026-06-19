/**
 * @file matrixRouter.test.js
 * @description Integration tests for POST /api/matrix/stats.
 * Uses Supertest to send real HTTP requests to the Express app.
 */

const request = require("supertest");
const app = require("../../src/infrastructure/server");

describe("POST /api/matrix/stats", () => {
  const validPayload = {
    qrResult: {
      Q: [
        [-0.16903085, 0.89708523],
        [-0.50709255, 0.27602622],
        [-0.84515425, -0.34503278],
      ],
      R: [
        [-5.91607978, -7.43735744],
        [0, 0.82807868],
      ],
    },
  };

  it("returns 200 with all statistics fields for valid input", async () => {
    const res = await request(app).post("/api/matrix/stats").send(validPayload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("max");
    expect(res.body).toHaveProperty("min");
    expect(res.body).toHaveProperty("average");
    expect(res.body).toHaveProperty("sum");
    expect(res.body.isDiagonal).toHaveProperty("Q");
    expect(res.body.isDiagonal).toHaveProperty("R");
  });

  it("returns 400 when qrResult is missing", async () => {
    const res = await request(app).post("/api/matrix/stats").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 when Q is not an array", async () => {
    const res = await request(app)
      .post("/api/matrix/stats")
      .send({ qrResult: { Q: "bad", R: [[1, 0], [0, 1]] } });
    expect(res.status).toBe(400);
  });

  it("returns 400 when Q contains non-numbers", async () => {
    const res = await request(app)
      .post("/api/matrix/stats")
      .send({ qrResult: { Q: [["a", "b"]], R: [[1]] } });
    expect(res.status).toBe(400);
  });

  it("GET /health returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
