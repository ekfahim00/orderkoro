import { Routes, Route } from "react-router-dom";
import Signup from "../views/signup";
import Login from "../views/Login";
import UserDashboard from "../views/UserDashboard";
import RestaurantDashboard from "../views/RestaurantDashboard";
import App from "../App";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard/user" element={<UserDashboard />} />
      <Route path="/dashboard/restaurant" element={<RestaurantDashboard />} />
    </Routes>
  );
}

export default AppRoutes;
