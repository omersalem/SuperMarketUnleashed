import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AddToStockModal from "./AddToStockModal";
import { updateProduct } from "../firebase/firestore";
import RoleGuard from "./RoleGuard";

const InventoryManagement = ({ products, setProducts, userRole = "admin" }) => {
  const { t } = useTranslation();
  const [isAddToStockModalOpen, setIsAddToStockModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const lowStockThreshold = 10;

  const handleAddToStock = async (productId, quantity) => {
    // Check if user has permission to add to stock
    if (userRole !== "admin") {
      setError("You don't have permission to add to stock.");
      return;
    }
    
    try {
      const productToUpdate = products.find((p) => p.id === productId);
      if (productToUpdate) {
        const newStock = productToUpdate.stock + quantity;
        await updateProduct(productId, { stock: newStock });
        setProducts(
          products.map((p) =>
            p.id === productId ? { ...p, stock: newStock } : p
          )
        );
      }
      setIsAddToStockModalOpen(false);
      setError(null);
      alert("Stock updated successfully!");
    } catch (error) {
      setError(error.message);
      console.error("Error adding to stock:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("inventoryManagement")}</h1>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="bg-gray-800 shadow-md rounded-lg p-4">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-700 text-left text-sm leading-4 text-gray-300 uppercase tracking-wider">
                {t("product")}
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-700 text-left text-sm leading-4 text-gray-300 uppercase tracking-wider">
                {t("stock")}
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-700 text-left text-sm leading-4 text-gray-300 uppercase tracking-wider">
                {t("status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={`${product.id}-${index}`}
                className={
                  product.stock < lowStockThreshold ? "bg-red-900" : ""
                }
              >
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-700">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-700">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-700">
                  {product.stock < lowStockThreshold ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-700 text-white">
                      {t("lowStock")}
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-700 text-white">
                      {t("inStock")}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add to Stock button moved below the table */}
      <div className="mt-6 flex justify-center">
        <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
          <button
            onClick={() => setIsAddToStockModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add to Stock
          </button>
        </RoleGuard>
      </div>

      <AddToStockModal
        isOpen={isAddToStockModalOpen}
        onClose={() => setIsAddToStockModalOpen(false)}
        onAddToStock={handleAddToStock}
        products={products}
      />
    </div>
  );
};

export default InventoryManagement;
