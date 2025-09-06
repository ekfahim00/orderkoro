import { calcTotals, updateOrderStatus } from "../../controllers/orderController";

const stepNext = (s) => {
  if (s === "placed") return "accepted";
  if (s === "accepted") return "preparing";
  if (s === "preparing") return "ready";
  if (s === "ready") return "delivered";
  return null;
};

const badgeClass = (status) => {
  const base = "text-xs px-2 py-0.5 rounded-full";
  switch (status) {
    case "placed":
      return `${base} bg-blue-100 text-blue-700`;
    case "accepted":
      return `${base} bg-indigo-100 text-indigo-700`;
    case "preparing":
      return `${base} bg-amber-100 text-amber-700`;
    case "ready":
      return `${base} bg-green-100 text-green-700`;
    case "delivered":
      return `${base} bg-gray-200 text-gray-700`;
    case "cancel":
      return `${base} bg-red-100 text-red-700`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
};

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  const next = stepNext(order.status);
  const { subtotal, vat, delivery, total } = calcTotals(order.items || []);

  return (
    <div className="fixed inset-0 z-40">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      {/* modal */}
      <div className="absolute inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-start justify-between p-5 border-b">
            <div>
              <h3 className="text-xl font-bold">
                Order #{(order.id || order.orderId || "").slice(-6)}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <span className={badgeClass(order.status)}>{order.status}</span>
                <span>
                  Placed: {order.placedAt ? new Date(order.placedAt).toLocaleString() : "—"}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Customer */}
            <section>
              <h4 className="font-semibold mb-2">Customer</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                <p><span className="text-gray-500">Name:</span> {order.customerName || "—"}</p>
                <p><span className="text-gray-500">Phone:</span> {order.customerPhone || "—"}</p>
                <p className="sm:col-span-2">
                  <span className="text-gray-500">Address:</span> {order.customerAddress || "—"}
                </p>
              </div>
            </section>

            {/* Items */}
            <section>
              <h4 className="font-semibold mb-2">Items</h4>
              {(!order.items || order.items.length === 0) ? (
                <p className="text-gray-500 text-sm">No items.</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2">Item</th>
                        <th className="text-right px-3 py-2">Unit</th>
                        <th className="text-right px-3 py-2">Qty</th>
                        <th className="text-right px-3 py-2">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((it) => (
                        <tr key={it.productId} className="border-t">
                          <td className="px-3 py-2">{it.name}</td>
                          <td className="px-3 py-2 text-right">৳{Number(it.price || 0).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">{it.quantity}</td>
                          <td className="px-3 py-2 text-right">
                            ৳{(Number(it.price || 0) * Number(it.quantity || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Totals */}
            <section>
              <h4 className="font-semibold mb-2">Totals</h4>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (15%)</span>
                  <span>৳{vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>৳{delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 mt-1 border-t font-semibold">
                  <span>Total</span>
                  <span>৳{total.toFixed(2)}</span>
                </div>
              </div>
            </section>

            {/* History */}
            <section>
              <h4 className="font-semibold mb-2">Status History</h4>
              {order.history && order.history.length ? (
                <ul className="text-sm text-gray-700 space-y-1">
                  {order.history
                    .slice()
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((h, i) => (
                      <li key={i}>
                        <span className={badgeClass(h.status)}>{h.status}</span>{" "}
                        <span className="text-gray-500">
                          — {h.timestamp ? new Date(h.timestamp).toLocaleString() : "—"}
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No history yet.</p>
              )}
            </section>
          </div>

          {/* Footer actions */}
          <div className="p-5 border-t flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Order ID: {order.id || order.orderId || "—"}
            </p>
            <div className="flex gap-2">
              {order.status !== "cancel" && order.status !== "delivered" && (
                <button
                  onClick={async () => {
                    const nxt = stepNext(order.status);
                    if (!nxt) return;
                    await updateOrderStatus(order.id, nxt);
                  }}
                  className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
                >
                  Mark {stepNext(order.status)}
                </button>
              )}
              {order.status !== "cancel" && order.status !== "delivered" && (
                <button
                  onClick={async () => {
                    await updateOrderStatus(order.id, "cancel");
                  }}
                  className="px-3 py-2 rounded border text-red-600 text-sm"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={onClose}
                className="px-3 py-2 rounded border text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
