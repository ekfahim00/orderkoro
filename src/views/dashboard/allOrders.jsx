import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase.config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebase.config";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const ownerId = auth.currentUser?.uid;
      if (!ownerId) return;

      const q = query(
        collection(db, "orders"),
        where("restaurantId", "==", ownerId),
        orderBy("placedAt", "desc")
      );

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(list);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading all orders...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="p-4 border rounded shadow bg-white">
              <p><strong>Order ID:</strong> {order.orderId}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> BDT {order.total}</p>
              <p><strong>Order Type:</strong> {order.orderType}</p>
              <p><strong>Items:</strong></p>
              <ul className="list-disc pl-5">
                {order.items.map((item, index) => (
                  <li key={index}>{item.name} x {item.quantity}</li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-1">
                Placed At: {new Date(order.placedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllOrders;
