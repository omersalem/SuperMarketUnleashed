import React from "react";
import { format } from "date-fns";

const StockAlertReport = ({ products = [], dateRange }) => {
  const lowStockProducts = products.filter(product => (product.stock || 0) < 10 && (product.stock || 0) > 0);
  const outOfStockProducts = products.filter(product => (product.stock || 0) === 0);
  const criticalProducts = [...outOfStockProducts, ...lowStockProducts];

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Stock Alert Report</h1>
        <p className="text-sm text-gray-500">
          Generated on: {format(new Date(), "MMM dd, yyyy HH:mm")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-red-800">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-yellow-800">Low Stock</h3>
          <p className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-orange-800">Total Alerts</h3>
          <p className="text-2xl font-bold text-orange-600">{criticalProducts.length}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Critical Stock Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Current Stock</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {criticalProducts.map((product, index) => {
                const stock = product.stock || 0;
                const isOutOfStock = stock === 0;
                const statusColor = isOutOfStock ? 'text-red-600' : 'text-yellow-600';
                const statusBg = isOutOfStock ? 'bg-red-100' : 'bg-yellow-100';
                
                return (
                  <tr key={product.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-4 py-2">{product.name || 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.categoryName || 'Uncategorized'}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">{stock}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ${Number(product.price || 0).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-sm ${statusBg} ${statusColor}`}>
                        {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {criticalProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No critical stock items found. All products are well stocked!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAlertReport;
