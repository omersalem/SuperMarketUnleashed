import React, { useState, useEffect, useContext } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import { AuthContext } from "../context/AuthContext";
import supermarketLogo from "../assets/supermarket.png";
import {
  PageLoadingSpinner,
  SectionLoadingSpinner,
} from "../components/LoadingSpinner";
import CustomerManagement from "../components/CustomerManagement";
import VendorManagement from "../components/VendorManagement";
import CategoryManagement from "../components/CategoryManagement";
import ProductManagement from "../components/ProductManagement";
import SalesManagement from "../components/SalesManagement";
import PurchaseManagement from "../components/PurchaseManagement";
import InvoiceManagement from "../components/InvoiceManagement";
import CheckManagement from "../components/CheckManagement";
import WorkerManagement from "../components/WorkerManagement";
import InventoryManagement from "../components/InventoryManagement";
import PaymentManagement from "../components/PaymentManagement";
import VendorPaymentManagement from "../components/VendorPaymentManagement";
import UserRoleManagement from "../components/UserRoleManagement";
import ReportsDashboard from "../components/ReportsDashboard";
import BudgetManagement from "../components/BudgetManagement";
import BackupManagement from "../components/BackupManagement";
import { handleFirebaseError, logError } from "../utils/errorHandling";
import { useDashboardData } from "../hooks/useDashboardData";

// Firebase functions
import {
  getCustomers,
  getVendors,
  getCategories,
  getProducts,
  getSales,
  getPurchases,
  getChecks,
  getWorkers,
  getBanks,
  getCurrencies,
  getSalaryPayments,
  getWorkerExpenses,
  getWorkerAttendance,
  getIncomes,
  getExpenses,
  deleteCustomer,
  deleteVendor,
  deleteCategory,
  deleteProduct,
  deleteSale,
  deletePurchase,
  deleteCheck,
  deleteWorker,
  deleteBank,
  deleteCurrency,
  deleteSalaryPayment,
  deleteWorkerExpense,
  deleteWorkerAttendance,
  deleteIncome,
  deleteExpense,
} from "../firebase/firestore";

