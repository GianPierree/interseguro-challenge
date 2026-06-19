/**
 * @file LoginForm.tsx
 * @description Simple login form to obtain a JWT from the Go API.
 */

import { useState } from "react";
import { login } from "@/services/matrixService";

interface LoginFormProps {
  onLogin: () => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("interseguro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      onLogin();
    } catch {
      setError("Credenciales inválidas o servidor no disponible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-brand-dark">Acceder</h2>
        <p className="text-sm text-gray-500 mt-1">
          Autentícate para usar la herramienta QR
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </p>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-brand-blue text-white py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
      >
        {loading ? "Conectando…" : "Iniciar sesión"}
      </button>
    </div>
  );
}
