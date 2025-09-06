import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase.config";
import { getRestaurantInfo, saveRestaurantInfo } from "../../controllers/restaurantController";

export default function StatusTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    open: true,
    openingTime: "09:00",
    closingTime: "22:00",
  });

  const ownerId = auth.currentUser?.uid;

  useEffect(() => {
    (async () => {
      if (!ownerId) return;
      const r = await getRestaurantInfo(ownerId);
      setForm({
        open: !!r.open,
        openingTime: r.openingTime || "09:00",
        closingTime: r.closingTime || "22:00",
      });
      setLoading(false);
    })();
  }, [ownerId]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const save = async () => {
    setSaving(true);
    await saveRestaurantInfo(ownerId, {
      open: form.open,
      openingTime: form.openingTime,
      closingTime: form.closingTime,
    });
    setSaving(false);
    alert("Status updated ✅");
  };

  if (loading) return <p className="p-4">Loading status…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">Status</h2>

      <div className="bg-white rounded shadow p-5 space-y-5">
        {/* Open/Closed toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Status</p>
            <p className={`text-lg font-semibold ${form.open ? "text-green-700" : "text-red-600"}`}>
              {form.open ? "Open" : "Closed"}
            </p>
          </div>

          <label className="inline-flex items-center gap-3 cursor-pointer">
            <span className="text-sm">Closed</span>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={form.open}
              onChange={(e) => setForm((p) => ({ ...p, open: e.target.checked }))}
            />
            <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 relative transition-colors">
              <div className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
            </div>
            <span className="text-sm">Open</span>
          </label>
        </div>

        {/* Opening / Closing times */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Opening Time</label>
            <input
              type="time"
              name="openingTime"
              value={form.openingTime}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Closing Time</label>
            <input
              type="time"
              name="closingTime"
              value={form.closingTime}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-5 py-2 rounded"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Tip: the Open/Closed button in your header can just navigate to this tab for updates.
      </p>
    </div>
  );
}
