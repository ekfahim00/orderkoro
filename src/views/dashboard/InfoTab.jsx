import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase.config";
import { getRestaurantInfo, saveRestaurantInfo } from "../../controllers/restaurantController";
import dayjs from "dayjs";

function InfoTab() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    openingTime: "09:00",
    closingTime: "22:00",
    open: true,
    ownerId: "",
    ownerName: "",
    ownerContact: "",
    createdAt: Date.now(),
    rating: 0,
    totalOrders: 0,
    totalReviews: 0,
  });

  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      const ownerId = auth.currentUser?.uid;
      const ownerEmail = auth.currentUser?.email;
      if (!ownerId) return;

      const restaurantData = await getRestaurantInfo(ownerId);
      setForm({ ...restaurantData });
      setOwner({ id: ownerId, email: ownerEmail });
      setLoading(false);
    };

    fetchInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    const ownerId = auth.currentUser?.uid;
    if (!ownerId) return;

    await saveRestaurantInfo(ownerId, form);
    alert("Profile updated successfully!");
    setEditMode(false);
  };

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  const daysSinceCreated = Math.floor((Date.now() - form.createdAt) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6 bg-white p-8 rounded shadow max-w-4xl mx-auto mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Restaurant Profile</h3>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save Changes
          </button>
        )}
      </div>

      <div>
        <h4 className="text-lg font-semibold border-b pb-1 mb-3">Restaurant Info</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Restaurant Name"
            className="w-full border px-3 py-2 rounded"
            value={form.name}
            onChange={handleChange}
            disabled={!editMode}
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            className="w-full border px-3 py-2 rounded"
            value={form.address}
            onChange={handleChange}
            disabled={!editMode}
          />
          <input
            type="time"
            name="openingTime"
            className="w-full border px-3 py-2 rounded"
            value={form.openingTime}
            onChange={handleChange}
            disabled={!editMode}
          />
          <input
            type="time"
            name="closingTime"
            className="w-full border px-3 py-2 rounded"
            value={form.closingTime}
            onChange={handleChange}
            disabled={!editMode}
          />
          <label className="flex items-center gap-2 col-span-2">
            <input
              type="checkbox"
              name="open"
              checked={form.open}
              onChange={handleChange}
              disabled={!editMode}
            />
            <span>{form.open ? "Currently Open" : "Currently Closed"}</span>
          </label>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold border-b pb-1 mb-3">Progress Info</h4>
        <p><strong>Joined:</strong> {dayjs(form.createdAt).format("MMMM D, YYYY")} ({daysSinceCreated} days ago)</p>
        <p><strong>Total Orders:</strong> {form.totalOrders ?? 0}</p>
        <p><strong>Total Reviews:</strong> {form.totalReviews ?? 0}</p>
        <p><strong>Rating:</strong> {form.rating ?? 0}/5</p>
      </div>

      <div>
        <h4 className="text-lg font-semibold border-b pb-1 mb-3">Owner Info</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="ownerName"
            placeholder="Owner Name"
            className="w-full border px-3 py-2 rounded"
            value={form.ownerName}
            onChange={handleChange}
            disabled={!editMode}
          />
          <input
            type="text"
            name="ownerContact"
            placeholder="Owner Contact Number"
            className="w-full border px-3 py-2 rounded"
            value={form.ownerContact}
            onChange={handleChange}
            disabled={!editMode}
          />
          <input
            type="email"
            value={owner?.email || "No Email"}
            disabled
            className="w-full border px-3 py-2 rounded col-span-2 bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}

export default InfoTab;
