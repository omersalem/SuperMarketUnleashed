import React from "react";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/currency";

const InventoryReport = ({ products = [], dateRange }) => {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => {
    const price = Number(product.price || 0);
    const stock = Number(product.stock || 0);
    return sum + (price * stock);
  }, 0);

  const lowStockProducts = products.filter(product => (product.stock || 0) < 10);
  const outOfStockProducts = products.filter(product => (product.stock || 0) === 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Report</h1>
        <p className="text-sm text-gray-500">
          Generated on: {format(new Date(), "MMM dd, yyyy HH:mm")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-blue-800">Total Products</h3>
          <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-green-800">Total Value</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-yellow-800">Low Stock</h3>
          <p className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-red-800">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
        </div>
      </div>

      {/* All Products Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">All Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Stock</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Total Value</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const price = Number(product.price || 0);
                const stock = Number(product.stock || 0);
                const totalValue = price * stock;
                let status = 'In Stock';
                let statusColor = 'text-green-600';
                
                if (stock === 0) {
                  status = 'Out of Stock';
                  statusColor = 'text-red-600';
                } else if (stock < 10) {
                  status = 'Low Stock';
                  statusColor = 'text-yellow-600';
                }

                return (
                  <tr key={product.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-4 py-2">{product.name || 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.categoryName || 'Uncategorized'}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{stock}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(price)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">{formatCurrency(totalValue)}</td>
                    <td className={`border border-gray-300 px-4 py-2 text-center font-medium ${statusColor}`}>
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;
