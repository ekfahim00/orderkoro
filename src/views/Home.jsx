import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRestaurants } from "../controllers/restaurantController";
import SiteHeader from "./siteHeader";

function RestaurantCard({ r, onClick }) {
  const cover = r.cover || "";
  const logo = r.logo || "";
  const open = !!r.open;

  return (
    <button
      onClick={onClick}
      className="text-left rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition-all duration-200"
    >
      {/* Cover */}
      <div className="relative h-36 w-full bg-gray-100">
        {cover ? (
          <img src={cover} alt={r.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400 text-sm">
            No cover
          </div>
        )}
        {/* Open badge */}
        <span
          className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full ${
            open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {open ? "Open" : "Closed"}
        </span>
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
            {logo ? (
              <img src={logo} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-[10px] text-gray-400">
                No logo
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold leading-tight">{r.name || "Unnamed"}</p>
            <p className="text-xs text-gray-500 truncate">{r.address || "No address"}</p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>Rating: {(r.rating ?? 0).toFixed(1)}/5</span>
          <span>Orders: {r.totalOrders ?? 0}</span>
        </div>
      </div>
    </button>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const list = await getAllRestaurants();
      setRestaurants(list);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return restaurants;
    return restaurants.filter((r) => (r.name || "").toLowerCase().includes(s));
  }, [q, restaurants]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search restaurants by name…"
            className="w-full md:w-1/2 border rounded px-3 py-2"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <p className="text-gray-600">Loading restaurants…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">No restaurants found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => (
              <RestaurantCard
                key={r.id}
                r={r}
                onClick={() => navigate(`/r/${r.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
