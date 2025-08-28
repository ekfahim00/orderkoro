import { useState } from "react";
import {
  FiHome,
  FiList,
  FiShoppingBag,
  FiLogOut,
  FiHelpCircle,
  FiClock,
  FiUser
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import RestaurantInfo from "./dashboard/InfoTab";
import InfoTab from "./dashboard/InfoTab";
import DashboardHome from "./dashboard/dashHome";
import LiveOrders from "./dashboard/liveOrders";
import AllOrders from "./dashboard/allOrders";

function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState("Live Orders");
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/login"));
  };

  const tabs = [
    { name: "Live Orders", icon: <FiShoppingBag /> },
    { name: "All Orders", icon: <FiShoppingBag /> },
    { name: "Dashboard", icon: <FiHome /> },
    { name: "Menu", icon: <FiList /> },
    { name: "Status", icon: <FiClock /> },
    { name: "Help", icon: <FiHelpCircle /> },
    { name: "Profile", icon: <FiUser /> },
    { name: "Logout", icon: <FiLogOut />, onClick: handleLogout }
  ];

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      <aside className="w-1/5 min-w-[220px] bg-white shadow-lg px-6 py-8 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-700 mb-8">OrderKoro</h1>
          <nav className="space-y-3">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  if (tab.onClick) tab.onClick();
                  else setActiveTab(tab.name);
                }}
                className={`flex items-center w-full gap-3 px-4 py-2 rounded-lg text-left transition-all duration-200 hover:bg-green-100 hover:scale-[1.02] ${
                  activeTab === tab.name
                    ? "bg-green-200 text-green-900 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
        <p className="text-xs text-gray-400">© 2025 OrderKoro</p>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-end items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab("Status")}
            className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
              isOpen
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {isOpen ? "🟢 Open" : "🔴 Closed"}
          </button>

          <button onClick={() => setActiveTab("Help")}>
            <FiHelpCircle className="text-xl text-gray-600 hover:text-gray-800" />
          </button>

          <button
            onClick={() => setActiveTab("Profile")}
            className="bg-gray-300 w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold text-gray-700"
          >
            IK
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 min-h-[300px] transition-all duration-300">
          <h2 className="text-2xl font-semibold mb-4">{activeTab}</h2>

          {activeTab === "Live Orders" && <LiveOrders/>}

          {activeTab === "Active Orders" && <AllOrders/>}

          {activeTab === "Dashboard" && <DashboardHome />}

          {activeTab === "Menu" && (
            <p className="text-gray-600">Manage your menu items here.</p>
          )}

          {activeTab === "Status" && (
            <p className="text-gray-600">
              Restaurant is currently {isOpen ? "Open" : "Closed"}.
            </p>
          )}

          {activeTab === "Help" && (
            <form className="space-y-4 max-w-md">
              <input
                type="text"
                placeholder="Subject"
                className="w-full border px-4 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Issue"
                className="w-full border px-4 py-2 rounded"
              />
              <textarea
                placeholder="Description"
                rows="4"
                className="w-full border px-4 py-2 rounded"
              ></textarea>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Send Mail
              </button>
            </form>
          )}

          {activeTab === "Profile" && <InfoTab/>}
        </div>
      </main>
    </div>
  );
}

export default RestaurantDashboard;
