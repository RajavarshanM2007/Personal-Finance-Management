import { PanelHeader } from "./IncomeExpenseChart";

function RecentTransactions({ transactions }) {
  return <section className="dashboard-panel transactions-panel"><PanelHeader title="Recent transactions" action="View all" /><div className="transaction-table"><div className="transaction-row transaction-head"><span>Transaction</span><span>Date</span><span>Type</span><span>Amount</span></div>{transactions.map(({ id, note, category, date, type, amount, mark }) => <div className="transaction-row" key={id}><span className="transaction-name"><i className={`transaction-mark transaction-mark--${mark}`} /> <span><strong>{note}</strong><small>{category}</small></span></span><span>{formatDate(date)}</span><span><span className={`type-pill type-pill--${type.toLowerCase()}`}>{type}</span></span><strong className={type === "Income" ? "amount-income" : "amount-expense"}>{type === "Income" ? "+" : "−"}₹{amount.toLocaleString("en-IN")}</strong></div>)}</div></section>;
}
function formatDate(date) { return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(`${date}T00:00:00`)); }
export default RecentTransactions;
