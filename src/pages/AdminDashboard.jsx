import React, { useState, useEffect, useContext } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import MobileNav from "../components/MobileNav";
import { AuthContext } from "../context/AuthContext";
import supermarketLogo from "../assets/supermarket.png";
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
import BudgetManagement from "../components/BudgetManagement";
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
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50 px-4 py-3 shadow-lg">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')]"></div>
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
            <div class="relative group">
              <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <span className="text-lg">📋</span>
                <span className="hidden sm:inline">Actions</span>
                <span className="text-xs">▼</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                <a href="#reports" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">📊 Reports</a>
                <a href="#customers" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">👥 Customers</a>
                <a href="#vendors" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">🏪 Vendors</a>
                <a href="#products" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">📦 Products</a>
                <a href="#sales" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">💰 Sales</a>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors duration-200 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {currentUser?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs text-gray-300 truncate max-w-[100px]">{currentUser?.email}</span>
                <span className="text-xs bg-red-500 px-2 py-0.5 rounded text-center">Admin</span>
              </div>
            </div>
            
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

        <ErrorBoundary fallbackMessage="Budget management failed to load.">
          <section id="budget" className="mb-8">
            <BudgetManagement userRole="admin" />
          </section>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default AdminDashboard;
