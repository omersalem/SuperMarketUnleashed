import React, { useState } from 'react';
import { addCustomer, updateCustomer, deleteCustomer } from '../firebase/firestore';
import AddCustomerModal from './AddCustomerModal';
import EditCustomerModal from './EditCustomerModal';

const CustomerManagement = ({ customers, setCustomers }) => {
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const handleAddCustomer = async (customer) => {
    try {
      const newCustomer = await addCustomer(customer);
      setCustomers([...customers, newCustomer]);
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async (id, customer) => {
    try {
      await updateCustomer(id, customer);
      setCustomers(customers.map(c => c.id === id ? { id, ...customer } : c));
      setIsEditModalOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        setCustomers(customers.filter(customer => customer.id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Customer Management</h2>
      <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
        Add Customer
      </button>
      
      {isAddModalOpen && (
        <AddCustomerModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCustomer} 
        />
      )}

      {isEditModalOpen && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          customer={editingCustomer}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCustomer(null);
          }}
          onUpdate={handleUpdateCustomer}
        />
      )}

      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full bg-gray-800">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Name</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Email</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Phone</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="py-2 px-4 border-b border-gray-700">{customer.name}</td>
              <td className="py-2 px-4 border-b border-gray-700">{customer.email}</td>
              <td className="py-2 px-4 border-b border-gray-700">{customer.phone}</td>
              <td className="py-2 px-4 border-b border-gray-700">
                <button onClick={() => handleEditCustomer(customer)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteCustomer(customer.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
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

export default CustomerManagement;
