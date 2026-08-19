import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children, currentPage, onNavigate }) {
  return <div className="app-shell"><Sidebar currentPage={currentPage} onNavigate={onNavigate} /><main className="main-content"><Topbar title={currentPage} />{children}</main></div>;
}
export default DashboardLayout;
