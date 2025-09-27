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
import ActionsMenu from "../components/ActionsMenu";
import POS from "../components/POS";
import BudgetManagement from "../components/BudgetManagement";
import InteractiveDashboard from "../components/InteractiveDashboard";
import Notifications from "../components/Notifications";
import BackupManagement from "../components/BackupManagement";
import { handleFirebaseError, logError } from "../utils/errorHandling";
import { useDashboardData } from "../hooks/useDashboardData";
import { useNotifications } from "../hooks/useNotifications";
import {
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
  const { data, setData, loading, error } = useDashboardData();
  // Correctly destructure the arrays from the data object, providing default empty arrays for safety.
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
  } = data || {};
  const { notifications, unreadCount, setReadNotifications } = useNotifications(
    products,
    checks
  );
  const [restoreTimestamp, setRestoreTimestamp] = useState(null);
  const [showPOS, setShowPOS] = useState(false);
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
      // Delete all customers
      await Promise.all(
        customers.map((customer) => deleteCustomer(customer.id))
      );

      // Delete all vendors
      await Promise.all(vendors.map((vendor) => deleteVendor(vendor.id)));

      // Delete all categories
      await Promise.all(
        categories.map((category) => deleteCategory(category.id))
      );

      // Delete all products
      await Promise.all(products.map((product) => deleteProduct(product.id)));

      // Delete all sales
      await Promise.all(sales.map((sale) => deleteSale(sale.id)));

      // Delete all purchases
      await Promise.all(
        purchases.map((purchase) => deletePurchase(purchase.id))
      );

      // Delete all checks
      await Promise.all(checks.map((check) => deleteCheck(check.id)));

      // Delete all workers
      await Promise.all(workers.map((worker) => deleteWorker(worker.id)));

      // Delete all banks
      await Promise.all(banks.map((bank) => deleteBank(bank.id)));

      // Delete all currencies
      await Promise.all(
        currencies.map((currency) => deleteCurrency(currency.id))
      );

      // Delete all salary payments
      await Promise.all(
        salaryPayments.map((payment) => deleteSalaryPayment(payment.id))
      );

      // Delete all worker expenses
      await Promise.all(
        workerExpenses.map((expense) => deleteWorkerExpense(expense.id))
      );

      // Delete all worker attendance records
      await Promise.all(
        workerAttendance.map((attendance) =>
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
    <>
      {showPOS && (
        <POS
          products={products}
          setProducts={(updater) =>
            setData((prev) => ({
              ...prev,
              products:
                typeof updater === "function"
                  ? updater(prev.products)
                  : updater,
            }))
          }
          customers={customers}
          categories={categories}
          sales={sales}
          setSales={(updater) =>
            setData((prev) => ({
              ...prev,
              sales:
                typeof updater === "function" ? updater(prev.sales) : updater,
            }))
          }
          onClose={() => setShowPOS(false)}
        />
      )}
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Fixed Navigation Header */}
        <nav className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50 px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between max-w-full">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md overflow-hidden">
                <img
                  src={supermarketLogo}
                  alt="SuperMarket Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-white">
                SuperMarket Admin
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Launch POS Button */}
              <button
                onClick={() => setShowPOS(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                title="Launch Point of Sale"
              >
                🛍️ Launch POS
              </button>

              {/* Actions Menu Dropdown */}
              <ActionsMenu />

              {/* Notifications Bell */}
              <Notifications
                notifications={notifications}
                unreadCount={unreadCount}
                setReadNotifications={setReadNotifications}
              />

              {/* User Profile */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {currentUser?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs">{currentUser?.email}</span>
                  <span className="text-xs bg-red-500 px-2 py-0.5 rounded text-center">
                    Admin
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center space-x-2"
                title="Logout"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="text-base">🚪</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-16 px-2 sm:px-4 lg:px-8 max-w-full overflow-hidden">
          {/* Interactive Dashboard Overview */}
          <section id="overview" className="mb-8">
            <InteractiveDashboard
              sales={sales}
              products={products}
              checks={checks}
            />
          </section>

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
                    setData((prev) => ({
                      ...prev,
                      customers:
                        typeof c === "function" ? c(prev.customers) : c,
                    }))
                  }
                  setProducts={(p) =>
                    setData((prev) => ({
                      ...prev,
                      products: typeof p === "function" ? p(prev.products) : p,
                    }))
                  }
                  setSales={(s) =>
                    setData((prev) => ({
                      ...prev,
                      sales: typeof s === "function" ? s(prev.sales) : s,
                    }))
                  }
                  setPurchases={(p) =>
                    setData((prev) => ({
                      ...prev,
                      purchases:
                        typeof p === "function" ? p(prev.purchases) : p,
                    }))
                  }
                  setChecks={(c) =>
                    setData((prev) => ({
                      ...prev,
                      checks: typeof c === "function" ? c(prev.checks) : c,
                    }))
                  }
                  setWorkers={(w) =>
                    setData((prev) => ({
                      ...prev,
                      workers: typeof w === "function" ? w(prev.workers) : w,
                    }))
                  }
                  setBanks={(b) =>
                    setData((prev) => ({
                      ...prev,
                      banks: typeof b === "function" ? b(prev.banks) : b,
                    }))
                  }
                  setCurrencies={(c) =>
                    setData((prev) => ({
                      ...prev,
                      currencies:
                        typeof c === "function" ? c(prev.currencies) : c,
                    }))
                  }
                  setSalaryPayments={(sp) =>
                    setData((prev) => ({
                      ...prev,
                      salaryPayments:
                        typeof sp === "function" ? sp(prev.salaryPayments) : sp,
                    }))
                  }
                  setWorkerExpenses={(we) =>
                    setData((prev) => ({
                      ...prev,
                      workerExpenses:
                        typeof we === "function" ? we(prev.workerExpenses) : we,
                    }))
                  }
                  setWorkerAttendance={(wa) =>
                    setData((prev) => ({
                      ...prev,
                      workerAttendance:
                        typeof wa === "function"
                          ? wa(prev.workerAttendance)
                          : wa,
                    }))
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
                  setData((prev) => ({
                    ...prev,
                    customers: typeof c === "function" ? c(prev.customers) : c,
                  }))
                }
              />
            </section>
          </ErrorBoundary>

          {/* Vendor Management */}
          <ErrorBoundary fallbackMessage="Vendor management failed to load.">
            <section id="vendors" className="mb-8">
              <VendorManagement
                vendors={vendors}
                setVendors={(v) =>
                  setData((prev) => ({
                    ...prev,
                    vendors: typeof v === "function" ? v(prev.vendors) : v,
                  }))
                }
              />
            </section>
          </ErrorBoundary>

          {/* Category Management */}
          <ErrorBoundary fallbackMessage="Category management failed to load.">
            <section id="categories" className="mb-8">
              <CategoryManagement
                categories={categories}
                setCategories={(c) =>
                  setData((prev) => ({
                    ...prev,
                    categories:
                      typeof c === "function" ? c(prev.categories) : c,
                  }))
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
                    setData((prev) => ({
                      ...prev,
                      products: typeof p === "function" ? p(prev.products) : p,
                    }))
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
                  setSales={(s) =>
                    setData((prev) => ({
                      ...prev,
                      sales: typeof s === "function" ? s(prev.sales) : s,
                    }))
                  }
                  customers={customers}
                  products={products}
                  setProducts={(p) =>
                    setData((prev) => ({
                      ...prev,
                      products: typeof p === "function" ? p(prev.products) : p,
                    }))
                  }
                  banks={banks}
                  setBanks={(b) =>
                    setData((prev) => ({
                      ...prev,
                      banks: typeof b === "function" ? b(prev.banks) : b,
                    }))
                  }
                  currencies={currencies}
                  setCurrencies={(c) =>
                    setData((prev) => ({
                      ...prev,
                      currencies:
                        typeof c === "function" ? c(prev.currencies) : c,
                    }))
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
                setSales={(s) =>
                  setData((prev) => ({
                    ...prev,
                    sales: typeof s === "function" ? s(prev.sales) : s,
                  }))
                }
                customers={customers}
                banks={banks}
                setBanks={(b) =>
                  setData((prev) => ({
                    ...prev,
                    banks: typeof b === "function" ? b(prev.banks) : b,
                  }))
                }
                currencies={currencies}
                setCurrencies={(c) =>
                  setData((prev) => ({
                    ...prev,
                    currencies:
                      typeof c === "function" ? c(prev.currencies) : c,
                  }))
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
                  setData((prev) => ({
                    ...prev,
                    purchases: typeof p === "function" ? p(prev.purchases) : p,
                  }))
                }
                vendors={vendors}
                products={products}
                setProducts={(p) =>
                  setData((prev) => ({
                    ...prev,
                    products: typeof p === "function" ? p(prev.products) : p,
                  }))
                }
                banks={banks}
                setBanks={(b) =>
                  setData((prev) => ({
                    ...prev,
                    banks: typeof b === "function" ? b(prev.banks) : b,
                  }))
                }
                currencies={currencies}
                setCurrencies={(c) =>
                  setData((prev) => ({
                    ...prev,
                    currencies:
                      typeof c === "function" ? c(prev.currencies) : c,
                  }))
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
                  setData((prev) => ({
                    ...prev,
                    purchases: typeof p === "function" ? p(prev.purchases) : p,
                  }))
                }
                vendors={vendors}
                banks={banks}
                setBanks={(b) =>
                  setData((prev) => ({
                    ...prev,
                    banks: typeof b === "function" ? b(prev.banks) : b,
                  }))
                }
                currencies={currencies}
                setCurrencies={(c) =>
                  setData((prev) => ({
                    ...prev,
                    currencies:
                      typeof c === "function" ? c(prev.currencies) : c,
                  }))
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
                setChecks={(c) =>
                  setData((prev) => ({
                    ...prev,
                    checks: typeof c === "function" ? c(prev.checks) : c,
                  }))
                }
                banks={banks}
                setBanks={(b) =>
                  setData((prev) => ({
                    ...prev,
                    banks: typeof b === "function" ? b(prev.banks) : b,
                  }))
                }
                currencies={currencies}
                setCurrencies={(c) =>
                  setData((prev) => ({
                    ...prev,
                    currencies:
                      typeof c === "function" ? c(prev.currencies) : c,
                  }))
                }
              />
            </section>
          </ErrorBoundary>

          {/* Worker Management */}
          <ErrorBoundary fallbackMessage="Worker management failed to load.">
            <section id="workers" className="mb-8">
              <WorkerManagement
                workers={workers}
                setWorkers={(w) =>
                  setData((prev) => ({
                    ...prev,
                    workers: typeof w === "function" ? w(prev.workers) : w,
                  }))
                }
                salaryPayments={salaryPayments}
                setSalaryPayments={(sp) =>
                  setData((prev) => ({
                    ...prev,
                    salaryPayments:
                      typeof sp === "function" ? sp(prev.salaryPayments) : sp,
                  }))
                }
                workerExpenses={workerExpenses}
                setWorkerExpenses={(we) =>
                  setData((prev) => ({
                    ...prev,
                    workerExpenses:
                      typeof we === "function" ? we(prev.workerExpenses) : we,
                  }))
                }
                workerAttendance={workerAttendance}
                setWorkerAttendance={(wa) =>
                  setData((prev) => ({
                    ...prev,
                    workerAttendance:
                      typeof wa === "function" ? wa(prev.workerAttendance) : wa,
                  }))
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
                  setData((prev) => ({
                    ...prev,
                    products: typeof p === "function" ? p(prev.products) : p,
                  }))
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
                  setData((prev) => ({
                    ...prev,
                    customers: typeof c === "function" ? c(prev.customers) : c,
                  }))
                }
                setVendors={(v) =>
                  setData((prev) => ({
                    ...prev,
                    vendors: typeof v === "function" ? v(prev.vendors) : v,
                  }))
                }
                setCategories={(c) =>
                  setData((prev) => ({
                    ...prev,
                    categories:
                      typeof c === "function" ? c(prev.categories) : c,
                  }))
                }
                setProducts={(p) =>
                  setData((prev) => ({
                    ...prev,
                    products: typeof p === "function" ? p(prev.products) : p,
                  }))
                }
                setSales={(s) => setData((prev) => ({ ...prev, sales: s }))}
                setPurchases={(p) =>
                  setData((prev) => ({
                    ...prev,
                    purchases: typeof p === "function" ? p(prev.purchases) : p,
                  }))
                }
                setChecks={(c) => setData((prev) => ({ ...prev, checks: c }))}
                setWorkers={(w) =>
                  setData((prev) => ({
                    ...prev,
                    workers: typeof w === "function" ? w(prev.workers) : w,
                  }))
                }
                setBanks={(b) => setData((prev) => ({ ...prev, banks: b }))}
                setCurrencies={(c) =>
                  setData((prev) => ({
                    ...prev,
                    currencies:
                      typeof c === "function" ? c(prev.currencies) : c,
                  }))
                }
                setSalaryPayments={(sp) =>
                  setData((prev) => ({
                    ...prev,
                    salaryPayments:
                      typeof sp === "function" ? sp(prev.salaryPayments) : sp,
                  }))
                }
                setWorkerExpenses={(we) =>
                  setData((prev) => ({
                    ...prev,
                    workerExpenses:
                      typeof we === "function" ? we(prev.workerExpenses) : we,
                  }))
                }
                setWorkerAttendance={(wa) =>
                  setData((prev) => ({
                    ...prev,
                    workerAttendance:
                      typeof wa === "function" ? wa(prev.workerAttendance) : wa,
                  }))
                }
                setRestoreTimestamp={setRestoreTimestamp}
              />
            </section>
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
