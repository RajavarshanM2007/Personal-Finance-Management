import { PanelHeader } from "./IncomeExpenseChart";

function UpcomingPayments({ payments }) {
  return <section className="dashboard-panel side-panel"><PanelHeader title="Upcoming payments" />{payments.length ? <div className="payment-list">{payments.map(({ name, due, amount, icon }) => <div className="payment-item" key={`${name}-${due}`}><span className="payment-icon">{icon}</span><span><strong>{name}</strong><small>Due {due}</small></span><strong>₹{amount.toLocaleString("en-IN")}</strong></div>)}</div> : <p className="panel-empty">No recurring payments</p>}</section>;
}
export default UpcomingPayments;
