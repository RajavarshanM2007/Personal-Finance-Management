function Topbar({ title }) {
  return <header className="topbar"><h1>{title}</h1><div className="topbar-actions"><label className="search-control"><SearchIcon /><span className="sr-only">Search</span><input type="search" placeholder="Search" /><kbd>⌘ K</kbd></label><button className="profile-button" type="button" aria-label="Open profile menu"><span className="profile-avatar">V</span><span className="profile-name">Varsha</span><ChevronIcon /></button></div></header>;
}
function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4 4" /></svg>; }
function ChevronIcon() { return <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>; }
export default Topbar;
