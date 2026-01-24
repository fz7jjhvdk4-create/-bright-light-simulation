"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, AlertCircle, CheckCircle, Save } from "lucide-react";

interface Proposal {
  id: number;
  rootCauseId: string;
  description: string;
  responsible: string | null;
  cost: number | null;
}

interface BudgetAllocationProps {
  groupCode: string;
  proposals: Proposal[];
  totalBudget?: number;
  onSave?: () => void;
}

interface AllocationItem {
  proposalId: number;
  allocated: number;
  notes: string;
}

export function BudgetAllocation({
  groupCode,
  proposals,
  totalBudget = 800000,
  onSave
}: BudgetAllocationProps) {
  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Initialize allocations from proposals
    setAllocations(proposals.map(p => ({
      proposalId: p.id,
      allocated: p.cost || 0,
      notes: ""
    })));
    loadAllocations();
  }, [proposals]);

  const loadAllocations = async () => {
    try {
      const response = await fetch(`/api/groups/${groupCode}/budget-allocation`);
      const data = await response.json();
      if (data.success && data.allocations) {
        setAllocations(data.allocations);
      }
    } catch (error) {
      console.error("Error loading allocations:", error);
    }
  };

  const saveAllocations = async () => {
    setSaving(true);
    try {
      await fetch(`/api/groups/${groupCode}/budget-allocation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave?.();
    } catch (error) {
      console.error("Error saving allocations:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateAllocation = (proposalId: number, field: 'allocated' | 'notes', value: number | string) => {
    setAllocations(prev => prev.map(a =>
      a.proposalId === proposalId
        ? { ...a, [field]: value }
        : a
    ));
  };

  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated, 0);
  const remaining = totalBudget - totalAllocated;
  const isOverBudget = remaining < 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Budgetallokering</h2>
        <p className="text-gray-600">
          Fördela projektbudgeten mellan era godkända åtgärder.
        </p>
      </div>

      {/* Budget summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-600 font-medium">Total budget</p>
          <p className="text-2xl font-bold text-blue-800">{totalBudget.toLocaleString()} SEK</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-green-600 font-medium">Allokerat</p>
          <p className="text-2xl font-bold text-green-800">{totalAllocated.toLocaleString()} SEK</p>
        </div>
        <div className={`rounded-lg p-4 text-center ${isOverBudget ? 'bg-red-50' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
            {isOverBudget ? 'Överskridet' : 'Kvar'}
          </p>
          <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-800' : 'text-gray-800'}`}>
            {Math.abs(remaining).toLocaleString()} SEK
          </p>
        </div>
      </div>

      {isOverBudget && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">
            Budgeten är överskriden med {Math.abs(remaining).toLocaleString()} SEK.
            Justera allokeringarna eller diskutera med styrgruppen om utökad budget.
          </p>
        </div>
      )}

      {/* Allocation items */}
      <div className="space-y-4 mb-6">
        {proposals.map((proposal, index) => {
          const allocation = allocations.find(a => a.proposalId === proposal.id);
          return (
            <div key={proposal.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-500">Åtgärd {index + 1}</span>
                  <p className="text-gray-900">{proposal.description}</p>
                  {proposal.responsible && (
                    <p className="text-sm text-gray-500">Ansvarig: {proposal.responsible}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Uppskattat</p>
                  <p className="font-medium">{(proposal.cost || 0).toLocaleString()} SEK</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allokerad budget (SEK)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={allocation?.allocated || 0}
                      onChange={(e) => updateAllocation(proposal.id, 'allocated', parseInt(e.target.value) || 0)}
                      className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anteckningar
                  </label>
                  <input
                    type="text"
                    value={allocation?.notes || ""}
                    onChange={(e) => updateAllocation(proposal.id, 'notes', e.target.value)}
                    placeholder="T.ex. inkluderar utbildning..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Budgetanvändning</span>
          <span className={isOverBudget ? 'text-red-600' : 'text-gray-600'}>
            {Math.round((totalAllocated / totalBudget) * 100)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min((totalAllocated / totalBudget) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={saveAllocations}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? (
            "Sparar..."
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Sparat!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Spara budgetallokering
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
