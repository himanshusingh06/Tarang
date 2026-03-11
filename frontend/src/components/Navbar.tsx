import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Wellness Chat", path: "/chat" },
  { label: "Programs Library", path: "/library" },
  { label: "Chakra Journey", path: "/chakra" },
  { label: "Daily Schedule", path: "/schedule" },
  { label: "Diagnostic", path: "/diagnostic" },
  { label: "Profile", path: "/profile" },
  { label: "Analytics", path: "/analytics" }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="px-6 py-4 flex flex-wrap gap-3 justify-between items-center text-sm uppercase tracking-widest">
      <div className="font-heading text-2xl text-sage">TARANG CURE</div>
      <div className="flex flex-wrap gap-4 items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `transition ${isActive ? "text-saffron underline" : "text-ink/70 hover:text-ink"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
        {user && (user.role === "admin" || user.role === "staff") && (
          <NavLink to="/admin" className="text-ink/70 hover:text-ink">
            Admin
          </NavLink>
        )}
        {user ? (
          <button
            onClick={logout}
            className="btn-outline"
          >
            Logout
          </button>
        ) : (
          <>
            <NavLink to="/login" className="text-ink/70 hover:text-ink">
              Login
            </NavLink>
            <NavLink to="/register" className="text-ink/70 hover:text-ink">
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
