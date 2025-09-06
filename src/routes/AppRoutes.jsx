import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "../views/Signup";
import Login from "../views/Login";
import UserDashboard from "../views/UserDashboard";
import RestaurantDashboard from "../views/RestaurantDashboard";
import RestaurantDetailsViewForUser from "../views/RestaurentDetailsViewForUser";
import Home from "../views/Home";

function AppRoutes({ currentUser }) {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home/>} />
      <Route path="/r/:id" element={<RestaurantDetailsViewForUser/>} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/dashboard/user"
        element={currentUser ? <UserDashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/dashboard/restaurant"
        element={currentUser ? <RestaurantDashboard /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default AppRoutes;
