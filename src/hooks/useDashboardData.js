import { useState, useEffect } from "react";
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

export const useDashboardData = () => {
  const [data, setData] = useState({
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [
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
        setData({
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
        });
      } catch (err) {
        const handledError = handleFirebaseError(err);
        logError(handledError, { context: "useDashboardData - fetchAllData" });
        setError(handledError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { ...data, setData, loading, error };
};
