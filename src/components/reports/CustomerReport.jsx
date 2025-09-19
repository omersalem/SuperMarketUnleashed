import React, { useState, useMemo } from "react";
import { format } from "date-fns";

const CustomerReport = ({ customers = [], sales = [], dateRange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Calculate customer statistics
  const customerStats = useMemo(() => {
    return customers.map((customer) => {
      const customerSales = sales.filter(
        (sale) =>
          sale.customerId === customer.id || sale.customerName === customer.name
      );
      const totalOrders = customerSales.length;
      const totalSpent = customerSales.reduce(
        (sum, sale) => sum + (sale.totalAmount || 0),
        0
      );
      const totalPaid = customerSales.reduce(
        (sum, sale) => sum + (sale.amountPaid || sale.totalAmount || 0),
        0
      );
      const totalBalance = customerSales.reduce(
        (sum, sale) => sum + (sale.balance || 0),
        0
      );
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      return {
        ...customer,
        totalOrders,
        totalSpent,
        totalPaid,
        totalBalance,
        averageOrderValue,
        sales: customerSales,
        lastOrderDate:
          customerSales.length > 0
            ? new Date(
                Math.max(
                  ...customerSales.map((s) => new Date(s.date || Date.now()))
                )
              )
            : null,
      };
    });
  }, [customers, sales]);

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customerStats;

    const search = searchTerm.toLowerCase();
    return customerStats.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.phone?.toLowerCase().includes(search)
    );
  }, [customerStats, searchTerm]);

  // Get detailed customer data for selected customer
  const getCustomerDetails = (customer) => {
    const customerSales = customer.sales || [];
    const totalProductsBought = customerSales.reduce((sum, sale) => {
      return sum + (sale.products?.length || sale.items?.length || 0);
    }, 0);

    const uniqueProducts = new Set();
    customerSales.forEach((sale) => {
      const products = sale.products || sale.items || [];
      products.forEach((product) => {
        uniqueProducts.add(product.name || product.productName);
      });
    });

    return {
      ...customer,
      totalProductsBought,
      uniqueProductsCount: uniqueProducts.size,
      productHistory: Array.from(uniqueProducts),
    };
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(getCustomerDetails(customer));
    setShowDetailedView(true);
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
    setShowDetailedView(false);
  };

  const totalCustomers = customers.length;
  const activeCustomers = filteredCustomers.filter(
    (c) => c.totalOrders > 0
  ).length;
  const totalRevenue = filteredCustomers.reduce(
    (sum, c) => sum + c.totalSpent,
    0
  );
  const totalOutstanding = filteredCustomers.reduce(
    (sum, c) => sum + c.totalBalance,
    0
  );

  if (showDetailedView && selectedCustomer) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b pb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToList}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              ← Back to Customer List
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Customer Detail Report
            </h1>
            <div></div>
          </div>
          <h2 className="text-xl font-semibold text-blue-600">
            {selectedCustomer.name}
          </h2>
          <p className="text-gray-600">
            Period: {format(new Date(dateRange.startDate), "MMM dd, yyyy")} -{" "}
            {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
          </p>
          <p className="text-sm text-gray-500">
            Generated on: {format(new Date(), "MMM dd, yyyy HH:mm")}
          </p>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-blue-800 mb-3">
              Customer Information
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {selectedCustomer.name || "N/A"}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {selectedCustomer.email || "N/A"}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {selectedCustomer.phone || "N/A"}
              </p>
              <p>
                <span className="font-medium">Address:</span>{" "}
                {selectedCustomer.address || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-green-800 mb-3">
              Purchase Summary
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Total Orders:</span>{" "}
                {selectedCustomer.totalOrders}
              </p>
              <p>
                <span className="font-medium">Total Spent:</span>{" "}
                <span className="text-green-600 font-bold">
                  ₪{selectedCustomer.totalSpent.toFixed(2)}
                </span>
              </p>
              <p>
                <span className="font-medium">Total Paid:</span>{" "}
                <span className="text-blue-600 font-bold">
                  ₪{selectedCustomer.totalPaid.toFixed(2)}
                </span>
              </p>
              <p>
                <span className="font-medium">Outstanding Balance:</span>{" "}
                <span
                  className={`font-bold ${
                    selectedCustomer.totalBalance > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  ₪{selectedCustomer.totalBalance.toFixed(2)}
                </span>
              </p>
              <p>
                <span className="font-medium">Average Order Value:</span> ₪
                {selectedCustomer.averageOrderValue.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Last Order:</span>{" "}
                {selectedCustomer.lastOrderDate
                  ? format(selectedCustomer.lastOrderDate, "MMM dd, yyyy")
                  : "Never"}
              </p>
            </div>
          </div>
        </div>

        {/* Product Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-purple-800">
              Product Statistics
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {selectedCustomer.totalProductsBought}
            </p>
            <p className="text-sm text-gray-600">Total Products Bought</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-orange-800">Unique Products</h3>
            <p className="text-2xl font-bold text-orange-600">
              {selectedCustomer.uniqueProductsCount}
            </p>
            <p className="text-sm text-gray-600">
              Different Products Purchased
            </p>
          </div>
        </div>

        {/* Purchase History */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Purchase History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Products
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Items Count
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Total Amount
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Amount Paid
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Balance
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Payment Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedCustomer.sales.map((sale, index) => {
                  const products = sale.products || sale.items || [];
                  return (
                    <tr
                      key={sale.id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {format(
                          new Date(sale.date || Date.now()),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="space-y-1">
                          {sale.isPaymentOnly ? (
                            <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                              💵{" "}
                              {{
                                account_payment: "Account Payment",
                                advance_payment: "Advance Payment",
                                store_credit: "Store Credit",
                              }[sale.paymentType] || "Payment Only"}
                            </div>
                          ) : (
                            products.map((product, pidx) => (
                              <div key={pidx} className="text-sm">
                                <span className="font-medium">
                                  {product.name ||
                                    product.productName ||
                                    "Unknown Product"}
                                </span>
                                <span className="text-gray-500">
                                  {" "}
                                  × {product.quantity || 1}
                                </span>
                                <span className="text-green-600">
                                  {" "}
                                  ($
                                  {(
                                    product.price ||
                                    product.priceAtSale ||
                                    0
                                  ).toFixed(2)}{" "}
                                  each)
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {sale.isPaymentOnly
                          ? 0
                          : products.reduce(
                              (sum, p) => sum + (p.quantity || 1),
                              0
                            )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-medium text-green-600">
                        ${(sale.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-medium text-blue-600">
                        ${(sale.amountPaid || sale.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                        <span
                          className={`${
                            (sale.balance || 0) > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          ${Math.abs(sale.balance || 0).toFixed(2)}
                          {(sale.balance || 0) < 0 && " (Change)"}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sale.paymentStatus === "paid" ||
                            (sale.balance || 0) <= 0
                              ? "bg-green-100 text-green-800"
                              : sale.paymentStatus === "partial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {sale.paymentStatus === "paid" ||
                          (sale.balance || 0) <= 0
                            ? "Paid"
                            : sale.paymentStatus === "partial"
                            ? "Partial"
                            : "Unpaid"}
                        </span>
                        {sale.paymentMethod && (
                          <div className="text-xs text-gray-500 mt-1 capitalize">
                            {sale.paymentMethod.replace("_", " ")}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product History Summary */}
        {selectedCustomer.productHistory.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Products Purchased</h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex flex-wrap gap-2">
                {selectedCustomer.productHistory.map((productName, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {productName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

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

      {/* Search Bar */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Customers
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Showing {filteredCustomers.length} of {totalCustomers} customers
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <p className="text-2xl font-bold text-purple-600">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-red-800">Outstanding Balance</h3>
          <p className="text-2xl font-bold text-red-600">
            ${totalOutstanding.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Customer Details Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Customer Details</h3>
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No customers found matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Email
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Phone
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Orders
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Total Spent
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Amount Paid
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Outstanding
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Avg. Order
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Last Order
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr
                    key={customer.id || index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {customer.name || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {customer.email || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {customer.phone || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {customer.totalOrders}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium text-green-600">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium text-blue-600">
                      ${customer.totalPaid.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      <span
                        className={
                          customer.totalBalance > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        ${customer.totalBalance.toFixed(2)}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ${customer.averageOrderValue.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {customer.lastOrderDate
                        ? format(customer.lastOrderDate, "MMM dd, yyyy")
                        : "Never"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {customer.totalOrders > 0 && (
                        <button
                          onClick={() => handleCustomerSelect(customer)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerReport;
