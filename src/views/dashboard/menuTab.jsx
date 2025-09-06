import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase.config";
import {
  getRestaurantInfo,
  saveRestaurantInfo,
} from "../../controllers/restaurantController";

const EMPTY_FORM = {
  name: "",
  price: "",
  description: "",
  image: "",
  available: true,
};

export default function MenuTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // menus is a map: { itemId: { name, price, description, image, available } }
  const [menus, setMenus] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);

  const ownerId = auth.currentUser?.uid;

  // Load menus
  useEffect(() => {
    (async () => {
      if (!ownerId) return;
      const r = await getRestaurantInfo(ownerId);
      setMenus(r.menus || {});
      setLoading(false);
    })();
  }, [ownerId]);

  // Helper: persist to Firestore and update local
  const commit = async (nextMenus, msg = "") => {
    setSaving(true);
    await saveRestaurantInfo(ownerId, { menus: nextMenus });
    setMenus(nextMenus);
    setSaving(false);
    if (msg) console.log(msg);
  };

  // Add item
  const addItem = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Item name is required.");
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const price = Number.parseFloat(form.price || "0");
    const nextMenus = {
      ...menus,
      [id]: {
        name: form.name.trim(),
        price: Number.isNaN(price) ? 0 : price,
        description: form.description.trim(),
        image: form.image.trim(),
        available: !!form.available,
      },
    };
    await commit(nextMenus, "Item added");
    setForm(EMPTY_FORM);
  };

  // Toggle availability
  const toggleAvailable = async (id) => {
    const nextMenus = {
      ...menus,
      [id]: { ...menus[id], available: !menus[id].available },
    };
    await commit(nextMenus, "Availability updated");
  };

  // Delete item
  const removeItem = async (id) => {
    if (!confirm("Delete this item?")) return;
    const nextMenus = { ...menus };
    delete nextMenus[id];
    await commit(nextMenus, "Item removed");
  };

  // Form state
  const onFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  if (loading) return <p className="p-4">Loading menu…</p>;

  const items = Object.entries(menus); // [ [id, item], ... ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Menu</h2>
        {saving && <span className="text-sm text-gray-500">Saving…</span>}
      </div>

      {/* Add item form */}
      <form
        onSubmit={addItem}
        className="bg-white rounded shadow p-4 grid grid-cols-1 md:grid-cols-12 gap-3"
      >
        <input
          name="name"
          value={form.name}
          onChange={onFieldChange}
          placeholder="Item name *"
          className="md:col-span-3 border rounded px-3 py-2"
          required
        />
        <input
          type="number"
          step="0.01"
          name="price"
          value={form.price}
          onChange={onFieldChange}
          placeholder="Price (e.g. 220)"
          className="md:col-span-2 border rounded px-3 py-2"
        />
        <input
          name="image"
          value={form.image}
          onChange={onFieldChange}
          placeholder="Image URL (optional)"
          className="md:col-span-3 border rounded px-3 py-2"
        />
        <input
          name="description"
          value={form.description}
          onChange={onFieldChange}
          placeholder="Short description"
          className="md:col-span-3 border rounded px-3 py-2"
        />
        <label className="md:col-span-1 flex items-center gap-2">
          <input
            type="checkbox"
            name="available"
            checked={form.available}
            onChange={onFieldChange}
          />
          <span className="text-sm">Available</span>
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Add item
          </button>
        </div>
      </form>

      {/* Items list */}
      <div className="bg-white rounded shadow">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="font-semibold">Items ({items.length})</h3>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No items yet. Use the form above to add your first item.
          </div>
        ) : (
          <ul className="max-h-[65vh] overflow-y-auto divide-y">
            {items.map(([id, item]) => (
              <li key={id} className="flex items-center gap-4 px-4 py-3">
                {/* Image */}
                <div className="w-14 h-14 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500">
                      ৳{Number(item.price || 0).toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!item.available}
                      onChange={() => toggleAvailable(id)}
                    />
                    <span>Available</span>
                  </label>
                  <button
                    onClick={() => removeItem(id)}
                    className="text-red-600 hover:underline text-sm"
                    title="Delete item"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
