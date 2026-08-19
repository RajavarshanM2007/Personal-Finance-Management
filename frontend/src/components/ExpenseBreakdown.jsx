import { PanelHeader } from "./IncomeExpenseChart";

function ExpenseBreakdown({ categories, total }) {
  const background = categories.length ? `conic-gradient(${buildGradient(categories)})` : "#292a2d";
  return <section className="dashboard-panel breakdown-panel"><PanelHeader title="Expense breakdown" action="This month" /><div className="breakdown-body"><div className="donut" style={{ background }}><div><strong>₹{total.toLocaleString("en-IN")}</strong><span>Spent</span></div></div>{categories.length ? <ul className="breakdown-list">{categories.map(({ name, amount, percent, color }) => <li key={name}><i style={{ background: color }} /><span>{name}</span><strong>₹{amount.toLocaleString("en-IN")}</strong><em>{percent}%</em></li>)}</ul> : <p className="breakdown-empty">No expenses this month</p>}</div></section>;
}
function buildGradient(categories) { let start = 0; return categories.map(({ percent, color }) => { const end = start + percent; const segment = `${color} ${start}% ${end}%`; start = end; return segment; }).join(", "); }
export default ExpenseBreakdown;
