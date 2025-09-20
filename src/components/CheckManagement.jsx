import React, { useState, useMemo } from "react";
import { addCheck, updateCheck, deleteCheck } from "../firebase/firestore";
import ResponsiveTable, { createMobileCard } from "./ResponsiveTable";
import AddCheckModal from "./AddCheckModal";
import EditCheckModal from "./EditCheckModal";
import RoleGuard from "./RoleGuard";
import { format } from "date-fns";
import { formatCurrency, formatCurrencyForTable } from "../utils/currency";

const CheckManagement = ({
  checks,
  setChecks,
  banks,
  setBanks,
  currencies,
  setCurrencies,
  userRole = "admin",
}) => {
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleAddCheck = async (check) => {
    // Check if user has permission to add checks
    if (userRole !== "admin") {
      setError("You don't have permission to add checks.");
      return;
    }
    
    try {
      const newCheck = await addCheck(check);
      setChecks([...checks, newCheck]);
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditCheck = (check) => {
    // Check if user has permission to edit checks
    if (userRole !== "admin") {
      setError("You don't have permission to edit checks.");
      return;
    }
    
    setEditingCheck(check);
    setIsEditModalOpen(true);
  };

  const handleUpdateCheck = async (id, check) => {
    try {
      await updateCheck(id, check);
      setChecks(checks.map((c) => (c.id === id ? { id, ...check } : c)));
      setIsEditModalOpen(false);
      setEditingCheck(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteCheck = async (id) => {
    // Check if user has permission to delete checks
    if (userRole !== "admin") {
      setError("You don't have permission to delete checks.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this check?")) {
      try {
        await deleteCheck(id);
        setChecks(checks.filter((check) => check.id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Filter checks based on date range
  const filteredChecks = useMemo(() => {
    return checks.filter((check) => {
      // Apply date range filter
      if (startDate && endDate) {
        const checkDate = new Date(check.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (checkDate < start || checkDate > end) {
          return false;
        }
      }
      return true;
    });
  }, [checks, startDate, endDate]);

  // Calculate total amounts based on filtered checks
  const totalChecks = filteredChecks.length;
  const totalAmount = filteredChecks.reduce((sum, check) => sum + check.amount, 0);
  
  // Group checks by currency
  const currencyTotals = filteredChecks.reduce((acc, check) => {
    if (!acc[check.currency]) {
      acc[check.currency] = 0;
    }
    acc[check.currency] += check.amount;
    return acc;
  }, {});

  // Create mobile card component for checks
  const CheckMobileCard = createMobileCard(({ item: check }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-white">#{check.checkNumber}</h3>
        <div className="flex space-x-2">
          <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
            <button
              onClick={() => handleEditCheck(check)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteCheck(check.id)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
            >
              Delete
            </button>
          </RoleGuard>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Amount:</span>
          <p className="text-green-400 font-medium">
            {formatCurrency(check.amount, check.currency)}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Date:</span>
          <p className="text-white font-medium">
            {new Date(check.date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Bank:</span>
          <p className="text-white font-medium">{check.bankName}</p>
        </div>
        <div>
          <span className="text-gray-400">Payee:</span>
          <p className="text-white font-medium">{check.payee}</p>
        </div>
      </div>
    </div>
  ));

  // Table columns configuration
  const tableColumns = [
    {
      key: "payee",
      label: "Person",
    },
    {
      key: "amount",
      label: "Amount",
      render: (check) => formatCurrency(check.amount, check.currency),
    },
    {
      key: "date",
      label: "Date",
      render: (check) => new Date(check.date).toLocaleDateString(),
    },
    {
      key: "bankName",
      label: "Bank Name",
    },
    {
      key: "checkNumber",
      label: "Check Number",
    },
    {
      key: "payee",
      label: "Payee",
    },
    {
      key: "currency",
      label: "Currency",
    },
    {
      key: "actions",
      label: "Actions",
      render: (check) => (
        <div className="flex space-x-2">
          <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
            <button
              onClick={() => handleEditCheck(check)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteCheck(check.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Delete
            </button>
          </RoleGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg mt-4 sm:mt-8 max-w-full overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">
        Check Management
      </h2>
      
      {/* Summary Section */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-300">Total Checks</p>
            <p className="text-xl font-bold text-purple-400">{totalChecks}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-300">Total Amount</p>
            <p className="text-xl font-bold text-green-400">₪{totalAmount.toFixed(2)}</p>
          </div>
        </div>
        
        {Object.keys(currencyTotals).length > 0 && (
          <div className="mt-4 bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-300 mb-2">Amounts by Currency</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(currencyTotals).map(([currency, amount]) => (
                <div key={currency} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-white">{currency}</span>
                  <span className="text-green-400 font-medium">₪{amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Date Filter */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <h3 className="text-lg font-semibold text-white mb-2 sm:mb-0">Filter by Date Range</h3>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-500 transition-colors"
          >
            Clear Filter
          </button>
        </div>
        
        {startDate && endDate && (
          <div className="text-sm text-green-400 mb-3">
            Showing from {format(new Date(startDate), "MMM dd, yyyy")} to {format(new Date(endDate), "MMM dd, yyyy")}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />
          </div>
        </div>
      </div>
      <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 w-full sm:w-auto"
        >
          Add Check
        </button>
      </RoleGuard>

      {isAddModalOpen && (
        <AddCheckModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCheck}
          banks={banks}
          setBanks={setBanks}
          currencies={currencies}
          setCurrencies={setCurrencies}
          userRole={userRole}
        />
      )}

      {isEditModalOpen && (
        <EditCheckModal
          isOpen={isEditModalOpen}
          check={editingCheck}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCheck(null);
          }}
          onUpdate={handleUpdateCheck}
          banks={banks}
          setBanks={setBanks}
          currencies={currencies}
          setCurrencies={setCurrencies}
          userRole={userRole}
        />
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ResponsiveTable
        data={filteredChecks}
        columns={tableColumns}
        MobileCard={CheckMobileCard}
        emptyMessage="No checks found. Add your first check to get started!"
      />
    </div>
  );
};

export default CheckManagement;
