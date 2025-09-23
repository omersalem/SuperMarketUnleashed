import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import app from "./config";

const db = getFirestore(app);

// Function to restore customers to Firebase
export const restoreCustomers = async (customers) => {
  const batch = writeBatch(db);
  const customersCollection = collection(db, "customers");

  // Clear existing customers
  const existingCustomers = await getDocs(customersCollection);
  existingCustomers.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new customers
  customers.forEach((customer) => {
    const customerDoc = doc(customersCollection);
    batch.set(customerDoc, customer);
  });

  await batch.commit();
};

// Function to restore vendors to Firebase
export const restoreVendors = async (vendors) => {
  const batch = writeBatch(db);
  const vendorsCollection = collection(db, "vendors");

  // Clear existing vendors
  const existingVendors = await getDocs(vendorsCollection);
  existingVendors.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new vendors
  vendors.forEach((vendor) => {
    const vendorDoc = doc(vendorsCollection);
    batch.set(vendorDoc, vendor);
  });

  await batch.commit();
};

// Function to restore categories to Firebase
export const restoreCategories = async (categories) => {
  const batch = writeBatch(db);
  const categoriesCollection = collection(db, "categories");

  // Clear existing categories
  const existingCategories = await getDocs(categoriesCollection);
  existingCategories.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new categories
  categories.forEach((category) => {
    const categoryDoc = doc(categoriesCollection);
    batch.set(categoryDoc, category);
  });

  await batch.commit();
};

// Function to restore products to Firebase
export const restoreProducts = async (products) => {
  const batch = writeBatch(db);
  const productsCollection = collection(db, "products");

  // Clear existing products
  const existingProducts = await getDocs(productsCollection);
  existingProducts.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new products
  products.forEach((product) => {
    const productDoc = doc(productsCollection);
    batch.set(productDoc, product);
  });

  await batch.commit();
};

// Function to restore sales to Firebase
export const restoreSales = async (sales) => {
  const batch = writeBatch(db);
  const salesCollection = collection(db, "sales");

  // Clear existing sales
  const existingSales = await getDocs(salesCollection);
  existingSales.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new sales
  sales.forEach((sale) => {
    const saleDoc = doc(salesCollection);
    batch.set(saleDoc, sale);
  });

  await batch.commit();
};

// Function to restore purchases to Firebase
export const restorePurchases = async (purchases) => {
  const batch = writeBatch(db);
  const purchasesCollection = collection(db, "purchases");

  // Clear existing purchases
  const existingPurchases = await getDocs(purchasesCollection);
  existingPurchases.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new purchases
  purchases.forEach((purchase) => {
    const purchaseDoc = doc(purchasesCollection);
    batch.set(purchaseDoc, purchase);
  });

  await batch.commit();
};

// Function to restore checks to Firebase
export const restoreChecks = async (checks) => {
  const batch = writeBatch(db);
  const checksCollection = collection(db, "checks");

  // Clear existing checks
  const existingChecks = await getDocs(checksCollection);
  existingChecks.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new checks
  checks.forEach((check) => {
    const checkDoc = doc(checksCollection);
    batch.set(checkDoc, check);
  });

  await batch.commit();
};

// Function to restore workers to Firebase
export const restoreWorkers = async (workers) => {
  const batch = writeBatch(db);
  const workersCollection = collection(db, "workers");

  // Clear existing workers
  const existingWorkers = await getDocs(workersCollection);
  existingWorkers.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new workers
  workers.forEach((worker) => {
    const workerDoc = doc(workersCollection);
    batch.set(workerDoc, worker);
  });

  await batch.commit();
};

// Function to restore banks to Firebase
export const restoreBanks = async (banks) => {
  const batch = writeBatch(db);
  const banksCollection = collection(db, "banks");

  // Clear existing banks
  const existingBanks = await getDocs(banksCollection);
  existingBanks.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new banks
  banks.forEach((bank) => {
    const bankDoc = doc(banksCollection);
    batch.set(bankDoc, bank);
  });

  await batch.commit();
};

// Function to restore currencies to Firebase
export const restoreCurrencies = async (currencies) => {
  const batch = writeBatch(db);
  const currenciesCollection = collection(db, "currencies");

  // Clear existing currencies
  const existingCurrencies = await getDocs(currenciesCollection);
  existingCurrencies.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new currencies
  currencies.forEach((currency) => {
    const currencyDoc = doc(currenciesCollection);
    batch.set(currencyDoc, currency);
  });

  await batch.commit();
};

// Function to restore salary payments to Firebase
export const restoreSalaryPayments = async (salaryPayments) => {
  const batch = writeBatch(db);
  const salaryPaymentsCollection = collection(db, "salaryPayments");

  // Clear existing salary payments
  const existingSalaryPayments = await getDocs(salaryPaymentsCollection);
  existingSalaryPayments.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new salary payments
  salaryPayments.forEach((salaryPayment) => {
    const salaryPaymentDoc = doc(salaryPaymentsCollection);
    batch.set(salaryPaymentDoc, salaryPayment);
  });

  await batch.commit();
};

// Function to restore worker expenses to Firebase
export const restoreWorkerExpenses = async (workerExpenses) => {
  const batch = writeBatch(db);
  const workerExpensesCollection = collection(db, "workerExpenses");

  // Clear existing worker expenses
  const existingWorkerExpenses = await getDocs(workerExpensesCollection);
  existingWorkerExpenses.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new worker expenses
  workerExpenses.forEach((workerExpense) => {
    const workerExpenseDoc = doc(workerExpensesCollection);
    batch.set(workerExpenseDoc, workerExpense);
  });

  await batch.commit();
};

// Function to restore worker attendance to Firebase
export const restoreWorkerAttendance = async (workerAttendance) => {
  const batch = writeBatch(db);
  const workerAttendanceCollection = collection(db, "workerAttendance");

  // Clear existing worker attendance
  const existingWorkerAttendance = await getDocs(workerAttendanceCollection);
  existingWorkerAttendance.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new worker attendance
  workerAttendance.forEach((attendance) => {
    const attendanceDoc = doc(workerAttendanceCollection);
    batch.set(attendanceDoc, attendance);
  });

  await batch.commit();
};
