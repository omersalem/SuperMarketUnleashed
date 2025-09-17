import React, { useState } from 'react';
import { addProduct, updateProduct, deleteProduct } from '../firebase/firestore';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';

const ProductManagement = ({ products, setProducts, categories }) => {
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAddProduct = async (product) => {
    try {
      const newProduct = await addProduct(product);
      setProducts([...products, newProduct]);
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (id, product) => {
    try {
      await updateProduct(id, product);
      setProducts(products.map(p => p.id === id ? { id, ...product } : p));
      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(product => product.id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Product Management</h2>
      <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
        Add Product
      </button>

      {isAddModalOpen && (
        <AddProductModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddProduct} 
          categories={categories}
        />
      )}

      {isEditModalOpen && (
        <EditProductModal
          isOpen={isEditModalOpen}
          product={editingProduct}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          onUpdate={handleUpdateProduct}
          categories={categories}
        />
      )}

      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full bg-gray-800">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Image</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Name</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Description</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Price</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Stock</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Category</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="py-2 px-4 border-b border-gray-700">
                <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-contain rounded-md border-2 border-gray-700 shadow-lg" />
              </td>
              <td className="py-2 px-4 border-b border-gray-700">{product.name}</td>
              <td className="py-2 px-4 border-b border-gray-700">{product.description}</td>
              <td className="py-2 px-4 border-b border-gray-700">{product.price}</td>
              <td className="py-2 px-4 border-b border-gray-700">{product.stock}</td>
              <td className="py-2 px-4 border-b border-gray-700">{getCategoryName(product.categoryId)}</td>
              <td className="py-2 px-4 border-b border-gray-700">
                <button onClick={() => handleEditProduct(product)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
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

export default ProductManagement;