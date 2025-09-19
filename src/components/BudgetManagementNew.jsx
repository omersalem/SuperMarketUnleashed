import React, { useState, useMemo } from "react";
import { format, isWithinInterval } from "date-fns";
import ResponsiveTable, { createMobileCard } from "./ResponsiveTable";
import AddIncomeModal from "./AddIncomeModal";
import AddExpenseModal from "./AddExpenseModal";
import RoleGuard from "./RoleGuard";

// Mock data for demonstration
const mockIncomes = [
  {
    id: "inc1",
    amount: 5000,
    description: "Supermarket Sales",
    date: "2023-09-01",
    category: "Sales",
    source: "Cash Register",
    notes: "Daily sales"
  },
  {
    id: "inc2",
    amount: 2000,
    description: "Online Sales",
    date: "2023-09-05",
    category: "Sales",
    source: "E-commerce",
    notes: "Online platform sales"
  },
  {
    id: "inc3",
    amount: 1500,
    description: "Rent Income",
    date: "2023-09-10",
    category: "Rental",
    source: "Property",
    notes: "Monthly rental income"
  }
];

const mockExpenses = [
  {
    id: "exp1",
    amount: 2000,
    description: "Vendor Payment",
    date: "2023-09-02",
    category: "Vendors",
    vendor: "Food Supplier",
    paymentMethod: "Bank Transfer",
    notes: "Monthly food supply"
  },
  {
    id: "exp2",
    amount: 1500,
    description: "Employee Salaries",
    date: "2023-09-15",
    category: "Employees",
    vendor: "Payroll",
    paymentMethod: "Bank Transfer",
    notes: "Monthly payroll"
  },
  {
    id: "exp3",
    amount: 500,
    description: "Coffee Supplies",
    date: "2023-09-08",
    category: "Supplies",
    vendor: "Coffee Supplier",
    paymentMethod: "Cash",
    notes: "Coffee and related supplies"
  },
  {
    id: "exp4",
    amount: 1000,
    description: "Maintenance",
    date: "2023-09-12",
    category: "Maintenance",
    vendor: "Repair Service",
    paymentMethod: "Bank Transfer",
    notes: "Equipment maintenance"
  },
  {
    id: "exp5",
    amount: 800,
    description: "Transportation",
    date: "2023-09-20",
    category: "Transportation",
    vendor: "Fuel Company",
    paymentMethod: "Credit Card",
    notes: "Fuel for delivery vehicles"
  }
];

