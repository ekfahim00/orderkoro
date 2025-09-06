import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebase.config";
import { doc, getDoc } from "firebase/firestore";

export default function SiteHeader() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [initials, setInitials] = useState("UK");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (u?.uid) {
        // fetch role from users/{uid}
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          const r = snap.exists() ? snap.data().role : null;
          setRole(r || null);
          // initials from email or displayName
          const src =
            u.displayName ||
            (snap.exists() && snap.data().name) ||
            u.email ||
            "UK";
          const parts = String(src).trim().split(/\s+/);
          const letters =
            parts.length >= 2
              ? parts[0][0] + parts[1][0]
              : (parts[0]?.slice(0, 2) || "UK");
          setInitials(letters.toUpperCase());
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
        setInitials("UK");
      }
    });
    return () => unsub();
  }, []);

  const goHome = () => navigate("/");
  const goProfileOrLogin = () => {
    if (!user) return navigate("/login");
    // route by role
    if (role === "restaurant") return navigate("/dashboard/restaurant");
    if (role === "user") return navigate("/dashboard/user");
    // fallback
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={goHome} className="text-2xl font-extrabold text-purple-700">
          OrderKoro
        </button>

        {/* Right side: login/profile */}
        <div className="flex items-center gap-3">
          {/* Avoid showing “Login” button if we’re already on /login */}
          {user ? (
            <button
              onClick={goProfileOrLogin}
              className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 text-sm font-bold grid place-items-center"
              title="Go to dashboard"
            >
              {initials}
            </button>
          ) : location.pathname === "/login" ? null : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
