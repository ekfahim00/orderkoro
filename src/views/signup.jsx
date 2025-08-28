import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSignup } from "../controllers/authController";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSignup(email, password, role, name, contact);
      if (role === "user") navigate("/dashboard/user");
      else navigate("/dashboard/restaurant");
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Signup</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Contact Number"
          className="w-full border px-3 py-2"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
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

        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded w-full">
          Create Account
        </button>
      </form>
    </div>
  );
}

export default Signup;
