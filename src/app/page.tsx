"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const [studentNames, setStudentNames] = useState("");
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!studentNames.trim() || !groupName.trim()) {
      setError("Fyll i alla fält");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName.trim(),
          studentNames: studentNames.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/simulation/${data.group.code}`);
      } else {
        setError(data.error || "Något gick fel");
      }
    } catch {
      setError("Kunde inte ansluta till servern");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Hero section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Välkommen till Simuleringen
          </h2>
          <p className="text-lg text-gray-600">
            Ni är konsulter hos Bright Light Solutions AB, ett LED-företag som
            har drabbats av allvarliga kvalitetsproblem.
          </p>
        </div>

        {/* Project facts */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-10">
          <h3 className="text-xl font-semibold text-yellow-800 mb-4">
            Ert uppdrag
          </h3>
          <p className="text-gray-700 mb-4">
            Reklamationskostnaderna har ökat från 1.2 till 4.8 MSEK på 18
            månader. Ert uppdrag är att utreda problemet, identifiera
            rotorsakerna och föreslå åtgärder.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">800 000 kr</div>
              <div className="text-sm text-gray-500">Budget</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">6 mån</div>
              <div className="text-sm text-gray-500">Deadline</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">50%</div>
              <div className="text-sm text-gray-500">Reduktionsmål</div>
            </div>
          </div>
        </div>

        {/* Registration form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Registrera er grupp
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="groupName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gruppnamn
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="T.ex. Grupp A, Team Alpha..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="studentNames"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Studentnamn (separera med komma)
              </label>
              <input
                type="text"
                id="studentNames"
                value={studentNames}
                onChange={(e) => setStudentNames(e.target.value)}
                placeholder="Anna Andersson, Erik Eriksson..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Skapar grupp..." : "Starta simuleringen"}
            </Button>
          </form>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Efter registrering får ni en unik gruppkod som ni kan använda för
            att återvända till simuleringen.
          </p>
        </div>
      </div>
    </div>
  );
}
