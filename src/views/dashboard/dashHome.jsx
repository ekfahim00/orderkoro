import { useEffect, useMemo, useState } from "react";
import { auth } from "../../firebase/firebase.config";
import { getRestaurantInfo } from "../../controllers/restaurantController";
import { subscribeAllOrders } from "../../controllers/orderController";
import dayjs from "dayjs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DashboardReport from "./reportdownload";

const money = (n) => `৳${Number(n || 0).toFixed(2)}`;

export default function DashHome() {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState(null); // all orders for this restaurant (live subscription)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      const ownerId = auth.currentUser?.uid;
      if (!ownerId) return;
      const data = await getRestaurantInfo(ownerId);
      setRestaurant(data);
      setLoading(false);
    };
    fetchInfo();
  }, []);

  //  Subscribe to all orders for this restaurant 
  useEffect(() => {
    const ownerId = auth.currentUser?.uid;
    if (!ownerId) return;
    const unsub = subscribeAllOrders(
      ownerId,
      (list) => setOrders(list || []),
      (err) => {
        console.error(err);
        setOrders([]);
      }
    );
    return () => unsub && unsub();
  }, []);

  //Compute aggregates for tiles + performance
  const stats = useMemo(() => {
    if (!orders) return null;

    const delivered = orders.filter((o) => o.status === "delivered");
    const totalOrders = delivered.length;
    const totalRevenue = delivered.reduce((s, o) => s + Number(o.total || 0), 0);

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const startThis7 = now - 7 * DAY;
    const startPrev7 = now - 14 * DAY;
    const endPrev7 = startThis7;

    const inRange = (o, start, end) =>
      typeof o.placedAt === "number" && o.placedAt >= start && o.placedAt < end;

    // Only count delivered in revenue 
    const this7 = delivered.filter((o) => inRange(o, startThis7, now));
    const prev7 = delivered.filter((o) => inRange(o, startPrev7, endPrev7));

    const this7Orders = this7.length;
    const this7Revenue = this7.reduce((s, o) => s + Number(o.total || 0), 0);

    const prev7Orders = prev7.length;
    const prev7Revenue = prev7.reduce((s, o) => s + Number(o.total || 0), 0);

    const ordersDiff = this7Orders - prev7Orders;
    const revenueDiff = this7Revenue - prev7Revenue;

    return {
      totalOrders,
      totalRevenue,
      this7Orders,
      this7Revenue,
      prev7Orders,
      prev7Revenue,
      ordersDiff,
      revenueDiff,
    };
  }, [orders]);

  if (loading || !restaurant) return <p className="p-4">Loading dashboard...</p>;
  if (!orders || !stats) return <p className="p-4">Loading metrics…</p>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <PDFDownloadLink
          document={<DashboardReport restaurant={restaurant} />}
          fileName="restaurant_report.pdf"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {({ loading }) => (loading ? "Preparing..." : "Download Report (PDF)")}
        </PDFDownloadLink>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white shadow p-4 rounded">
          <h4 className="font-semibold">Total Orders</h4>
          <p className="text-2xl">{stats.totalOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Delivered only</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h4 className="font-semibold">Total Revenue</h4>
          <p className="text-2xl">{money(stats.totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Delivered only</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h4 className="font-semibold">Rating</h4>
          <p className="text-2xl">{Number(restaurant.rating ?? 0).toFixed(1)} / 5</p>
        </div>
      </div>

      {/* Best sellers placeholder */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <h4 className="text-xl font-semibold mb-2">Best Selling Items</h4>
        <ul className="list-disc pl-5 text-gray-700">
          <li>Coming soon — requires item-level sales aggregation.</li>
          <li>Coming soon — requires item-level sales aggregation.</li>
          <li>Coming soon — requires item-level sales aggregation.</li>
        </ul>
      </div>

      {/* Performance section */}
      <div className="bg-white shadow p-4 rounded space-y-4">
        <h4 className="text-xl font-semibold">Performance</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded p-3">
            <p className="font-medium mb-1">This 7 days</p>
            <p>Total Orders: {stats.this7Orders}</p>
            <p>Total Revenue: {money(stats.this7Revenue)}</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="font-medium mb-1">Previous 7 days</p>
            <p>Total Orders: {stats.prev7Orders}</p>
            <p>Total Revenue: {money(stats.prev7Revenue)}</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="font-medium mb-1">Difference</p>
            <p>Orders: {stats.ordersDiff >= 0 ? "+" : ""}{stats.ordersDiff}</p>
            <p>Revenue: {stats.revenueDiff >= 0 ? "+" : ""}{money(stats.revenueDiff)}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t">
        <h4 className="text-sm text-gray-600">
          Report generated on {dayjs().format("MMMM D, YYYY h:mm A")}
        </h4>
        <p className="text-xs text-gray-400">Restaurant ID: {restaurant.ownerId}</p>
      </div>
    </div>
  );
}
