import { useEffect, useRef, useState } from "react";

function Topbar({ title, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.name?.trim() || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div className="topbar-actions">
        <label className="search-control">
          <SearchIcon /><span className="sr-only">Search</span>
          <input type="search" placeholder="Search" /><kbd>⌘ K</kbd>
        </label>
        <div className="profile-menu" ref={menuRef}>
          <button
            className="profile-button"
            type="button"
            aria-label="Open profile menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="profile-avatar">{initial}</span>
            <span className="profile-name">{displayName}</span>
            <ChevronIcon />
          </button>
          {menuOpen && (
            <div className="profile-dropdown" role="menu">
              {user?.email && <div className="profile-dropdown-email">{user.email}</div>}
              <button
                type="button"
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4 4" /></svg>; }
function ChevronIcon() { return <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>; }
export default Topbar;
