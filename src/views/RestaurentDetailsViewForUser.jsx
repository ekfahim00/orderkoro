import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRestaurantInfo } from "../controllers/restaurantController";
import SiteHeader from "./siteHeader"; // keep your existing path
import { placeOrder } from "../controllers/orderController";
import { auth } from "../firebase/firebase.config";

const DELIVERY_FEE = 60;
const VAT_RATE = 0.15;
const money = (n) => `৳${Number(n || 0).toFixed(2)}`;

export default function RestaurantDetailsViewForUser() {
  const { id } = useParams(); // restaurant doc id (ownerId)
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [r, setR] = useState(null);

  // cart shape: { [itemId]: { id, name, price, quantity, image } }
  const [cart, setCart] = useState({});

  // checkout modal state
  const [showCheckout, setShowCheckout] = useState(false);
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cAddress, setCAddress] = useState("");

  // --- load restaurant + cart ---
  useEffect(() => {
    (async () => {
      const data = await getRestaurantInfo(id); // uses your controller
      setR(data);
      setLoading(false);
    })();

    // load cart from localStorage for this restaurant
    try {
      const raw = localStorage.getItem(`cart_${id}`);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [id]);

  // persist cart
  useEffect(() => {
    localStorage.setItem(`cart_${id}`, JSON.stringify(cart));
  }, [cart, id]);

  // turn menus map -> array
  const items = useMemo(() => {
    const m = r?.menus || {};
    return Object.entries(m).map(([itemId, item]) => ({ id: itemId, ...item }));
  }, [r]);

  const addToCart = (item) => {
    setCart((prev) => {
      const prevLine = prev[item.id];
      const nextQty = (prevLine?.quantity || 0) + 1;
      return {
        ...prev,
        [item.id]: {
          id: item.id,
          name: item.name,
          price: Number(item.price || 0),
          image: item.image || "",
          quantity: nextQty,
        },
      };
    });
  };

  const inc = (itemId) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], quantity: prev[itemId].quantity + 1 },
    }));
  };

  const dec = (itemId) => {
    setCart((prev) => {
      const line = prev[itemId];
      if (!line) return prev;
      const next = { ...prev };
      const q = line.quantity - 1;
      if (q <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = { ...line, quantity: q };
      }
      return next;
    });
  };

  const removeLine = (itemId) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const clearCart = () => setCart({});

  // totals
  const { subtotal, vat, delivery, total } = useMemo(() => {
    const lines = Object.values(cart);
    const subtotal = lines.reduce(
      (s, line) => s + Number(line.price || 0) * Number(line.quantity || 0),
      0
    );
    const vat = subtotal * VAT_RATE;
    const delivery = lines.length > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + vat + delivery;
    return { subtotal, vat, delivery, total };
  }, [cart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <main className="max-w-6xl mx-auto px-4 py-6">Loading…</main>
      </div>
      
    );
  }

  if (!r) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <main className="max-w-6xl mx-auto px-4 py-6">
          Restaurant not found.
          <div>
            <button
              onClick={() => navigate("/")}
              className="mt-3 text-purple-600 underline"
            >
              Go back
            </button>
          </div>
        </main>
      </div>
    );
  }

  const cover = r.cover || "";
  const logo = r.logo || "";
  const open = !!r.open;

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 rounded border hover:bg-gray-50"
        >
          ← Back
        </button>
        </div>
        {/* Header card */}
        <div className="rounded-xl overflow-hidden bg-white shadow">
          <div className="relative h-52 w-full bg-gray-100">
            {cover ? (
              <img src={cover} alt={r.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-gray-400 text-sm">
                No cover
              </div>
            )}
            <span
              className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full ${
                open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {open ? "Open" : "Closed"}
            </span>
          </div>

          <div className="p-4 flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden -mt-10 ring-4 ring-white">
              {logo ? (
                <img src={logo} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-[10px] text-gray-400">
                  No logo
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{r.name || "Unnamed"}</h1>
              <p className="text-sm text-gray-600">
                {r.address || "No address provided"}
              </p>
              <div className="mt-1 text-xs text-gray-500 flex items-center gap-4 flex-wrap">
                <span>Rating: {(r.rating ?? 0).toFixed(1)}/5</span>
                <span>Reviews: {r.totalReviews ?? 0}</span>
                <span>
                  Hours: {r.openingTime || "--:--"} – {r.closingTime || "--:--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body: menu + cart */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Menu list */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow">
              <div className="px-5 py-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
              </div>

              {items.length === 0 ? (
                <div className="p-6 text-gray-600">No items yet.</div>
              ) : (
                <ul className="divide-y">
                  {items.map((it) => {
                    const inCart = cart[it.id];
                    const disabled = !it.available;
                    return (
                      <li key={it.id} className="px-5 py-4 flex gap-4 items-center">
                        <div className="w-20 h-20 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-[10px] text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{it.name}</p>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full ${
                                it.available
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {it.available ? "Available" : "Unavailable"}
                            </span>
                          </div>
                          {it.description && (
                            <p className="text-sm text-gray-600">{it.description}</p>
                          )}
                          <p className="mt-1 font-semibold">{money(it.price)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!inCart ? (
                            <button
                              disabled={disabled || !open}
                              onClick={() => {
                                if (!open) {
                                  alert("Sorry, this store is closed right now.");
                                  return;
                                }
                                addToCart(it);
                              }}
                              className={`px-3 py-1.5 rounded text-sm ${
                                disabled || !open
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-purple-600 text-white hover:bg-purple-700"
                              }`}
                            >
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => dec(it.id)}
                                className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300"
                                title="Decrease"
                              >
                                –
                              </button>
                              <span className="min-w-[2ch] text-center">
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() => inc(it.id)}
                                className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300"
                                title="Increase"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeLine(it.id)}
                                className="ml-2 text-red-600 text-sm hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
          {/* Cart sidebar */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow sticky top-24">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Your Cart</h3>
                {Object.keys(cart).length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {Object.keys(cart).length === 0 ? (
                <div className="p-6 text-gray-600">Your cart is empty.</div>
              ) : (
                <>
                  <ul className="divide-y">
                    {Object.values(cart).map((line) => (
                      <li key={line.id} className="px-5 py-4 flex gap-3 items-center">
                        <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          {line.image ? (
                            <img
                              src={line.image}
                              alt={line.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-[10px] text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-medium leading-tight">{line.name}</p>
                          <p className="text-xs text-gray-500">
                            {money(line.price)} × {line.quantity}
                          </p>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <p className="font-semibold">
                            {money(line.price * line.quantity)}
                          </p>
                          <div className="flex justify-end gap-1 mt-1">
                            <button
                              onClick={() => dec(line.id)}
                              className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
                              title="Decrease"
                            >
                              –
                            </button>
                            <button
                              onClick={() => inc(line.id)}
                              className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="px-5 py-4 border-t space-y-1 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (15%)</span>
                      <span>{money(vat)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>{money(delivery)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-1">
                      <span>Total</span>
                      <span>{money(total)}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (!open) {
                          alert("Sorry, this store is closed right now.");
                          return;
                        }
                        setShowCheckout(true);
                      }}
                      className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                    >
                      Place Order
                    </button>

                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/30 z-40 grid place-items-center">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-5">
            <h3 className="text-lg font-semibold mb-3">Delivery Details</h3>

            <div className="space-y-3">
              <input
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                placeholder="Your full name"
                className="w-full border rounded px-3 py-2"
              />
              <input
                value={cPhone}
                onChange={(e) => setCPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                value={cAddress}
                onChange={(e) => setCAddress(e.target.value)}
                placeholder="Delivery address"
                rows={3}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCheckout(false)}
                className="px-3 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!cName || !cPhone || !cAddress) {
                    alert("Please fill all fields");
                    return;
                  }
                  const user = auth.currentUser;
                  if (!user) {
                    alert("Please log in to place an order.");
                    return;
                  }

                  // build items array from cart object
                  const items = Object.values(cart).map(line => ({
                    productId: line.id,
                    name: line.name,
                    price: line.price,
                    quantity: line.quantity,
                    image: line.image || "",
                  }));

                  try {
                    const orderId = await placeOrder({
                      customerId: user.uid,
                      customerName: cName,
                      customerPhone: cPhone,
                      customerAddress: cAddress,
                      restaurantId: id,      // route param is the restaurant doc id
                      orderType: "delivery", // for now
                      items,
                    });

                    // clear cart and go to confirmation page
                    setCart({});
                    localStorage.removeItem(`cart_${id}`);
                    setShowCheckout(false);
                    navigate(`/order/${orderId}/confirm`);
                  } catch (e) {
                    console.error(e);
                    alert("Failed to place order. Try again.");
                  }
                }}
                className="px-3 py-2 rounded bg-purple-600 text-white"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
