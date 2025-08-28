import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase.config";
import { getRestaurantInfo } from "../../controllers/restaurantController";
import dayjs from "dayjs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DashboardReport from "./reportdownload";

function DashHome() {
  const [restaurant, setRestaurant] = useState(null);
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

  if (loading || !restaurant) return <p className="p-4">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        {restaurant && (
          <PDFDownloadLink
            document={<DashboardReport restaurant={restaurant} />}
            fileName="restaurant_report.pdf"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            {({ loading }) => (loading ? "Preparing..." : "Download Report (PDF)")}
          </PDFDownloadLink>
        )}
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white shadow p-4 rounded">
            <h4 className="font-semibold">Total Orders</h4>
            <p className="text-2xl">{restaurant.totalOrders}</p>
          </div>
          <div className="bg-white shadow p-4 rounded">
            <h4 className="font-semibold">Total Revenue</h4>
            <p className="text-2xl">৳0.00</p>
          </div>
          <div className="bg-white shadow p-4 rounded">
            <h4 className="font-semibold">Rating</h4>
            <p className="text-2xl">{restaurant.rating.toFixed(1)} / 5</p>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <h4 className="text-xl font-semibold mb-2">Best Selling Items</h4>
          <ul className="list-disc pl-5 text-gray-700">
            <li>Coming soon — requires order data.</li>
            <li>Coming soon — requires order data.</li>
            <li>Coming soon — requires order data.</li>
          </ul>
        </div>

        <div className="bg-white shadow p-4 rounded space-y-4">
          <h4 className="text-xl font-semibold">Performance (Last 7 Days)</h4>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-medium">This Week</p>
              <p>Total Orders: N/A</p>
              <p>Total Revenue: ৳0.00</p>
            </div>
            <div>
              <p className="font-medium">Previous Week</p>
              <p>Total Orders: N/A</p>
              <p>Total Revenue: ৳0.00</p>
            </div>
            <div>
              <p className="font-medium">Difference</p>
              <p>Orders: N/A</p>
              <p>Revenue: N/A</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t">
          <h4 className="text-sm text-gray-600">Report generated on {dayjs().format("MMMM D, YYYY h:mm A")}</h4>
          <p className="text-xs text-gray-400">Restaurant ID: {restaurant.ownerId}</p>
        </div>
      </div>
    </div>
  );
}

export default DashHome;
