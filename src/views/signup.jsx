import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSignup } from "../controllers/authController";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSignup(email, password, role);
      if (role === "user") navigate("/dashboard/user");
      else navigate("/dashboard/restaurant");
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  };
  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Signup</h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="email"
          className="w-full border px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="w-full border px-3 py-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="user"
              checked={role === "user"}
              onChange={() => setRole("user")}
            />
            <span className="ml-2">Customer</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="restaurant"
              checked={role === "restaurant"}
              onChange={() => setRole("restaurant")}
            />
            <span className="ml-2">Restaurant</span>
          </label>
        </div>

        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">
          Create Account
        </button>
      </form>
    </div>
  );
}

export default Signup;
