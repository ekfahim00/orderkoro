import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase.config";
import {
  subscribeLiveOrders,
  updateOrderStatus,
  calcTotals,
} from "../../controllers/orderController";
import OrderDetailsModal from "./orderDetailsModal";

const nextStatus = (s) => {
  if (s === "placed") return "accepted";
  if (s === "accepted") return "preparing";
  if (s === "preparing") return "ready";
  if (s === "ready") return "delivered";
  return null;
};

export default function LiveOrders() {
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = subscribeLiveOrders(
      uid,
      (list) => {
        setOrders(list);
        setReady(true);
      },
      (err) => {
        console.error(err);
        setReady(true);
      }
    );
    return () => unsub && unsub();
  }, []);

  if (!ready) return <p>Loading live orders…</p>;

  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <img
          src="https://cdn-icons-png.flaticon.com/512/10437/10437645.png"
          alt="No orders"
          className="w-28 mx-auto mb-2"
        />
        No Live Orders
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {orders.map((o) => {
          const { total } = calcTotals(o.items || []);
          const nxt = nextStatus(o.status);

          return (
            <div
              key={o.id}
              role="button"
              onClick={() => setSelected(o)}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">Order #{o.id.slice(-6)}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {o.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                {o.customerName || "Customer"} — ৳{total.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                Placed: {new Date(o.placedAt).toLocaleString()}
              </p>

              <ul className="mt-3 text-sm list-disc pl-5">
                {(o.items || []).slice(0, 3).map((it) => (
                  <li key={it.productId}>
                    {it.name} × {it.quantity}
                  </li>
                ))}
                {(o.items || []).length > 3 && (
                  <li className="text-gray-500">and more…</li>
                )}
              </ul>

              <div className="mt-4 flex gap-2">
                {nxt && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(o.id, nxt);
                    }}
                    className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Mark {nxt}
                  </button>
                )}
                {o.status !== "cancel" && o.status !== "delivered" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(o.id, "cancel");
                    }}
                    className="px-3 py-1 rounded border text-red-600"
                  >
                    Cancel
                  </button>
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
