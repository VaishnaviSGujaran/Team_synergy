import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Trash2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  Key
} from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function CaregiverAccessPage() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view_adherence");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadCaregivers = async () => {
    try {
      const data = await api.getCaregivers();
      setCaregivers(data);
    } catch (err) {
      console.error("Failed to load caregivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaregivers();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await api.inviteCaregiver({
        caregiver_email: email,
        permission,
      });
      setMessage(res.message || "Caregiver authorized successfully.");
      setEmail("");
      await loadCaregivers();
    } catch (err) {
      setError(err.message || "Failed to authorize caregiver.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (accessId) => {
    if (window.confirm("Are you sure you want to revoke this caregiver's access? They will no longer be able to view your adherence summaries.")) {
      try {
        await api.revokeCaregiver(accessId);
        await loadCaregivers();
      } catch (err) {
        alert(err.message || "Failed to revoke access.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Caregiver Access & Authorization</h1>
        <p className="text-sm text-slate-500">
          Authorize trusted family members or caregivers to monitor your adherence summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Add / Invite Caregiver Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-4">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add Caregiver</h2>
              <span className="text-xs text-slate-500">Grant read-only visibility</span>
            </div>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label htmlFor="cg-email" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Caregiver Email Address *
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="cg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. caregiver@meditrack.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Permission Level
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3">
                <Eye className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">View Adherence Summaries</span>
                  <p className="text-slate-500">
                    Caregiver can only view taken/missed charts and pattern insights. Cannot alter medications or dosages.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send Invitation & Authorize"}
              </button>
            </div>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-start space-x-2">
            <Key className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              Explicit patient authorization is required. You retain full control and may revoke access at any time.
            </span>
          </div>
        </div>

        {/* Right Column: Authorized Caregivers List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100 mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Authorized Caregivers</h2>
              <span className="text-xs text-slate-500">Active monitoring links</span>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              {caregivers.filter((c) => c.status === "active").length} Active
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500">Loading authorized caregivers...</p>
            </div>
          ) : caregivers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium text-sm">No authorized caregivers yet.</p>
              <p className="text-slate-400 text-xs mt-1">
                Enter your caregiver's email to share your adherence progress.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {caregivers.map((cg) => (
                <div
                  key={cg.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{cg.caregiver_name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          cg.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {cg.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{cg.caregiver_email}</div>
                    <div className="text-[11px] text-teal-700 font-semibold mt-1">
                      Permission: View Adherence Summaries (Read-Only)
                    </div>
                  </div>

                  {cg.status === "active" ? (
                    <button
                      onClick={() => handleRevoke(cg.id)}
                      className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors shadow-2xs self-start sm:self-auto"
                    >
                      Revoke Access
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Access Revoked</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
