import React, { useState } from 'react';
import { addVendor, updateVendor, deleteVendor } from '../firebase/firestore';
import AddVendorModal from './AddVendorModal';
import EditVendorModal from './EditVendorModal';

const VendorManagement = ({ vendors, setVendors }) => {
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const handleAddVendor = async (vendor) => {
    try {
      const newVendor = await addVendor(vendor);
      setVendors([...vendors, newVendor]);
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setIsEditModalOpen(true);
  };

  const handleUpdateVendor = async (id, vendor) => {
    try {
      await updateVendor(id, vendor);
      setVendors(vendors.map(v => v.id === id ? { id, ...vendor } : v));
      setIsEditModalOpen(false);
      setEditingVendor(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteVendor = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await deleteVendor(id);
        setVendors(vendors.filter(vendor => vendor.id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Vendor Management</h2>
      <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
        Add Vendor
      </button>

      {isAddModalOpen && (
        <AddVendorModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddVendor} 
        />
      )}

      {isEditModalOpen && (
        <EditVendorModal
          isOpen={isEditModalOpen}
          vendor={editingVendor}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingVendor(null);
          }}
          onUpdate={handleUpdateVendor}
        />
      )}

      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full bg-gray-800">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Name</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Contact Person</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Email</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Phone</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id}>
              <td className="py-2 px-4 border-b border-gray-700">{vendor.name}</td>
              <td className="py-2 px-4 border-b border-gray-700">{vendor.contactPerson}</td>
              <td className="py-2 px-4 border-b border-gray-700">{vendor.email}</td>
              <td className="py-2 px-4 border-b border-gray-700">{vendor.phone}</td>
              <td className="py-2 px-4 border-b border-gray-700">
                <button onClick={() => handleEditVendor(vendor)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteVendor(vendor.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
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

export default VendorManagement;
