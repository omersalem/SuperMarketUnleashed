import { useState, useEffect, useContext } from "react";
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
import { AuthContext } from "../context/AuthContext";

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
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
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
  }, [currentUser]);

  return { data, setData, loading, error };
};
