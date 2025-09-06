import { useEffect, useState } from "react";
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
import { auth, db } from "../firebase/firebase.config";
import { doc, onSnapshot } from "firebase/firestore";

import InfoTab from "./dashboard/InfoTab";
import DashboardHome from "./dashboard/dashHome";
import LiveOrders from "./dashboard/liveOrders";
import AllOrders from "./dashboard/allOrders";
import MenuTab from "./dashboard/menuTab";
import StatusTab from "./dashboard/statusTab";
import HelpTab from "./dashboard/helpTab";

function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState("Live Orders");
  const [isOpen, setIsOpen] = useState(true);         
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [initials, setInitials] = useState("OK");     
  const navigate = useNavigate();

  // Subscribe to restaurant doc to keep 'isOpen' in sync with Firestore
  useEffect(() => {
    const ownerId = auth.currentUser?.uid;
    if (!ownerId) return;

    const unsub = onSnapshot(doc(db, "restaurants", ownerId), (snap) => {
      const data = snap.data();
      if (data?.open !== undefined) setIsOpen(!!data.open);

      // Compute initials from restaurant name (fallback to user email)
      const nameSrc =
        (data?.name && String(data.name)) ||
        (auth.currentUser?.displayName && String(auth.currentUser.displayName)) ||
        (auth.currentUser?.email && String(auth.currentUser.email)) ||
        "OK";
      const parts = nameSrc.trim().split(/\s+/).filter(Boolean);
      const letters =
        parts.length >= 2
          ? parts[0][0] + parts[1][0]
          : (parts[0]?.slice(0, 2) || "OK");
      setInitials(letters.toUpperCase());
    });

    return () => unsub();
  }, []);

  // Open the logout confirmation instead of logging out immediately
  const askLogout = () => setShowLogoutConfirm(true);

  const doLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut(auth);
    navigate("/login");
  };

  const tabs = [
    { name: "Live Orders", icon: <FiShoppingBag /> },
    { name: "All Orders", icon: <FiList /> },
    { name: "Dashboard", icon: <FiHome /> },
    { name: "Menu", icon: <FiList /> },
    { name: "Status", icon: <FiClock /> },
    { name: "Help", icon: <FiHelpCircle /> },
    { name: "Profile", icon: <FiUser /> },
    { name: "Logout", icon: <FiLogOut />, onClick: askLogout }
  ];

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      {/* Sidebar */}
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

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex justify-end items-center gap-4 mb-6">
          {/* Status pill navigates to Status page, does NOT toggle here */}
          <button
            onClick={() => setActiveTab("Status")}
            className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
              isOpen
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
            title="View and change status"
          >
            {isOpen ? "Open" : "Closed"}
          </button>

          {/* Help shortcut */}
          <button onClick={() => setActiveTab("Help")}>
            <FiHelpCircle className="text-xl text-gray-600 hover:text-gray-800" />
          </button>

          {/* Profile bubble */}
          <button
            onClick={() => setActiveTab("Profile")}
            className="bg-gray-300 w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold text-gray-700"
            title="Profile"
          >
            {initials}
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6 min-h-[300px] transition-all duration-300">
          <h2 className="text-2xl font-semibold mb-4">{activeTab}</h2>

          {activeTab === "Live Orders" && <LiveOrders />}
          {activeTab === "All Orders" && <AllOrders />}{/* <-- fixed string */}
          {activeTab === "Dashboard" && <DashboardHome />}
          {activeTab === "Menu" && <MenuTab />}
          {activeTab === "Status" && <StatusTab />}
          {activeTab === "Help" && <HelpTab />}
          {activeTab === "Profile" && <InfoTab />}
          {activeTab === "Logout" && null /* handled by modal below */}
        </div>
      </main>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Log out</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={doLogout}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantDashboard;
