
export default function HelpPage() {
  const faqs: { q: string; a: string }[] = [
    { q: "How do I add a new device?", a: "Go to Devices and use the Add Device button (static demo). In production, register the ESP32 MAC address in the backend." },
    { q: "Why is my device offline?", a: "Check Wi-Fi connectivity, power supply, and backend server availability." },
    { q: "When does the pump turn ON?", a: "In auto mode, the pump activates when soil moisture drops below the configured threshold." },
    { q: "Where can I see moisture trends?", a: "Open Dashboard or Reports/Analytics to view charts by hour, day, or month." },
  ];

  return (
    <div className="w-full text-[var(--text)]">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Help & Support</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Guidance and common questions for the AgriSense system.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-3">Quick Start</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-muted)]">
            <li>Connect ESP32 sensors and flash firmware.</li>
            <li>Start backend server and MySQL database.</li>
            <li>Register devices and verify telemetry.</li>
            <li>Monitor moisture, alerts, and pump status from dashboard.</li>
          </ol>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <div className="text-sm text-[var(--text-muted)] space-y-2">
            <p>Email: <a href="mailto:obamamulondo6@gmail.com" className="text-[var(--accent)] hover:underline">obamamulondo6@gmail.com</a></p>
            <p>Phone: <a href="tel:+250787880064" className="text-[var(--accent)] hover:underline">+250 787 880 064</a></p>
            <p>GitHub: <a href="https://github.com/obamamulondovictor-coder/Arduino_moist_fullStack" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Project Repository</a></p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5">
        <h2 className="text-lg font-semibold mb-4">FAQs</h2>
        <div className="space-y-4">
          {faqs.map((item: { q: string; a: string }) => (
            <div key={item.q} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
              <p className="font-medium mb-1">{item.q}</p>
              <p className="text-sm text-[var(--text-muted)]">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}