import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children, currentPage, onNavigate, user, onLogout }) {
  return <div className="app-shell"><Sidebar currentPage={currentPage} onNavigate={onNavigate} /><main className="main-content"><Topbar title={currentPage} user={user} onLogout={onLogout} />{children}</main></div>;
}
export default DashboardLayout;
