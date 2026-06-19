/**
 * @file server.js
 * @description Infrastructure — Express app configuration and server startup.
 *
 * This is the outermost layer. It wires everything together:
 * loads config, mounts routers, registers middleware, starts listening.
 *
 * The app object is exported for integration testing (Supertest).
 */

"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const matrixRouter = require("../adapters/http/matrixRouter");

const app = express();
const PORT = process.env.PORT || 4000;

// ── Global middleware ──────────────────────────────────────────────────────
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));

// ── Health check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "node-api" });
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/matrix", matrixRouter);

// ── Global error handler ───────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[error]", err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// ── Start (skipped when imported by tests) ────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Node API listening on port ${PORT}`);
  });
}

module.exports = app;
