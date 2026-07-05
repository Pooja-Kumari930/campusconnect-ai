import { api } from "./api.js";

export const complaintService = {
  list: (params) => api.get("/complaints", { params }).then((r) => r.data),
  get: (id) => api.get(`/complaints/${id}`).then((r) => r.data),
  create: (formData) =>
    api
      .post("/complaints", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data),
  updateStatus: (id, status, note) =>
    api.patch(`/complaints/${id}/status`, { status, note }).then((r) => r.data),
  assign: (id, staffId) => api.patch(`/complaints/${id}/assign`, { staffId }).then((r) => r.data),
  addComment: (id, message, isInternal = false) =>
    api.post(`/complaints/${id}/comments`, { message, isInternal }).then((r) => r.data),
  submitFeedback: (id, rating, comment) =>
    api.post(`/complaints/${id}/feedback`, { rating, comment }).then((r) => r.data),
  analyticsSummary: () => api.get("/complaints/analytics/summary").then((r) => r.data),
};

export const categoryService = {
  list: () => api.get("/categories").then((r) => r.data),
};

export const departmentService = {
  list: () => api.get("/departments").then((r) => r.data),
};

export const userService = {
  listStaff: () => api.get("/users/staff").then((r) => r.data),
  listUsers: (params) => api.get("/users", { params }).then((r) => r.data),
};
