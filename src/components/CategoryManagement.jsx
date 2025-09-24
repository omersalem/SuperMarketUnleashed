import React, { useState } from "react";
import {
  addCategory,
  updateCategory,
  deleteCategory,
} from "../firebase/firestore";
import { LoadingButton } from "./LoadingSpinner";
import ResponsiveTable, { createMobileCard } from "./ResponsiveTable";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import RoleGuard, { RoleMessage } from "./RoleGuard";

const CategoryManagement = ({
  categories,
  setCategories,
  userRole = "admin",
}) => {
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'
  const [loadingStates, setLoadingStates] = useState({
    adding: false,
    editing: false,
    deleting: null,
  });

  const handleAddCategory = async (category) => {
    try {
      setLoadingStates((prev) => ({ ...prev, adding: true }));
      const newCategory = await addCategory(category);
      setCategories([...categories, newCategory]);
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingStates((prev) => ({ ...prev, adding: false }));
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (id, category) => {
    try {
      setLoadingStates((prev) => ({ ...prev, editing: true }));
      await updateCategory(id, category);
      setCategories(
        categories.map((c) => (c.id === id ? { id, ...category } : c))
      );
      setIsEditModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      // If category doesn't exist, just remove it from local state
      if (error.message && error.message.includes("does not exist")) {
        setCategories(categories.filter((c) => c.id !== id));
        setError("This category has already been deleted. Please add the category again.");
        setIsEditModalOpen(false);
        setEditingCategory(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, editing: false }));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        setLoadingStates((prev) => ({ ...prev, deleting: id }));
        await deleteCategory(id);
        setCategories(categories.filter((category) => category.id !== id));
      } catch (error) {
        // If category doesn't exist, just remove it from local state
        if (error.message && error.message.includes("does not exist")) {
          setCategories(categories.filter((category) => category.id !== id));
          setError("This category has already been deleted.");
        } else {
          setError(error.message);
        }
      } finally {
        setLoadingStates((prev) => ({ ...prev, deleting: null }));
      }
    }
  };

  // Glassy Category Card Component
  const CategoryCard = ({ category }) => {
    const isDeleting = loadingStates.deleting === category.id;
    const isEditing =
      loadingStates.editing && editingCategory?.id === category.id;

    return (
      <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 ease-out hover:border-white/30">
        {/* Floating glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-teal-500/0 to-blue-500/0 group-hover:from-green-500/10 group-hover:via-teal-500/10 group-hover:to-blue-500/10 rounded-2xl transition-all duration-500 ease-out"></div>

        {/* Card content */}
        <div className="relative z-10">
          {/* Category Icon */}
          <div className="relative mb-4 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">📚</span>
            </div>
          </div>

          {/* Category Info */}
          <div className="space-y-3 text-center">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-300 transition-colors duration-300">
                {category.name}
              </h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                {category.description || "No description available"}
              </p>
            </div>

            {/* Action Buttons */}
            <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
              <div className="flex space-x-3 pt-4">
                <LoadingButton
                  loading={isEditing}
                  onClick={() => handleEditCategory(category)}
                  className="flex-1 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 hover:from-yellow-400 hover:to-orange-400 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-yellow-500/30"
                  loadingText="Editing..."
                >
                  ✏️ Edit
                </LoadingButton>
                <LoadingButton
                  loading={isDeleting}
                  onClick={() => handleDeleteCategory(category.id)}
                  className="flex-1 bg-gradient-to-r from-red-500/80 to-pink-500/80 hover:from-red-400 hover:to-pink-400 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-red-500/30"
                  loadingText="Deleting..."
                >
                  🗑️ Delete
                </LoadingButton>
              </div>
            </RoleGuard>
          </div>
        </div>

        {/* Loading overlay */}
        {(isDeleting || isEditing) && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    );
  };

  // Mobile card component for categories
  const CategoryMobileCard = createMobileCard(({ item: category }) => {
    const isDeleting = loadingStates.deleting === category.id;
    const isEditing =
      loadingStates.editing && editingCategory?.id === category.id;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">{category.name}</h3>
          <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
            <div className="flex space-x-2">
              <LoadingButton
                loading={isEditing}
                onClick={() => handleEditCategory(category)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
                loadingText="Editing..."
              >
                Edit
              </LoadingButton>
              <LoadingButton
                loading={isDeleting}
                onClick={() => handleDeleteCategory(category.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
                loadingText="Deleting..."
              >
                Delete
              </LoadingButton>
            </div>
          </RoleGuard>
        </div>

        <div>
          <span className="text-gray-400 text-sm">Description:</span>
          <p className="text-white text-sm mt-1">
            {category.description || "No description available"}
          </p>
        </div>
      </div>
    );
  });

  // Table columns configuration
  const columns = [
    {
      header: "Name",
      key: "name",
      cellClassName: "font-medium",
    },
    {
      header: "Description",
      key: "description",
      cellClassName: "max-w-xs truncate",
    },
    {
      header: "Actions",
      key: "actions",
      render: (category) => (
        <RoleGuard
          userRole={userRole}
          allowedRoles={["admin"]}
          fallback={<span className="text-gray-500 text-xs">View Only</span>}
        >
          <div className="flex space-x-2">
            <LoadingButton
              loading={
                loadingStates.editing && editingCategory?.id === category.id
              }
              onClick={() => handleEditCategory(category)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm"
              loadingText="Editing..."
            >
              Edit
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.deleting === category.id}
              onClick={() => handleDeleteCategory(category.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
              loadingText="Deleting..."
            >
              Delete
            </LoadingButton>
          </div>
        </RoleGuard>
      ),
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-6 rounded-2xl shadow-2xl mt-4 sm:mt-8 max-w-full overflow-hidden border border-white/10">
      {/* Role Message */}
      <RoleMessage userRole={userRole} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-4 sm:mb-0">
          📚 Category Management
        </h2>

        {/* View Toggle & Add Button */}
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === "cards"
                  ? "bg-green-500 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              🎴 Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === "table"
                  ? "bg-green-500 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              📊 Table
            </button>
          </div>

          {/* Add Category Button */}
          <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
            <LoadingButton
              loading={loadingStates.adding}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-green-500/30"
              loadingText="Adding..."
            >
              ➕ Add Category
            </LoadingButton>
          </RoleGuard>
        </div>
      </div>

      {/* Modals */}
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {viewMode === "cards" ? (
        /* Cards View */
        <div>
          {categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No categories found
              </h3>
              <p className="text-gray-400 mb-6">
                Add your first category to get started!
              </p>
              <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
                <LoadingButton
                  loading={loadingStates.adding}
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                  loadingText="Adding..."
                >
                  ➕ Add Your First Category
                </LoadingButton>
              </RoleGuard>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <CategoryCard key={`${category.id}-${index}`} category={category} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <ResponsiveTable
          data={categories}
          columns={columns}
          mobileCardComponent={CategoryMobileCard}
          emptyMessage="No categories found. Add your first category to get started!"
          className="mt-4"
        />
      )}
    </div>
  );
};

export default CategoryManagement;
