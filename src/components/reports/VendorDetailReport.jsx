import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";

const VendorDetailReport = ({ vendors = [], purchases = [], dateRange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);

  // Filter purchases by date range
  const filteredPurchases = useMemo(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) return purchases;

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999);

    return purchases.filter((purchase) => {
      const purchaseDate = new Date(purchase.date || Date.now());
      return purchaseDate >= startDate && purchaseDate <= endDate;
    });
  }, [purchases, dateRange]);

  // Calculate comprehensive vendor statistics
  const vendorStats = useMemo(() => {
    return vendors.map((vendor) => {
      const vendorPurchases = filteredPurchases.filter(
        (purchase) =>
          purchase.vendorId === vendor.id || purchase.vendorName === vendor.name
      );

      const totalOrders = vendorPurchases.length;
      const totalAmount = vendorPurchases.reduce(
        (sum, purchase) => sum + (purchase.totalAmount || 0),
        0
      );
      const totalPaid = vendorPurchases.reduce(
        (sum, purchase) =>
          sum + (purchase.amountPaid || purchase.totalAmount || 0),
        0
      );
      const totalBalance = vendorPurchases.reduce(
        (sum, purchase) => sum + (purchase.balance || 0),
        0
      );
      const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

      // Calculate payment methods used
      const paymentMethods = {};
      vendorPurchases.forEach((purchase) => {
        const method = purchase.paymentMethod || "cash";
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
      });

      // Calculate products supplied
      const productsSupplied = {};
      let totalItemsSupplied = 0;
      vendorPurchases.forEach((purchase) => {
        const products = purchase.products || purchase.items || [];
        products.forEach((product) => {
          const name = product.name || product.productName;
          const quantity = product.quantity || 1;
          totalItemsSupplied += quantity;

          if (productsSupplied[name]) {
            productsSupplied[name].quantity += quantity;
            productsSupplied[name].totalValue +=
              (product.price || 0) * quantity;
          } else {
            productsSupplied[name] = {
              quantity: quantity,
              totalValue: (product.price || 0) * quantity,
              lastSupplied: purchase.date,
            };
          }
        });
      });

      // Calculate payment status distribution
      const paymentStatusCount = {
        paid: 0,
        partial: 0,
        unpaid: 0,
      };
      vendorPurchases.forEach((purchase) => {
        const status = purchase.paymentStatus || "unpaid";
        paymentStatusCount[status] = (paymentStatusCount[status] || 0) + 1;
      });

      return {
        ...vendor,
        totalOrders,
        totalAmount,
        totalPaid,
        totalBalance,
        averageOrderValue,
        totalItemsSupplied,
        paymentMethods,
        productsSupplied,
        paymentStatusCount,
        purchases: vendorPurchases.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        ),
        lastOrderDate:
          vendorPurchases.length > 0
            ? new Date(
                Math.max(
                  ...vendorPurchases.map((p) => new Date(p.date || Date.now()))
                )
              )
            : null,
        firstOrderDate:
          vendorPurchases.length > 0
            ? new Date(
                Math.min(
                  ...vendorPurchases.map((p) => new Date(p.date || Date.now()))
                )
              )
            : null,
      };
    });
  }, [vendors, filteredPurchases]);

  // Filter vendors based on search
  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) return vendorStats;
    const search = searchTerm.toLowerCase();
    return vendorStats.filter(
      (vendor) =>
        vendor.name?.toLowerCase().includes(search) ||
        vendor.email?.toLowerCase().includes(search) ||
        vendor.phone?.toLowerCase().includes(search) ||
        vendor.contactPerson?.toLowerCase().includes(search)
    );
  }, [vendorStats, searchTerm]);

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowDetailView(true);
  };

  const handleBackToList = () => {
    setSelectedVendor(null);
    setShowDetailView(false);
  };

  const exportToPDF = (vendor) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Vendor Detail Report", 20, yPosition);

    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 200);
    doc.text(vendor.name || "N/A", 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`,
      20,
      yPosition
    );
    doc.text(
      `Period: ${format(
        new Date(dateRange.startDate),
        "MMM dd, yyyy"
      )} - ${format(new Date(dateRange.endDate), "MMM dd, yyyy")}`,
      120,
      yPosition
    );

    yPosition += 20;

    // Vendor Information
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text("Vendor Information:", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Contact Person: ${vendor.contactPerson || "N/A"}`, 20, yPosition);
    doc.text(`Phone: ${vendor.phone || "N/A"}`, 120, yPosition);
    yPosition += 6;
    doc.text(`Email: ${vendor.email || "N/A"}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Address: ${vendor.address || "N/A"}`, 20, yPosition);
    yPosition += 15;

    // Summary Statistics
    doc.setFontSize(12);
    doc.text("Purchase Summary:", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Total Orders: ${vendor.totalOrders}`, 20, yPosition);
    doc.text(`Total Amount: $${vendor.totalAmount.toFixed(2)}`, 70, yPosition);
    doc.text(`Total Paid: $${vendor.totalPaid.toFixed(2)}`, 120, yPosition);
    doc.text(`Balance: $${vendor.totalBalance.toFixed(2)}`, 170, yPosition);
    yPosition += 6;
    doc.text(
      `Average Order: $${vendor.averageOrderValue.toFixed(2)}`,
      20,
      yPosition
    );
    doc.text(`Items Supplied: ${vendor.totalItemsSupplied}`, 70, yPosition);
    yPosition += 15;

    // Recent Transactions Table
    if (vendor.purchases && vendor.purchases.length > 0) {
      doc.setFontSize(12);
      doc.text("Recent Transactions:", 20, yPosition);
      yPosition += 5;

      const tableData = vendor.purchases
        .slice(0, 10)
        .map((purchase) => [
          format(new Date(purchase.date), "MMM dd, yyyy"),
          `${(purchase.products || purchase.items || []).length} items`,
          `$${(purchase.totalAmount || 0).toFixed(2)}`,
          `$${(purchase.amountPaid || purchase.totalAmount || 0).toFixed(2)}`,
          `$${(purchase.balance || 0).toFixed(2)}`,
          purchase.paymentMethod || "cash",
        ]);

      doc.autoTable({
        startY: yPosition,
        head: [["Date", "Items", "Total", "Paid", "Balance", "Method"]],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // Top Products
    if (Object.keys(vendor.productsSupplied).length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.text("Top Products Supplied:", 20, yPosition);
      yPosition += 5;

      const productData = Object.entries(vendor.productsSupplied)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 15)
        .map(([name, data]) => [
          name,
          data.quantity.toString(),
          `$${data.totalValue.toFixed(2)}`,
          format(new Date(data.lastSupplied), "MMM dd, yyyy"),
        ]);

      doc.autoTable({
        startY: yPosition,
        head: [["Product", "Quantity", "Total Value", "Last Supplied"]],
        body: productData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    }

    doc.save(`vendor-detail-${vendor.name || "report"}.pdf`);
  };

  if (showDetailView && selectedVendor) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToList}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              ← Back to Vendor List
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Vendor Detail Report
            </h1>
            <button
              onClick={() => exportToPDF(selectedVendor)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Export PDF
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              {selectedVendor.name}
            </h2>
            <p className="text-gray-600">
              Period: {format(new Date(dateRange.startDate), "MMM dd, yyyy")} -{" "}
              {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
            </p>
            <p className="text-sm text-gray-500">
              Generated on: {format(new Date(), "MMM dd, yyyy HH:mm")}
            </p>
          </div>
        </div>

        {/* Vendor Information & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendor Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-blue-800 mb-4 text-lg">
              Vendor Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="text-gray-800">
                  {selectedVendor.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Contact Person:
                </span>
                <span className="text-gray-800">
                  {selectedVendor.contactPerson || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-800">
                  {selectedVendor.email || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Phone:</span>
                <span className="text-gray-800">
                  {selectedVendor.phone || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Address:</span>
                <span className="text-gray-800">
                  {selectedVendor.address || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">First Order:</span>
                <span className="text-gray-800">
                  {selectedVendor.firstOrderDate
                    ? format(selectedVendor.firstOrderDate, "MMM dd, yyyy")
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Last Order:</span>
                <span className="text-gray-800">
                  {selectedVendor.lastOrderDate
                    ? format(selectedVendor.lastOrderDate, "MMM dd, yyyy")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Purchase Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-green-800 mb-4 text-lg">
              Purchase Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Total Orders:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {selectedVendor.totalOrders}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${selectedVendor.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Total Paid:</span>
                <span className="text-xl font-bold text-blue-600">
                  ${selectedVendor.totalPaid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Outstanding Balance:
                </span>
                <span
                  className={`text-xl font-bold ${
                    selectedVendor.totalBalance > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  ${selectedVendor.totalBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Average Order Value:
                </span>
                <span className="text-lg font-semibold text-purple-600">
                  ${selectedVendor.averageOrderValue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Total Items Supplied:
                </span>
                <span className="text-lg font-semibold text-orange-600">
                  {selectedVendor.totalItemsSupplied}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Payment Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-purple-800 mb-4 text-lg">
              Payment Methods Used
            </h3>
            <div className="space-y-2">
              {Object.entries(selectedVendor.paymentMethods).map(
                ([method, count]) => (
                  <div
                    key={method}
                    className="flex justify-between items-center"
                  >
                    <span className="capitalize font-medium text-gray-600">
                      {method}:
                    </span>
                    <div className="flex items-center">
                      <span className="text-gray-800 mr-2">{count} times</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (count / selectedVendor.totalOrders) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-indigo-800 mb-4 text-lg">
              Payment Status Distribution
            </h3>
            <div className="space-y-2">
              {Object.entries(selectedVendor.paymentStatusCount).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex justify-between items-center"
                  >
                    <span className="capitalize font-medium text-gray-600">
                      {status}:
                    </span>
                    <div className="flex items-center">
                      <span className="text-gray-800 mr-2">{count} orders</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === "paid"
                              ? "bg-green-600"
                              : status === "partial"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{
                            width: `${
                              (count / selectedVendor.totalOrders) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Top Products Supplied */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-orange-800 mb-4 text-lg">
            Top Products Supplied
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(selectedVendor.productsSupplied)
              .sort((a, b) => b[1].quantity - a[1].quantity)
              .slice(0, 12)
              .map(([productName, data]) => (
                <div key={productName} className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-800 text-sm mb-1">
                    {productName}
                  </div>
                  <div className="text-xs text-gray-600">
                    <div>Quantity: {data.quantity}</div>
                    <div>Value: ${data.totalValue.toFixed(2)}</div>
                    <div>
                      Last:{" "}
                      {format(new Date(data.lastSupplied), "MMM dd, yyyy")}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4 text-lg">
            Transaction History
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Items
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Payment Method
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedVendor.purchases.map((purchase, index) => (
                  <tr key={purchase.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {format(new Date(purchase.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {(purchase.products || purchase.items || []).length} items
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">
                      ${(purchase.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">
                      $
                      {(
                        purchase.amountPaid ||
                        purchase.totalAmount ||
                        0
                      ).toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right font-medium ${
                        (purchase.balance || 0) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ${(purchase.balance || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 capitalize">
                      {purchase.paymentMethod || "cash"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          purchase.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : purchase.paymentStatus === "partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {purchase.paymentStatus || "unpaid"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Vendor Detail Reports
        </h1>
        <p className="text-gray-600">
          Select a vendor to view detailed transaction history and analytics
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Vendors
          </label>
          <input
            type="text"
            placeholder="Search by name, email, phone, or contact person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vendor List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Orders
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Balance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Last Order
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVendors.map((vendor, index) => (
                <tr key={vendor.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {vendor.name || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {vendor.contactPerson || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {vendor.email || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {vendor.phone || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-blue-600">
                      {vendor.totalOrders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-green-600">
                      ${vendor.totalAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-sm font-medium ${
                        vendor.totalBalance > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ${vendor.totalBalance.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {vendor.lastOrderDate
                      ? format(vendor.lastOrderDate, "MMM dd, yyyy")
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleViewDetails(vendor)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No vendors found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default VendorDetailReport;
