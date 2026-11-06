import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  History,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Calendar
} from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState("");
  const [medicineFilter, setMedicineFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [medsRes, histRes] = await Promise.all([
        api.getMedications(),
        api.getHistory({
          date: dateFilter || undefined,
          medicine: medicineFilter !== "all" ? medicineFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          limit: 100,
        }),
      ]);
      setMedications(medsRes);
      setHistory(histRes);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateFilter, medicineFilter, statusFilter]);

  const resetFilters = () => {
    setDateFilter("");
    setMedicineFilter("all");
    setStatusFilter("all");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "TAKEN":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Taken</span>
          </span>
        );
      case "SNOOZED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Snoozed</span>
          </span>
        );
      case "MISSED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Missed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Medication History</h1>
        <p className="text-sm text-slate-500">
          Complete historical audit trail of confirmed, missed, and snoozed medication doses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Filter Records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Date Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Medication Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Medication</label>
            <select
              value={medicineFilter}
              onChange={(e) => setMedicineFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="all">All Medications</option>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.medicine_name} ({m.dosage})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="TAKEN">✓ Taken</option>
              <option value="MISSED">✕ Missed</option>
              <option value="SNOOZED">↻ Snoozed</option>
              <option value="PENDING">⏰ Pending</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-2 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-slate-500">Loading dose records...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-medium">No dose records match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Medicine</th>
                  <th className="py-3.5 px-6">Scheduled Time</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Confirmed Time / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {record.scheduled_date}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{record.medicine_name}</div>
                      <div className="text-xs text-slate-400">{record.dosage}</div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-700 font-semibold">
                      {record.scheduled_time}
                    </td>
                    <td className="py-3.5 px-6">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-500">
                      {record.confirmed_at ? (
                        <span>Confirmed: {new Date(record.confirmed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      ) : record.notes ? (
                        <span className="italic">{record.notes}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
}
