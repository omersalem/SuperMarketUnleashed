import React, { useState } from "react";
import { addCheck, updateCheck, deleteCheck } from "../firebase/firestore";
import ResponsiveTable, { createMobileCard } from "./ResponsiveTable";
import AddCheckModal from "./AddCheckModal";
import EditCheckModal from "./EditCheckModal";

const CheckManagement = ({
  checks,
  setChecks,
  banks,
  setBanks,
  currencies,
  setCurrencies,
}) => {
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState(null);

  const handleAddCheck = async (check) => {
    try {
      const newCheck = await addCheck(check);
      setChecks([...checks, newCheck]);
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditCheck = (check) => {
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
    if (window.confirm("Are you sure you want to delete this check?")) {
      try {
        await deleteCheck(id);
        setChecks(checks.filter((check) => check.id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Create mobile card component for checks
  const CheckMobileCard = createMobileCard(({ item: check }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-white">#{check.checkNumber}</h3>
        <div className="flex space-x-2">
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
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Amount:</span>
          <p className="text-green-400 font-medium">
            {check.amount} {check.currency}
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
      key: "id",
      label: "ID",
    },
    {
      key: "amount",
      label: "Amount",
      render: (check) => `₪${check.amount} ${check.currency}`,
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
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg mt-4 sm:mt-8 max-w-full overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">
        Check Management
      </h2>
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 w-full sm:w-auto"
      >
        Add Check
      </button>

      {isAddModalOpen && (
        <AddCheckModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCheck}
          banks={banks}
          setBanks={setBanks}
          currencies={currencies}
          setCurrencies={setCurrencies}
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
        />
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ResponsiveTable
        data={checks}
        columns={tableColumns}
        MobileCard={CheckMobileCard}
        emptyMessage="No checks found. Add your first check to get started!"
      />
    </div>
  );
};

export default CheckManagement;
