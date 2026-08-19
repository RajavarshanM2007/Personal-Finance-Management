import { useEffect, useState } from "react";

import login from "./pages/login";
import DashboardLayout from "./components/DashboardLayout";
import Overview from "./pages/Overview";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";

import "./App.css";

const API = "http://localhost:5000/api";

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
  // ─────────────────────────────────────────────
  // CURRENT USER
  // ─────────────────────────────────────────────

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("fintrack_user");

    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem("fintrack_user");
      return null;
    }
  });

  // ─────────────────────────────────────────────
  // APP DATA
  // ─────────────────────────────────────────────

  const [currentPage, setCurrentPage] = useState(getInitialPage);

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);

  const [settings, setSettings] = useState({
    name: "",
    email: "",
    currency: "INR",
    darkTheme: true,
    budgetAlerts: true,
    paymentReminders: true,
  });

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────

  const handleLogin = (loggedInUser) => {
    localStorage.setItem(
      "fintrack_user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    // Start with empty state while user data loads
    setTransactions([]);
    setBudgets([]);
    setGoals([]);

    setSettings({
      name: loggedInUser.name || "",
      email: loggedInUser.email || "",
      currency: "INR",
      darkTheme: true,
      budgetAlerts: true,
      paymentReminders: true,
    });
  };

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────

  const handleLogout = () => {
    localStorage.removeItem("fintrack_user");
    localStorage.removeItem("fintrack_token");

    setUser(null);

    setTransactions([]);
    setBudgets([]);
    setGoals([]);

    setSettings({
      name: "",
      email: "",
      currency: "INR",
      darkTheme: true,
      budgetAlerts: true,
      paymentReminders: true,
    });

    window.location.hash = "";
  };

  // ─────────────────────────────────────────────
  // USER HEADER
  // ─────────────────────────────────────────────

  const authHeaders = () => {
    if (!user?.id) {
      return {};
    }

    return {
      "x-user-id": String(user.id),
    };
  };

  // ─────────────────────────────────────────────
  // LOAD USER DATA
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const loadData = async () => {
      try {
        const headers = authHeaders();

        const [
          transactionsResponse,
          budgetsResponse,
          goalsResponse,
          settingsResponse,
        ] = await Promise.all([
          fetch(`${API}/transactions`, {
            headers,
          }),

          fetch(`${API}/budgets`, {
            headers,
          }),

          fetch(`${API}/goals`, {
            headers,
          }),

          fetch(`${API}/settings`, {
            headers,
          }),
        ]);

        const transactionsResult =
          await transactionsResponse.json();

        const budgetsResult =
          await budgetsResponse.json();

        const goalsResult =
          await goalsResponse.json();

        const settingsResult =
          await settingsResponse.json();

        if (transactionsResult.success) {
          setTransactions(transactionsResult.data);
        } else {
          setTransactions([]);
        }

        if (budgetsResult.success) {
          setBudgets(budgetsResult.data);
        } else {
          setBudgets([]);
        }

        if (goalsResult.success) {
          setGoals(goalsResult.data);
        } else {
          setGoals([]);
        }

        if (settingsResult.success) {
          setSettings(settingsResult.data);
        } else {
          setSettings({
            name: user.name || "",
            email: user.email || "",
            currency: "INR",
            darkTheme: true,
            budgetAlerts: true,
            paymentReminders: true,
          });
        }
      } catch (error) {
        console.error(
          "Failed to load user data:",
          error
        );
      }
    };

    loadData();
  }, [user?.id]);

  // ─────────────────────────────────────────────
  // PAGE SYNC
  // ─────────────────────────────────────────────

  useEffect(() => {
    const syncPage = () => {
      setCurrentPage(getInitialPage());
    };

    window.addEventListener("hashchange", syncPage);

    return () => {
      window.removeEventListener(
        "hashchange",
        syncPage
      );
    };
  }, []);

  const navigate = (page) => {
    window.location.hash = page.toLowerCase();
    setCurrentPage(page);
  };

  // ─────────────────────────────────────────────
  // TRANSACTIONS
  // ─────────────────────────────────────────────

  const addTransaction = async (transaction) => {
    try {
      const response = await fetch(
        `${API}/transactions`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },

          body: JSON.stringify({
            ...transaction,
            mark:
              transaction.type === "Income"
                ? "work"
                : "other",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setTransactions((current) => [
          result.data,
          ...current,
        ]);
      } else {
        console.error(
          "Failed to add transaction:",
          result.message
        );
      }
    } catch (error) {
      console.error(
        "Failed to add transaction:",
        error
      );
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(
        `${API}/transactions/${id}`,
        {
          method: "DELETE",
          headers: {
            ...authHeaders(),
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setTransactions((current) =>
          current.filter(
            (transaction) =>
              transaction.id !== id
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete transaction:",
        error
      );
    }
  };

  // ─────────────────────────────────────────────
  // BUDGETS
  // ─────────────────────────────────────────────

  const saveBudget = async (budget) => {
    try {
      const response = await fetch(
        budget.id
          ? `${API}/budgets/${budget.id}`
          : `${API}/budgets`,
        {
          method: budget.id ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },

          body: JSON.stringify(budget),
        }
      );

      const result = await response.json();

      if (!result.success) {
        console.error(
          "Failed to save budget:",
          result.message
        );
        return;
      }

      setBudgets((current) =>
        budget.id
          ? current.map((entry) =>
              entry.id === budget.id
                ? result.data
                : entry
            )
          : [...current, result.data]
      );
    } catch (error) {
      console.error(
        "Failed to save budget:",
        error
      );
    }
  };

  const deleteBudget = async (id) => {
    try {
      const response = await fetch(
        `${API}/budgets/${id}`,
        {
          method: "DELETE",
          headers: {
            ...authHeaders(),
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setBudgets((current) =>
          current.filter(
            (budget) => budget.id !== id
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete budget:",
        error
      );
    }
  };

  // ─────────────────────────────────────────────
  // GOALS
  // ─────────────────────────────────────────────

  const saveGoal = async (goal) => {
    try {
      const newGoal = goal.id
        ? goal
        : {
            ...goal,
            color:
              goal.color ||
              [
                "#b4c58c",
                "#7892ab",
                "#c49b79",
                "#9e87b8",
              ][goals.length % 4],
          };

      const response = await fetch(
        goal.id
          ? `${API}/goals/${goal.id}`
          : `${API}/goals`,
        {
          method: goal.id ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },

          body: JSON.stringify(newGoal),
        }
      );

      const result = await response.json();

      if (!result.success) {
        console.error(
          "Failed to save goal:",
          result.message
        );
        return;
      }

      setGoals((current) =>
        goal.id
          ? current.map((entry) =>
              entry.id === goal.id
                ? result.data
                : entry
            )
          : [...current, result.data]
      );
    } catch (error) {
      console.error(
        "Failed to save goal:",
        error
      );
    }
  };

  const deleteGoal = async (id) => {
    try {
      const response = await fetch(
        `${API}/goals/${id}`,
        {
          method: "DELETE",
          headers: {
            ...authHeaders(),
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setGoals((current) =>
          current.filter(
            (goal) => goal.id !== id
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete goal:",
        error
      );
    }
  };

  const contributeToGoal = async (id, amount) => {
    try {
      const goal = goals.find(
        (entry) => entry.id === id
      );

      if (!goal) return;

      const response = await fetch(
        `${API}/goals/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },

          body: JSON.stringify({
            ...goal,
            current:
              goal.current + Number(amount),
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setGoals((current) =>
          current.map((entry) =>
            entry.id === id
              ? result.data
              : entry
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to contribute to goal:",
        error
      );
    }
  };

  // ─────────────────────────────────────────────
  // SETTINGS
  // ─────────────────────────────────────────────

  const saveSettings = async (updatedSettings) => {
    try {
      const response = await fetch(
        `${API}/settings`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },

          body: JSON.stringify(updatedSettings),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSettings(result.data);

        // Keep the user's latest profile details
        const updatedUser = {
          ...user,
          name: result.data.name,
          email: result.data.email,
        };

        setUser(updatedUser);

        localStorage.setItem(
          "fintrack_user",
          JSON.stringify(updatedUser)
        );
      } else {
        console.error(
          "Failed to save settings:",
          result.message
        );
      }
    } catch (error) {
      console.error(
        "Failed to save settings:",
        error
      );
    }
  };

  // ─────────────────────────────────────────────
  // RESET USER DATA
  // ─────────────────────────────────────────────

  const resetData = async () => {
    try {
      const response = await fetch(
        `${API}/reset`,
        {
          method: "POST",

          headers: {
            ...authHeaders(),
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        console.error(
          "Failed to reset data:",
          result.message
        );
        return;
      }

      // User's own data becomes empty
      setTransactions([]);
      setBudgets([]);
      setGoals([]);

      setSettings({
        name: user.name || "",
        email: user.email || "",
        currency: "INR",
        darkTheme: true,
        budgetAlerts: true,
        paymentReminders: true,
      });

      console.log(
        "User data reset successfully."
      );
    } catch (error) {
      console.error(
        "Failed to reset data:",
        error
      );
    }
  };

  // ─────────────────────────────────────────────
  // LOGIN PAGE
  // ─────────────────────────────────────────────

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // ─────────────────────────────────────────────
  // PAGE CONTENT
  // ─────────────────────────────────────────────

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
        onLogout={handleLogout}
      />
    );
  }

  // ─────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={navigate}
      user={user}
      onLogout={handleLogout}
    >
      {page}
    </DashboardLayout>
  );
}

export default App;