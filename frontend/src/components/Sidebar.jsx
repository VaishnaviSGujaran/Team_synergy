import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Pill,
  Calendar,
  History,
  TrendingUp,
  Users,
  Settings,
  ShieldCheck,
  Activity,
  UserCheck
} from "lucide-react";

export default function Sidebar() {
  const { role } = useAuth();

  const patientLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/medications", label: "Medications", icon: Pill },
    { to: "/schedule", label: "Schedule", icon: Calendar },
    { to: "/history", label: "Medication History", icon: History },
    { to: "/analytics", label: "Analytics & Insights", icon: TrendingUp },
    { to: "/caregivers", label: "Caregiver Access", icon: Users },
    { to: "/settings", label: "Reminder Settings", icon: Settings },
  ];

  const caregiverLinks = [
    { to: "/caregiver-dashboard", label: "Patient Dashboard", icon: LayoutDashboard },
    { to: "/caregiver-dashboard", label: "Adherence Summaries", icon: TrendingUp },
    { to: "/settings", label: "Account Settings", icon: Settings },
  ];

  const adminLinks = [
    { to: "/admin", label: "System Overview", icon: LayoutDashboard },
    { to: "/admin", label: "Users & Patients", icon: Users },
    { to: "/admin", label: "Audit & Activity", icon: Activity },
  ];

  let links = patientLinks;
  if (role === "caregiver") links = caregiverLinks;
  if (role === "admin") links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 h-[calc(100vh-4rem)] sticky top-16">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {role === "patient" ? "Patient Navigation" : role === "caregiver" ? "Caregiver Portal" : "Admin Panel"}
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to + link.label}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-teal-50 text-teal-800 font-bold border-l-4 border-teal-600 shadow-xs"
                      : "text-slate-600 hover:text-teal-700 hover:bg-slate-50"
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Safety Badge at bottom of sidebar */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500">
        <div className="flex items-center space-x-1.5 font-bold text-slate-700 mb-1">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Patient Protected</span>
        </div>
        <p className="text-[11px] leading-tight text-slate-500">
          Strict verification. Reminder ≠ Intake. Explicit confirmation required.
        </p>
      </div>
    </aside>
  );
}
