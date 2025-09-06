
import { useEffect, useState, useMemo } from "react";
import { auth } from "../../firebase/firebase.config";
import { getRestaurantInfo, saveRestaurantInfo } from "../../controllers/restaurantController";

function toMinutes(hhmm = "00:00") {
  const [h, m] = String(hhmm).split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function isNowWithinWindow(openingTime, closingTime) {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = toMinutes(openingTime);
  const closeMins = toMinutes(closingTime);

  if (openMins === closeMins) {
    return false;
  }
  if (openMins < closeMins) {
    return nowMins >= openMins && nowMins < closeMins;
  }
  return nowMins >= openMins || nowMins < closeMins;
}

export default function StatusTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    open: true,
    openingTime: "09:00",
    closingTime: "22:00",
  });

  const ownerId = auth.currentUser?.uid || null;

  useEffect(() => {
    (async () => {
      if (!ownerId) {
        setLoading(false);
        return;
      }
      const r = await getRestaurantInfo(ownerId);
      setForm({
        open: !!r.open,
        openingTime: r.openingTime || "09:00",
        closingTime: r.closingTime || "22:00",
      });
      setLoading(false);
    })();
  }, [ownerId]);

  // Live evaluation of whether "now" is inside the current window
  const withinWindow = useMemo(
    () => isNowWithinWindow(form.openingTime, form.closingTime),
    [form.openingTime, form.closingTime]
  );

  const onTimeChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Toggle handler that blocks opening outside hours
  const onToggle = (checked) => {
    if (checked && !withinWindow) {
      alert("Outside active hours — you can only open during your configured opening times.");
      // keep closed
      setForm((p) => ({ ...p, open: false }));
      return;
    }
    setForm((p) => ({ ...p, open: checked }));
  };

  const save = async () => {
    if (!ownerId) return;
    let payload = { ...form };

    // Safety: never save as "open" if we're outside the window.
    if (payload.open && !withinWindow) {
      alert("Outside active hours — saving as Closed.");
      payload.open = false;
    }

    setSaving(true);
    await saveRestaurantInfo(ownerId, {
      open: payload.open,
      openingTime: payload.openingTime,
      closingTime: payload.closingTime,
    });
    setSaving(false);
  };

  if (!ownerId) {
    return <p className="p-4 text-gray-600">Please log in to manage status.</p>;
  }

  if (loading) return <p className="p-4">Loading status…</p>;

  // Nicety: show "now" time
  const now = new Date();
  const nowStr = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">Status</h2>

      <div className="bg-white rounded shadow p-5 space-y-5">
        {/* Open/Closed toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Status</p>
            <p
              className={`text-lg font-semibold ${
                form.open ? "text-green-700" : "text-red-600"
              }`}
            >
              {form.open ? "Open" : "Closed"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Active hours today: <b>{form.openingTime}</b> – <b>{form.closingTime}</b> • Now:{" "}
              <b>{nowStr}</b> {withinWindow ? "(within hours)" : "(outside hours)"}
            </p>
          </div>

          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <span className="text-sm">Closed</span>

            {/* peer */}
            <input
              type="checkbox"
              className="sr-only peer"
              checked={form.open}
              onChange={(e) => onToggle(e.target.checked)}
              aria-label="Toggle restaurant open/closed"
            />

            {/* track + knob via ::after */}
            <span
              className="
                relative inline-block h-6 w-12 rounded-full bg-gray-300 transition-colors
                peer-checked:bg-green-500
                after:content-[''] after:absolute after:top-0.5 after:left-0.5
                after:h-5 after:w-5 after:rounded-full after:bg-white
                after:transition-transform peer-checked:after:translate-x-6
              "
            />

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
              onChange={onTimeChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Closing Time</label>
            <input
              type="time"
              name="closingTime"
              value={form.closingTime}
              onChange={onTimeChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2 rounded"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Note: you can’t set the store to <em>Open</em> if the current time is outside your active
        hours. Overnight hours (e.g., 18:00–02:00) are supported.
      </p>
    </div>
  );
}
