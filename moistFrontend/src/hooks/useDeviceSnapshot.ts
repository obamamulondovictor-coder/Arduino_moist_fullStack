import { useEffect, useState } from "react";
import type { DeviceSnapshot, IrrigationSettings } from "../types.ts";
import { fetchDevices, fetchSnapshot, subscribeToSnapshot } from "../services/api.ts";

export interface BackendDevice {
  device_id: string;
  device_name: string;
  ip_address: string | null;
  operating_mode: string;
  pump_state: string;
  location: string | null;
  status: string;
  registered_at: string;
}

const DEFAULT_SETTINGS: IrrigationSettings = {
  startThreshold: 30,
  stopThreshold: 45,
  maxRuntimeSeconds: 90,
  cooldownSeconds: 60,
  minTankLevel: 12,
  staleAfterSeconds: 30,
};

function emptySnapshot(deviceId: string, deviceName = "North field node"): DeviceSnapshot {
  return {
    telemetry: {
      deviceId,
      soilMoisture: null,
      airTemperature: null,
      airHumidity: null,
      tankLevel: null,
      sensorValid: false,
      signalStrength: 0,
      timestamp: Date.now(),
    },
    pumpStatus: "UNKNOWN",
    mode: "AUTO",
    online: false,
    pumpStartedAt: null,
    cooldownUntil: null,
    fault: null,
    faultAt: null,
    settings: DEFAULT_SETTINGS,
    alerts: [],
    events: [],
    history: [],
    lastSync: null,
    controlReason: "Connecting to the irrigation controller",
    firmware: "--",
    deviceName,
  };
}

export function useDeviceSnapshot() {
  const [devices, setDevices] = useState<BackendDevice[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [snapshot, setSnapshot] = useState<DeviceSnapshot>(() => emptySnapshot(""));
  const [now, setNow] = useState(() => Date.now());
  const [connected, setConnected] = useState(false);

  const deviceId = selectedId || devices[0]?.device_id || "";
  const visibleSnapshot =
    snapshot.telemetry.deviceId === deviceId
      ? snapshot
      : emptySnapshot(deviceId);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const rows = await fetchDevices();
        if (!cancelled) setDevices(rows);
      } catch {
        if (!cancelled) setDevices([]);
      }
    };
    void load();
    const timer = window.setInterval(() => { void load(); }, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    let cancelled = false;
    const refresh = async () => {
      try {
        const next = await fetchSnapshot(deviceId);
        if (cancelled) return;
        setSnapshot(next);
        setConnected(true);
      } catch {
        if (cancelled) return;
        setConnected(false);
        setSnapshot((previous) =>
          previous.telemetry.deviceId === deviceId
            ? {
                ...previous,
                online: false,
                controlReason: "Backend unavailable — showing the last database reading.",
              }
            : previous,
        );
      }
    };

    void refresh();
    const unsubscribe = subscribeToSnapshot(deviceId, () => { void refresh(); });
    const timer = window.setInterval(() => { void refresh(); }, 5000);
    window.addEventListener("online", refresh);

    return () => {
      cancelled = true;
      unsubscribe();
      window.clearInterval(timer);
      window.removeEventListener("online", refresh);
    };
  }, [deviceId]);

  return {
    devices,
    deviceId,
    selectDevice: setSelectedId,
    snapshot: visibleSnapshot,
    now,
    connected,
  };
}
