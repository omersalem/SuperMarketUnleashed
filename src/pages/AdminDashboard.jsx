import React, { useState, useEffect, useContext } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import MobileNav from "../components/MobileNav";
import { AuthContext } from "../context/AuthContext";
import {
  PageLoadingSpinner,
  SectionLoadingSpinner,
} from "../components/LoadingSpinner";
import { StatsSkeleton } from "../components/SkeletonLoader";
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
import { handleFirebaseError, logError } from "../utils/errorHandling";

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

const AdminDashboard = () => {
  const { logout, currentUser, userRole } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [checks, setChecks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [workerExpenses, setWorkerExpenses] = useState([]);
  const [workerAttendance, setWorkerAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
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
        setCustomers(customersData);
        setVendors(vendorsData);
        setCategories(categoriesData);
        setProducts(productsData);
        setSales(salesData);
        setPurchases(purchasesData);
        setChecks(checksData);
        setWorkers(workersData);
        setBanks(banksData);
        setCurrencies(currenciesData);
        setSalaryPayments(salaryPaymentsData);
        setWorkerExpenses(workerExpensesData);
        setWorkerAttendance(workerAttendanceData);
      } catch (err) {
        const handledError = handleFirebaseError(err);
        logError(handledError, { context: "AdminDashboard - fetchAllData" });
        setError(handledError.message);
      } finally {
        setLoading(false);
        setLoadingStates((prev) => ({ ...prev, initial: false }));
      }
    };

    fetchAllData();
  }, []);

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
          <h1 className="text-lg sm:text-xl font-bold text-white truncate">
            Admin Dashboard
          </h1>

          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-300">
              <span className="text-blue-400">👤</span>
              <span>{currentUser?.email}</span>
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

            <MobileNav userRole={userRole || "admin"} />
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
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Vendor management failed to load.">
          <section id="vendors" className="mb-8">
            <VendorManagement vendors={vendors} setVendors={setVendors} />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Category management failed to load.">
          <section id="categories" className="mb-8">
            <CategoryManagement
              categories={categories}
              setCategories={setCategories}
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Product management failed to load.">
          <section id="products" className="mb-8">
            {loadingStates.products ? (
              <SectionLoadingSpinner message="Loading products..." />
            ) : (
              <ProductManagement
                products={products}
                setProducts={setProducts}
                categories={categories}
                onLoadingChange={(loading) =>
                  handleSectionLoading("products", loading)
                }
              />
            )}
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Sales management failed to load.">
          <section id="sales" className="mb-8">
            {loadingStates.sales ? (
              <SectionLoadingSpinner message="Loading sales..." />
            ) : (
              <SalesManagement
                sales={sales}
                setSales={setSales}
                customers={customers}
                products={products}
                setProducts={setProducts}
                banks={banks}
                setBanks={setBanks}
                currencies={currencies}
                setCurrencies={setCurrencies}
                onLoadingChange={(loading) =>
                  handleSectionLoading("sales", loading)
                }
              />
            )}
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
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Purchase management failed to load.">
          <section id="purchases" className="mb-8">
            <PurchaseManagement
              purchases={purchases}
              setPurchases={setPurchases}
              vendors={vendors}
              products={products}
              setProducts={setProducts}
              banks={banks}
              setBanks={setBanks}
              currencies={currencies}
              setCurrencies={setCurrencies}
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Vendor payment management failed to load.">
          <section id="vendor-payments" className="mb-8">
            <VendorPaymentManagement
              purchases={purchases}
              setPurchases={setPurchases}
              vendors={vendors}
              banks={banks}
              setBanks={setBanks}
              currencies={currencies}
              setCurrencies={setCurrencies}
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Invoice management failed to load.">
          <section id="invoices" className="mb-8">
            <InvoiceManagement
              sales={sales}
              customers={customers}
              userRole="admin"
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
            />
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Inventory management failed to load.">
          <section id="inventory" className="mb-8">
            <InventoryManagement
              products={products}
              setProducts={setProducts}
            />
          </section>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default AdminDashboard;
