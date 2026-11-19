export default function ProfilePage() {
  const info: { label: string; value: string }[] = [
    { label: "Full Name", value: "Obama Mulondo Victor" },
    { label: "Role", value: "Administrator" },
    { label: "Email", value: "obamamulondo6@gmail.com" },
    { label: "Phone", value: "+250 787 880 064" },
    { label: "Farm / Project", value: "AgriSense Smart Irrigation" },
    { label: "Location", value: "Rwanda" },
  ];

  return (
    <div className="w-full text-white">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
        <p className="text-sm text-emerald-100/70 mt-1">User account overview (static).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/10 border border-white/15 rounded-xl p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-2xl font-bold mb-3">OM</div>
          <h2 className="text-lg font-semibold">Obama M. Victor</h2>
          <p className="text-sm text-emerald-100/70">Admin</p>
          <span className="mt-3 text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">Active</span>
        </div>

        <div className="lg:col-span-2 bg-white/10 border border-white/15 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">Account Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {info.map((item: { label: string; value: string }) => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-xs text-emerald-100/60 mb-1">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white/10 border border-white/15 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-2">Preferences</h2>
        <p className="text-sm text-emerald-100/75">Theme, notification, and irrigation preferences can be managed from Settings page. Profile editing and authentication will be added later.</p>
      </div>
    </div>
  );
}