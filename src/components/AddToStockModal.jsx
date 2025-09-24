import React, { useState, useMemo } from 'react';
import Modal from './Modal';

const AddToStockModal = ({ isOpen, onClose, onAddToStock, products }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Deduplicate products by id to avoid duplicate React keys in the select
  const uniqueProducts = useMemo(() => {
    const seen = new Set();
    return (products || []).filter((p) => {
      if (!p || !p.id) return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddToStock(selectedProductId, quantity);
      onClose();
    } catch (error) {
      console.error("Error adding to stock:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">Add to Stock</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="product" className="block mb-2 text-sm font-medium">Select Product</label>
          <select id="product" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required>
            <option value="">-- Select Product --</option>
            {uniqueProducts.map((product, idx) => (
              <option key={`${product.id}-${idx}`} value={product.id}>
                {product.name} (Current Stock: {product.stock})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="quantity" className="block mb-2 text-sm font-medium">Quantity to Add</label>
          <input type="number" name="quantity" id="quantity" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} min="1" required />
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
            Cancel
          </button>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add to Stock
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddToStockModal;
