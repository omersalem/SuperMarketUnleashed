import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/currency";
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
        (sum, purchase) => sum + (purchase.amountPaid ?? 0),
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

    // Header with background color
    doc.setFillColor(102, 51, 153); // Purple for vendor reports
    doc.rect(0, 0, doc.internal.pageSize.width, 25, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Vendor Detail Report", 20, yPosition + 15);

    // --- Custom Shopping Cart Logo ---
    const logoX = doc.internal.pageSize.width - 40;
    const logoY = 8;
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);

    // Cart basket
    doc.line(logoX, logoY, logoX + 20, logoY); // Top
    doc.line(logoX, logoY, logoX + 4, logoY + 10); // Left
    doc.line(logoX + 4, logoY + 10, logoX + 22, logoY + 10); // Bottom

    // Cart handle
    doc.line(logoX + 20, logoY, logoX + 25, logoY - 3);

    // Wheels
    doc.circle(logoX + 7, logoY + 12, 1.5);
    doc.circle(logoX + 19, logoY + 12, 1.5);

    yPosition += 35;
    doc.setFontSize(18);
    doc.setTextColor(0, 50, 150);
    doc.text(vendor.name || "N/A", 20, yPosition);

    yPosition += 15;
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

    // --- Enhanced Vendor Information Section ---
    const infoBoxStartY = yPosition - 5;
    const infoBoxHeight = 38; // Increased height for more info

    doc.setFillColor(245, 240, 250); // Light purple
    doc.rect(
      15,
      infoBoxStartY,
      doc.internal.pageSize.width - 30,
      infoBoxHeight,
      "F"
    );

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Vendor Information:", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    // Column 1
    doc.text(`Contact Person: ${vendor.contactPerson || "N/A"}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Phone: ${vendor.phone || "N/A"}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Email: ${vendor.email || "N/A"}`, 20, yPosition);

    // Column 2
    let yPosCol2 = yPosition - 14; // Reset Y for the second column
    const col2X = doc.internal.pageSize.width / 2 + 10; // Start second column past the midpoint
    doc.text(`Address: ${vendor.address || "N/A"}`, col2X, yPosCol2);
    yPosCol2 += 7;
    doc.text(
      `First Order: ${
        vendor.firstOrderDate
          ? format(vendor.firstOrderDate, "MMM dd, yyyy")
          : "N/A"
      }`,
      col2X,
      yPosCol2
    );
    yPosCol2 += 7;
    doc.text(
      `Last Order: ${
        vendor.lastOrderDate
          ? format(vendor.lastOrderDate, "MMM dd, yyyy")
          : "N/A"
      }`,
      col2X,
      yPosCol2
    );

    // Update yPosition to be below the info box
    yPosition = infoBoxStartY + infoBoxHeight + 10;

    // Summary Statistics with color boxes
    doc.setFillColor(240, 250, 240); // Light green
    doc.rect(15, yPosition - 5, doc.internal.pageSize.width - 30, 80, "F");
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Purchase Summary:", 20, yPosition);
    yPosition += 15;

    // Summary metrics in boxes
    const metrics = [
      {
        label: "Total Orders",
        value: String(vendor.totalOrders || 0),
        color: [230, 230, 250],
      }, // Light purple
      {
        label: "Total Amount",
        value: `NIS ${parseFloat(vendor.totalAmount || 0)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        color: [220, 250, 220],
      }, // Light green
      {
        label: "Total Paid",
        value: `NIS ${parseFloat(vendor.totalPaid || 0)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        color: [230, 230, 250],
      }, // Light purple
      {
        label: "Balance",
        value: `NIS ${parseFloat(vendor.totalBalance || 0)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        color: [250, 220, 220],
      }, // Light red
      {
        label: "Avg. Order",
        value: `NIS ${parseFloat(vendor.averageOrderValue || 0)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        color: [240, 220, 250],
      }, // Light violet
      {
        label: "Items Supplied",
        value: String(vendor.totalItemsSupplied || 0),
        color: [250, 245, 220],
      },
    ];

    // Draw metric boxes
    const boxWidth = (doc.internal.pageSize.width - 50) / 3;
    const boxHeight = 25;

    const horizontalGap = 5;
    const verticalGap = 5;

    for (let i = 0; i < metrics.length; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;

      const x = 15 + col * (boxWidth + horizontalGap);
      const y = yPosition + row * (boxHeight + verticalGap);

      doc.setFillColor(...metrics[i].color);
      doc.rect(x, y, boxWidth, boxHeight, "F");

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(metrics[i].label, x + 5, y + 10);

      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(metrics[i].value, x + 5, y + 20);
    }

    yPosition += 2 * (boxHeight + verticalGap) + 10;

    // Recent Transactions Table
    if (vendor.purchases && vendor.purchases.length > 0) {
      // Add a colored header for the section title
      doc.setFillColor(102, 51, 153); // Purple
      doc.rect(15, yPosition - 5, doc.internal.pageSize.width - 30, 10, "F");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("Recent Transactions:", 20, yPosition);
      yPosition += 10;

      const tableData = vendor.purchases.slice(0, 15).map((purchase) => {
        const total = parseFloat(purchase.totalAmount || 0);
        const paid = parseFloat(purchase.amountPaid ?? 0); // Corrected logic
        const balance = total - paid;

        return [
          format(new Date(purchase.date), "MMM dd, yyyy"),
          `${(purchase.products || purchase.items || []).length} items`,
          `NIS ${total.toFixed(2)}`,
          `NIS ${paid.toFixed(2)}`,
          `NIS ${balance.toFixed(2)}`,
          purchase.paymentMethod || "cash",
          purchase.paymentStatus || "unpaid",
        ];
      });

      const startY = yPosition;
      const columnWidths = [25, 20, 25, 25, 25, 20, 20];
      const headers = [
        "Date",
        "Items",
        "Total",
        "Paid",
        "Balance",
        "Method",
        "Status",
      ];

      doc.setFillColor(102, 51, 153); // Purple header
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");

      // First, draw all the background rectangles for the header
      let xPos = 15;
      headers.forEach((header, i) => {
        doc.rect(xPos, startY, columnWidths[i], 8, "F");
        xPos += columnWidths[i];
      });

      // Then, draw the text on top of the backgrounds
      xPos = 15;
      headers.forEach((header, i) => {
        doc.text(header, xPos + 2, startY + 5);
        xPos += columnWidths[i];
      });

      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(8);
      yPosition = startY + 8;

      tableData.forEach((row, i) => {
        xPos = 15;
        if (i % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(xPos, yPosition, doc.internal.pageSize.width - 30, 7, "F");
        }
        row.forEach((cell, j) => {
          doc.text(String(cell), xPos + 2, yPosition + 5);
          xPos += columnWidths[j];
        });
        yPosition += 7;
      });

      yPosition += 10;
    }

    // Payment Status Distribution with Bar Chart
    if (
      Object.keys(vendor.paymentStatusCount).length > 0 &&
      yPosition < pageHeight - 100
    ) {
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(250, 245, 240);
      doc.rect(15, yPosition - 5, doc.internal.pageSize.width - 30, 5, "F");
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Payment Status Distribution:", 20, yPosition);
      yPosition += 15;

      // Draw a simple bar chart for payment status
      const statusData = Object.entries(vendor.paymentStatusCount)
        .map(([status, count]) => ({
          status,
          count,
          percentage:
            vendor.totalOrders > 0
              ? ((count / vendor.totalOrders) * 100).toFixed(1)
              : 0,
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count);

      // Define colors for different payment statuses
      const colors = [
        [46, 204, 113], // Green for paid
        [241, 196, 15], // Yellow for partial
        [231, 76, 60], // Red for unpaid
      ];

      // Draw chart title
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text("Payment Status Usage", 20, yPosition);
      yPosition += 15;

      // Draw bars
      const maxBarWidth = doc.internal.pageSize.width - 100;
      const barHeight = 15;
      const barSpacing = 5;

      statusData.forEach((item, index) => {
        const barWidth = (item.count / vendor.totalOrders) * maxBarWidth;
        const x = 20;
        const y = yPosition + index * (barHeight + barSpacing);

        // Draw bar background
        doc.setFillColor(230, 230, 230);
        doc.rect(x, y, maxBarWidth, barHeight, "F");

        // Draw bar
        doc.setFillColor(...colors[index % colors.length]);
        doc.rect(x, y, barWidth, barHeight, "F");

        // Draw percentage text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(`${item.percentage}%`, x + barWidth / 2, y + barHeight / 2, {
          align: "center",
        });

        // Draw status name
        doc.setTextColor(40, 40, 40);
        doc.text(
          `${item.status} (${item.count} orders)`,
          x + maxBarWidth + 10,
          y + barHeight / 2
        );
      });

      yPosition += statusData.length * (barHeight + barSpacing) + 10;
    }

    // Top Products
    if (Object.keys(vendor.productsSupplied).length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      // Add a colored header for the section title
      doc.setFillColor(102, 51, 153); // Purple
      doc.rect(15, yPosition - 5, doc.internal.pageSize.width - 30, 10, "F");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("Top Products Supplied:", 20, yPosition);
      yPosition += 10;

      const productData = Object.entries(vendor.productsSupplied)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 12)
        .map(([name, data]) => {
          const totalValue = parseFloat(data.totalValue || 0);
          return [
            name,
            data.quantity.toString(),
            `NIS ${totalValue.toFixed(2)}`,
            format(new Date(data.lastSupplied), "MMM dd, yyyy"),
          ];
        });

      const startY = yPosition;
      const columnWidths = [80, 20, 35, 35];
      const headers = ["Product", "Quantity", "Total Value", "Last Supplied"];
      let xPos = 15;

      doc.setFillColor(102, 51, 153); // Purple header
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");

      headers.forEach((header, i) => {
        doc.rect(xPos, startY, columnWidths[i], 8, "F");
        doc.text(header, xPos + 2, startY + 5);
        xPos += columnWidths[i];
      });

      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(8);
      yPosition = startY + 8;

      productData.forEach((row, i) => {
        xPos = 15;
        if (i % 2 === 0) doc.setFillColor(245, 245, 245);
        else doc.setFillColor(255, 255, 255);
        doc.rect(xPos, yPosition, doc.internal.pageSize.width - 30, 7, "F");
        row.forEach((cell, j) => {
          doc.text(String(cell), xPos + 2, yPosition + 5);
          xPos += columnWidths[j];
        });
        yPosition += 7;
      });
    }

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    doc.save(
      `vendor-detail-${vendor.name || "report"}-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.pdf`
    );
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
                  {formatCurrency(selectedVendor.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Total Paid:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(selectedVendor.totalPaid)}
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
                  {formatCurrency(selectedVendor.totalBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Average Order Value:
                </span>
                <span className="text-lg font-semibold text-purple-600">
                  {formatCurrency(selectedVendor.averageOrderValue)}
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
                    <div>Value: {formatCurrency(data.totalValue)}</div>
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
                      {formatCurrency(purchase.totalAmount || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">
                      {formatCurrency(purchase.amountPaid ?? 0)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right font-medium ${
                        (purchase.balance || 0) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(purchase.balance || 0)}
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
                      {formatCurrency(vendor.totalAmount)}
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
                      {formatCurrency(vendor.totalBalance)}
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
