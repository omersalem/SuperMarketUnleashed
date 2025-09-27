import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import ErrorBoundary from "../components/ErrorBoundary";
import MobileNav from "../components/MobileNav";
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
import ReportsDashboard from "../components/ReportsDashboard";
import UserRoleManagement from "../components/UserRoleManagement";
import { handleFirebaseError, logError } from "../utils/errorHandling";
import { useDashboardData } from "../hooks/useDashboardData";

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
} from "../firebase/firestore";

const UserDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
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
    loading,
    error,
  } = useDashboardData();
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
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50 px-2 sm:px-4 py-3">
        <div className="flex items-center justify-between max-w-full">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">
              User Dashboard
            </h1>
            <p className="text-xs text-gray-400">View-Only Access</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-300">
              <span className="text-blue-400">👤</span>
              <div className="flex flex-col">
                <span className="text-xs">{currentUser?.email}</span>
                <span className="text-xs bg-green-600 px-2 py-0.5 rounded text-center">
                  Read-Only User
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center space-x-2"
              title="Logout"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="text-base">🚪</span>
            </button>
            {/* The userRole is always 'user' here, so we can hardcode it or remove if MobileNav doesn't need it for users */}
            <MobileNav userRole="user" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 px-2 sm:px-4 lg:px-8 max-w-full overflow-hidden">
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
                userRole="user"
                onLoadingChange={(loading) =>
                  handleSectionLoading("reports", loading)
                }
              />
            )}
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Customer management failed to load.">
          <section id="customers" className="mb-8">
            <CustomerManagement
              customers={customers}
              setCustomers={setCustomers}
              userRole="user"
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Vendor management failed to load.">
          <section id="vendors" className="mb-8">
            <VendorManagement
              vendors={vendors}
              setVendors={setVendors}
              userRole="user"
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Category management failed to load.">
          <section id="categories" className="mb-8">
            <CategoryManagement
              categories={categories}
              setCategories={setCategories}
              userRole="user"
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Product management failed to load.">
          <section id="products" className="mb-8">
            <ProductManagement
              products={products}
              setProducts={setProducts}
              categories={categories}
              userRole="user"
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Payment management failed to load.">
          <section id="payments" className="mb-8">
            <PaymentManagement
              sales={sales}
              setSales={setSales}
              customers={customers}
              banks={banks}
              setBanks={setBanks}
              currencies={currencies}
              setCurrencies={setCurrencies}
              userRole="user"
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Invoice management failed to load.">
          <section id="invoices" className="mb-8">
            <InvoiceManagement
              sales={sales}
              customers={customers}
              userRole="user"
              currentUserId={currentUser?.uid}
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Check management failed to load.">
          <section id="checks" className="mb-8">
            <CheckManagement
              checks={checks}
              setChecks={setChecks}
              banks={banks}
              setBanks={setBanks}
              currencies={currencies}
              setCurrencies={setCurrencies}
              userRole="user"
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Worker management failed to load.">
          <section id="workers" className="mb-8">
            <WorkerManagement
              workers={workers}
              setWorkers={setWorkers}
              salaryPayments={salaryPayments}
              setSalaryPayments={setSalaryPayments}
              workerExpenses={workerExpenses}
              setWorkerExpenses={setWorkerExpenses}
              workerAttendance={workerAttendance}
              setWorkerAttendance={setWorkerAttendance}
              userRole="user"
            />
          </section>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default UserDashboard;
