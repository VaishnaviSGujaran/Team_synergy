import React from "react";
import { ShieldAlert } from "lucide-react";

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-amber-50/90 border-t border-amber-200/60 px-4 py-2 text-xs text-amber-900 flex items-center justify-center space-x-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="truncate">
          <strong>Medical Safety:</strong> MediTrack is an adherence tracking platform and does not replace professional medical advice or prescribe medications.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 shadow-sm flex items-start space-x-3 my-4">
      <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0 mt-0.5">
        <ShieldAlert className="w-4 h-4" />
      </div>
      <div className="leading-relaxed">
        <h4 className="font-bold text-amber-950 uppercase tracking-wide text-[11px] mb-1">
          Important Medical Safety Notice
        </h4>
        <p>
          MediTrack is a medication management and adherence support platform. It does not provide medical diagnosis, prescribe medications, change treatment plans, or replace professional medical advice. Medication information should be based on prescriptions provided by qualified healthcare professionals.
        </p>
      </div>
    </div>
  );
}
