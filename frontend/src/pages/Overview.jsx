import { useMemo } from "react";
import SummaryCard from "../components/SummaryCard";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import ExpenseBreakdown from "../components/ExpenseBreakdown";
import RecentTransactions from "../components/RecentTransactions";
import UpcomingPayments from "../components/UpcomingPayments";
import SavingsGoals from "../components/SavingsGoals";

const colors = ["#b4c58c", "#7892ab", "#c49b79", "#9e87b8", "#70747b"];
const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

function Overview({ transactions, goals }) {
  const dashboard = useMemo(() => buildDashboardData(transactions), [transactions]);
  return <><section className="dashboard-intro" id="overview" aria-labelledby="welcome-heading"><h2 id="welcome-heading">Good morning</h2><p>Here's a quick look at your finances.</p></section><section className="dashboard-content" aria-label="Financial overview"><div className="summary-grid">{dashboard.summary.map((card) => <SummaryCard key={card.label} {...card} />)}</div><div className="overview-grid"><IncomeExpenseChart months={dashboard.months} /><ExpenseBreakdown categories={dashboard.categories} total={dashboard.expenses} /><RecentTransactions transactions={dashboard.recentTransactions} /><div className="right-column"><UpcomingPayments payments={dashboard.upcomingPayments} /><SavingsGoals goals={goals} /></div></div></section></>;
}

function buildDashboardData(transactions) {
  const income = sumAmounts(transactions, "Income");
  const expenses = sumAmounts(transactions, "Expense");
  const balance = income - expenses;
  const recentTransactions = [...transactions].sort((a, b) => new Date(`${b.date}T00:00:00`) - new Date(`${a.date}T00:00:00`)).slice(0, 4);
  return { summary: [{ label: "Total balance", amount: formatCurrency(balance), status: "Income minus expenses", tone: balance >= 0 ? "positive" : "negative" }, { label: "Income", amount: formatCurrency(income), status: `${transactions.filter(({ type }) => type === "Income").length} income transactions`, tone: "positive" }, { label: "Expenses", amount: formatCurrency(expenses), status: `${transactions.filter(({ type }) => type === "Expense").length} expense transactions`, tone: "neutral" }, { label: "Savings", amount: formatCurrency(balance), status: "Available after expenses", tone: balance >= 0 ? "positive" : "negative" }], expenses, recentTransactions, months: buildMonthlyData(transactions), categories: buildExpenseCategories(transactions), upcomingPayments: buildUpcomingPayments(transactions) };
}

function sumAmounts(transactions, type) { return transactions.filter((transaction) => transaction.type === type).reduce((total, transaction) => total + transaction.amount, 0); }
function buildMonthlyData(transactions) { const today = new Date(); return Array.from({ length: 6 }, (_, offset) => { const date = new Date(today.getFullYear(), today.getMonth() - 5 + offset, 1); const matchesMonth = (transaction) => { const value = new Date(`${transaction.date}T00:00:00`); return value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth(); }; return { month: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date), income: sumAmounts(transactions.filter(matchesMonth), "Income"), expenses: sumAmounts(transactions.filter(matchesMonth), "Expense") }; }); }
function buildExpenseCategories(transactions) { const monthlyExpenses = transactions.filter((transaction) => transaction.type === "Expense" && isCurrentMonth(transaction.date)); const total = monthlyExpenses.reduce((sum, transaction) => sum + transaction.amount, 0); const totals = monthlyExpenses.reduce((result, transaction) => ({ ...result, [transaction.category]: (result[transaction.category] ?? 0) + transaction.amount }), {}); const ordered = Object.entries(totals).sort(([, first], [, second]) => second - first); const primary = ordered.slice(0, 4); const other = ordered.slice(4).reduce((sum, [, amount]) => sum + amount, 0); const entries = other ? [...primary, ["Other", other]] : primary; return entries.map(([name, amount], index) => ({ name, amount, percent: total ? Math.round((amount / total) * 100) : 0, color: colors[index] })); }
function buildUpcomingPayments(transactions) { return transactions.filter((transaction) => transaction.type === "Expense" && transaction.recurring).sort((a, b) => new Date(`${a.date}T00:00:00`) - new Date(`${b.date}T00:00:00`)).slice(0, 3).map((transaction) => ({ name: transaction.note, due: formatDueDate(transaction.date), amount: transaction.amount, icon: transaction.category.charAt(0).toUpperCase() })); }
function isCurrentMonth(date) { const value = new Date(`${date}T00:00:00`); const today = new Date(); return value.getFullYear() === today.getFullYear() && value.getMonth() === today.getMonth(); }
function formatDueDate(date) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${date}T00:00:00`)); }
export default Overview;
