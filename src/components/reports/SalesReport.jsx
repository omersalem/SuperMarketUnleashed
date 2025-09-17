import React from "react";
import { format } from "date-fns";

const SalesReport = ({ sales, customers, dateRange }) => {
  console.log('SalesReport Debug:', {
    salesCount: sales?.length || 0,
    customersCount: customers?.length || 0,
    sampleSale: sales?.[0],
    dateRange,
    allSales: sales
  });

  // Helper function to get customer name from ID
  const getCustomerName = (sale) => {
    if (sale.customerName) {
      return sale.customerName;
    }
    if (sale.customerId && customers) {
      const customer = customers.find(c => c.id === sale.customerId);
      return customer ? customer.name : 'Walk-in Customer';
    }
    return 'Walk-in Customer';
  };

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + (sale.totalAmount || 0),
    0
  );
  const totalTransactions = sales.length;
  const averageOrderValue =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Top selling products
  const productSales = {};
  sales.forEach((sale) => {
    if (sale.products) {
      sale.products.forEach((product) => {
        const key = product.name || product.id;
        if (!productSales[key]) {
          productSales[key] = { name: key, quantity: 0, revenue: 0 };
        }
        productSales[key].quantity += product.quantity || 0;
        productSales[key].revenue +=
          (product.quantity || 0) * (product.price || 0);
      });
    }
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Sales by customer
  const customerSales = {};
  sales.forEach((sale) => {
    const customerName = getCustomerName(sale);
    if (!customerSales[customerName]) {
      customerSales[customerName] = { name: customerName, orders: 0, total: 0 };
    }
    customerSales[customerName].orders += 1;
    customerSales[customerName].total += sale.totalAmount || 0;
  });

  const topCustomers = Object.values(customerSales)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Sales Report</h1>
        <p className="text-gray-600">
          Period: {format(new Date(dateRange.startDate), "MMM dd, yyyy")} -{" "}
          {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
        </p>
        <p className="text-sm text-gray-500">
          Generated on: {format(new Date(), "MMM dd, yyyy HH:mm")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-blue-800">Total Revenue</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-green-800">Total Transactions</h3>
          <p className="text-2xl font-bold text-green-600">
            {totalTransactions}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-purple-800">Average Order Value</h3>
          <p className="text-2xl font-bold text-purple-600">
            ${averageOrderValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Sales Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Date
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Customer
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Items
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr
                  key={sale.id || index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {format(new Date(sale.date || Date.now()), "MMM dd, yyyy")}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {getCustomerName(sale)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {sale.products?.length || 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    ${(sale.totalAmount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Selling Products */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Product
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Quantity Sold
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {product.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {product.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    ${product.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Customers */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Top Customers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Customer
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Orders
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  Total Spent
                </th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {customer.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {customer.orders}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    ${customer.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;