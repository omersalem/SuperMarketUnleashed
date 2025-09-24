import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import app from "./config";

const db = getFirestore(app);

// Customers
const customersCollection = collection(db, "customers");

export const getCustomers = async () => {
  const snapshot = await getDocs(customersCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addCustomer = async (customer) => {
  const docRef = await addDoc(customersCollection, customer);
  return { id: docRef.id, ...customer };
};

export const updateCustomer = async (id, customer) => {
  const customerDoc = doc(db, "customers", id);
  try {
    await setDoc(customerDoc, customer, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  const customerDoc = doc(db, "customers", id);
  
  try {
    await deleteDoc(customerDoc);
  } catch (error) {
    console.error("Error deleting customer:", error);
    // If the document doesn't exist, throw a more specific error
    if (error.message && error.message.includes("does not exist")) {
      throw new Error(`No customer found with ID: ${id}`);
    }
    throw error;
  }
};

// Vendors
const vendorsCollection = collection(db, "vendors");

export const getVendors = async () => {
  const snapshot = await getDocs(vendorsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addVendor = async (vendor) => {
  const docRef = await addDoc(vendorsCollection, vendor);
  return { id: docRef.id, ...vendor };
};

export const updateVendor = async (id, vendor) => {
  const vendorDoc = doc(db, "vendors", id);
  try {
    await setDoc(vendorDoc, vendor, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteVendor = async (id) => {
  const vendorDoc = doc(db, "vendors", id);
  try {
    await deleteDoc(vendorDoc);
  } catch (error) {
    console.error("Error deleting vendor:", error);
    if (error.message && error.message.includes("does not exist")) {
      throw new Error(`No vendor found with ID: ${id}`);
    }
    throw error;
  }
};

// Categories
const categoriesCollection = collection(db, "categories");

export const getCategories = async () => {
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addCategory = async (category) => {
  const docRef = await addDoc(categoriesCollection, category);
  return { id: docRef.id, ...category };
};

export const updateCategory = async (id, category) => {
  const categoryDoc = doc(db, "categories", id);
  try {
    await setDoc(categoryDoc, category, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  const categoryDoc = doc(db, "categories", id);
  try {
    await deleteDoc(categoryDoc);
  } catch (error) {
    console.error("Error deleting category:", error);
    if (error.message && error.message.includes("does not exist")) {
      throw new Error(`No category found with ID: ${id}`);
    }
    throw error;
  }
};

// Sales
const salesCollection = collection(db, "sales");

export const getSales = async () => {
  const snapshot = await getDocs(salesCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addSale = async (sale) => {
  const docRef = await addDoc(salesCollection, sale);
  return { id: docRef.id, ...sale };
};

export const updateSale = async (id, sale) => {
  const saleDoc = doc(db, "sales", id);
  try {
    await setDoc(saleDoc, sale, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteSale = async (id) => {
  const saleDoc = doc(db, "sales", id);
  try {
    await deleteDoc(saleDoc);
  } catch (error) {
    console.error("Error deleting sale:", error);
    if (error.message && error.message.includes("does not exist")) {
      throw new Error(`No sale found with ID: ${id}`);
    }
    throw error;
  }
};

// Products
const productsCollection = collection(db, "products");

export const getProducts = async () => {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addProduct = async (product) => {
  const docRef = await addDoc(productsCollection, product);
  return { id: docRef.id, ...product };
};

export const updateProduct = async (id, product) => {
  const productDoc = doc(db, "products", id);
  try {
    await setDoc(productDoc, product, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  const productDoc = doc(db, "products", id);
  try {
    await deleteDoc(productDoc);
  } catch (error) {
    console.error("Error deleting product:", error);
    if (error.message && error.message.includes("does not exist")) {
      throw new Error(`No product found with ID: ${id}`);
    }
    throw error;
  }
};

// Purchases
const purchasesCollection = collection(db, "purchases");

export const getPurchases = async () => {
  const snapshot = await getDocs(purchasesCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addPurchase = async (purchase) => {
  const docRef = await addDoc(purchasesCollection, purchase);
  return { id: docRef.id, ...purchase };
};

export const updatePurchase = async (id, purchase) => {
  const purchaseDoc = doc(db, "purchases", id);
  try {
    await setDoc(purchaseDoc, purchase, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deletePurchase = async (id) => {
  const purchaseDoc = doc(db, "purchases", id);
  try {
    await deleteDoc(purchaseDoc);
  } catch (error) {
    console.error("Error deleting purchase:", error);
    if (error.message && error.message.includes("does not exist")) {
      throw new Error(`No purchase found with ID: ${id}`);
    }
    throw error;
  }
};

// Checks
const checksCollection = collection(db, "checks");

export const getChecks = async () => {
  const snapshot = await getDocs(checksCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addCheck = async (check) => {
  const docRef = await addDoc(checksCollection, check);
  return { id: docRef.id, ...check };
};

export const updateCheck = async (id, check) => {
  const checkDoc = doc(db, "checks", id);
  await setDoc(checkDoc, check, { merge: true });
};

export const deleteCheck = async (id) => {
  const checkDoc = doc(db, "checks", id);
  await deleteDoc(checkDoc);
};

// Banks
const banksCollection = collection(db, "banks");

export const getBanks = async () => {
  const snapshot = await getDocs(banksCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addBank = async (bank) => {
  const docRef = await addDoc(banksCollection, bank);
  return { id: docRef.id, ...bank };
};

export const deleteBank = async (id) => {
  const bankDoc = doc(db, "banks", id);
  await deleteDoc(bankDoc);
};

// Currencies
const currenciesCollection = collection(db, "currencies");

export const getCurrencies = async () => {
  const snapshot = await getDocs(currenciesCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addCurrency = async (currency) => {
  const docRef = await addDoc(currenciesCollection, currency);
  return { id: docRef.id, ...currency };
};

export const deleteCurrency = async (id) => {
  const currencyDoc = doc(db, "currencies", id);
  await deleteDoc(currencyDoc);
};

// Workers
const workersCollection = collection(db, "workers");

export const getWorkers = async () => {
  const snapshot = await getDocs(workersCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addWorker = async (worker) => {
  const docRef = await addDoc(workersCollection, worker);
  return { id: docRef.id, ...worker };
};

export const updateWorker = async (id, worker) => {
  const workerDoc = doc(db, "workers", id);
  await setDoc(workerDoc, worker, { merge: true });
};

export const deleteWorker = async (id) => {
  const workerDoc = doc(db, "workers", id);
  await deleteDoc(workerDoc);
};

// Salary Payments
const salaryPaymentsCollection = collection(db, "salaryPayments");

export const getSalaryPayments = async (workerId = null) => {
  if (workerId) {
    const q = query(salaryPaymentsCollection, where("workerId", "==", workerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  const snapshot = await getDocs(salaryPaymentsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addSalaryPayment = async (payment) => {
  const docRef = await addDoc(salaryPaymentsCollection, payment);
  return { id: docRef.id, ...payment };
};

export const deleteSalaryPayment = async (id) => {
  const paymentDoc = doc(db, "salaryPayments", id);
  await deleteDoc(paymentDoc);
};

// Worker Expenses
const workerExpensesCollection = collection(db, "workerExpenses");

export const getWorkerExpenses = async (workerId = null) => {
  if (workerId) {
    const q = query(workerExpensesCollection, where("workerId", "==", workerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  const snapshot = await getDocs(workerExpensesCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addWorkerExpense = async (expense) => {
  const docRef = await addDoc(workerExpensesCollection, expense);
  return { id: docRef.id, ...expense };
};

export const updateWorkerExpense = async (id, expense) => {
  const expenseDoc = doc(db, "workerExpenses", id);
  await setDoc(expenseDoc, expense, { merge: true });
};

export const deleteWorkerExpense = async (id) => {
  const expenseDoc = doc(db, "workerExpenses", id);
  await deleteDoc(expenseDoc);
};

// Worker Attendance
const workerAttendanceCollection = collection(db, "workerAttendance");

export const getWorkerAttendance = async (workerId = null) => {
  if (workerId) {
    const q = query(workerAttendanceCollection, where("workerId", "==", workerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  const snapshot = await getDocs(workerAttendanceCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addWorkerAttendance = async (attendance) => {
  const docRef = await addDoc(workerAttendanceCollection, attendance);
  return { id: docRef.id, ...attendance };
};

export const updateWorkerAttendance = async (id, attendance) => {
  const attendanceDoc = doc(db, "workerAttendance", id);
  await setDoc(attendanceDoc, attendance, { merge: true });
};

export const deleteWorkerAttendance = async (id) => {
  const attendanceDoc = doc(db, "workerAttendance", id);
  await deleteDoc(attendanceDoc);
};

// Incomes
const incomesCollection = collection(db, "incomes");

export const getIncomes = async () => {
  const snapshot = await getDocs(incomesCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addIncome = async (income) => {
  const docRef = await addDoc(incomesCollection, income);
  return { id: docRef.id, ...income };
};

export const deleteIncome = async (id) => {
  const incomeDoc = doc(db, "incomes", id);
  await deleteDoc(incomeDoc);
};

// Expenses
const expensesCollection = collection(db, "expenses");

export const getExpenses = async () => {
  const snapshot = await getDocs(expensesCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addExpense = async (expense) => {
  const docRef = await addDoc(expensesCollection, expense);
  return { id: docRef.id, ...expense };
};

export const deleteExpense = async (id) => {
  const expenseDoc = doc(db, "expenses", id);
  await deleteDoc(expenseDoc);
};

export default db;
