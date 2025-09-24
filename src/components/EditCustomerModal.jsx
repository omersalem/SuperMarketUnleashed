import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const EditCustomerModal = ({ isOpen, customer, onClose, onUpdate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone);
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(customer.id, { name, email, phone });
      onClose();
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error.message && error.message.includes("No customer found with ID")) {
        alert("This customer has been deleted and cannot be updated. Please add the customer again.");
        onClose();
      } else {
        alert("Error updating customer: " + error.message);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">Edit Customer</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2 text-sm font-medium">Name</label>
          <input type="text" name="name" id="name" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-sm font-medium">Email</label>
          <input type="email" name="email" id="email" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mb-4">
          <label htmlFor="phone" className="block mb-2 text-sm font-medium">Phone</label>
          <input type="tel" name="phone" id="phone" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
            Cancel
          </button>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Update
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCustomerModal;
