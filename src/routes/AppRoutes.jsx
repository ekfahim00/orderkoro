import { Routes, Route, Navigate } from "react-router-dom"; 
import Signup from "../views/signup";
import Login from "../views/Login";
import UserDashboard from "../views/UserDashboard";
import RestaurantDashboard from "../views/RestaurantDashboard";
import App from "../App";

function AppRoutes({ currentUser }) {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard/user"
        element={
          currentUser ? <UserDashboard /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/dashboard/restaurant"
        element={
          currentUser ? <RestaurantDashboard /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

export default AppRoutes;
