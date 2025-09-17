import React from "react";
import { format } from "date-fns";

const CustomerReport = ({ customers = [], sales = [], dateRange }) => {
  // Calculate customer statistics
  const customerStats = customers.map(customer => {
    const customerSales = sales.filter(sale => 
      sale.customerId === customer.id || sale.customerName === customer.name
    );
    const totalOrders = customerSales.length;
    const totalSpent = customerSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    return {
      ...customer,
      totalOrders,
      totalSpent,
      averageOrderValue,
      lastOrderDate: customerSales.length > 0 
        ? new Date(Math.max(...customerSales.map(s => new Date(s.date || Date.now()))))
        : null
    };
  });

  const totalCustomers = customers.length;
  const activeCustomers = customerStats.filter(c => c.totalOrders > 0).length;
  const totalRevenue = customerStats.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Customer Report</h1>
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
          <h3 className="font-semibold text-blue-800">Total Customers</h3>
          <p className="text-2xl font-bold text-blue-600">{totalCustomers}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-green-800">Active Customers</h3>
          <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-purple-800">Total Revenue</h3>
          <p className="text-2xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Customer Details Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Customer Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Phone</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Orders</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Total Spent</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Avg. Order</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customerStats.map((customer, index) => (
                <tr key={customer.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-4 py-2">{customer.name || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">{customer.email || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">{customer.phone || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{customer.totalOrders}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    ${customer.totalSpent.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    ${customer.averageOrderValue.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {customer.lastOrderDate 
                      ? format(customer.lastOrderDate, "MMM dd, yyyy")
                      : 'Never'
                    }
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

export default CustomerReport;
