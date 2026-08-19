import { useEffect, useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import Overview from "./pages/Overview";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import "./App.css";

const initialTransactions = [
  {
    id: 1,
    note: "Monthly salary",
    category: "Salary",
    date: "2026-08-19",
    type: "Income",
    amount: 82500,
    recurring: true,
    mark: "salary",
  },
  {
    id: 2,
    note: "FreshMart",
    category: "Food",
    date: "2026-08-18",
    type: "Expense",
    amount: 1840,
    recurring: false,
    mark: "food",
  },
  {
    id: 3,
    note: "Uber",
    category: "Transport",
    date: "2026-08-17",
    type: "Expense",
    amount: 462,
    recurring: false,
    mark: "transport",
  },
  {
    id: 4,
    note: "Freelance project",
    category: "Freelance",
    date: "2026-08-16",
    type: "Income",
    amount: 12000,
    recurring: false,
    mark: "work",
  },
  {
    id: 5,
    note: "Airtel Postpaid",
    category: "Bills",
    date: "2026-08-15",
    type: "Expense",
    amount: 799,
    recurring: true,
    mark: "bills",
  },
  {
    id: 6,
    note: "Weekend dinner",
    category: "Food",
    date: "2026-08-14",
    type: "Expense",
    amount: 1280,
    recurring: false,
    mark: "food",
  },
];

const initialBudgets = [
  { id: 1, category: "Food", limit: 6000 },
  { id: 2, category: "Transport", limit: 500 },
  { id: 3, category: "Bills", limit: 750 },
];

const initialGoals = [
  {
    id: 1,
    name: "Emergency fund",
    current: 98500,
    target: 150000,
    targetDate: "2027-03-31",
    color: "#b4c58c",
  },
  {
    id: 2,
    name: "Goa trip",
    current: 18300,
    target: 45000,
    targetDate: "2026-12-15",
    color: "#7892ab",
  },
];

const initialSettings = {
  name: "Varsha",
  email: "varsha@example.com",
  currency: "INR",
  darkTheme: true,
  budgetAlerts: true,
  paymentReminders: true,
};

function getInitialPage() {
  const page = window.location.hash.slice(1);

  return [
    "overview",
    "transactions",
    "budgets",
    "goals",
    "settings",
  ].includes(page)
    ? `${page.charAt(0).toUpperCase()}${page.slice(1)}`
    : "Overview";
}

function App() {
  const [currentPage, setCurrentPage] = useState(getInitialPage);

  const [transactions, setTransactions] = useState(initialTransactions);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [goals, setGoals] = useState(initialGoals);

  // Shared settings state
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    const syncPage = () => setCurrentPage(getInitialPage());

    window.addEventListener("hashchange", syncPage);

    return () => window.removeEventListener("hashchange", syncPage);
  }, []);

  const navigate = (page) => {
    window.location.hash = page.toLowerCase();
    setCurrentPage(page);
  };

  // -------------------------
  // Transactions
  // -------------------------

  const addTransaction = (transaction) => {
    setTransactions((current) => [
      {
        ...transaction,
        id: Date.now(),
        mark: transaction.type === "Income" ? "work" : "other",
      },
      ...current,
    ]);
  };

  const deleteTransaction = (id) => {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id)
    );
  };

  // -------------------------
  // Budgets
  // -------------------------

  const saveBudget = (budget) => {
    setBudgets((current) =>
      budget.id
        ? current.map((entry) =>
            entry.id === budget.id ? budget : entry
          )
        : [...current, { ...budget, id: Date.now() }]
    );
  };

  const deleteBudget = (id) => {
    setBudgets((current) =>
      current.filter((budget) => budget.id !== id)
    );
  };

  // -------------------------
  // Goals
  // -------------------------

  const saveGoal = (goal) => {
    setGoals((current) =>
      goal.id
        ? current.map((entry) =>
            entry.id === goal.id ? goal : entry
          )
        : [
            ...current,
            {
              ...goal,
              id: Date.now(),
              color: [
                "#b4c58c",
                "#7892ab",
                "#c49b79",
                "#9e87b8",
              ][current.length % 4],
            },
          ]
    );
  };

  const deleteGoal = (id) => {
    setGoals((current) =>
      current.filter((goal) => goal.id !== id)
    );
  };

  const contributeToGoal = (id, amount) => {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === id
          ? { ...goal, current: goal.current + amount }
          : goal
      )
    );
  };

  // -------------------------
  // Settings
  // -------------------------

  const saveSettings = (updatedSettings) => {
    setSettings(updatedSettings);
  };

  // -------------------------
  // Reset demo data
  // -------------------------

  const resetData = () => {
    setTransactions(initialTransactions.map((transaction) => ({ ...transaction })));

    setBudgets(initialBudgets.map((budget) => ({ ...budget })));

    setGoals(initialGoals.map((goal) => ({ ...goal })));

    setSettings({ ...initialSettings });
  };

  // -------------------------
  // Pages
  // -------------------------

  let page = (
    <Overview
      transactions={transactions}
      goals={goals}
    />
  );

  if (currentPage === "Transactions") {
    page = (
      <Transactions
        transactions={transactions}
        onAdd={addTransaction}
        onDelete={deleteTransaction}
      />
    );
  }

  if (currentPage === "Budgets") {
    page = (
      <Budgets
        budgets={budgets}
        transactions={transactions}
        onSave={saveBudget}
        onDelete={deleteBudget}
      />
    );
  }

  if (currentPage === "Goals") {
    page = (
      <Goals
        goals={goals}
        onSave={saveGoal}
        onDelete={deleteGoal}
        onContribute={contributeToGoal}
      />
    );
  }

  if (currentPage === "Settings") {
    page = (
      <Settings
        settings={settings}
        onSave={saveSettings}
        onResetData={resetData}
      />
    );
  }

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={navigate}
    >
      {page}
    </DashboardLayout>
  );
}

export default App;