import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { handleLogin } from "../controllers/authController";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      const { role } = await handleLogin(email, password);
      // Redirect based on role
      if (role === "restaurant") {
        navigate("/dashboard/restaurant");
      } else {
        navigate("/");
      }
    } catch (error) {
      setErr(error?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-purple-600 text-white px-4 py-2 rounded w-full disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log In"}
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-sm text-gray-600 text-center mt-4">
        New to OrderKoro?{" "}
        <Link to="/signup" className="text-purple-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default Login;
