export default function DevicePage() {
  const devices: { id: string; name: string; location: string; status: string; moisture: string; pump: string; lastSeen: string }[] = [
    { id: "ESP32-001", name: "Greenhouse Node A", location: "Block 1", status: "Online", moisture: "62%", pump: "OFF", lastSeen: "2 min ago" },
    { id: "ESP32-002", name: "Field Node B", location: "Block 2", status: "Online", moisture: "48%", pump: "ON", lastSeen: "5 min ago" },
    { id: "ESP32-003", name: "Nursery Node C", location: "Nursery", status: "Offline", moisture: "35%", pump: "OFF", lastSeen: "1 hr ago" },
  ];

  return (
    <div className="w-full p-1 md:p-2 text-gray-900 dark:text-white">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Device Management</h1>
        <p className="text-sm text-emerald-100/70 mt-1">Manage connected ESP32 devices and irrigation controllers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 border border-white/15 rounded-xl p-4">
          <p className="text-xs text-emerald-100/70">Total Devices</p>
          <p className="text-2xl font-bold mt-2">3</p>
        </div>
        <div className="bg-white/10 border border-white/15 rounded-xl p-4">
          <p className="text-xs text-emerald-100/70">Online</p>
          <p className="text-2xl font-bold mt-2 text-emerald-300">2</p>
        </div>
        <div className="bg-white/10 border border-white/15 rounded-xl p-4">
          <p className="text-xs text-emerald-100/70">Offline</p>
          <p className="text-2xl font-bold mt-2 text-red-300">1</p>
        </div>
      </div>

      <div className="bg-white/10 border border-white/15 rounded-xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Registered Devices</h2>
          <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold">Add Device</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-100/70 border-b border-white/10">
                <th className="py-3 pr-3">Device ID</th>
                <th className="py-3 pr-3">Name</th>
                <th className="py-3 pr-3">Location</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-3">Moisture</th>
                <th className="py-3 pr-3">Pump</th>
                <th className="py-3 pr-3">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device: { id: string; name: string; location: string; status: string; moisture: string; pump: string; lastSeen: string }) => (
                <tr key={device.id} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-3 font-medium">{device.id}</td>
                  <td className="py-3 pr-3">{device.name}</td>
                  <td className="py-3 pr-3">{device.location}</td>
                  <td className="py-3 pr-3">
                    <span className={device.status === "Online" ? "text-emerald-300" : "text-red-300"}>{device.status}</span>
                  </td>
                  <td className="py-3 pr-3">{device.moisture}</td>
                  <td className="py-3 pr-3">{device.pump}</td>
                  <td className="py-3 pr-3 text-emerald-100/70">{device.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}