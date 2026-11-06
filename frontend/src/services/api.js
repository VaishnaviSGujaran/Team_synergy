const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("meditrack_token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || (typeof data === "string" ? data : "An unexpected server error occurred");
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getMe: () => request("/api/auth/me"),

  // Medications
  getMedications: () => request("/api/medications"),
  createMedication: (data) =>
    request("/api/medications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMedication: (id, data) =>
    request(`/api/medications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteMedication: (id) =>
    request(`/api/medications/${id}`, {
      method: "DELETE",
    }),

  // Doses
  getTodayDoses: () => request("/api/doses/today"),
  getWeeklyDoses: () => request("/api/doses/weekly"),
  triggerTestReminder: () => request("/api/doses/test-reminder", { method: "POST" }),
  respondDose: (doseId, payload) =>
    request(`/api/doses/respond/${doseId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getHistory: (params = {}) => {
    const query = new URLSearchParams();
    if (params.date) query.append("date_filter", params.date);
    if (params.medicine) query.append("medicine_filter", params.medicine);
    if (params.status) query.append("status_filter", params.status);
    if (params.limit) query.append("limit", params.limit);
    return request(`/api/doses/history?${query.toString()}`);
  },

  // Analytics & Intelligence
  getAnalytics: (days = 14) => request(`/api/analytics?days=${days}`),

  // Caregivers
  getCaregivers: () => request("/api/caregivers"),
  inviteCaregiver: (data) =>
    request("/api/caregivers/invite", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  revokeCaregiver: (accessId) =>
    request(`/api/caregivers/${accessId}`, {
      method: "DELETE",
    }),
  getAuthorizedPatients: () => request("/api/caregivers/patients"),
  getPatientSummary: (patientId) => request(`/api/caregivers/patients/${patientId}/summary`),

  // Settings
  getReminderSettings: () => request("/api/settings/reminders"),
  updateReminderSettings: (data) =>
    request("/api/settings/reminders", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Admin
  getAdminOverview: () => request("/api/admin/overview"),
  getAdminUsers: () => request("/api/admin/users"),
  getAdminActivity: () => request("/api/admin/activity"),
};

