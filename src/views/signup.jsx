import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { handleSignup } from "../controllers/authController";

function Signup() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // "user" | "restaurant"
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      await handleSignup(email, password, role, name, contact);
      if (role === "restaurant") {
        navigate("/dashboard/restaurant");
      } else {
        navigate("/"); // customers land on homepage
      }
    } catch (error) {
      setErr(error?.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create your account</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Full Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g., Imran Khan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Contact Number</label>
          <input
            type="tel"
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g., 01XXXXXXXXX"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Role */}
        <div className="flex gap-6 items-center">
          <span className="text-sm text-gray-600">Sign up as:</span>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="user"
              checked={role === "user"}
              onChange={() => setRole("user")}
            />
            <span>Customer</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="restaurant"
              checked={role === "restaurant"}
              onChange={() => setRole("restaurant")}
            />
            <span>Restaurant</span>
          </label>
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded w-full disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create Account"}
        </button>
      </form>

      {/* Login link */}
      <p className="text-sm text-gray-600 text-center mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-purple-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default Signup;
