import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

// ─── Query Key helpers ───────────────────────────────────────────────────────
export const getListProjectsQueryKey = () => ["projects"];
export const getGetProjectQueryKey = (id: string) => ["projects", id];
export const getListTasksQueryKey = () => ["tasks"];
export const getListProjectTasksQueryKey = (id: string) => ["tasks", "project", id];
export const getGetTaskQueryKey = (id: string) => ["tasks", id];
export const getListMembersQueryKey = () => ["members"];
export const getGetOverviewStatsQueryKey = () => ["stats", "overview"];
export const getGetProjectProgressQueryKey = (id: string) => ["stats", "progress", id];
export const getGetUpcomingDeadlinesQueryKey = () => ["stats", "deadlines"];

// ─── Projects ────────────────────────────────────────────────────────────────
export function useListProjects() {
  return useQuery({ queryKey: getListProjectsQueryKey(), queryFn: () => apiFetch("/projects") });
}
export function useGetProject(id: string, options?: { query?: { enabled?: boolean; queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetProjectQueryKey(id),
    queryFn: () => apiFetch(`/projects/${id}`),
    enabled: options?.query?.enabled ?? true,
  });
}
export function useCreateProject() {
  return useMutation({ mutationFn: ({ data }: { data: Record<string, unknown> }) => apiFetch("/projects", { method: "POST", body: JSON.stringify(data) }) });
}
export function useUpdateProject() {
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => apiFetch(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }) });
}
export function useDeleteProject() {
  return useMutation({ mutationFn: ({ id }: { id: string }) => apiFetch(`/projects/${id}`, { method: "DELETE" }) });
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export function useListTasks() {
  return useQuery({ queryKey: getListTasksQueryKey(), queryFn: () => apiFetch("/tasks") });
}
export function useListProjectTasks(projectId: string, options?: { query?: { enabled?: boolean; queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListProjectTasksQueryKey(projectId),
    queryFn: () => apiFetch(`/tasks/by-project/${projectId}`),
    enabled: options?.query?.enabled ?? true,
  });
}
export function useGetTask(id: string, options?: { query?: { enabled?: boolean; queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetTaskQueryKey(id),
    queryFn: () => apiFetch(`/tasks/${id}`),
    enabled: options?.query?.enabled ?? true,
  });
}
export function useCreateTask() {
  return useMutation({ mutationFn: ({ data }: { data: Record<string, unknown> }) => apiFetch("/tasks", { method: "POST", body: JSON.stringify(data) }) });
}
export function useUpdateTask() {
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => apiFetch(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }) });
}
export function useDeleteTask() {
  return useMutation({ mutationFn: ({ id }: { id: string }) => apiFetch(`/tasks/${id}`, { method: "DELETE" }) });
}

// ─── Members ─────────────────────────────────────────────────────────────────
export function useListMembers() {
  return useQuery({ queryKey: getListMembersQueryKey(), queryFn: () => apiFetch("/members") });
}
export function useCreateMember() {
  return useMutation({ mutationFn: ({ data }: { data: Record<string, unknown> }) => apiFetch("/members", { method: "POST", body: JSON.stringify(data) }) });
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export function useGetOverviewStats() {
  return useQuery({ queryKey: getGetOverviewStatsQueryKey(), queryFn: () => apiFetch("/stats/overview") });
}
export function useGetProjectProgress(id: string, options?: { query?: { enabled?: boolean; queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetProjectProgressQueryKey(id),
    queryFn: () => apiFetch(`/stats/projects/${id}/progress`),
    enabled: options?.query?.enabled ?? true,
  });
}
export function useGetUpcomingDeadlines() {
  return useQuery({ queryKey: getGetUpcomingDeadlinesQueryKey(), queryFn: () => apiFetch("/stats/upcoming-deadlines") });
}
