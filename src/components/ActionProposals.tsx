"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { rootCauses, RootCause } from "@/lib/root-causes";
import { Plus, Trash2, Send, AlertCircle } from "lucide-react";

interface Proposal {
  id: number;
  rootCauseId: string;
  description: string;
  responsible: string | null;
  cost: number | null;
  createdAt: string;
}

interface ActionProposalsProps {
  groupCode: string;
  onSubmit?: () => void;
}

export function ActionProposals({ groupCode, onSubmit }: ActionProposalsProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedRootCause, setSelectedRootCause] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [cost, setCost] = useState("");

  useEffect(() => {
    fetchProposals();
  }, [groupCode]);

  const fetchProposals = async () => {
    try {
      const response = await fetch(`/api/groups/${groupCode}/proposals`);
      const data = await response.json();
      if (data.success) {
        setProposals(data.proposals);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProposal = async () => {
    if (!selectedRootCause || !description.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/groups/${groupCode}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rootCauseId: selectedRootCause,
          description: description.trim(),
          responsible: responsible.trim() || null,
          cost: cost ? parseInt(cost) : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setProposals(prev => [data.proposal, ...prev]);
        setSelectedRootCause("");
        setDescription("");
        setResponsible("");
        setCost("");
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding proposal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProposal = async (id: number) => {
    try {
      const response = await fetch(`/api/groups/${groupCode}/proposals?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setProposals(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting proposal:", error);
    }
  };

  const getRootCauseName = (id: string) => {
    const rc = rootCauses.find(r => r.id === id);
    return rc?.name || id;
  };

  const canSubmit = proposals.length >= 3;

  if (loading) {
    return <div className="p-4 text-gray-500">Laddar åtgärdsförslag...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Åtgärdsförslag</h3>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            disabled={showForm}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Formulera åtgärder för de rotorsaker ni identifierat. Minst 3 åtgärder krävs för inlämning.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Add form */}
        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium mb-3">Nytt åtgärdsförslag</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rotorsak *
                </label>
                <select
                  value={selectedRootCause}
                  onChange={(e) => setSelectedRootCause(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                >
                  <option value="">Välj rotorsak...</option>
                  {rootCauses.map((rc) => (
                    <option key={rc.id} value={rc.id}>
                      {rc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beskrivning av åtgärd *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beskriv åtgärden i detalj..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ansvarig
                  </label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="T.ex. Kvalitetschef"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uppskattad kostnad (SEK)
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="T.ex. 50000"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleAddProposal}
                  disabled={!selectedRootCause || !description.trim() || submitting}
                >
                  {submitting ? "Sparar..." : "Spara åtgärd"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedRootCause("");
                    setDescription("");
                    setResponsible("");
                    setCost("");
                  }}
                >
                  Avbryt
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Proposals list */}
        {proposals.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Inga åtgärdsförslag tillagda än.</p>
            <p className="text-sm mt-2">
              Analysera era intervjuer och data för att identifiera rotorsaker.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="p-4 border rounded-lg bg-white hover:border-yellow-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                        {getRootCauseName(proposal.rootCauseId)}
                      </span>
                    </div>
                    <p className="text-gray-900">{proposal.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      {proposal.responsible && (
                        <span>Ansvarig: {proposal.responsible}</span>
                      )}
                      {proposal.cost && (
                        <span>Kostnad: {proposal.cost.toLocaleString()} SEK</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProposal(proposal.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Ta bort"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit section */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className={proposals.length >= 3 ? "text-green-600" : "text-gray-500"}>
              {proposals.length} av minst 3 åtgärder
            </span>
          </div>
          <Button
            disabled={!canSubmit}
            onClick={onSubmit}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Lämna in för godkännande
          </Button>
        </div>
        {!canSubmit && (
          <p className="text-xs text-gray-500 mt-2">
            Lägg till minst 3 åtgärdsförslag innan inlämning.
          </p>
        )}
      </div>
    </div>
  );
}
