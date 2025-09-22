import React from "react";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/currency";

const PurchaseReport = ({ purchases = [], vendors = [], dateRange }) => {
  const getVendorName = (purchase) => {
    if (purchase.vendorName) return purchase.vendorName;
    if (purchase.vendorId && vendors) {
      const vendor = vendors.find(v => v.id === purchase.vendorId);
      return vendor ? vendor.name : 'Unknown Vendor';
    }
    return 'Unknown Vendor';
  };

  const totalPurchases = purchases.length;
  const totalAmount = purchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);
  const averageOrderValue = totalPurchases > 0 ? totalAmount / totalPurchases : 0;

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Purchase Report</h1>
        <p className="text-gray-600">
          Period: {format(new Date(dateRange.startDate), "MMM dd, yyyy")} -{" "}
          {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
        </p>
        <p className="text-sm text-gray-500">
          Generated on: {format(new Date(), "MMM dd, yyyy HH:mm")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-blue-800">Total Purchases</h3>
          <p className="text-2xl font-bold text-blue-600">{totalPurchases}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-green-800">Total Amount</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-purple-800">Average Order</h3>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(averageOrderValue)}</p>
        </div>
      </div>

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
                  <td className="border border-gray-300 px-4 py-2">{getVendorName(purchase)}</td>
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
    </div>
  );
};

export default PurchaseReport;
