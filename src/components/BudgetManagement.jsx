import React, { useState, useEffect, useMemo } from "react";
import { format, isWithinInterval } from "date-fns";
import ResponsiveTable, { createMobileCard } from "./ResponsiveTable";
import AddIncomeModal from "./AddIncomeModal";
import AddExpenseModal from "./AddExpenseModal";
import RoleGuard from "./RoleGuard";
import {
  getIncomes,
  getExpenses,
  getSales,
  getPurchases,
  getProducts,
  addIncome,
  addExpense,
  deleteIncome,
  deleteExpense,
} from "../firebase/firestore";

const BudgetManagement = ({ userRole = "admin" }) => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Fetch budget data from Firebase
  const fetchBudgetData = async () => {
    try {
      const [incomesData, expensesData, salesData, purchasesData, productsData] = await Promise.all([
        getIncomes(),
        getExpenses(),
        getSales(),
        getPurchases(),
        getProducts(),
      ]);
      setIncomes(incomesData || []);
      setExpenses(expensesData || []);
      // Keep all transactions; we'll exclude payment-only where appropriate (P&L)
      setSales(salesData || []);
      setPurchases(purchasesData || []);
      setProducts(productsData || []);
    } catch (error) {
      setError("Error loading budget data: " + error.message);
    }
  };

  // Clear all budget data
  const clearBudgetData = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all budget data? This action cannot be undone."
      )
    ) {
      return;
    }
    
    // Ask for password confirmation
    const password = prompt("Please enter your password to confirm budget data deletion:");
    if (!password) {
      alert("Password confirmation required. Budget data deletion cancelled.");
      return;
    }
    
    // In a real application, you would verify the password with your backend
    // For this demo, we'll just check if it's not empty
    if (password.trim() === "") {
      alert("Invalid password. Budget data deletion cancelled.");
      return;
    }

    try {
      // Clear state
      setIncomes([]);
      setExpenses([]);

      // Delete all income records
      const incomesData = await getIncomes();
      await Promise.all(incomesData.map((income) => deleteIncome(income.id)));

      // Delete all expense records
      const expensesData = await getExpenses();
      await Promise.all(
        expensesData.map((expense) => deleteExpense(expense.id))
      );

      alert("All budget data has been successfully cleared.");
    } catch (error) {
      setError("Error clearing budget data: " + error.message);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchBudgetData();
  }, []);

  // Filter incomes and expenses by date range
  const filteredIncomes = useMemo(() => {
    return incomes.filter((income) => {
      if (!startDate || !endDate) return true;

      const incomeDate = new Date(income.date);
      const start = new Date(startDate);
      const end = new Date(endDate);

      return isWithinInterval(incomeDate, { start, end });
    });
  }, [incomes, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (!startDate || !endDate) return true;

      const expenseDate = new Date(expense.date);
      const start = new Date(startDate);
      const end = new Date(endDate);

      return isWithinInterval(expenseDate, { start, end });
    });
  }, [expenses, startDate, endDate]);

  // Filter sales and purchases by date range (exclude payment-only records)
  const filteredSales = useMemo(() => {
    const base = (sales || []).filter((s) => !s.isPaymentOnly);
    return base.filter((sale) => {
      if (!startDate || !endDate) return true;
      const d = new Date(sale.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return isWithinInterval(d, { start, end });
    });
  }, [sales, startDate, endDate]);
 
  const filteredPurchases = useMemo(() => {
    const base = (purchases || []).filter((p) => !p.isPaymentOnly);
    return base.filter((purchase) => {
      if (!startDate || !endDate) return true;
      const d = new Date(purchase.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return isWithinInterval(d, { start, end });
    });
  }, [purchases, startDate, endDate]);

  // Calculate totals and advanced financial metrics
  const totalIncome = filteredIncomes.reduce((sum, income) => sum + (income.amount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);
 
  // Helper for date range
  const inRange = (dateStr) => {
    if (!startDate || !endDate) return true;
    const d = new Date(dateStr);
    const s = new Date(startDate);
    const e = new Date(endDate);
    return isWithinInterval(d, { start: s, end: e });
  };
 
  // Build product average cost map from ALL purchases (moving average across history)
  const averageCostByProduct = useMemo(() => {
    const totals = new Map(); // id -> { qty, cost }
    (purchases || []).forEach((p) => {
      const items = Array.isArray(p.items) && p.items.length > 0
        ? p.items.map(it => ({ productId: it.productId || it.id, qty: it.quantity || 0, price: (it.priceAtPurchase ?? it.price ?? 0) }))
        : (Array.isArray(p.products) ? p.products.map(it => ({ productId: it.id, qty: it.quantity || 0, price: (it.price ?? 0) })) : []);
      items.forEach(({ productId, qty, price }) => {
        if (!productId || !qty) return;
        const acc = totals.get(productId) || { qty: 0, cost: 0 };
        acc.qty += Number(qty) || 0;
        acc.cost += (Number(qty) || 0) * (Number(price) || 0);
        totals.set(productId, acc);
      });
    });
    const avg = new Map();
    totals.forEach((v, k) => {
      avg.set(k, v.qty > 0 ? v.cost / v.qty : 0);
    });
    return avg;
  }, [purchases]);
 
  // Quantities sold and purchased in period (by product)
  const soldQtyByProduct = useMemo(() => {
    const m = new Map();
    filteredSales.forEach((s) => {
      const items = Array.isArray(s.items) ? s.items : [];
      items.forEach((it) => {
        const id = it.productId || it.id;
        const q = Number(it.quantity) || 0;
        if (!id || !q) return;
        m.set(id, (m.get(id) || 0) + q);
      });
    });
    return m;
  }, [filteredSales]);
 
  const purchasedQtyByProduct = useMemo(() => {
    const m = new Map();
    filteredPurchases.forEach((p) => {
      const items = Array.isArray(p.items) && p.items.length > 0
        ? p.items
        : (Array.isArray(p.products) ? p.products.map(it => ({ productId: it.id, quantity: it.quantity })) : []);
      items.forEach((it) => {
        const id = it.productId || it.id;
        const q = Number(it.quantity) || 0;
        if (!id || !q) return;
        m.set(id, (m.get(id) || 0) + q);
      });
    });
    return m;
  }, [filteredPurchases]);
 
  // Approximate Opening/Closing inventory quantities for the period
  // OpeningQty = ClosingQty - PurchasedQty(period) + SoldQty(period)
  const closingQtyByProduct = useMemo(() => {
    const m = new Map();
    (products || []).forEach((p) => {
      if (!p?.id) return;
      m.set(p.id, Number(p.stock) || 0);
    });
    return m;
  }, [products]);
 
  const purchasesValueInPeriod = useMemo(() => {
    let total = 0;
    filteredPurchases.forEach((p) => {
      const items = Array.isArray(p.items) && p.items.length > 0
        ? p.items.map(it => ({ qty: it.quantity || 0, price: (it.priceAtPurchase ?? it.price ?? 0) }))
        : (Array.isArray(p.products) ? p.products.map(it => ({ qty: it.quantity || 0, price: (it.price ?? 0) })) : []);
      items.forEach(({ qty, price }) => {
        total += (Number(qty) || 0) * (Number(price) || 0);
      });
    });
    return total;
  }, [filteredPurchases]);
 
  const { openingInventoryValue, closingInventoryValue } = useMemo(() => {
    let openingValue = 0;
    let closingValue = 0;
    closingQtyByProduct.forEach((closingQty, id) => {
      const purchased = purchasedQtyByProduct.get(id) || 0;
      const sold = soldQtyByProduct.get(id) || 0;
      const openingQty = Math.max(0, closingQty - purchased + sold);
      const avgCost = averageCostByProduct.get(id) || 0;
      openingValue += openingQty * avgCost;
      closingValue += closingQty * avgCost;
    });
    return { openingInventoryValue: openingValue, closingInventoryValue: closingValue };
  }, [closingQtyByProduct, purchasedQtyByProduct, soldQtyByProduct, averageCostByProduct]);
 
  // COGS via accounting identity: Opening + Purchases - Closing
  const cogs = Math.max(0, openingInventoryValue + purchasesValueInPeriod - closingInventoryValue);
 
  // Gross and Net
  const grossProfit = totalSales - cogs;
  const netProfit = grossProfit + totalIncome - totalExpenses;
 
  // Working capital and cash-flow approximations for the period
  const receivables = filteredSales.reduce((sum, s) => sum + (s.balance || 0), 0);
  const payables = filteredPurchases.reduce((sum, p) => sum + (p.balance || 0), 0);
 
  const paymentOnlySalesInPeriod = (sales || []).filter((s) => s.isPaymentOnly && inRange(s.date));
  const paymentOnlyPurchasesInPeriod = (purchases || []).filter((p) => p.isPaymentOnly && inRange(p.date));
 
  const cashIn = filteredSales.reduce((sum, s) => sum + (s.amountPaid || 0), 0)
    + paymentOnlySalesInPeriod.reduce((sum, s) => sum + (s.amountPaid || 0), 0)
    + totalIncome; // assume manual incomes are cash in
 
  const cashOut = filteredPurchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0)
    + paymentOnlyPurchasesInPeriod.reduce((sum, p) => sum + (p.amountPaid || 0), 0)
    + totalExpenses; // assume manual expenses are cash out
 
  const netCashFlow = cashIn - cashOut;

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
  const handleAddIncome = async (income) => {
    try {
      const newIncome = {
        ...income,
      };
      await addIncome(newIncome);
      fetchBudgetData();
      setIsAddIncomeModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle adding new expense
  const handleAddExpense = async (expense) => {
    try {
      const newExpense = {
        ...expense,
      };
      await addExpense(newExpense);
      fetchBudgetData();
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
        <p className="text-gray-400">
          {income.category} • {income.source}
        </p>
        <p className="text-gray-500">
          {format(new Date(income.date), "MMM dd, yyyy")}
        </p>
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
        <p className="text-gray-400">
          {expense.category} • {expense.vendor}
        </p>
        <p className="text-gray-500">
          {format(new Date(expense.date), "MMM dd, yyyy")}
        </p>
      </div>
    </div>
  ));

  // Table columns for incomes
  const incomeColumns = [
    {
      key: "date",
      header: "Date",
      render: (income) => format(new Date(income.date), "MMM dd, yyyy"),
    },
    {
      key: "description",
      header: "Description",
    },
    {
      key: "category",
      header: "Category",
    },
    {
      key: "source",
      header: "Source",
    },
    {
      key: "amount",
      header: "Amount",
      render: (income) => `+${income.amount} ₪`,
      className: "text-green-400",
    },
  ];

  // Table columns for expenses
  const expenseColumns = [
    {
      key: "date",
      header: "Date",
      render: (expense) => format(new Date(expense.date), "MMM dd, yyyy"),
    },
    {
      key: "description",
      header: "Description",
    },
    {
      key: "category",
      header: "Category",
    },
    {
      key: "vendor",
      header: "Vendor",
    },
    {
      key: "amount",
      header: "Amount",
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
        <div className="flex flex-wrap gap-2">
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
            <button
              onClick={clearBudgetData}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Clear Budget Data
            </button>
          </RoleGuard>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Date Filter */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <h3 className="text-lg font-semibold text-white mb-2 sm:mb-0">
            Filter by Date Range
          </h3>
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
            Showing from {format(new Date(startDate), "MMM dd, yyyy")} to{" "}
            {format(new Date(endDate), "MMM dd, yyyy")}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">
              Start Date
            </label>
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

      {/* Summary Cards (Comprehensive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-lg">
          <p className="text-sm text-green-300 mb-1">Sales Revenue</p>
          <p className="text-2xl font-bold text-green-400">+{totalSales.toFixed(2)} ₪</p>
        </div>
        <div className="bg-emerald-900/30 border border-emerald-500/30 p-4 rounded-lg">
          <p className="text-sm text-emerald-300 mb-1">Other Income</p>
          <p className="text-2xl font-bold text-emerald-400">+{totalIncome.toFixed(2)} ₪</p>
        </div>
        <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-lg">
          <p className="text-sm text-red-300 mb-1">COGS</p>
          <p className="text-2xl font-bold text-red-400">-{cogs.toFixed(2)} ₪</p>
        </div>
        <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-lg">
          <p className="text-sm text-indigo-300 mb-1">Gross Profit</p>
          <p className="text-2xl font-bold text-indigo-400">{grossProfit >= 0 ? "+" : ""}{grossProfit.toFixed(2)} ₪</p>
        </div>
        <div className="bg-rose-900/30 border border-rose-500/30 p-4 rounded-lg">
          <p className="text-sm text-rose-300 mb-1">Other Expenses</p>
          <p className="text-2xl font-bold text-rose-400">-{totalExpenses.toFixed(2)} ₪</p>
        </div>
        <div className={`p-4 rounded-lg ${netProfit >= 0 ? 'bg-blue-900/30 border border-blue-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
          <p className="text-sm mb-1">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toFixed(2)} ₪
          </p>
        </div>
        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <p className="text-sm text-gray-300 mb-1">Inventory (Closing)</p>
          <p className="text-2xl font-bold text-gray-100">{closingInventoryValue.toFixed(2)} ₪</p>
        </div>
      </div>

      {/* Working Capital & Cash Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-yellow-900/30 border border-yellow-500/30 p-4 rounded-lg">
          <p className="text-sm text-yellow-300 mb-1">Accounts Receivable</p>
          <p className="text-2xl font-bold text-yellow-400">₪{receivables.toFixed(2)}</p>
        </div>
        <div className="bg-orange-900/30 border border-orange-500/30 p-4 rounded-lg">
          <p className="text-sm text-orange-300 mb-1">Accounts Payable</p>
          <p className="text-2xl font-bold text-orange-400">₪{payables.toFixed(2)}</p>
        </div>
        <div className="bg-teal-900/30 border border-teal-500/30 p-4 rounded-lg">
          <p className="text-sm text-teal-300 mb-1">Cash In (approx)</p>
          <p className="text-2xl font-bold text-teal-400">+{cashIn.toFixed(2)} ₪</p>
        </div>
        <div className="bg-fuchsia-900/30 border border-fuchsia-500/30 p-4 rounded-lg">
          <p className="text-sm text-fuchsia-300 mb-1">Cash Out (approx)</p>
          <p className="text-2xl font-bold text-fuchsia-400">-{cashOut.toFixed(2)} ₪</p>
        </div>
      </div>
      <div className="mb-10 p-4 rounded-lg border" style={{ borderColor: netCashFlow >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)', background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-sm mb-1">Net Cash Flow (approx)</p>
        <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {netCashFlow >= 0 ? '+' : ''}{netCashFlow.toFixed(2)} ₪
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Income by Category */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">
            Income by Category
          </h3>
          <div className="space-y-2">
            {Object.entries(incomesByCategory).map(([category, amount]) => (
              <div key={category} className="bg-gray-600 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white text-sm">{category}</span>
                  <span className="text-green-400 font-medium">
                    +{amount.toFixed(2)} ₪
                  </span>
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
          <h3 className="text-lg font-semibold text-white mb-3">
            Expenses by Category
          </h3>
          <div className="space-y-2">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="bg-gray-600 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white text-sm">{category}</span>
                  <span className="text-red-400 font-medium">
                    -{amount.toFixed(2)} ₪
                  </span>
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
            <span className="text-green-400 text-sm">
              {filteredIncomes.length} records
            </span>
          </div>
          <ResponsiveTable
            data={filteredIncomes}
            columns={incomeColumns}
            mobileCardComponent={IncomeMobileCard}
            emptyMessage="No income records found. Add your first income to get started!"
          />
        </div>

        {/* Expenses Table */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Expense Records
            </h3>
            <span className="text-red-400 text-sm">
              {filteredExpenses.length} records
            </span>
          </div>
          <ResponsiveTable
            data={filteredExpenses}
            columns={expenseColumns}
            mobileCardComponent={ExpenseMobileCard}
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
