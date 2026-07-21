"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, LogIn } from "lucide-react";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // UI flag only — the real session is the httpOnly cookie
        localStorage.setItem("teacher_session", "authenticated");
        router.push("/teacher/dashboard");
      } else {
        setError(data.error || "Fel lösenord");
      }
    } catch {
      setError("Kunde inte ansluta till servern");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-yellow-100 rounded-full mb-3 sm:mb-4">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-600" aria-hidden="true" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lärarportal</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              Logga in för att hantera grupper och godkänna inlämningar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Lärarinloggning">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lösenord
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ange lösenord"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-base"
                disabled={isLoading}
                required
                aria-required="true"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div role="alert" className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3" disabled={isLoading} aria-busy={isLoading}>
              <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
              {isLoading ? "Loggar in..." : "Logga in"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
