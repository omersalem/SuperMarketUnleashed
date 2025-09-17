import React, { useState, useEffect } from 'react';
import CustomerManagement from '../components/CustomerManagement';
import VendorManagement from '../components/VendorManagement';
import CategoryManagement from '../components/CategoryManagement';
import ProductManagement from '../components/ProductManagement';
import SalesManagement from '../components/SalesManagement';
import PurchaseManagement from '../components/PurchaseManagement';
import InvoiceManagement from '../components/InvoiceManagement';
import CheckManagement from '../components/CheckManagement';
import WorkerManagement from '../components/WorkerManagement';
import InventoryManagement from '../components/InventoryManagement';
import ReportsDashboard from '../components/ReportsDashboard';

import { 
  getCustomers, getVendors, getCategories, getProducts, getSales, getPurchases, getChecks, getWorkers, getBanks, getCurrencies, getSalaryPayments, getWorkerExpenses
} from '../firebase/firestore';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [customersData, vendorsData, categoriesData, productsData, salesData, purchasesData, checksData, workersData, banksData, currenciesData, salaryPaymentsData, workerExpensesData] = await Promise.all([
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <ReportsDashboard 
        sales={sales}
        purchases={purchases}
        customers={customers}
        vendors={vendors}
        products={products}
        workers={workers}
        salaryPayments={salaryPayments}
        workerExpenses={workerExpenses}
        checks={checks}
        categories={categories}
      />
      <CustomerManagement customers={customers} setCustomers={setCustomers} />
      <VendorManagement vendors={vendors} setVendors={setVendors} />
      <CategoryManagement categories={categories} setCategories={setCategories} />
      <ProductManagement products={products} setProducts={setProducts} categories={categories} />
      <SalesManagement sales={sales} setSales={setSales} customers={customers} products={products} setProducts={setProducts} />
      <PurchaseManagement purchases={purchases} setPurchases={setPurchases} vendors={vendors} products={products} setProducts={setProducts} />
      <InvoiceManagement sales={sales} userRole="admin" />
      <CheckManagement checks={checks} setChecks={setChecks} banks={banks} setBanks={setBanks} currencies={currencies} setCurrencies={setCurrencies} />
      <WorkerManagement workers={workers} setWorkers={setWorkers} />
      <InventoryManagement products={products} setProducts={setProducts} />
    </div>
  );
};

export default AdminDashboard;
