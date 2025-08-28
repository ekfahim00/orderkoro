import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "../controllers/authController";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { role } = await handleLogin(email, password);
      if (role === "user") navigate("/dashboard/user");
      else navigate("/dashboard/restaurant");
    } catch (err) {
      alert("Login failed: " + err.message);
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
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded w-full"
        >
          Log In
        </button>
      </form>
    </div>
  );
}

export default Login;
