import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  Pill,
  Plus,
  Trash2,
  Edit,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function MedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [scheduledTimes, setScheduledTimes] = useState(["08:00"]);

  const loadMedications = async () => {
    try {
      const data = await api.getMedications();
      setMedications(data);
    } catch (err) {
      console.error("Failed to load medications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedications();
  }, []);

  const openAddModal = () => {
    setEditingMed(null);
    setMedicineName("");
    setDosage("");
    setInstructions("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setFrequency("daily");
    setScheduledTimes(["08:00"]);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (med) => {
    setEditingMed(med);
    setMedicineName(med.medicine_name);
    setDosage(med.dosage);
    setInstructions(med.instructions);
    setStartDate(med.start_date);
    setEndDate(med.end_date || "");
    setFrequency("daily");
    setScheduledTimes(med.schedules?.map((s) => s.scheduled_time) || ["08:00"]);
    setError("");
    setIsModalOpen(true);
  };

  const handleAddTimeInput = () => {
    setScheduledTimes([...scheduledTimes, "12:00"]);
  };

  const handleTimeChange = (index, value) => {
    const updated = [...scheduledTimes];
    updated[index] = value;
    setScheduledTimes(updated);
  };

  const handleRemoveTime = (index) => {
    if (scheduledTimes.length > 1) {
      setScheduledTimes(scheduledTimes.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (editingMed) {
        await api.updateMedication(editingMed.id, {
          medicine_name: medicineName,
          dosage,
          instructions,
          start_date: startDate,
          end_date: endDate || null,
        });
      } else {
        await api.createMedication({
          medicine_name: medicineName,
          dosage,
          instructions,
          start_date: startDate,
          end_date: endDate || null,
          frequency,
          scheduled_times: scheduledTimes,
        });
      }

      setIsModalOpen(false);
      await loadMedications();
    } catch (err) {
      setError(err.message || "Failed to save medication");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medication and its schedules?")) {
      try {
        await api.deleteMedication(id);
        await loadMedications();
      } catch (err) {
        alert(err.message || "Failed to delete medication");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medication Management</h1>
          <p className="text-sm text-slate-500">
            Maintain your prescribed medications, daily schedules, and intake instructions.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Medications Grid / Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-slate-500">Loading medications...</p>
        </div>
      ) : medications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No medications added yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            Add your doctor-prescribed medications to track schedules and start receiving reminders.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-teal-600 text-white font-bold text-sm rounded-xl hover:bg-teal-700 transition-colors"
          >
            + Add First Medication
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">
                        {med.medicine_name}
                      </h3>
                      <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {med.dosage}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                    {med.status || "active"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-800 block mb-0.5">Instructions:</strong>
                    {med.instructions}
                  </p>

                  <div className="pt-2 flex items-center space-x-2 text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Started: {med.start_date}</span>
                    {med.end_date && <span>• Ends: {med.end_date}</span>}
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600 mr-1" />
                    <span className="font-semibold text-slate-700">Times:</span>
                    {med.schedules && med.schedules.length > 0 ? (
                      med.schedules.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md font-bold text-xs"
                        >
                          {s.scheduled_time}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">08:00</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => openEditModal(med)}
                  className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit Medication"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(med.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-teal-600 px-6 py-4 text-white flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingMed ? "Edit Medication" : "Add Prescribed Medication"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-teal-700 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="e.g. Metformin"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 500 mg"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Instructions *
                </label>
                <textarea
                  required
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take after breakfast with a full glass of water"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {!editingMed && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      Scheduled Medication Times
                    </label>
                    <button
                      type="button"
                      onClick={handleAddTimeInput}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700"
                    >
                      + Add Another Time
                    </button>
                  </div>
                  <div className="space-y-2">
                    {scheduledTimes.map((time, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="time"
                          required
                          value={time}
                          onChange={(e) => handleTimeChange(idx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                        {scheduledTimes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTime(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingMed ? "Update Medication" : "Save Medication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
