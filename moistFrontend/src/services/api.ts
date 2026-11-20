import type { DeviceSnapshot } from "../types.ts";

const baseUrl: string = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:5000";

export function getApiBaseUrl(): string {
  return baseUrl;
}

async function request(path: string): Promise<unknown> {
  const response = await fetch(baseUrl + path);
  if (!response.ok) {
    throw new Error("Request failed: " + response.status);
  }
  return await response.json();
}

export async function fetchHealth(): Promise<{ ok: boolean; status: string }> {
  try {
    const data = (await request("/")) as { status?: string };
    return { ok: data.status === "ON", status: data.status || "OFF" };
  } catch {
    return { ok: false, status: "OFF" };
  }
}

export async function fetchDevices(): Promise<{ device_id: string; device_name: string; ip_address: string | null; operating_mode: string; pump_state: string; location: string | null; status: string; registered_at: string }[]> {
  const data = (await request("/device")) as { success?: boolean; data?: { device_id: string; device_name: string; ip_address: string | null; operating_mode: string; pump_state: string; location: string | null; status: string; registered_at: string }[] };
  return Array.isArray(data.data) ? data.data : [];
}

export async function fetchLatestReadings(): Promise<{ id: number; device_id: string; device_name: string | null; moisture: number; temperature: number; mode: string; created_at: string }[]> {
  const data = (await request("/soil/latest")) as { success?: boolean; data?: { id: number; device_id: string; device_name: string | null; moisture: number; temperature: number; mode: string; created_at: string }[] };
  return Array.isArray(data.data) ? data.data : [];
}

export async function fetchAlerts(limit: number = 20): Promise<{ id: number; device_id: string; device_name: string | null; moisture_level: number; alert_message: string; created_at: string }[]> {
  const data = (await request("/soil/alerts?limit=" + limit)) as { success?: boolean; data?: { id: number; device_id: string; device_name: string | null; moisture_level: number; alert_message: string; created_at: string }[] };
  return Array.isArray(data.data) ? data.data : [];
}

export async function fetchReadings(deviceId: string, limit: number = 50): Promise<{ id: number; device_id: string; moisture: number; temperature: number; mode: string; created_at: string }[]> {
  const data = (await request("/soil/readings/" + encodeURIComponent(deviceId) + "?limit=" + limit)) as { success?: boolean; data?: { id: number; device_id: string; moisture: number; temperature: number; mode: string; created_at: string }[] };
  return Array.isArray(data.data) ? data.data : [];
}

export async function fetchSnapshot(deviceId: string): Promise<DeviceSnapshot> {
  const data = (await request("/soil/snapshot/" + encodeURIComponent(deviceId))) as {
    success?: boolean;
    data?: DeviceSnapshot;
  };
  if (!data.data) throw new Error("Snapshot unavailable for " + deviceId);
  return data.data;
}

export function subscribeToSnapshot(
  deviceId: string,
  onUpdate: () => void,
): () => void {
  if (typeof EventSource === "undefined") return () => {};

  let cancelled = false;
  let retryTimer: number | undefined;
  let stream: EventSource | null = null;

  const connect = () => {
    if (cancelled) return;
    stream = new EventSource(baseUrl + "/soil/stream/" + encodeURIComponent(deviceId));
    stream.addEventListener("ready", onUpdate);
    stream.addEventListener("update", onUpdate);
    stream.addEventListener("error", () => {
      stream?.close();
      stream = null;
      if (cancelled) return;
      retryTimer = window.setTimeout(connect, 5000);
    });
  };

  connect();

  return () => {
    cancelled = true;
    if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    stream?.close();
    stream = null;
  };
}
