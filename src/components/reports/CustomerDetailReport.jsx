import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/currency";
import jsPDF from "jspdf";
import "jspdf-autotable";

const CustomerDetailReport = ({ customers = [], sales = [], dateRange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);

  // Filter sales by date range
  const filteredSales = useMemo(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) return sales;

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999);

    return sales.filter((sale) => {
      const saleDate = new Date(sale.date || Date.now());
      return saleDate >= startDate && saleDate <= endDate;
    });
  }, [sales, dateRange]);

  // Calculate comprehensive customer statistics
  const customerStats = useMemo(() => {
    return customers.map((customer) => {
      const customerSales = filteredSales.filter(
        (sale) =>
          sale.customerId === customer.id || sale.customerName === customer.name
      );

      const totalOrders = customerSales.length;
      const totalSpent = customerSales.reduce(
        (sum, sale) => sum + (sale.totalAmount || 0),
        0
      );
      const totalPaid = customerSales.reduce(
        (sum, sale) => sum + (sale.amountPaid ?? 0),
        0
      );
      const totalBalance = customerSales.reduce(
        (sum, sale) => sum + (sale.balance || 0),
        0
      );
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      // Calculate payment methods used
      const paymentMethods = {};
      customerSales.forEach((sale) => {
        const method = sale.paymentMethod || "cash";
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
      });

      // Calculate products purchased
      const productsPurchased = {};
      let totalItemsBought = 0;
      customerSales.forEach((sale) => {
        const products = sale.products || sale.items || [];
        products.forEach((product) => {
          const name = product.name || product.productName;
          const quantity = product.quantity || 1;
          totalItemsBought += quantity;

          if (productsPurchased[name]) {
            productsPurchased[name].quantity += quantity;
            productsPurchased[name].totalValue +=
              (product.price || 0) * quantity;
          } else {
            productsPurchased[name] = {
              quantity: quantity,
              totalValue: (product.price || 0) * quantity,
              lastPurchased: sale.date,
            };
          }
        });
      });

      return {
        ...customer,
        totalOrders,
        totalSpent,
        totalPaid,
        totalBalance,
        averageOrderValue,
        totalItemsBought,
        paymentMethods,
        productsPurchased,
        sales: customerSales.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        ),
        lastOrderDate:
          customerSales.length > 0
            ? new Date(
                Math.max(
                  ...customerSales.map((s) => new Date(s.date || Date.now()))
                )
              )
            : null,
        firstOrderDate:
          customerSales.length > 0
            ? new Date(
                Math.min(
                  ...customerSales.map((s) => new Date(s.date || Date.now()))
                )
              )
            : null,
      };
    });
  }, [customers, filteredSales]);

  // Filter customers based on search
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

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailView(true);
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
    setShowDetailView(false);
  };

  const exportToPDF = (customer) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Header with background color
    doc.setFillColor(66, 139, 202);
    doc.rect(0, 0, doc.internal.pageSize.width, 25, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Customer Detail Report", 20, yPosition + 15);

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
    doc.text(customer.name || "N/A", 20, yPosition);

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

    // --- Enhanced Customer Information Section ---
    const infoBoxStartY = yPosition - 5;
    const infoBoxHeight = 38; // Increased height for more info

    doc.setFillColor(240, 248, 255);
    doc.rect(
      15,
      infoBoxStartY,
      doc.internal.pageSize.width - 30,
      infoBoxHeight,
      "F"
    );

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Customer Information:", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    // Column 1
    doc.text(`Email: ${customer.email || "N/A"}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Phone: ${customer.phone || "N/A"}`, 20, yPosition);

    // Column 2
    let yPosCol2 = yPosition - 7; // Reset Y for the second column
    const col2X = doc.internal.pageSize.width / 2 + 10;
    doc.text(`Address: ${customer.address || "N/A"}`, col2X, yPosCol2);
    yPosCol2 += 7;
    doc.text(
      `First Order: ${
        customer.firstOrderDate
          ? format(customer.firstOrderDate, "MMM dd, yyyy")
          : "N/A"
      }`,
      col2X,
      yPosCol2
    );
    yPosCol2 += 7;
    doc.text(
      `Last Order: ${
        customer.lastOrderDate
          ? format(customer.lastOrderDate, "MMM dd, yyyy")
          : "N/A"
      }`,
      col2X,
      yPosCol2
    );

    // Update yPosition to be below the info box
    yPosition = infoBoxStartY + infoBoxHeight + 10;

    // Summary Statistics with color boxes
    doc.setFillColor(66, 139, 202); // Blue header
    doc.rect(15, yPosition - 5, doc.internal.pageSize.width - 30, 10, "F");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("Purchase Summary:", 20, yPosition);
    yPosition += 15;

    // Set font to support the ₪ symbol
    // jsPDF uses "helvetica" by default which supports the Shekel symbol
    doc.setFont("helvetica");

    // Summary metrics
    const metrics = [
      {
        label: "Total Orders",
        value: String(customer.totalOrders || 0),
        color: [220, 230, 240],
      },
      {
        label: "Total Spent",
        value: `NIS ${parseFloat(customer.totalSpent || 0)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        color: [220, 250, 220],
      },
      {
        label: "Total Paid",
        value: `NIS ${parseFloat(customer.totalPaid || 0)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        color: [220, 230, 240],
      },
      {
        label: "Balance",
        value: `NIS ${parseFloat(customer.totalBalance || 0)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        color: [250, 220, 220],
      },
      {
        label: "Avg. Order",
        value: `NIS ${parseFloat(customer.averageOrderValue || 0)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        color: [240, 220, 250],
      },
      {
        label: "Items Bought",
        value: String(customer.totalItemsBought || 0),
        color: [250, 245, 220],
      },
    ];

    // --- Dynamic Layout Calculation ---
    const startX = 15;
    const startY = yPosition;
    const boxWidth = (doc.internal.pageSize.width - 50) / 3;
    const boxHeight = 25;
    const horizontalGap = 5; // <-- REDUCE THIS VALUE to decrease horizontal distance
    const verticalGap = 5; // <-- REDUCE THIS VALUE to decrease vertical distance

    // Loop to draw all metric boxes
    for (let i = 0; i < metrics.length; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;

      // Calculate position with controlled gaps
      const x = startX + col * (boxWidth + horizontalGap);
      const y = startY + row * (boxHeight + verticalGap);

      // Draw the colored box
      doc.setFillColor(...metrics[i].color);
      doc.rect(x, y, boxWidth, boxHeight, "F");

      // Draw the label text
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(metrics[i].label, x + 5, y + 10);

      // Draw the value text
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(metrics[i].value, x + 5, y + 20);
    }

    // Update yPosition for whatever content comes next
    yPosition = startY + 2 * (boxHeight + verticalGap);

    yPosition += 15;

    // Recent Transactions Table
    if (customer.sales && customer.sales.length > 0) {
      doc.setFillColor(66, 139, 202); // Blue header
      doc.rect(15, yPosition - 5, doc.internal.pageSize.width - 30, 10, "F");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("Recent Transactions:", 20, yPosition);
      yPosition += 10;

      const tableData = customer.sales.slice(0, 15).map((sale) => {
        // Calculate balance from totalAmount and amountPaid to ensure accuracy
        const total = parseFloat(sale.totalAmount || 0);
        const paid = parseFloat(sale.amountPaid || 0);
        const balance = total - paid;

        return [
          format(new Date(sale.date), "MMM dd, yyyy"),
          `${(sale.products || sale.items || []).length} items`,
          `NIS ${total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          `NIS ${paid.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          `NIS ${balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          sale.paymentMethod || "cash",
          sale.paymentStatus || "unpaid",
        ];
      });

      // Create table using jsPDF's built-in table functionality
      const startY = yPosition;
      const columnWidths = [25, 20, 25, 25, 25, 20, 20];

      // Draw header
      doc.setFillColor(66, 139, 202);
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");

      const headers = [
        "Date",
        "Items",
        "Total",
        "Paid",
        "Balance",
        "Method",
        "Status",
      ];
      let xPos = 15;

      // First, draw all the background rectangles for the header
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

      // Draw data rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(8);

      yPosition = startY + 8;

      tableData.forEach((row, i) => {
        xPos = 15;

        // Alternate row background
        if (i % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(xPos, yPosition, doc.internal.pageSize.width - 30, 7, "F");
        }

        row.forEach((cell, j) => {
          doc.text(cell, xPos + 2, yPosition + 5);
          xPos += columnWidths[j];
        });

        yPosition += 7;
      });

      yPosition += 15;
    }

    // Payment Methods Visualization
    if (
      Object.keys(customer.paymentMethods).length > 0 &&
      yPosition < pageHeight - 80
    ) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(66, 139, 202); // Blue header
      doc.rect(15, yPosition - 5, doc.internal.pageSize.width - 30, 10, "F");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("Payment Methods Distribution:", 20, yPosition);
      yPosition += 15;

      // Draw a simple bar chart for payment methods
      const barData = Object.entries(customer.paymentMethods)
        .map(([method, count]) => ({
          method,
          count,
          percentage:
            customer.totalOrders > 0
              ? ((count / customer.totalOrders) * 100).toFixed(1)
              : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // Define colors for different payment methods
      const colors = [
        [66, 139, 202], // Blue
        [255, 140, 0], // Orange
        [46, 204, 113], // Green
        [155, 89, 182], // Purple
        [241, 196, 15], // Yellow
        [230, 126, 34], // Dark Orange
      ];

      // Draw chart title
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text("Payment Methods Usage", 20, yPosition);
      yPosition += 15;

      // Draw bars
      const maxBarWidth = doc.internal.pageSize.width - 100;
      const barHeight = 15;
      const barSpacing = 5;

      barData.forEach((item, index) => {
        const barWidth = (item.count / customer.totalOrders) * maxBarWidth;
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

        // Draw method name
        doc.setTextColor(40, 40, 40);
        doc.text(
          `${item.method} (${item.count} orders)`,
          x + maxBarWidth + 10,
          y + barHeight / 2
        );
      });

      yPosition += barData.length * (barHeight + barSpacing) + 10;
    }

    // Top Products
    if (Object.keys(customer.productsPurchased).length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(66, 139, 202); // Blue header
      doc.rect(15, yPosition - 5, doc.internal.pageSize.width - 30, 10, "F");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("Top Products Purchased:", 20, yPosition);
      yPosition += 10;

      const productData = Object.entries(customer.productsPurchased)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 12)
        .map(([name, data]) => [
          name,
          data.quantity.toString(),
          `NIS ${parseFloat(data.totalValue || 0)
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          format(new Date(data.lastPurchased), "MMM dd, yyyy"),
        ]);

      // Create table using jsPDF's built-in table functionality
      const startY = yPosition;
      const columnWidths = [80, 20, 35, 35];

      // Draw header
      doc.setFillColor(255, 140, 0);
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");

      const headers = ["Product", "Quantity", "Total Value", "Last Purchased"];
      let xPos = 15;

      // First, draw all the background rectangles for the header
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

      // Draw data rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(8);

      yPosition = startY + 8;

      productData.forEach((row, i) => {
        xPos = 15;

        // Alternate row background
        if (i % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(xPos, yPosition, doc.internal.pageSize.width - 30, 7, "F");
        }

        row.forEach((cell, j) => {
          doc.text(cell, xPos + 2, yPosition + 5);
          xPos += columnWidths[j];
        });

        yPosition += 7;
      });

      yPosition += 15;
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
      `customer-detail-${customer.name || "report"}-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.pdf`
    );
  };

  if (showDetailView && selectedCustomer) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
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
            <button
              onClick={() => exportToPDF(selectedCustomer)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Export PDF
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
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
        </div>

        {/* Customer Information & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-blue-800 mb-4 text-lg">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="text-gray-800">
                  {selectedCustomer.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-800">
                  {selectedCustomer.email || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Phone:</span>
                <span className="text-gray-800">
                  {selectedCustomer.phone || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Address:</span>
                <span className="text-gray-800">
                  {selectedCustomer.address || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">First Order:</span>
                <span className="text-gray-800">
                  {selectedCustomer.firstOrderDate
                    ? format(selectedCustomer.firstOrderDate, "MMM dd, yyyy")
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Last Order:</span>
                <span className="text-gray-800">
                  {selectedCustomer.lastOrderDate
                    ? format(selectedCustomer.lastOrderDate, "MMM dd, yyyy")
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
                  {selectedCustomer.totalOrders}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Total Spent:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(selectedCustomer.totalSpent)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Total Paid:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(selectedCustomer.totalPaid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Outstanding Balance:
                </span>
                <span
                  className={`text-xl font-bold ${
                    selectedCustomer.totalBalance > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {formatCurrency(selectedCustomer.totalBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Average Order Value:
                </span>
                <span className="text-lg font-semibold text-purple-600">
                  {formatCurrency(selectedCustomer.averageOrderValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Total Items Bought:
                </span>
                <span className="text-lg font-semibold text-orange-600">
                  {selectedCustomer.totalItemsBought}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-purple-800 mb-4 text-lg">
              Payment Methods Used
            </h3>
            <div className="space-y-2">
              {Object.entries(selectedCustomer.paymentMethods).map(
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
                              (count / selectedCustomer.totalOrders) * 100
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

          {/* Top Products */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-orange-800 mb-4 text-lg">
              Top Products Purchased
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(selectedCustomer.productsPurchased)
                .sort((a, b) => b[1].quantity - a[1].quantity)
                .slice(0, 10)
                .map(([productName, data]) => (
                  <div
                    key={productName}
                    className="flex justify-between items-center py-1"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">
                        {productName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Qty: {data.quantity} | Value:{" "}
                        {formatCurrency(data.totalValue)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
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
                {selectedCustomer.sales.map((sale, index) => (
                  <tr key={sale.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {format(new Date(sale.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {(sale.products || sale.items || []).length} items
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">
                      {formatCurrency(sale.totalAmount || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">
                      {formatCurrency(sale.amountPaid ?? 0)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right font-medium ${
                        (sale.balance || 0) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(sale.balance || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 capitalize">
                      {sale.paymentMethod || "cash"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sale.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : sale.paymentStatus === "partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {sale.paymentStatus || "unpaid"}
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
          Customer Detail Reports
        </h1>
        <p className="text-gray-600">
          Select a customer to view detailed transaction history and analytics
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Customers
          </label>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Orders
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total Spent
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
              {filteredCustomers.map((customer, index) => (
                <tr key={customer.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {customer.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {customer.email || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.phone || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-blue-600">
                      {customer.totalOrders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(customer.totalSpent)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-sm font-medium ${
                        customer.totalBalance > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(customer.totalBalance)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {customer.lastOrderDate
                      ? format(customer.lastOrderDate, "MMM dd, yyyy")
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleViewDetails(customer)}
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

      {filteredCustomers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No customers found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default CustomerDetailReport;
