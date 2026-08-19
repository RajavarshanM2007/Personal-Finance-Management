function IncomeExpenseChart({ months }) {
  const maxValue = Math.max(1, ...months.flatMap(({ income, expenses }) => [income, expenses]));
  return <section className="dashboard-panel chart-panel"><PanelHeader title="Income vs Expenses" action="This year" /><div className="chart-legend"><span><i className="legend-dot legend-dot--income" />Income</span><span><i className="legend-dot legend-dot--expense" />Expenses</span></div><div className="bar-chart" role="img" aria-label="Monthly income and expense comparison chart">
    {months.map(({ month, income, expenses }) => <div className="bar-group" key={month}><div className="bar-columns"><span className="chart-bar chart-bar--income" style={{ height: `${(income / maxValue) * 100}%` }} title={`Income ₹${income.toLocaleString("en-IN")}`} /><span className="chart-bar chart-bar--expense" style={{ height: `${(expenses / maxValue) * 100}%` }} title={`Expenses ₹${expenses.toLocaleString("en-IN")}`} /></div><span className="bar-label">{month}</span></div>)}
  </div></section>;
}
function PanelHeader({ title, action }) { return <div className="panel-header"><h3>{title}</h3>{action && <button type="button" className="text-button">{action}<span aria-hidden="true">⌄</span></button>}</div>; }
export { PanelHeader };
export default IncomeExpenseChart;
