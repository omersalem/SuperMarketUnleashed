import React, { useState } from 'react';
import { addCategory, updateCategory, deleteCategory } from '../firebase/firestore';
import AddCategoryModal from './AddCategoryModal';
import EditCategoryModal from './EditCategoryModal';

const CategoryManagement = ({ categories, setCategories }) => {
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = async (category) => {
    try {
      const newCategory = await addCategory(category);
      setCategories([...categories, newCategory]);
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (id, category) => {
    try {
      await updateCategory(id, category);
      setCategories(categories.map(c => c.id === id ? { id, ...category } : c));
      setIsEditModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(category => category.id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Category Management</h2>
      <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
        Add Category
      </button>

      {isAddModalOpen && (
        <AddCategoryModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCategory} 
        />
      )}

      {isEditModalOpen && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          category={editingCategory}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCategory(null);
          }}
          onUpdate={handleUpdateCategory}
        />
      )}

      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full bg-gray-800">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Name</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Description</th>
            <th className="py-2 px-4 border-b border-gray-700 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="py-2 px-4 border-b border-gray-700">{category.name}</td>
              <td className="py-2 px-4 border-b border-gray-700">{category.description}</td>
              <td className="py-2 px-4 border-b border-gray-700">
                <button onClick={() => handleEditCategory(category)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteCategory(category.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
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

export default CategoryManagement;
