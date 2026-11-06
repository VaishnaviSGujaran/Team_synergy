import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  ShieldAlert,
  Users,
  Pill,
  Activity,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Server
} from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [overviewRes, usersRes, activityRes] = await Promise.all([
          api.getAdminOverview(),
          api.getAdminUsers(),
          api.getAdminActivity(),
        ]);
        setStats(overviewRes.stats);
        setUsers(usersRes);
        setActivity(activityRes);
      } catch (err) {
        console.error("Failed to load admin overview:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-slate-600">Loading system administration metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
            <Server className="w-4 h-4 text-purple-300" />
            <span>Platform Administration & Health Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            MediTrack System Command
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl">
            Live monitoring of registered accounts, system adherence statistics, and medication record logs.
          </p>
        </div>

        <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-center">
          <span className="text-[11px] uppercase font-bold text-purple-200 block">System Adherence</span>
          <span className="text-3xl font-black text-emerald-400">
            {stats?.system_adherence_rate || 82}%
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Total Users</span>
            <div className="text-2xl font-black text-slate-900">{stats?.total_users || 0}</div>
            <span className="text-[11px] text-slate-400">
              {stats?.patients || 0} Patients • {stats?.caregivers || 0} Caregivers
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Active Prescriptions</span>
            <div className="text-2xl font-black text-slate-900">{stats?.medications || 0}</div>
            <span className="text-[11px] text-slate-400">Tracked in database</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Doses Logged</span>
            <div className="text-2xl font-black text-slate-900">{stats?.doses_recorded || 0}</div>
            <span className="text-[11px] text-slate-400">Audited dose records</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Platform Status</span>
            <div className="text-2xl font-black text-emerald-600">Online</div>
            <span className="text-[11px] text-emerald-700 font-semibold">FastAPI + PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Registered Platform Users</h2>
            <p className="text-xs text-slate-500">Role-based accounts with patient data isolation.</p>
          </div>
          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
            {users.length} Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">User ID</th>
                <th className="py-3 px-6">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">{u.name}</td>
                  <td className="py-3.5 px-6 text-slate-600">{u.email}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        u.role === "patient"
                          ? "bg-teal-50 text-teal-800 border-teal-200"
                          : u.role === "caregiver"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-purple-50 text-purple-800 border-purple-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-slate-400 font-mono">
                    {u.id}
                  </td>
                  <td className="py-3.5 px-6 text-xs font-bold text-emerald-600">
                    Active
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1">Recent System Activity</h2>
        <p className="text-xs text-slate-500 mb-4">Live audit trail of dose confirmations and intake events.</p>

        <div className="space-y-3">
          {activity.map((act, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                <span className="font-semibold text-slate-800">{act.description}</span>
              </div>
              <span className="text-slate-400 font-mono">
                {act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : "Just now"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