const AdminDashboard = () => {
  const { logout, currentUser } = useContext(AuthContext);
  const {
    customers,
    vendors,
    categories,
    products,
    sales,
    purchases,
    checks,
    workers,
    banks,
    currencies,
    salaryPayments,
    workerExpenses,
    workerAttendance,
    setData,
    loading,
    error,
  } = useDashboardData();
  const [restoreTimestamp, setRestoreTimestamp] = useState(null);
  // Section loading states
  const [loadingStates, setLoadingStates] = useState({
    initial: true,
    reports: false,
    customers: false,
    vendors: false,
    categories: false,
    products: false,
    sales: false,
    purchases: false,
    checks: false,
    workers: false,
    inventory: false,
  });

  // Helper function to handle section loading
  const handleSectionLoading = (section, isLoading) => {
    setLoadingStates((prev) => ({ ...prev, [section]: isLoading }));
  };

  // Function to reset all data
  const handleResetAllData = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all data? This action cannot be undone."
      )
    ) {
      return;
    }

    // Ask for password confirmation
    const password = prompt(
      "Please enter your password to confirm data deletion:"
    );
    if (!password) {
      alert("Password confirmation required. Data deletion cancelled.");
      return;
    }

    // In a real application, you would verify the password with your backend
    // For this demo, we'll just check if it's not empty
    if (password.trim() === "") {
      alert("Invalid password. Data deletion cancelled.");
      return;
    }

    try {
      // Reset all state
      setData({
        customers: [],
        vendors: [],
        categories: [],
        products: [],
        sales: [],
        purchases: [],
        checks: [],
        workers: [],
        banks: [],
        currencies: [],
        salaryPayments: [],
        workerExpenses: [],
        workerAttendance: [],
      });

      // Delete all documents from collections
      const [
        customersData,
        vendorsData,
        categoriesData,
        productsData,
        salesData,
        purchasesData,
        checksData,
        workersData,
        banksData,
        currenciesData,
        salaryPaymentsData,
        workerExpensesData,
        workerAttendanceData,
      ] = await Promise.all([
        getCustomers(),
        getVendors(),
        getCategories(),
        getProducts(),
        getSales(),
        getPurchases(),
        getChecks(),
        getWorkers(),
        getBanks(),
        getCurrencies(),
        getSalaryPayments(),
        getWorkerExpenses(),
        getWorkerAttendance(),
      ]);

      // Delete all customers
      await Promise.all(
        customersData.map((customer) => deleteCustomer(customer.id))
      );

      // Delete all vendors
      await Promise.all(vendorsData.map((vendor) => deleteVendor(vendor.id)));

      // Delete all categories
      await Promise.all(
        categoriesData.map((category) => deleteCategory(category.id))
      );

      // Delete all products
      await Promise.all(
        productsData.map((product) => deleteProduct(product.id))
      );

      // Delete all sales
      await Promise.all(salesData.map((sale) => deleteSale(sale.id)));

      // Delete all purchases
      await Promise.all(
        purchasesData.map((purchase) => deletePurchase(purchase.id))
      );

      // Delete all checks
      await Promise.all(checksData.map((check) => deleteCheck(check.id)));

      // Delete all workers
      await Promise.all(workersData.map((worker) => deleteWorker(worker.id)));

      // Delete all banks
      await Promise.all(banksData.map((bank) => deleteBank(bank.id)));

      // Delete all currencies
      await Promise.all(
        currenciesData.map((currency) => deleteCurrency(currency.id))
      );

      // Delete all salary payments
      await Promise.all(
        salaryPaymentsData.map((payment) => deleteSalaryPayment(payment.id))
      );

      // Delete all worker expenses
      await Promise.all(
        workerExpensesData.map((expense) => deleteWorkerExpense(expense.id))
      );

      // Delete all worker attendance records
      await Promise.all(
        workerAttendanceData.map((attendance) =>
          deleteWorkerAttendance(attendance.id)
        )
      );

      // Delete all income records
      const incomesData = await getIncomes();
      await Promise.all(incomesData.map((income) => deleteIncome(income.id)));

      // Delete all expense records
      const expensesData = await getExpenses();
      await Promise.all(
        expensesData.map((expense) => deleteExpense(expense.id))
      );

      alert("All data has been successfully cleared.");
    } catch (err) {
      const handledError = handleFirebaseError(err);
      logError(handledError, {
        context: "AdminDashboard - handleResetAllData",
      });
      alert(`Error clearing data: ${handledError.message}`);
    }
  };

  if (loading) {
    return <PageLoadingSpinner message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <p className="text-red-500">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Fixed Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50 px-4 py-3 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-full gap-4 relative z-10">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-md overflow-hidden">
              <img
                src={supermarketLogo}
                alt="SuperMarket Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              SuperMarket Admin
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {/* Budget Management Button */}
            <button
              onClick={() => {
                const element = document.querySelector("#budget");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              title="Budget Management"
            >
              <span className="text-lg">💰</span>
              <span className="hidden sm:inline">Budget</span>
            </button>

            {/* Quick Actions Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <span className="text-lg">📋</span>
                <span className="hidden sm:inline">Actions</span>
                <span className="text-xs">▼</span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                <a
                  href="#reports"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  📊 Reports
                </a>
                <a
                  href="#customers"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  👥 Customers
                </a>
                <a
                  href="#vendors"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  🏪 Vendors
                </a>
                <a
                  href="#categories"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  📂 Categories
                </a>
                <a
                  href="#products"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  📦 Products
                </a>
                <a
                  href="#sales"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  💰 Sales
                </a>
                <a
                  href="#payments"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  💳 Payments
                </a>
                <a
                  href="#purchases"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  🛒 Purchases
                </a>
                <a
                  href="#vendor-payments"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  💸 Vendor Payments
                </a>
                <a
                  href="#invoices"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  📄 Invoices
                </a>
                <a
                  href="#checks"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  📋 Checks
                </a>
                <a
                  href="#workers"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  👷 Workers
                </a>
                <a
                  href="#inventory"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  📊 Inventory
                </a>
                <a
                  href="#budget"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  💰 Budget
                </a>
                <a
                  href="#backup"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  💾 Backup
                </a>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors duration-200 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {currentUser?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs text-gray-300 truncate max-w-[100px]">
                  {currentUser?.email}
                </span>
                <span className="text-xs bg-red-500 px-2 py-0.5 rounded text-center">
                  Admin
                </span>
              </div>
            </div>

            {/* Reset Data Button */}
            <button
              onClick={handleResetAllData}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-700 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              title="Reset All Data"
            >
              <span className="text-lg">🔄</span>
              <span className="hidden sm:inline">Reset Data</span>
            </button>

            {/* Backup Button */}
            <button
              onClick={() => {
                const element = document.querySelector("#backup");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              title="Backup & Restore Data"
            >
              <span className="text-lg">💾</span>
              <span className="hidden sm:inline">Backup</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              title="Logout"
            >
              <span className="text-lg">🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <>
        {/* Main Content */}
        <div className="pt-16 px-2 sm:px-4 lg:px-8 max-w-full overflow-hidden">
          {/* Reports Section */}
          <ErrorBoundary fallbackMessage="Reports dashboard failed to load.">
            <section id="reports" className="mb-8">
              {loadingStates.reports ? (
                <SectionLoadingSpinner message="Loading reports..." />
              ) : (
                <ReportsDashboard
                  customers={customers}
                  vendors={vendors}
                  products={products}
                  sales={sales}
                  purchases={purchases}
                  checks={checks}
                  workers={workers}
                  banks={banks}
                  currencies={currencies}
                  salaryPayments={salaryPayments}
                  workerExpenses={workerExpenses}
                  workerAttendance={workerAttendance}
                  onLoadingChange={(loading) =>
                    handleSectionLoading("reports", loading)
                  }
                  // Pass setters for components that might update data
                  setCustomers={(c) =>
                    setData((prev) => ({ ...prev, customers: c }))
                  }
                  setVendors={(v) =>
                    setData((prev) => ({ ...prev, vendors: v }))
                  }
                  setProducts={(p) =>
                    setData((prev) => ({ ...prev, products: p }))
                  }
                  setSales={(s) => setData((prev) => ({ ...prev, sales: s }))}
                  setPurchases={(p) =>
                    setData((prev) => ({ ...prev, purchases: p }))
                  }
                  setChecks={(c) => setData((prev) => ({ ...prev, checks: c }))}
                  setWorkers={(w) =>
                    setData((prev) => ({ ...prev, workers: w }))
                  }
                  setBanks={(b) => setData((prev) => ({ ...prev, banks: b }))}
                  setCurrencies={(c) =>
                    setData((prev) => ({ ...prev, currencies: c }))
                  }
                  setSalaryPayments={(sp) =>
                    setData((prev) => ({ ...prev, salaryPayments: sp }))
                  }
                  setWorkerExpenses={(we) =>
                    setData((prev) => ({ ...prev, workerExpenses: we }))
                  }
                  setWorkerAttendance={(wa) =>
                    setData((prev) => ({ ...prev, workerAttendance: wa }))
                  }
                />
              )}
            </section>
          </ErrorBoundary>

          {/* Customer Management */}
          <ErrorBoundary fallbackMessage="Customer management failed to load.">
            <section id="customers" className="mb-8">
              <CustomerManagement
                key={restoreTimestamp}
                customers={customers}
                setCustomers={(c) =>
                  setData((prev) => ({ ...prev, customers: c }))
                }
              />
            </section>
          </ErrorBoundary>

          {/* Vendor Management */}
          <ErrorBoundary fallbackMessage="Vendor management failed to load.">
            <section id="vendors" className="mb-8">
              <VendorManagement
                vendors={vendors}
                setVendors={(v) => setData((prev) => ({ ...prev, vendors: v }))}
              />
            </section>
          </ErrorBoundary>

          {/* Category Management */}
          <ErrorBoundary fallbackMessage="Category management failed to load.">
            <section id="categories" className="mb-8">
              <CategoryManagement
                categories={categories}
                setCategories={(c) =>
                  setData((prev) => ({ ...prev, categories: c }))
                }
              />
            </section>
          </ErrorBoundary>

          {/* Product Management */}
          <ErrorBoundary fallbackMessage="Product management failed to load.">
            <section id="products" className="mb-8">
              {loadingStates.products ? (
                <SectionLoadingSpinner message="Loading products..." />
              ) : (
                <ProductManagement
                  products={products}
                  setProducts={(p) =>
                    setData((prev) => ({ ...prev, products: p }))
                  }
                  categories={categories}
                  onLoadingChange={(loading) =>
                    handleSectionLoading("products", loading)
                  }
                />
              )}
            </section>
          </ErrorBoundary>

          {/* Sales Management */}
          <ErrorBoundary fallbackMessage="Sales management failed to load.">
            <section id="sales" className="mb-8">
              {loadingStates.sales ? (
                <SectionLoadingSpinner message="Loading sales..." />
              ) : (
                <SalesManagement
                  sales={sales}
                  setSales={(s) => setData((prev) => ({ ...prev, sales: s }))}
                  customers={customers}
                  products={products}
                  setProducts={(p) =>
                    setData((prev) => ({ ...prev, products: p }))
                  }
                  banks={banks}
                  setBanks={(b) => setData((prev) => ({ ...prev, banks: b }))}
                  currencies={currencies}
                  setCurrencies={(c) =>
                    setData((prev) => ({ ...prev, currencies: c }))
                  }
                  onLoadingChange={(loading) =>
                    handleSectionLoading("sales", loading)
                  }
                />
              )}
            </section>
          </ErrorBoundary>

          {/* Payment Management */}
          <ErrorBoundary fallbackMessage="Payment management failed to load.">
            <section id="payments" className="mb-8">
              <PaymentManagement
                sales={sales}
                setSales={(s) => setData((prev) => ({ ...prev, sales: s }))}
                customers={customers}
                banks={banks}
                setBanks={(b) => setData((prev) => ({ ...prev, banks: b }))}
                currencies={currencies}
                setCurrencies={(c) =>
                  setData((prev) => ({ ...prev, currencies: c }))
                }
              />
            </section>
          </ErrorBoundary>

          {/* Purchase Management */}
          <ErrorBoundary fallbackMessage="Purchase management failed to load.">
            <section id="purchases" className="mb-8">
              <PurchaseManagement
                purchases={purchases}
                setPurchases={(p) =>
                  setData((prev) => ({ ...prev, purchases: p }))
                }
                vendors={vendors}
                products={products}
                setProducts={(p) =>
                  setData((prev) => ({ ...prev, products: p }))
                }
                banks={banks}
                setBanks={(b) => setData((prev) => ({ ...prev, banks: b }))}
                currencies={currencies}
                setCurrencies={(c) =>
                  setData((prev) => ({ ...prev, currencies: c }))
                }
              />
            </section>
          </ErrorBoundary>

          {/* Vendor Payment Management */}
          <ErrorBoundary fallbackMessage="Vendor payment management failed to load.">
            <section id="vendor-payments" className="mb-8">
              <VendorPaymentManagement
                purchases={purchases}
                setPurchases={(p) =>
                  setData((prev) => ({ ...prev, purchases: p }))
                }
                vendors={vendors}
                banks={banks}
                setBanks={(b) => setData((prev) => ({ ...prev, banks: b }))}
                currencies={currencies}
                setCurrencies={(c) =>
                  setData((prev) => ({ ...prev, currencies: c }))
                }
              />
            </section>
          </ErrorBoundary>

          {/* User Role Management */}
          <ErrorBoundary fallbackMessage="User role management failed to load.">
            <section id="user-roles" className="mb-8">
              <UserRoleManagement />
            </section>
          </ErrorBoundary>

          {/* Invoice Management */}
          <ErrorBoundary fallbackMessage="Invoice management failed to load.">
            <section id="invoices" className="mb-8">
              <InvoiceManagement
                sales={sales}
                customers={customers}
                userRole="admin"
              />
            </section>
          </ErrorBoundary>

          {/* Check Management */}
          <ErrorBoundary fallbackMessage="Check management failed to load.">
            <section id="checks" className="mb-8">
              <CheckManagement
                checks={checks}
                setChecks={(c) => setData((prev) => ({ ...prev, checks: c }))}
                banks={banks}
                setBanks={(b) => setData((prev) => ({ ...prev, banks: b }))}
                currencies={currencies}
                setCurrencies={(c) =>
                  setData((prev) => ({ ...prev, currencies: c }))
                }
              />
            </section>
          </ErrorBoundary>

          {/* Worker Management */}
          <ErrorBoundary fallbackMessage="Worker management failed to load.">
            <section id="workers" className="mb-8">
              <WorkerManagement
                workers={workers}
                setWorkers={(w) => setData((prev) => ({ ...prev, workers: w }))}
                salaryPayments={salaryPayments}
                setSalaryPayments={(sp) =>
                  setData((prev) => ({ ...prev, salaryPayments: sp }))
                }
                workerExpenses={workerExpenses}
                setWorkerExpenses={(we) =>
                  setData((prev) => ({ ...prev, workerExpenses: we }))
                }
                workerAttendance={workerAttendance}
                setWorkerAttendance={(wa) =>
                  setData((prev) => ({ ...prev, workerAttendance: wa }))
                }
              />
            </section>
          </ErrorBoundary>

          {/* Inventory Management */}
          <ErrorBoundary fallbackMessage="Inventory management failed to load.">
            <section id="inventory" className="mb-8">
              <InventoryManagement
                products={products}
                setProducts={(p) =>
                  setData((prev) => ({ ...prev, products: p }))
                }
              />
            </section>
          </ErrorBoundary>

          {/* Budget Management */}
          <ErrorBoundary fallbackMessage="Budget management failed to load.">
            <section id="budget" className="mb-8">
              <BudgetManagement userRole="admin" />
            </section>
          </ErrorBoundary>

          {/* Backup & Restore Management */}
          <ErrorBoundary fallbackMessage="Backup management failed to load.">
            <section id="backup" className="mb-8">
              <BackupManagement
                customers={customers}
                vendors={vendors}
                categories={categories}
                products={products}
                sales={sales}
                purchases={purchases}
                checks={checks}
                workers={workers}
                banks={banks}
                currencies={currencies}
                salaryPayments={salaryPayments}
                workerExpenses={workerExpenses}
                workerAttendance={workerAttendance}
                setCustomers={(c) =>
                  setData((prev) => ({ ...prev, customers: c }))
                }
                setVendors={(v) => setData((prev) => ({ ...prev, vendors: v }))}
                setCategories={(c) =>
                  setData((prev) => ({ ...prev, categories: c }))
                }
                setProducts={(p) =>
                  setData((prev) => ({ ...prev, products: p }))
                }
                setSales={(s) => setData((prev) => ({ ...prev, sales: s }))}
                setPurchases={(p) =>
                  setData((prev) => ({ ...prev, purchases: p }))
                }
                setChecks={(c) => setData((prev) => ({ ...prev, checks: c }))}
                setWorkers={(w) => setData((prev) => ({ ...prev, workers: w }))}
                setBanks={(b) => setData((prev) => ({ ...prev, banks: b }))}
                setCurrencies={(c) =>
                  setData((prev) => ({ ...prev, currencies: c }))
                }
                setSalaryPayments={(sp) =>
                  setData((prev) => ({ ...prev, salaryPayments: sp }))
                }
                setWorkerExpenses={(we) =>
                  setData((prev) => ({ ...prev, workerExpenses: we }))
                }
                setWorkerAttendance={(wa) =>
                  setData((prev) => ({ ...prev, workerAttendance: wa }))
                }
                setRestoreTimestamp={setRestoreTimestamp}
              />
            </section>
          </ErrorBoundary>
        </div>
      </>
    </div>
  );
};

export default AdminDashboard;
