import React, { useState } from "react";
import { format, subDays, subMonths } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useReactToPrint } from "react-to-print";

// Import report components
import SalesReport from "./reports/SalesReport";
import InventoryReport from "./reports/InventoryReport";
import CustomerReport from "./reports/CustomerReport";
import VendorReport from "./reports/VendorReport";
import WorkerReport from "./reports/WorkerReport";
import FinancialReport from "./reports/FinancialReport";
import PurchaseReport from "./reports/PurchaseReport";
import ChecksReport from "./reports/ChecksReport";
import StockAlertReport from "./reports/StockAlertReport";
import ProfitLossReport from "./reports/ProfitLossReport";
import CustomerDetailReport from "./reports/CustomerDetailReport";
import VendorDetailReport from "./reports/VendorDetailReport";

const ReportsDashboard = ({
  sales = [],
  purchases = [],
  customers = [],
  vendors = [],
  products = [],
  workers = [],
  salaryPayments = [],
  workerExpenses = [],
  workerAttendance = [],
  checks = [],
  categories = [],
}) => {
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 12), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = React.useRef();

  // Filter data based on date range
  const filterByDateRange = (data, dateField = "date") => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    return data.filter((item) => {
      let itemDate;
      const dateValue = item[dateField];

      if (!dateValue) {
        return false; // Skip items without dates
      }

      // Handle different date formats
      if (typeof dateValue === "string") {
        // Check if it's DD/MM/YYYY format
        if (dateValue.includes("/") && dateValue.split("/").length === 3) {
          const parts = dateValue.split("/");
          if (
            parts[0].length <= 2 &&
            parts[1].length <= 2 &&
            parts[2].length === 4
          ) {
            // DD/MM/YYYY format - convert to YYYY-MM-DD
            itemDate = new Date(
              `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
                2,
                "0"
              )}`
            );
          } else {
            itemDate = new Date(dateValue);
          }
        } else {
          itemDate = new Date(dateValue);
        }
      } else {
        itemDate = new Date(dateValue);
      }

      // Check if date is valid
      if (isNaN(itemDate.getTime())) {
        console.warn("Invalid date found:", dateValue, "in item:", item);
        return false;
      }

      return itemDate >= start && itemDate <= end;
    });
  };

  const filteredData = {
    sales: filterByDateRange(sales),
    purchases: filterByDateRange(purchases),
    salaryPayments: filterByDateRange(salaryPayments),
    workerExpenses: filterByDateRange(workerExpenses),
    checks: filterByDateRange(checks),
  };

  // Use filtered data directly - date filtering now works correctly
  const finalData = {
    sales: filteredData.sales,
    purchases: filteredData.purchases,
    salaryPayments: filteredData.salaryPayments,
    workerExpenses: filteredData.workerExpenses,
    checks: filteredData.checks,
  };

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Process products to include category names
  const processedProducts = products.map((product) => ({
    ...product,
    categoryName: getCategoryName(product.categoryId),
  }));

  const reportTypes = [
    { id: "sales", name: "Sales Report", icon: "📊" },
    { id: "inventory", name: "Inventory Report", icon: "📦" },
    { id: "customers", name: "Customer Report", icon: "👥" },
    { id: "customerDetails", name: "Customer Detail Reports", icon: "👤" },
    { id: "vendors", name: "Vendor Report", icon: "🏪" },
    { id: "vendorDetails", name: "Vendor Detail Reports", icon: "🏢" },
    { id: "workers", name: "Worker Report", icon: "👷" },
    { id: "financial", name: "Financial Report", icon: "💰" },
    { id: "purchases", name: "Purchase Report", icon: "🛒" },
    { id: "checks", name: "Checks Report", icon: "💳" },
    { id: "stockAlert", name: "Stock Alert Report", icon: "⚠️" },
    { id: "profitLoss", name: "Profit & Loss Report", icon: "📈" },
  ];

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `${
      reportTypes.find((r) => r.id === selectedReport)?.name || "Report"
    } - ${format(new Date(), "yyyy-MM-dd")}`,
  });

  const generatePDF = async () => {
    if (!reportRef.current) return;

    setIsGenerating(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const reportName =
        reportTypes.find((r) => r.id === selectedReport)?.name || "Report";

      // Add header
      pdf.setFontSize(16);
      pdf.text("Supermarket Management System", 105, 20, { align: "center" });
      pdf.setFontSize(14);
      pdf.text(reportName, 105, 30, { align: "center" });
      pdf.setFontSize(10);
      pdf.text(
        `Generated: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
        105,
        40,
        { align: "center" }
      );
      pdf.text(
        `Period: ${format(
          new Date(dateRange.startDate),
          "dd/MM/yyyy"
        )} - ${format(new Date(dateRange.endDate), "dd/MM/yyyy")}`,
        105,
        50,
        { align: "center" }
      );

      let yPosition = 60;

      // Generate report-specific content
      switch (selectedReport) {
        case "sales":
          await generateSalesPDF(pdf, yPosition);
          break;
        case "inventory":
          await generateInventoryPDF(pdf, yPosition);
          break;
        case "customers":
          await generateCustomersPDF(pdf, yPosition);
          break;
        case "vendors":
          await generateVendorsPDF(pdf, yPosition);
          break;
        case "workers":
          await generateWorkersPDF(pdf, yPosition);
          break;
        case "financial":
          await generateFinancialPDF(pdf, yPosition);
          break;
        case "purchases":
          await generatePurchasesPDF(pdf, yPosition);
          break;
        case "checks":
          await generateChecksPDF(pdf, yPosition);
          break;
        case "stockAlert":
          await generateStockAlertPDF(pdf, yPosition);
          break;
        case "profitLoss":
          await generateProfitLossPDF(pdf, yPosition);
          break;
        default:
          pdf.text("Report data not available", 20, yPosition);
      }

      pdf.save(
        `${reportName.replace(/\s+/g, "_")}_${format(
          new Date(),
          "yyyy-MM-dd"
        )}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // PDF generation functions for each report type
  const generateSalesPDF = async (pdf, startY) => {
    try {
      if (typeof pdf.autoTable !== "function") {
        throw new Error(
          "PDF table generation not available. Please check jsPDF autoTable plugin."
        );
      }

      const tableData = finalData.sales.map((sale) => {
        const customer = customers.find((c) => c.id === sale.customerId);
        const customerName =
          sale.customerName || (customer ? customer.name : "Walk-in Customer");

        return [
          format(new Date(sale.date || Date.now()), "MMM dd, yyyy"),
          customerName,
          sale.products?.length || 0,
          `$${(sale.totalAmount || 0).toFixed(2)}`,
        ];
      });

      pdf.autoTable({
        head: [["Date", "Customer", "Items", "Amount"]],
        body: tableData,
        startY: startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    } catch (error) {
      console.error("Error in generateSalesPDF:", error);
      pdf.text(`Error generating sales report data.`, 20, startY);
    }
  };

  const generateInventoryPDF = async (pdf, startY) => {
    try {
      if (typeof pdf.autoTable !== "function") {
        throw new Error(
          "PDF table generation not available. Please check jsPDF autoTable plugin."
        );
      }

      const tableData = processedProducts.map((product) => [
        product.name || "N/A",
        product.categoryName || "Uncategorized",
        product.stock || 0,
        `$${Number(product.price || 0).toFixed(2)}`,
      ]);

      pdf.autoTable({
        head: [["Product", "Category", "Stock", "Price"]],
        body: tableData,
        startY: startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    } catch (error) {
      console.error("Error in generateInventoryPDF:", error);
      pdf.text(`Error generating inventory report data.`, 20, startY);
    }
  };

  const generateCustomersPDF = async (pdf, startY) => {
    try {
      if (typeof pdf.autoTable !== "function") {
        throw new Error(
          "PDF table generation not available. Please check jsPDF autoTable plugin."
        );
      }

      // Calculate customer statistics for PDF
      const customerStats = customers.map((customer) => {
        const customerSales = finalData.sales.filter(
          (sale) =>
            sale.customerId === customer.id ||
            sale.customerName === customer.name
        );
        const totalOrders = customerSales.length;
        const totalSpent = customerSales.reduce(
          (sum, sale) => sum + (sale.totalAmount || 0),
          0
        );
        const averageOrderValue =
          totalOrders > 0 ? totalSpent / totalOrders : 0;

        return {
          ...customer,
          totalOrders,
          totalSpent,
          averageOrderValue,
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

      const tableData = customerStats.map((customer) => [
        customer.name || "N/A",
        customer.email || "N/A",
        customer.phone || "N/A",
        customer.totalOrders.toString(),
        `$${customer.totalSpent.toFixed(2)}`,
        `$${customer.averageOrderValue.toFixed(2)}`,
        customer.lastOrderDate
          ? format(customer.lastOrderDate, "MMM dd, yyyy")
          : "Never",
      ]);

      pdf.autoTable({
        head: [
          [
            "Name",
            "Email",
            "Phone",
            "Orders",
            "Total Spent",
            "Avg Order",
            "Last Order",
          ],
        ],
        body: tableData,
        startY: startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    } catch (error) {
      console.error("Error in generateCustomersPDF:", error);
      pdf.text(`Error generating customers report data.`, 20, startY);
    }
  };

  const generateVendorsPDF = async (pdf, startY) => {
    try {
      if (typeof pdf.autoTable !== "function") {
        throw new Error(
          "PDF table generation not available. Please check jsPDF autoTable plugin."
        );
      }

      const tableData = vendors.map((vendor) => [
        vendor.name || "N/A",
        vendor.email || "N/A",
        vendor.phone || "N/A",
        vendor.address || "N/A",
      ]);

      pdf.autoTable({
        head: [["Name", "Email", "Phone", "Address"]],
        body: tableData,
        startY: startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    } catch (error) {
      console.error("Error in generateVendorsPDF:", error);
      pdf.text(`Error generating vendors report data.`, 20, startY);
    }
  };

  const generateWorkersPDF = async (pdf, startY) => {
    try {
      if (typeof pdf.autoTable !== "function") {
        throw new Error(
          "PDF table generation not available. Please check jsPDF autoTable plugin."
        );
      }

      const tableData = workers.map((worker) => [
        worker.name || "N/A",
        worker.position || "N/A",
        `$${(worker.salary || 0).toFixed(2)}`,
        worker.phone || "N/A",
      ]);

      pdf.autoTable({
        head: [["Name", "Position", "Salary", "Phone"]],
        body: tableData,
        startY: startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    } catch (error) {
      console.error("Error in generateWorkersPDF:", error);
      pdf.text(`Error generating workers report data.`, 20, startY);
    }
  };

  const generateFinancialPDF = async (pdf, startY) => {
    const totalRevenue = finalData.sales.reduce(
      (sum, sale) => sum + (sale.totalAmount || 0),
      0
    );
    const totalExpenses = finalData.purchases.reduce(
      (sum, purchase) => sum + (purchase.totalAmount || 0),
      0
    );
    const totalSalaries = finalData.salaryPayments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );
    const netProfit = totalRevenue - totalExpenses - totalSalaries;

    try {
      if (typeof pdf.autoTable !== "function") {
        throw new Error(
          "PDF table generation not available. Please check jsPDF autoTable plugin."
        );
      }

      const tableData = [
        ["Total Revenue", `$${totalRevenue.toFixed(2)}`],
        ["Total Expenses", `$${totalExpenses.toFixed(2)}`],
        ["Total Salaries", `$${totalSalaries.toFixed(2)}`],
        ["Net Profit", `$${netProfit.toFixed(2)}`],
      ];

      pdf.autoTable({
        head: [["Financial Metric", "Amount"]],
        body: tableData,
        startY: startY,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    } catch (error) {
      console.error("Error in generateFinancialPDF:", error);
      pdf.text(`Error generating financial report data.`, 20, startY);
    }
  };

  const generatePurchasesPDF = async (pdf, startY) => {
    try {
      if (typeof pdf.autoTable !== "function") {
        throw new Error(
          "PDF table generation not available. Please check jsPDF autoTable plugin."
        );
      }

      const tableData = finalData.purchases.map((purchase) => {
        const vendor = vendors.find((v) => v.id === purchase.vendorId);
        const vendorName =
          purchase.vendorName || (vendor ? vendor.name : "Unknown Vendor");

        return [
          format(new Date(purchase.date || Date.now()), "MMM dd, yyyy"),
          vendorName,
          purchase.products?.length || 0,
          `$${(purchase.totalAmount || 0).toFixed(2)}`,
        ];
      });

      pdf.autoTable({
        head: [["Date", "Vendor", "Items", "Amount"]],
        body: tableData,
        startY: startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    } catch (error) {
      console.error("Error in generatePurchasesPDF:", error);
      pdf.text(`Error generating purchases report data.`, 20, startY);
    }
  };

  const generateChecksPDF = async (pdf, startY) => {
    try {
      if (typeof pdf.autoTable !== "function") {
        throw new Error(
          "PDF table generation not available. Please check jsPDF autoTable plugin."
        );
      }

      const tableData = finalData.checks.map((check) => [
        check.checkNumber || "N/A",
        format(new Date(check.date || Date.now()), "MMM dd, yyyy"),
        check.payee || "N/A",
        `$${(check.amount || 0).toFixed(2)}`,
        check.status || "N/A",
      ]);

      pdf.autoTable({
        head: [["Check #", "Date", "Payee", "Amount", "Status"]],
        body: tableData,
        startY: startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    } catch (error) {
      console.error("Error in generateChecksPDF:", error);
      pdf.text(`Error generating checks report data.`, 20, startY);
    }
  };

  const generateStockAlertPDF = async (pdf, startY) => {
    try {
      if (typeof pdf.autoTable !== "function") {
        throw new Error(
          "PDF table generation not available. Please check jsPDF autoTable plugin."
        );
      }

      const lowStockProducts = processedProducts.filter(
        (product) => (product.stock || 0) < 10
      );
      const tableData = lowStockProducts.map((product) => [
        product.name || "N/A",
        product.categoryName || "Uncategorized",
        product.stock || 0,
        product.stock === 0 ? "Out of Stock" : "Low Stock",
      ]);

      pdf.autoTable({
        head: [["Product", "Category", "Stock", "Status"]],
        body: tableData,
        startY: startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [220, 53, 69] },
      });
    } catch (error) {
      console.error("Error in generateStockAlertPDF:", error);
      pdf.text(`Error generating stock alert report data.`, 20, startY);
    }
  };

  const generateProfitLossPDF = async (pdf, startY) => {
    const revenue = finalData.sales.reduce(
      (sum, sale) => sum + (sale.totalAmount || 0),
      0
    );
    const cogs = finalData.purchases.reduce(
      (sum, purchase) => sum + (purchase.totalAmount || 0),
      0
    );
    const expenses =
      finalData.salaryPayments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      ) +
      finalData.workerExpenses.reduce(
        (sum, expense) => sum + (expense.amount || 0),
        0
      );
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenses;

    try {
      if (typeof pdf.autoTable !== "function") {
        throw new Error(
          "PDF table generation not available. Please check jsPDF autoTable plugin."
        );
      }

      const tableData = [
        ["Revenue", `$${revenue.toFixed(2)}`],
        ["Cost of Goods Sold", `$${cogs.toFixed(2)}`],
        ["Gross Profit", `$${grossProfit.toFixed(2)}`],
        ["Operating Expenses", `$${expenses.toFixed(2)}`],
        ["Net Profit", `$${netProfit.toFixed(2)}`],
      ];

      pdf.autoTable({
        head: [["Item", "Amount"]],
        body: tableData,
        startY: startY,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    } catch (error) {
      console.error("Error in generateProfitLossPDF:", error);
      pdf.text(`Error generating profit loss report data.`, 20, startY);
    }
  };

  const renderReport = () => {
    const commonProps = {
      dateRange,
      customers,
      vendors,
      workers,
      categories,
    };

    switch (selectedReport) {
      case "sales":
        return (
          <SalesReport
            sales={finalData.sales}
            workers={workers}
            salaryPayments={finalData.salaryPayments}
            workerExpenses={finalData.workerExpenses}
            workerAttendance={workerAttendance || []}
            {...commonProps}
          />
        );
      case "inventory":
        return (
          <InventoryReport products={processedProducts} {...commonProps} />
        );
      case "customers":
        return (
          <CustomerReport
            customers={customers}
            sales={finalData.sales}
            {...commonProps}
          />
        );
      case "customerDetails":
        return (
          <CustomerDetailReport
            customers={customers}
            sales={finalData.sales}
            {...commonProps}
          />
        );
      case "vendors":
        return (
          <VendorReport
            vendors={vendors}
            purchases={finalData.purchases}
            {...commonProps}
          />
        );
      case "vendorDetails":
        return (
          <VendorDetailReport
            vendors={vendors}
            purchases={finalData.purchases}
            {...commonProps}
          />
        );
      case "workers":
        return (
          <WorkerReport
            workers={workers}
            salaryPayments={finalData.salaryPayments}
            workerExpenses={finalData.workerExpenses}
            {...commonProps}
          />
        );
      case "financial":
        return (
          <FinancialReport
            sales={finalData.sales}
            purchases={finalData.purchases}
            salaryPayments={finalData.salaryPayments}
            workerExpenses={finalData.workerExpenses}
            {...commonProps}
          />
        );
      case "purchases":
        return (
          <PurchaseReport purchases={finalData.purchases} {...commonProps} />
        );
      case "checks":
        return (
          <ChecksReport
            checks={finalData.checks}
            allChecks={checks}
            {...commonProps}
          />
        );
      case "stockAlert":
        return (
          <StockAlertReport products={processedProducts} {...commonProps} />
        );
      case "profitLoss":
        return (
          <ProfitLossReport
            sales={finalData.sales}
            purchases={finalData.purchases}
            salaryPayments={finalData.salaryPayments}
            workerExpenses={finalData.workerExpenses}
            {...commonProps}
          />
        );
      default:
        return <div>Select a report to view</div>;
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Reports Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            🖨️ Print
          </button>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isGenerating ? "⏳ Generating..." : "📄 Export PDF"}
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 flex gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          Select Report Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-3 rounded-lg text-center transition-colors ${
                selectedReport === report.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <div className="text-2xl mb-1">{report.icon}</div>
              <div className="text-sm font-medium">{report.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="bg-white rounded-lg p-6 text-black">
        {renderReport()}
      </div>
    </div>
  );
};

export default ReportsDashboard;
