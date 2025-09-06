// src/views/UserDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase.config";
import { signOut } from "firebase/auth";
import { subscribeUserInfo, saveUserInfo } from "../controllers/userController";
import { subscribeUserOrders, rateOrder } from "../controllers/orderController";



const money = (n) => `৳${Number(n || 0).toFixed(2)}`;
const fmtTime = (ms) => (ms ? new Date(ms).toLocaleString() : "--");

export default function UserDashboard() {
  const navigate = useNavigate();

  const uid = auth.currentUser?.uid || null;
  const email = auth.currentUser?.email || "";

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    addresses: [],
    paymentMethod: "cash",
  });

  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (!uid) return;

    const unsubProfile = subscribeUserInfo(
      uid,
      (data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          contact: data.contact || "",
          addresses: Array.isArray(data.addresses) ? data.addresses : [],
          paymentMethod: data.paymentMethod || "cash",
        });
        setLoading(false);
      },
      (err) => console.error(err)
    );

    const unsubOrders = subscribeUserOrders(
      uid,
      (list) => setOrders(list),
      (err) => console.error(err)
    );

    return () => {
      unsubProfile?.();
      unsubOrders?.();
    };
  }, [uid]);

  const safeOrders = orders || [];
  const delivered = useMemo(
    () => safeOrders.filter((o) => o.status === "delivered"),
    [safeOrders]
  );
  const unratedDelivered = useMemo(
    () => delivered.filter((o) => o.rating === undefined || o.rating === null),
    [delivered]
  );
  const totalSpent = useMemo(
    () => delivered.reduce((s, o) => s + Number(o.total || 0), 0),
    [delivered]
  );

  const handleLogout = async () => {
    const ok = window.confirm("Are you sure you want to log out?");
    if (!ok) return;
    await signOut(auth);
    navigate("/login");
  };

  if (!uid) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded border hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-2">Customer Dashboard</h2>
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded border hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-2">Customer Dashboard</h2>
        <p>Loading your data…</p>
      </div>
    );
  }

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onAddressesChange = (e) => {
    const arr = e.target.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((p) => ({ ...p, addresses: arr }));
  };

  const saveProfile = async () => {
    await saveUserInfo(uid, {
      ...profile,
      name: form.name,
      contact: form.contact,
      addresses: form.addresses,
      paymentMethod: form.paymentMethod || "cash",
    });
    setEditing(false);
    alert("Profile updated ✅");
  };

  const openRate = (order) => {
    setRatingOrder(order);
    setStars(5);
    setReviewText("");
    setRatingOpen(true);
  };

  const submitRating = async () => {
    if (!ratingOrder) return;
    await rateOrder(ratingOrder.id, stars, reviewText);
    setRatingOpen(false);
    alert("Thanks for your rating!");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header with Back & Logout */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 rounded border hover:bg-gray-50"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold">Customer Dashboard</h2>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Profile card */}
      <section className="bg-white rounded-lg shadow p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">Your Profile</h3>
            <p className="text-gray-500 text-sm">Manage your contact info</p>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
              >
                Edit Info
              </button>
            ) : (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onFormChange}
              disabled={!editing}
              className="w-full border rounded px-3 py-2"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input
              name="contact"
              value={form.contact}
              onChange={onFormChange}
              disabled={!editing}
              className="w-full border rounded px-3 py-2"
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              value={email}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">
              Addresses (one per line)
            </label>
            <textarea
              rows={3}
              value={(form.addresses || []).join("\n")}
              onChange={onAddressesChange}
              disabled={!editing}
              className="w-full border rounded px-3 py-2"
              placeholder="House, Road, Area, City"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Payment Method</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod || "cash"}
              onChange={onFormChange}
              disabled={!editing}
              className="w-full border rounded px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="bkash">bKash</option>
            </select>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <Stats delivered={delivered.length} unrated={unratedDelivered.length} totalSpent={totalSpent} />

      {/* Past orders */}
      <OrdersList orders={safeOrders} onRate={openRate} />

      {/* Rating modal */}
      {ratingOpen && ratingOrder && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-3">Rate your order</h4>
            <p className="text-sm text-gray-600 mb-2">
              Order #{ratingOrder.orderId || ratingOrder.id}
            </p>

            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStars(n)}
                  className={`w-9 h-9 rounded border grid place-items-center ${
                    n <= stars ? "bg-yellow-300 border-yellow-400" : "bg-white"
                  }`}
                  title={`${n} star${n > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Share your feedback (optional)"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRatingOpen(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stats({ delivered, unrated, totalSpent }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-500">Delivered Orders</p>
        <p className="text-2xl font-semibold">{delivered}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-500">Unrated Delivered Orders</p>
        <p className="text-2xl font-semibold">{unrated}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-500">Total Spent</p>
        <p className="text-2xl font-semibold">{money(totalSpent)}</p>
      </div>
    </section>
  );
}

function OrdersList({ orders, onRate }) {
  return (
    <section className="bg-white rounded-lg shadow">
      <div className="px-5 py-4 border-b">
        <h3 className="text-xl font-semibold">Your Orders</h3>
        <p className="text-sm text-gray-500">Tap an order to view details</p>
      </div>

      {orders.length === 0 ? (
        <div className="p-6 text-gray-600">No orders yet.</div>
      ) : (
        <ul className="divide-y">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} onRate={() => onRate(o)} />
          ))}
        </ul>
      )}
    </section>
  );
}

function OrderRow({ order, onRate }) {
  const [open, setOpen] = useState(false);
  const rated = order.rating !== undefined && order.rating !== null;
  const moneyFmt = (n) => `৳${Number(n || 0).toFixed(2)}`;
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <li>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-center justify-between"
      >
        <div>
          <p className="font-medium">
            Order #{order.orderId || order.id} • {order.status}
          </p>
          <p className="text-xs text-gray-500">Placed: {fmtTime(order.placedAt)}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{moneyFmt(order.total)}</p>
          {!rated && order.status === "delivered" && (
            <span className="text-xs text-green-700">Tap to rate</span>
          )}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-4">
          <div className="bg-gray-50 rounded p-3 mb-3">
            <p className="text-sm font-semibold mb-2">Items</p>
            {items.length === 0 ? (
              <p className="text-sm text-gray-600">No items.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {items.map((it, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>
                      {it.name} × {it.quantity}
                    </span>
                    <span>{moneyFmt(Number(it.price) * Number(it.quantity))}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="font-semibold">Total: {moneyFmt(order.total)}</p>
            {order.status === "delivered" &&
              (rated ? (
                <span className="text-sm text-gray-600">Rated: {order.rating}★</span>
              ) : (
                <button
                  onClick={onRate}
                  className="px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700 text-sm"
                >
                  Rate order
                </button>
              ))}
          </div>
        </div>
      )}
    </li>
  );
}
