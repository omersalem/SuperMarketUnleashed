import React from "react";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/currency";

const VendorReport = ({ vendors = [], purchases = [], dateRange }) => {
  console.log('VendorReport Debug:', {
    vendorsCount: vendors?.length || 0,
    purchasesCount: purchases?.length || 0,
    samplePurchase: purchases?.[0],
    dateRange,
    allPurchases: purchases
  });

  // Helper function to get vendor name from ID
  const getVendorName = (purchase) => {
    if (purchase.vendorName) {
      return purchase.vendorName;
    }
    if (purchase.vendorId && vendors) {
      const vendor = vendors.find(v => v.id === purchase.vendorId);
      return vendor ? vendor.name : 'Unknown Vendor';
    }
    return 'Unknown Vendor';
  };

  // Calculate vendor statistics
  const vendorStats = vendors.map(vendor => {
    const vendorPurchases = purchases.filter(purchase => 
      purchase.vendorId === vendor.id || purchase.vendorName === vendor.name
    );
    const totalOrders = vendorPurchases.length;
    const totalAmount = vendorPurchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;
    
    return {
      ...vendor,
      totalOrders,
      totalAmount,
      averageOrderValue,
      lastOrderDate: vendorPurchases.length > 0 
        ? new Date(Math.max(...vendorPurchases.map(p => new Date(p.date || Date.now()))))
        : null
    };
  });

  const totalVendors = vendors.length;
  const activeVendors = vendorStats.filter(v => v.totalOrders > 0).length;
  const totalPurchaseAmount = vendorStats.reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Vendor Report</h1>
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
          <h3 className="font-semibold text-blue-800">Total Vendors</h3>
          <p className="text-2xl font-bold text-blue-600">{totalVendors}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-green-800">Active Vendors</h3>
          <p className="text-2xl font-bold text-green-600">{activeVendors}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-purple-800">Total Purchases</h3>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalPurchaseAmount)}</p>
        </div>
      </div>

      {/* Purchase Transactions Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Purchase Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Vendor</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Items</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase, index) => (
                <tr key={purchase.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-4 py-2">
                    {format(new Date(purchase.date || Date.now()), "MMM dd, yyyy")}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {getVendorName(purchase)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {purchase.products?.length || 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    {formatCurrency(purchase.totalAmount || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Performance Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Vendor Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Vendor</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Contact</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Orders</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Total Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Avg. Order</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {vendorStats.map((vendor, index) => (
                <tr key={vendor.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-4 py-2">{vendor.name || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">{vendor.email || vendor.phone || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{vendor.totalOrders}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    {formatCurrency(vendor.totalAmount)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {formatCurrency(vendor.averageOrderValue)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {vendor.lastOrderDate 
                      ? format(vendor.lastOrderDate, "MMM dd, yyyy")
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

export default VendorReport;