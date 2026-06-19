/**
 * @file matrixService.ts
 * @description Frontend service layer for communicating with the Go API.
 *
 * Centralises all HTTP calls so components stay decoupled from transport.
 */

import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_GO_API_URL ?? "http://localhost:3000";

// ── Types ──────────────────────────────────────────────────────────────────

export interface QRResult {
  Q: number[][];
  R: number[][];
  originalRows: number;
  originalCols: number;
}

export interface DiagonalCheck {
  Q: boolean;
  R: boolean;
}

export interface Statistics {
  max: number;
  min: number;
  average: number;
  sum: number;
  isDiagonal: DiagonalCheck;
}

export interface MatrixResponse {
  qrResult: QRResult;
  statistics: Statistics;
}

export interface TokenResponse {
  token: string;
}

// ── Token storage ──────────────────────────────────────────────────────────

let _token: string | null = null;

export function setToken(token: string): void {
  _token = token;
}

export function clearToken(): void {
  _token = null;
}

function authHeader(): Record<string, string> {
  return _token ? { Authorization: `Bearer ${_token}` } : {};
}

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * Authenticates with the Go API and stores the JWT.
 * @returns The raw JWT string
 */
export async function login(
  username: string,
  password: string
): Promise<string> {
  const { data } = await axios.post<TokenResponse>(
    `${API_BASE}/api/auth/token`,
    { username, password }
  );
  setToken(data.token);
  return data.token;
}

/**
 * Sends a matrix to the Go API for QR factorization.
 * Requires a valid JWT (call login() first).
 *
 * @param matrix - Rectangular 2D array (rows >= cols)
 */
export async function factorizeMatrix(
  matrix: number[][]
): Promise<MatrixResponse> {
  const { data } = await axios.post<MatrixResponse>(
    `${API_BASE}/api/matrix/qr`,
    { matrix },
    { headers: { ...authHeader(), "Content-Type": "application/json" } }
  );
  return data;
}
