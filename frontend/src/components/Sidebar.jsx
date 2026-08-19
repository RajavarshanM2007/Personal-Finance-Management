const navigationItems = [
  { label: "Overview", icon: OverviewIcon },
  { label: "Transactions", icon: TransactionsIcon },
  { label: "Budgets", icon: BudgetIcon },
  { label: "Goals", icon: GoalsIcon },
];

function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <a className="brand" href="#overview" onClick={() => onNavigate("Overview")} aria-label="FinTrack overview">
        <span className="brand-mark" aria-hidden="true">₹</span><span>FinTrack</span>
      </a>
      <nav className="sidebar-nav">
        {navigationItems.map(({ label, icon: Icon }) => (
          <a className={`nav-item${currentPage === label ? " is-active" : ""}`} href={`#${label.toLowerCase()}`} key={label} onClick={() => onNavigate(label)} aria-current={currentPage === label ? "page" : undefined}>
            <Icon /><span>{label}</span>
          </a>
        ))}
      </nav>
      <div className="sidebar-footer"><a className="nav-item" href="#settings"><SettingsIcon /><span>Settings</span></a></div>
    </aside>
  );
}

function IconBase({ children }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">{children}</svg>; }
function OverviewIcon() { return <IconBase><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></IconBase>; }
function TransactionsIcon() { return <IconBase><path d="M4 7h12" /><path d="m13 4 3 3-3 3" /><path d="M20 17H8" /><path d="m11 14-3 3 3 3" /></IconBase>; }
function BudgetIcon() { return <IconBase><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M16 15h2" /></IconBase>; }
function GoalsIcon() { return <IconBase><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><path d="M12 3.5v2" /><path d="M20.5 12h-2" /></IconBase>; }
function SettingsIcon() { return <IconBase><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.2 2.2-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56v.1h-3.12v-.1a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.2-2.2.06-.06A1.7 1.7 0 0 0 6.74 15 1.7 1.7 0 0 0 5.18 14H5.1v-3.12h.08a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.2-2.2.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56v-.1h3.12v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.2 2.2-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.1V14h-.1A1.7 1.7 0 0 0 19.4 15Z" /></IconBase>; }
export default Sidebar;
