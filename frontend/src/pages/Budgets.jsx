import { useMemo, useState } from "react";
import BudgetCard from "../components/BudgetCard";
import BudgetModal from "../components/BudgetModal";

const defaultCategories = ["Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Other"];

function Budgets({ budgets, transactions, onSave, onDelete }) {
  const [activeBudget, setActiveBudget] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const categories = useMemo(() => [...new Set([...defaultCategories, ...transactions.filter(({ type }) => type === "Expense").map(({ category }) => category)])], [transactions]);
  const spending = useMemo(() => transactions.filter(({ type, date }) => type === "Expense" && isCurrentMonth(date)).reduce((totals, transaction) => ({ ...totals, [transaction.category]: (totals[transaction.category] ?? 0) + transaction.amount }), {}), [transactions]);
  const closeModal = () => { setActiveBudget(null); setIsCreating(false); };
  const saveBudget = (budget) => { onSave(budget); closeModal(); };
  return <section className="budgets-page" id="budgets"><div className="page-heading"><div><h2>Budgets</h2><p>Set monthly limits and stay on top of your spending.</p></div><button className="button button--primary" type="button" onClick={() => setIsCreating(true)}>Create budget</button></div>{budgets.length ? <div className="budget-grid">{budgets.map((budget) => <BudgetCard key={budget.id} budget={budget} spent={spending[budget.category] ?? 0} onEdit={setActiveBudget} onDelete={onDelete} />)}</div> : <section className="dashboard-panel empty-budgets"><strong>No budgets yet</strong><p>Create a monthly category budget to begin tracking your spending.</p><button className="button button--primary" type="button" onClick={() => setIsCreating(true)}>Create budget</button></section>}{(isCreating || activeBudget) && <BudgetModal budget={activeBudget} categories={categories} onClose={closeModal} onSave={saveBudget} />}</section>;
}
function isCurrentMonth(date) { const value = new Date(`${date}T00:00:00`); const today = new Date(); return value.getFullYear() === today.getFullYear() && value.getMonth() === today.getMonth(); }
export default Budgets;
