import { useParams, Link } from "react-router-dom";

export default function OrderConfirmation() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center p-6">
      <div className="bg-white rounded-xl shadow p-6 text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Order placed!</h1>
        <p className="text-gray-600 mb-4">
          Your order ID is <span className="font-mono">{id}</span>.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          We’ll notify the restaurant. You can track status in your order history (coming soon).
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
