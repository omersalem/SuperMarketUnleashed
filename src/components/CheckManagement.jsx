import React, { useState } from 'react';
import { addCheck, updateCheck, deleteCheck } from '../firebase/firestore';
import AddCheckModal from './AddCheckModal';
import EditCheckModal from './EditCheckModal';

const CheckManagement = ({ checks, setChecks, banks, setBanks, currencies, setCurrencies }) => {
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
      setChecks(checks.map(c => c.id === id ? { id, ...check } : c));
      setIsEditModalOpen(false);
      setEditingCheck(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteCheck = async (id) => {
    if (window.confirm('Are you sure you want to delete this check?')) {
      try {
        await deleteCheck(id);
        setChecks(checks.filter(check => check.id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Check Management</h2>
      <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
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

      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full bg-gray-800">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700 text-left">ID</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Amount</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Date</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Bank Name</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Check Number</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Payee</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Currency</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.id}>
              <td className="py-2 px-4 border-b border-gray-700">{check.id}</td>
              <td className="py-2 px-4 border-b border-gray-700">{check.amount}</td>
              <td className="py-2 px-4 border-b border-gray-700">{new Date(check.date).toLocaleDateString()}</td>
              <td className="py-2 px-4 border-b border-gray-700">{check.bankName}</td>
              <td className="py-2 px-4 border-b border-gray-700">{check.checkNumber}</td>
              <td className="py-2 px-4 border-b border-gray-700">{check.payee}</td>
              <td className="py-2 px-4 border-b border-gray-700">{check.currency}</td>
              <td className="py-2 px-4 border-b border-gray-700">
                <button onClick={() => handleEditCheck(check)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteCheck(check.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CheckManagement;
