function BudgetCard({ budget, spent, onEdit, onDelete }) {
  const remaining = budget.limit - spent;
  const percent = Math.round((spent / budget.limit) * 100);
  const state = percent >= 100 ? "exceeded" : percent >= 80 ? "warning" : "normal";
  return <article className={`budget-card budget-card--${state}`}><div className="budget-card__header"><div><h3>{budget.category}</h3><p>Monthly budget</p></div><div className="budget-card__actions"><button type="button" onClick={() => onEdit(budget)}>Edit</button><button type="button" onClick={() => onDelete(budget.id)}>Delete</button></div></div><div className="budget-amounts"><strong>₹{spent.toLocaleString("en-IN")}</strong><span>of ₹{budget.limit.toLocaleString("en-IN")}</span></div><div className="budget-progress" aria-label={`${percent}% of budget used`}><span style={{ width: `${Math.min(percent, 100)}%` }} /></div><div className="budget-card__footer"><span className={`budget-status budget-status--${state}`}>{state === "exceeded" ? `₹${Math.abs(remaining).toLocaleString("en-IN")} over budget` : state === "warning" ? "Near budget limit" : `₹${remaining.toLocaleString("en-IN")} remaining`}</span><strong>{percent}% used</strong></div></article>;
}
export default BudgetCard;