const BudgetManagement = ({ userRole = "admin" }) => {
  const [incomes, setIncomes] = useState(mockIncomes);
  const [expenses, setExpenses] = useState(mockExpenses);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Filter incomes and expenses by date range
  const filteredIncomes = useMemo(() => {
    return incomes.filter(income => {
      if (!startDate || !endDate) return true;

      const incomeDate = new Date(income.date);
      const start = new Date(startDate);
      const end = new Date(endDate);

      return isWithinInterval(incomeDate, { start, end });
    });
  }, [incomes, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (!startDate || !endDate) return true;

      const expenseDate = new Date(expense.date);
      const start = new Date(startDate);
      const end = new Date(endDate);

      return isWithinInterval(expenseDate, { start, end });
    });
  }, [expenses, startDate, endDate]);

  // Calculate totals
  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netBudget = totalIncome - totalExpenses;

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});
  }, [filteredExpenses]);

  // Group incomes by category
  const incomesByCategory = useMemo(() => {
    return filteredIncomes.reduce((acc, income) => {
      if (!acc[income.category]) {
        acc[income.category] = 0;
      }
      acc[income.category] += income.amount;
      return acc;
    }, {});
  }, [filteredIncomes]);

  // Handle adding new income
  const handleAddIncome = (income) => {
    try {
      const newIncome = {
        id: `inc${Date.now()}`,
        ...income
      };
      setIncomes([...incomes, newIncome]);
      setIsAddIncomeModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle adding new expense
  const handleAddExpense = (expense) => {
    try {
      const newExpense = {
        id: `exp${Date.now()}`,
        ...expense
      };
      setExpenses([...expenses, newExpense]);
      setIsAddExpenseModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  // Mobile card for incomes
  const IncomeMobileCard = createMobileCard(({ item: income }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-green-400">+{income.amount} ₪</h3>
      </div>
      <div className="text-sm">
        <p className="font-medium text-white">{income.description}</p>
        <p className="text-gray-400">{income.category} • {income.source}</p>
        <p className="text-gray-500">{format(new Date(income.date), "MMM dd, yyyy")}</p>
      </div>
    </div>
  ));

  // Mobile card for expenses
  const ExpenseMobileCard = createMobileCard(({ item: expense }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-red-400">-{expense.amount} ₪</h3>
      </div>
      <div className="text-sm">
        <p className="font-medium text-white">{expense.description}</p>
        <p className="text-gray-400">{expense.category} • {expense.vendor}</p>
        <p className="text-gray-500">{format(new Date(expense.date), "MMM dd, yyyy")}</p>
      </div>
    </div>
  ));

  // Table columns for incomes
  const incomeColumns = [
    {
      key: "date",
      label: "Date",
      render: (income) => format(new Date(income.date), "MMM dd, yyyy"),
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "source",
      label: "Source",
    },
    {
      key: "amount",
      label: "Amount",
      render: (income) => `+${income.amount} ₪`,
      className: "text-green-400",
    },
  ];

  // Table columns for expenses
  const expenseColumns = [
    {
      key: "date",
      label: "Date",
      render: (expense) => format(new Date(expense.date), "MMM dd, yyyy"),
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "vendor",
      label: "Vendor",
    },
    {
      key: "amount",
      label: "Amount",
      render: (expense) => `-${expense.amount} ₪`,
      className: "text-red-400",
    },
  ];

  return (
    <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-0 text-white">
          Budget Management
        </h2>
        <div className="flex space-x-2">
          <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
            <button
              onClick={() => setIsAddIncomeModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Income
            </button>
            <button
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Expense
            </button>
          </RoleGuard>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Date Filter */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <h3 className="text-lg font-semibold text-white mb-2 sm:mb-0">Filter by Date Range</h3>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-500 transition-colors"
          >
            Clear Filter
          </button>
        </div>

        {startDate && endDate && (
          <div className="text-sm text-green-400 mb-3">
            Showing from {format(new Date(startDate), "MMM dd, yyyy")} to {format(new Date(endDate), "MMM dd, yyyy")}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-lg">
          <p className="text-sm text-green-300 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-400">+{totalIncome.toFixed(2)} ₪</p>
        </div>
        <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-lg">
          <p className="text-sm text-red-300 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-400">-{totalExpenses.toFixed(2)} ₪</p>
        </div>
        <div className={`p-4 rounded-lg ${netBudget >= 0 ? 'bg-blue-900/30 border border-blue-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
          <p className="text-sm mb-1">Net Budget</p>
          <p className={`text-2xl font-bold ${netBudget >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {netBudget >= 0 ? '+' : ''}{netBudget.toFixed(2)} ₪
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Income by Category */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Income by Category</h3>
          <div className="space-y-2">
            {Object.entries(incomesByCategory).map(([category, amount]) => (
              <div key={category} className="bg-gray-600 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white text-sm">{category}</span>
                  <span className="text-green-400 font-medium">+{amount.toFixed(2)} ₪</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(amount / totalIncome) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Expenses by Category</h3>
          <div className="space-y-2">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="bg-gray-600 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white text-sm">{category}</span>
                  <span className="text-red-400 font-medium">-{amount.toFixed(2)} ₪</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(amount / totalExpenses) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Income and Expenses Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Table */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Income Records</h3>
            <span className="text-green-400 text-sm">{filteredIncomes.length} records</span>
          </div>
          <ResponsiveTable
            data={filteredIncomes}
            columns={incomeColumns}
            MobileCard={IncomeMobileCard}
            emptyMessage="No income records found. Add your first income to get started!"
          />
        </div>

        {/* Expenses Table */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Expense Records</h3>
            <span className="text-red-400 text-sm">{filteredExpenses.length} records</span>
          </div>
          <ResponsiveTable
            data={filteredExpenses}
            columns={expenseColumns}
            MobileCard={ExpenseMobileCard}
            emptyMessage="No expense records found. Add your first expense to get started!"
          />
        </div>
      </div>

      {/* Add Income Modal */}
      {isAddIncomeModalOpen && (
        <AddIncomeModal
          isOpen={isAddIncomeModalOpen}
          onClose={() => setIsAddIncomeModalOpen(false)}
          onAdd={handleAddIncome}
          userRole={userRole}
        />
      )}

      {/* Add Expense Modal */}
      {isAddExpenseModalOpen && (
        <AddExpenseModal
          isOpen={isAddExpenseModalOpen}
          onClose={() => setIsAddExpenseModalOpen(false)}
          onAdd={handleAddExpense}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default BudgetManagement;
