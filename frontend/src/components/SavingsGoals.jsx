import { PanelHeader } from "./IncomeExpenseChart";

function SavingsGoals({ goals }) {
  return <section className="dashboard-panel side-panel"><PanelHeader title="Savings goals" action="View all" />{goals.length ? <div className="goal-list">{goals.map(({ id, name, current, target, color }) => { const percent = Math.min(100, Math.round((current / target) * 100)); return <div className="goal-item" key={id}><div className="goal-title"><strong>{name}</strong><span>{percent}%</span></div><div className="goal-track"><span style={{ width: `${percent}%`, background: color }} /></div><p>₹{current.toLocaleString("en-IN")} <span>of ₹{target.toLocaleString("en-IN")}</span></p></div>; })}</div> : <p className="panel-empty">No savings goals</p>}</section>;
}
export default SavingsGoals;
