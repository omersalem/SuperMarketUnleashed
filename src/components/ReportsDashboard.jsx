import React, { useState, useMemo } from "react";
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
  setProducts,
  setSales,
  onLoadingChange,
  userRole,
}) => {
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 12), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const reportRef = React.useRef();

  // Handle date changes with loading animation
  const handleDateChange = async (field, value) => {
    setIsLoadingData(true);

    // Simulate processing time for better UX
    setTimeout(() => {
      setDateRange((prev) => ({ ...prev, [field]: value }));
      setIsLoadingData(false);
    }, 300);
  };

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

  // Fast lookup for categories by id and by name (defensive)
  const categoriesMap = useMemo(() => {
    const byId = new Map();
    const byName = new Map();
    (categories || []).forEach((c) => {
      if (!c) return;
      const id = c.id != null ? String(c.id).trim() : null;
      const name = (c.name || "").trim();
      if (id) byId.set(id, name || "Uncategorized");
      if (name) byName.set(name.toLowerCase(), name);
    });
    return { byId, byName };
  }, [categories]);

  // Helper function to get category name (robust to different product shapes/legacy data)
  const getCategoryName = (product) => {
    if (!product) return "Uncategorized";

    // 1) Already computed fields
    if (
      typeof product.categoryName === "string" &&
      product.categoryName.trim()
    ) {
      return product.categoryName.trim();
    }

    // 2) Direct string category on product
    if (typeof product.category === "string" && product.category.trim()) {
      return product.category.trim();
    }

    // 3) Object category with name property
    if (
      product.category &&
      typeof product.category === "object" &&
      typeof product.category.name === "string"
    ) {
      const nm = product.category.name.trim();
      if (nm) return nm;
    }

    // 4) Try to resolve via possible id fields
    const candidates = [];
    const pushId = (val) => {
      if (val == null) return;
      if (typeof val === "string" || typeof val === "number") {
        candidates.push(String(val).trim());
      } else if (typeof val === "object") {
        if (val.id) candidates.push(String(val.id).trim());
        // Firestore ref-like shape
        if (
          val._key &&
          val._key.path &&
          Array.isArray(val._key.path.segments)
        ) {
          const segs = val._key.path.segments;
          candidates.push(String(segs[segs.length - 1]).trim());
        }
        if (val.path && typeof val.path === "string") {
          const parts = val.path.split("/");
          candidates.push(parts[parts.length - 1].trim());
        }
      }
    };

    pushId(product.categoryId);
    pushId(product.categoryID);
    pushId(product.category_id);
    pushId(product.categoryRef);
    pushId(product.category_ref);

    // Resolve against categories map by id first
    for (const id of candidates) {
      if (categoriesMap.byId.has(id)) {
        return categoriesMap.byId.get(id);
      }
    }

    // 5) Fallback: if product has a category string that doesn't match id, try name lookup (case-insensitive)
    if (typeof product.category === "string" && product.category.trim()) {
      const key = product.category.trim().toLowerCase();
      if (categoriesMap.byName.has(key)) {
        return categoriesMap.byName.get(key);
      }
    }

    return "Uncategorized";
  };

  // Process products to include category names (recomputes when products or categories change)
  const processedProducts = useMemo(() => {
    return (products || []).map((product) => {
      const categoryName = getCategoryName(product);
      return { ...product, categoryName };
    });
  }, [products, categoriesMap, categories]);

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
          `₪${(sale.totalAmount || 0).toFixed(2)}`,
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
        `₪${Number(product.price || 0).toFixed(2)}`,
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
        `₪${customer.totalSpent.toFixed(2)}`,
        `₪${customer.averageOrderValue.toFixed(2)}`,
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
    <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Reports Dashboard
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            disabled={isGenerating || isLoadingData}
            className="bg-green-500 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors w-full sm:w-auto"
          >
            🖨️ Print
          </button>
          <button
            onClick={generatePDF}
            disabled={isGenerating || isLoadingData}
            className="bg-red-500 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors w-full sm:w-auto"
          >
            {isGenerating ? "⏳ Generating..." : "📄 Export PDF"}
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
          Date Range
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-white mb-2">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                disabled={isLoadingData}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              {isLoadingData && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-white mb-2">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                disabled={isLoadingData}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              {isLoadingData && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          {/* Quick Date Range Buttons */}
          <div className="flex flex-wrap gap-2 lg:ml-4">
            <button
              onClick={() => {
                const newRange = {
                  startDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
                  endDate: format(new Date(), "yyyy-MM-dd"),
                };
                setIsLoadingData(true);
                setTimeout(() => {
                  setDateRange(newRange);
                  setIsLoadingData(false);
                }, 300);
              }}
              disabled={isLoadingData}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
            >
              7 Days
            </button>
            <button
              onClick={() => {
                const newRange = {
                  startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
                  endDate: format(new Date(), "yyyy-MM-dd"),
                };
                setIsLoadingData(true);
                setTimeout(() => {
                  setDateRange(newRange);
                  setIsLoadingData(false);
                }, 300);
              }}
              disabled={isLoadingData}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
            >
              1 Month
            </button>
            <button
              onClick={() => {
                const newRange = {
                  startDate: format(subMonths(new Date(), 12), "yyyy-MM-dd"),
                  endDate: format(new Date(), "yyyy-MM-dd"),
                };
                setIsLoadingData(true);
                setTimeout(() => {
                  setDateRange(newRange);
                  setIsLoadingData(false);
                }, 300);
              }}
              disabled={isLoadingData}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
            >
              1 Year
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
          Select Report Type
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              disabled={isLoadingData}
              className={`p-3 rounded-lg text-center transition-all duration-200 touch-manipulation min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedReport === report.id
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:transform hover:scale-102"
              }`}
            >
              <div className="text-xl sm:text-2xl mb-1">{report.icon}</div>
              <div className="text-xs sm:text-sm font-medium leading-tight">
                {report.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoadingData && (
        <div className="relative">
          <div className="absolute inset-0 bg-gray-800 bg-opacity-75 rounded-lg z-10 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-white text-sm font-medium">
                Updating report data...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div
        ref={reportRef}
        className={`report-surface bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-lg p-3 sm:p-6 text-gray-100 transition-opacity duration-300 ${
          isLoadingData ? "opacity-50" : "opacity-100"
        }`}
      >
        {renderReport()}
      </div>
    </div>
  );
};

export default ReportsDashboard;
