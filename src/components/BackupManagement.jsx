import React, { useState } from "react";
import { handleFirebaseError, logError } from "../utils/errorHandling";
import {
  restoreCustomers,
  restoreVendors,
  restoreCategories,
  restoreProducts,
  restoreSales,
  restorePurchases,
  restoreChecks,
  restoreWorkers,
  restoreBanks,
  restoreCurrencies,
  restoreSalaryPayments,
  restoreWorkerExpenses,
  restoreWorkerAttendance,
} from "../firebase/restoreFunctions";

const BackupManagement = ({ 
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
  setCustomers,
  setVendors,
  setCategories,
  setProducts,
  setSales,
  setPurchases,
  setChecks,
  setWorkers,
  setBanks,
  setCurrencies,
  setSalaryPayments,
  setWorkerExpenses,
  setWorkerAttendance,
  setRestoreTimestamp
}) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [backupStatus, setBackupStatus] = useState(null);

  // Function to backup data to file
  const backupDataToFile = () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
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
        workerAttendance
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataUri = "data:application/json;charset=utf-8,"+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `supermarket-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      setBackupStatus({ success: true, message: "Data backed up successfully!" });
    } catch (error) {
      const handledError = handleFirebaseError(error);
      logError(handledError, { context: "BackupManagement - backupDataToFile" });
      setBackupStatus({ success: false, message: `Backup failed: ${handledError.message}` });
    }
  };

  // Function to handle file selection for restore
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRestoreFile(file);
    }
  };

  // Function to restore data from file
  const restoreDataFromFile = async () => {
    if (!restoreFile) {
      setBackupStatus({ success: false, message: "Please select a backup file to restore." });
      return;
    }

    setIsRestoring(true);
    setBackupStatus(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const backupData = JSON.parse(event.target.result);

          // Create confirmation dialog
          const confirmRestore = window.confirm(
            `Are you sure you want to restore data from ${restoreFile.name}? This will replace all existing data.`
          );

          if (confirmRestore) {
            try {
              // Restore the data to Firebase
              if (backupData.customers) await restoreCustomers(backupData.customers);
              if (backupData.vendors) await restoreVendors(backupData.vendors);
              if (backupData.categories) await restoreCategories(backupData.categories);
              if (backupData.products) await restoreProducts(backupData.products);
              if (backupData.sales) await restoreSales(backupData.sales);
              if (backupData.purchases) await restorePurchases(backupData.purchases);
              if (backupData.checks) await restoreChecks(backupData.checks);
              if (backupData.workers) await restoreWorkers(backupData.workers);
              if (backupData.banks) await restoreBanks(backupData.banks);
              if (backupData.currencies) await restoreCurrencies(backupData.currencies);
              if (backupData.salaryPayments) await restoreSalaryPayments(backupData.salaryPayments);
              if (backupData.workerExpenses) await restoreWorkerExpenses(backupData.workerExpenses);
              if (backupData.workerAttendance) await restoreWorkerAttendance(backupData.workerAttendance);

              // Restore the data to the component state
              if (backupData.customers) setCustomers(backupData.customers);
              if (backupData.vendors) setVendors(backupData.vendors);
              if (backupData.categories) setCategories(backupData.categories);
              if (backupData.products) setProducts(backupData.products);
              if (backupData.sales) setSales(backupData.sales);
              if (backupData.purchases) setPurchases(backupData.purchases);
              if (backupData.checks) setChecks(backupData.checks);
              if (backupData.workers) setWorkers(backupData.workers);
              if (backupData.banks) setBanks(backupData.banks);
              if (backupData.currencies) setCurrencies(backupData.currencies);
              if (backupData.salaryPayments) setSalaryPayments(backupData.salaryPayments);
              if (backupData.workerExpenses) setWorkerExpenses(backupData.workerExpenses);
              if (backupData.workerAttendance) setWorkerAttendance(backupData.workerAttendance);

              // Force a re-render by adding a timestamp to the state
              setRestoreTimestamp(Date.now());

              // Show success message with the data count
              const dataCount = {
                customers: backupData.customers?.length || 0,
                vendors: backupData.vendors?.length || 0,
                categories: backupData.categories?.length || 0,
                products: backupData.products?.length || 0,
                sales: backupData.sales?.length || 0,
                purchases: backupData.purchases?.length || 0,
                checks: backupData.checks?.length || 0,
                workers: backupData.workers?.length || 0,
              };

              setBackupStatus({
                success: true,
                message: `Data from ${
                  restoreFile.name
                } has been restored successfully!\n\nData summary:\n${Object.entries(
                  dataCount
                )
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("\n")}`,
              });

              // Log the restored data to console
              console.log("Data restored:", backupData);
            } catch (error) {
              const handledError = handleFirebaseError(error);
              logError(handledError, {
                context: "BackupManagement - restoreDataFromFile",
              });
              setBackupStatus({
                success: false,
                message: `Restore failed: ${handledError.message}`,
              });
            }
          } else {
            setBackupStatus({
              success: false,
              message: "Restore operation cancelled by user.",
            });
          }

          // Reset file selection
          setRestoreFile(null);
          document.getElementById("restoreFileInput").value = "";
        } catch (error) {
          const handledError = handleFirebaseError(error);
          logError(handledError, {
            context: "BackupManagement - restoreDataFromFile - parse",
          });
          setBackupStatus({
            success: false,
            message: `Invalid backup file format: ${handledError.message}`,
          });
        } finally {
          setIsRestoring(false);
        }
      };

      reader.readAsText(restoreFile);
    } catch (error) {
      const handledError = handleFirebaseError(error);
      logError(handledError, { context: "BackupManagement - restoreDataFromFile" });
      setBackupStatus({ success: false, message: `Restore failed: ${handledError.message}` });
      setIsRestoring(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="mr-2">💾</span> Backup & Restore Management
      </h2>

      {backupStatus && (
        <div className={`mb-4 p-4 rounded-lg ${backupStatus.success ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
          {backupStatus.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Section */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Backup Data</h3>
          <p className="text-gray-300 mb-4">
            Create a backup of all your data to a file. You can use this file to restore your data later.
          </p>
          <button
            onClick={backupDataToFile}
            disabled={isBackingUp}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-300"
          >
            {isBackingUp ? "Backing up..." : "Backup to File"}
          </button>
        </div>

        {/* Restore Section */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Restore Data</h3>
          <p className="text-gray-300 mb-4">
            Restore data from a previously created backup file. This will replace all existing data.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select backup file:
            </label>
            <input
              type="file"
              id="restoreFileInput"
              accept=".json"
              onChange={handleFileChange}
              className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white"
            />
          </div>

          <button
            onClick={restoreDataFromFile}
            disabled={!restoreFile || isRestoring}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-300"
          >
            {isRestoring ? "Restoring..." : "Restore from File"}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Important Notes</h3>
        <ul className="text-gray-300 list-disc pl-5 space-y-1">
          <li>Always create a backup before making significant changes to your data</li>
          <li>Store backup files in a secure location, preferably off-site</li>
          <li>Regularly test your backup files to ensure they can be restored</li>
          <li>Restoring from a backup will replace all existing data</li>
        </ul>
      </div>
    </div>
  );
};

export default BackupManagement;