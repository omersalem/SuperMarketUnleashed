import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <p>Loading all data...</p>
      </div>
    );
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
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex flex-wrap gap-2 overflow-x-auto">
            <a
              href="#reports"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              📊 Reports
            </a>
            <a
              href="#customers"
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
            >
              👥 Customers
            </a>
            <a
              href="#vendors"
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
            >
              🏪 Vendors
            </a>
            <a
              href="#categories"
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors"
            >
              📂 Categories
            </a>
            <a
              href="#products"
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
            >
              📦 Products
            </a>
            <a
              href="#sales"
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm transition-colors"
            >
              💰 Sales
            </a>
            <a
              href="#payments"
              className="px-3 py-1 bg-pink-600 hover:bg-pink-700 rounded text-sm transition-colors"
            >
              💳 Payments
            </a>
            <a
              href="#purchases"
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded text-sm transition-colors"
            >
              🛒 Purchases
            </a>
            <a
              href="#vendor-payments"
              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm transition-colors"
            >
              💼 Vendor Pay
            </a>
            <a
              href="#invoices"
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-sm transition-colors"
            >
              📋 Invoices
            </a>
            <a
              href="#checks"
              className="px-3 py-1 bg-lime-600 hover:bg-lime-700 rounded text-sm transition-colors"
            >
              💳 Checks
            </a>
            <a
              href="#workers"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-sm transition-colors"
            >
              👷 Workers
            </a>
            <a
              href="#inventory"
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 rounded text-sm transition-colors"
            >
              📊 Inventory
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content with top padding to account for fixed header */}
      <div className="pt-20 px-8 pb-8">
        <section id="reports">
          <ReportsDashboard
            sales={sales}
            purchases={purchases}
            customers={customers}
            vendors={vendors}
            products={products}
            workers={workers}
            salaryPayments={salaryPayments}
            workerExpenses={workerExpenses}
            workerAttendance={workerAttendance}
            checks={checks}
            categories={categories}
          />
        </section>

        <section id="customers">
          <CustomerManagement
            customers={customers}
            setCustomers={setCustomers}
          />
        </section>

        <section id="vendors">
          <VendorManagement vendors={vendors} setVendors={setVendors} />
        </section>

        <section id="categories">
          <CategoryManagement
            categories={categories}
            setCategories={setCategories}
          />
        </section>

        <section id="products">
          <ProductManagement
            products={products}
            setProducts={setProducts}
            categories={categories}
          />
        </section>

        <section id="sales">
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
          />
        </section>

        <section id="payments">
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

        <section id="purchases">
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

        <section id="vendor-payments">
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

        <section id="invoices">
          <InvoiceManagement sales={sales} userRole="admin" />
        </section>

        <section id="checks">
          <CheckManagement
            checks={checks}
            setChecks={setChecks}
            banks={banks}
            setBanks={setBanks}
            currencies={currencies}
            setCurrencies={setCurrencies}
          />
        </section>

        <section id="workers">
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

        <section id="inventory">
          <InventoryManagement products={products} setProducts={setProducts} />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
