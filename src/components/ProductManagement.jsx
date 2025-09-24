import React, { useState } from "react";
import {
  addProduct,
  updateProduct,
  deleteProduct,
} from "../firebase/firestore";
import { LoadingButton, SectionLoadingSpinner } from "./LoadingSpinner";
import { TableSkeleton } from "./SkeletonLoader";
import ResponsiveTable, { createMobileCard } from "./ResponsiveTable";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import RoleGuard, { ReadOnlyWrapper, RoleMessage } from "./RoleGuard";

const ProductManagement = ({
  products,
  setProducts,
  categories,
  onLoadingChange,
  userRole = "admin",
}) => {
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'
  const [loadingStates, setLoadingStates] = useState({
    adding: false,
    editing: false,
    deleting: null, // Store the ID of the product being deleted
    table: false,
  });

  const handleAddProduct = async (product) => {
    try {
      setLoadingStates((prev) => ({ ...prev, adding: true }));
      onLoadingChange?.(true);
      const newProduct = await addProduct(product);
      setProducts([...products, newProduct]);
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingStates((prev) => ({ ...prev, adding: false }));
      onLoadingChange?.(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (id, product) => {
    try {
      setLoadingStates((prev) => ({ ...prev, editing: true }));
      await updateProduct(id, product);
      setProducts(products.map((p) => (p.id === id ? { id, ...product } : p)));
      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      // If product doesn't exist, just remove it from local state
      if (error.message && error.message.includes("does not exist")) {
        setProducts(products.filter((p) => p.id !== id));
        setError("This product has already been deleted. Please add the product again.");
        setIsEditModalOpen(false);
        setEditingProduct(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, editing: false }));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setLoadingStates((prev) => ({ ...prev, deleting: id }));
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
        // If product doesn't exist, just remove it from local state
        if (error.message && error.message.includes("does not exist")) {
          setProducts(products.filter((product) => product.id !== id));
          setError("This product has already been deleted.");
        } else {
          setError(error.message);
        }
      } finally {
        setLoadingStates((prev) => ({ ...prev, deleting: null }));
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Glassy Product Card Component
  const ProductCard = ({ product }) => {
    const isDeleting = loadingStates.deleting === product.id;
    const isEditing =
      loadingStates.editing && editingProduct?.id === product.id;

    return (
      <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 ease-out hover:border-white/30">
        {/* Floating glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 rounded-2xl transition-all duration-500 ease-out"></div>

        {/* Card content */}
        <div className="relative z-10">
          {/* Product Image */}
          <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-2">
            <div className="w-full h-48 flex items-center justify-center bg-white/5 rounded-lg overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                style={{
                  objectPosition: "center",
                }}
              />
            </div>

            {/* Stock badge */}
            <div
              className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                product.stock > 50
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : product.stock > 10
                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}
            >
              {product.stock} in stock
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">
                {product.name}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                {product.description || "No description available"}
              </p>
            </div>

            {/* Price and Category */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-400">
                  ₪{product.price}
                </div>
                <div className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">
                  {getCategoryName(product.categoryId)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
              <div className="flex space-x-3 pt-4">
                <LoadingButton
                  loading={isEditing}
                  onClick={() => handleEditProduct(product)}
                  className="flex-1 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 hover:from-yellow-400 hover:to-orange-400 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-yellow-500/30"
                  loadingText="Editing..."
                >
                  ✏️ Edit
                </LoadingButton>
                <LoadingButton
                  loading={isDeleting}
                  onClick={() => handleDeleteProduct(product.id)}
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

  // Mobile card component for products
  const ProductMobileCard = createMobileCard(({ item: product }) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-16 h-16 object-contain rounded-md border border-gray-600"
        />
        <div className="flex-1">
          <h3 className="font-medium text-white">{product.name}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Price:</span>
          <span className="text-white ml-2">₪{product.price}</span>
        </div>
        <div>
          <span className="text-gray-400">Stock:</span>
          <span className="text-white ml-2">{product.stock}</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400">Category:</span>
          <span className="text-white ml-2">
            {getCategoryName(product.categoryId)}
          </span>
        </div>
      </div>

      <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
        <div className="flex space-x-2 pt-2">
          <LoadingButton
            loading={loadingStates.editing && editingProduct?.id === product.id}
            onClick={() => handleEditProduct(product)}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-3 rounded text-sm transition-colors"
            loadingText="Editing..."
          >
            Edit
          </LoadingButton>
          <LoadingButton
            loading={loadingStates.deleting === product.id}
            onClick={() => handleDeleteProduct(product.id)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded text-sm transition-colors"
            loadingText="Deleting..."
          >
            Delete
          </LoadingButton>
        </div>
      </RoleGuard>
    </div>
  ));

  // Table columns configuration
  const columns = [
    {
      header: "Image",
      key: "imageUrl",
      render: (product) => (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-20 h-20 object-contain rounded-md border-2 border-gray-700 shadow-lg"
        />
      ),
      className: "w-24",
    },
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
      header: "Price",
      key: "price",
      render: (product) => `₪${product.price}`,
      cellClassName: "font-mono",
    },
    {
      header: "Stock",
      key: "stock",
      cellClassName: "text-center",
    },
    {
      header: "Category",
      key: "categoryId",
      render: (product) => getCategoryName(product.categoryId),
    },
    {
      header: "Actions",
      key: "actions",
      render: (product) => (
        <RoleGuard
          userRole={userRole}
          allowedRoles={["admin"]}
          fallback={<span className="text-gray-500 text-xs">View Only</span>}
        >
          <div className="flex space-x-2">
            <LoadingButton
              loading={
                loadingStates.editing && editingProduct?.id === product.id
              }
              onClick={() => handleEditProduct(product)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm"
              loadingText="Editing..."
            >
              Edit
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.deleting === product.id}
              onClick={() => handleDeleteProduct(product.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
              loadingText="Deleting..."
            >
              Delete
            </LoadingButton>
          </div>
        </RoleGuard>
      ),
      className: "w-40",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-6 rounded-2xl shadow-2xl mt-4 sm:mt-8 max-w-full overflow-hidden border border-white/10">
      {/* Role Message */}
      <RoleMessage userRole={userRole} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 sm:mb-0">
          ✨ Product Management
        </h2>

        {/* View Toggle & Add Button */}
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === "cards"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              🎴 Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === "table"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              📊 Table
            </button>
          </div>

          {/* Add Product Button */}
          <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
            <LoadingButton
              loading={loadingStates.adding}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-blue-500/30"
              loadingText="Adding..."
            >
              ➕ Add Product
            </LoadingButton>
          </RoleGuard>
        </div>
      </div>

      {/* Modals */}
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
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No products found
              </h3>
              <p className="text-gray-400 mb-6">
                Add your first product to get started!
              </p>
              <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
                <LoadingButton
                  loading={loadingStates.adding}
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                  loadingText="Adding..."
                >
                  ➕ Add Your First Product
                </LoadingButton>
              </RoleGuard>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard key={`${product.id}-${index}`} product={product} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <ResponsiveTable
          data={products}
          columns={columns}
          mobileCardComponent={ProductMobileCard}
          loading={loadingStates.table}
          emptyMessage="No products found. Add your first product to get started!"
          className="mt-4"
        />
      )}
    </div>
  );
};

export default ProductManagement;

// Add custom CSS for line-clamp if not available
const style = document.createElement("style");
style.textContent = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
if (!document.head.querySelector("style[data-line-clamp]")) {
  style.setAttribute("data-line-clamp", "true");
  document.head.appendChild(style);
}
