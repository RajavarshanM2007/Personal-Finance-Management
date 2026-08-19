function GoalCard({ goal, onEdit, onDelete, onContribute }) {
  const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const remaining = Math.max(0, goal.target - goal.current);
  return <article className="goal-card"><div className="goal-card__header"><div><h3>{goal.name}</h3><p>Target {formatDate(goal.targetDate)}</p></div><div className="budget-card__actions"><button type="button" onClick={() => onEdit(goal)}>Edit</button><button type="button" onClick={() => onDelete(goal.id)}>Delete</button></div></div><div className="goal-card__amount"><strong>₹{goal.current.toLocaleString("en-IN")}</strong><span>of ₹{goal.target.toLocaleString("en-IN")}</span></div><div className="goal-track goal-card__track"><span style={{ width: `${percent}%`, background: goal.color }} /></div><div className="goal-card__footer"><span>₹{remaining.toLocaleString("en-IN")} remaining</span><strong>{percent}% saved</strong></div><button className="button button--secondary goal-contribute" type="button" onClick={() => onContribute(goal)}>Add contribution</button></article>;
}
function formatDate(date) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`)); }
export default GoalCard;
