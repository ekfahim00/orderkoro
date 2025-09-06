import { useEffect, useMemo, useState } from "react";
import { auth } from "../../firebase/firebase.config";
import {
  subscribeAllOrders,
  calcTotals,
  updateOrderStatus,
} from "../../controllers/orderController";
import OrderDetailsModal from "./orderDetailsModal";

const nextStatus = (s) => {
  if (s === "placed") return "accepted";
  if (s === "accepted") return "preparing";
  if (s === "preparing") return "ready";
  if (s === "ready") return "delivered";
  return null;
};

export default function AllOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("all"); // all | active | delivered | cancel
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = subscribeAllOrders(
      uid,
      (list) => setOrders(list),
      (err) => {
        console.error(err);
        setOrders([]);
      }
    );
    return () => unsub && unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!orders) return null;
    if (filter === "all") return orders;
    if (filter === "active") {
      return orders.filter((o) =>
        ["placed", "accepted", "preparing", "ready"].includes(o.status)
      );
    }
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  if (!orders) return <p>Loading…</p>;
  if (filtered.length === 0)
    return (
      <div>
        <div className="mb-4 flex gap-2">
          <Filter value={filter} setValue={setFilter} />
        </div>
        <p className="text-gray-500">No orders to show.</p>
      </div>
    );

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Filter value={filter} setValue={setFilter} />
      </div>

      <div className="space-y-3">
        {filtered.map((o) => {
          const { total } = calcTotals(o.items || []);
          const nxt = nextStatus(o.status);

          return (
            <div
              key={o.id}
              role="button"
              onClick={() => setSelected(o)}
              className="bg-white rounded shadow p-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold text-lg">Order #{o.id.slice(-6)}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                  {o.status}
                </span>
              </div>

              <p className="text-sm text-gray-600">
                {o.customerName || "Customer"} — ৳{total.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                Placed: {new Date(o.placedAt).toLocaleString()}
              </p>

              <div className="mt-3 flex gap-2">
                {o.status !== "delivered" && o.status !== "cancel" && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(o.id, nxt || "accepted");
                      }}
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Advance Status
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(o.id, "cancel");
                      }}
                      className="px-3 py-1 rounded border text-red-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <OrderDetailsModal order={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function Filter({ value, setValue }) {
  const btn = (v, label) => (
    <button
      onClick={() => setValue(v)}
      className={`px-3 py-1 rounded border text-sm ${
        value === v ? "bg-purple-600 text-white border-purple-600" : "bg-white"
      }`}
    >
      {label}
    </button>
  );
  return (
    <>
      {btn("all", "All")}
      {btn("active", "Active")}
      {btn("delivered", "Delivered")}
      {btn("cancel", "Cancelled")}
    </>
  );
}
