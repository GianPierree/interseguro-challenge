/**
 * @file index.tsx
 * @description Main page — ties together login, matrix input, QR result display,
 * and statistics from the Node.js API.
 */

import { useState } from "react";
import Head from "next/head";
import LoginForm from "@/components/LoginForm";
import MatrixInput from "@/components/MatrixInput";
import MatrixDisplay from "@/components/MatrixDisplay";
import StatsDisplay from "@/components/StatsDisplay";
import { factorizeMatrix, clearToken } from "@/services/matrixService";
import type { MatrixResponse } from "@/services/matrixService";

type AppState = "login" | "ready" | "loading" | "result" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("login");
  const [result, setResult] = useState<MatrixResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleLogout() {
    clearToken();
    setResult(null);
    setAppState("login");
  }

  async function handleMatrix(matrix: number[][]) {
    setAppState("loading");
    setErrorMsg(null);
    try {
      const data = await factorizeMatrix(matrix);
      setResult(data);
      setAppState("result");
    } catch (e) {
      setErrorMsg(
        (e as { response?: { data?: { error?: string } } }).response?.data
          ?.error ?? "Error al procesar la matriz."
      );
      setAppState("error");
    }
  }

  return (
    <>
      <Head>
        <title>Interseguro — QR Factorization</title>
        <meta name="description" content="Coding Challenge — División TI" />
      </Head>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="bg-brand-blue text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-brand-blue font-bold text-sm">IS</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">
            Interseguro · QR Tool
          </span>
        </div>
        {appState !== "login" && (
          <button
            onClick={handleLogout}
            className="text-sm text-white/80 hover:text-white underline"
          >
            Cerrar sesión
          </button>
        )}
      </header>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        {appState === "login" && (
          <LoginForm onLogin={() => setAppState("ready")} />
        )}

        {(appState === "ready" ||
          appState === "loading" ||
          appState === "result" ||
          appState === "error") && (
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            {/* Matrix input */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-brand-dark mb-4">
                Ingresar Matriz
              </h2>
              <MatrixInput
                onSubmit={handleMatrix}
                disabled={appState === "loading"}
              />
            </section>

            {/* Error state */}
            {appState === "error" && errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                {errorMsg}
              </div>
            )}

            {/* Results */}
            {appState === "result" && result && (
              <>
                <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                  <h2 className="text-base font-semibold text-brand-dark">
                    Descomposición QR (Go API)
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <MatrixDisplay label="Q" matrix={result.qrResult.Q} />
                    <MatrixDisplay label="R" matrix={result.qrResult.R} />
                  </div>
                  <p className="text-xs text-gray-400">
                    Matriz original: {result.qrResult.originalRows} ×{" "}
                    {result.qrResult.originalCols}
                  </p>
                </section>

                <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <StatsDisplay stats={result.statistics} />
                </section>
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}
