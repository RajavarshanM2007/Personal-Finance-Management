import { useMemo, useState } from "react";
import TransactionModal from "../components/TransactionModal";
import TransactionsTable from "../components/TransactionsTable";

function Transactions({ transactions, onAdd, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ query: "", type: "All", category: "All" });
  const categories = useMemo(() => ["All", ...new Set(transactions.map(({ category }) => category))], [transactions]);
  const filteredTransactions = useMemo(() => transactions.filter((transaction) => (filters.type === "All" || transaction.type === filters.type) && (filters.category === "All" || transaction.category === filters.category) && `${transaction.note} ${transaction.category}`.toLowerCase().includes(filters.query.toLowerCase())), [transactions, filters]);
  const updateFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  const saveTransaction = (form) => { onAdd(form); setShowModal(false); };
  return <section className="transactions-page" id="transactions"><div className="page-heading"><div><h2>Transactions</h2><p>Track and review all of your money movements.</p></div><button className="button button--primary" type="button" onClick={() => setShowModal(true)}>Add transaction</button></div><section className="dashboard-panel transactions-workspace"><div className="transaction-filters"><label className="filter-search"><span className="sr-only">Search transactions</span><input name="query" type="search" value={filters.query} onChange={updateFilter} placeholder="Search transactions" /></label><select name="type" value={filters.type} onChange={updateFilter}><option>All</option><option>Income</option><option>Expense</option></select><select name="category" value={filters.category} onChange={updateFilter}>{categories.map((category) => <option key={category}>{category}</option>)}</select><button className="clear-filters" type="button" onClick={() => setFilters({ query: "", type: "All", category: "All" })}>Clear filters</button></div><TransactionsTable transactions={filteredTransactions} onDelete={onDelete} /></section>{showModal && <TransactionModal onClose={() => setShowModal(false)} onSave={saveTransaction} />}</section>;
}
export default Transactions;
