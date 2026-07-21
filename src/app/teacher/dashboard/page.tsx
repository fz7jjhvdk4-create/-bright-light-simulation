"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  Search,
  Eye,
  Trash2,
} from "lucide-react";

type GateStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

interface GroupSummary {
  id: number;
  code: string;
  name: string;
  studentNames: string;
  phase: number;
  status: string;
  createdAt: string;
  gate1Status: GateStatus;
  gate2Status: GateStatus;
  gate3Status: GateStatus;
  gate4Status: GateStatus;
  interviewsCount: number;
  downloadsCount: number;
  proposalsCount: number;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null);

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem("teacher_session");
    if (session !== "authenticated") {
      router.push("/teacher");
      return;
    }

    fetchGroups();
  }, [router]);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/teacher/groups");
      if (response.status === 401) {
        localStorage.removeItem("teacher_session");
        router.push("/teacher");
        return;
      }
      const data = await response.json();
      if (data.success) {
        setGroups(data.groups);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("teacher_session");
    try {
      await fetch("/api/teacher/login", { method: "DELETE" });
    } catch {
      // Cookie expires on its own if the request fails
    }
    router.push("/teacher");
  };

  const handleDeleteGroup = async (group: GroupSummary) => {
    if (!confirm(`Är du säker på att du vill ta bort gruppen "${group.name}" (${group.code})?\n\nAll data (intervjuer, nedladdningar, aktivitetslogg, åtgärdsförslag) kommer att tas bort permanent.`)) {
      return;
    }

    try {
      const response = await fetch("/api/teacher/groups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: group.id }),
      });
      const data = await response.json();
      if (data.success) {
        setGroups(groups.filter((g) => g.id !== group.id));
      } else {
        alert(`Kunde inte ta bort gruppen: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Ett fel uppstod vid borttagning av gruppen.");
    }
  };

  const getStatusBadge = (status: string, phase: number) => {
    if (status === "approved" || phase === 2) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
          <CheckCircle className="w-3 h-3" />
          Godkänd
        </span>
      );
    }
    if (status === "pending_approval") {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
          <Clock className="w-3 h-3" />
          Väntar
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
        <AlertCircle className="w-3 h-3" />
        Pågående
      </span>
    );
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.studentNames.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lärarportal</h1>
            <p className="text-sm text-gray-500">
              Bright Light Solutions Simulering
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logga ut
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{groups.length}</div>
                <div className="text-sm text-gray-500">Totalt grupper</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {groups.filter((g) =>
                    g.gate1Status === 'pending' ||
                    g.gate2Status === 'pending' ||
                    g.gate3Status === 'pending' ||
                    g.gate4Status === 'pending'
                  ).length}
                </div>
                <div className="text-sm text-gray-500">Väntar godkännande</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {groups.filter((g) => g.gate4Status === 'approved').length}
                </div>
                <div className="text-sm text-gray-500">Slutförda</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {groups.reduce((sum, g) => sum + g.proposalsCount, 0)}
                </div>
                <div className="text-sm text-gray-500">Åtgärdsförslag</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök på gruppnamn, kod eller student..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
            />
          </div>
        </div>

        {/* Groups table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Grupp
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Studenter
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                  Gate 1
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                  Gate 2
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                  Gate 3
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                  Gate 4
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                  Intervjuer
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                  Förslag
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    {searchQuery
                      ? "Inga grupper matchar sökningen"
                      : "Inga grupper registrerade än"}
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const getGateBadge = (status: GateStatus) => {
                    if (status === 'approved') {
                      return <span className="flex items-center justify-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle className="w-3 h-3" /></span>;
                    }
                    if (status === 'pending') {
                      return <span className="flex items-center justify-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Clock className="w-3 h-3" /></span>;
                    }
                    if (status === 'rejected') {
                      return <span className="flex items-center justify-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"><AlertCircle className="w-3 h-3" /></span>;
                    }
                    return <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded-full text-xs">—</span>;
                  };

                  return (
                    <tr key={group.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{group.name}</div>
                        <div className="text-sm text-gray-500">{group.code}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {group.studentNames}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getGateBadge(group.gate1Status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getGateBadge(group.gate2Status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getGateBadge(group.gate3Status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getGateBadge(group.gate4Status)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {group.interviewsCount}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {group.proposalsCount}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/teacher/group/${group.code}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Visa
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGroup(group)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
