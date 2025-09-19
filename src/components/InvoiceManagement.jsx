import React, { useState, useMemo } from "react";
import ResponsiveTable, { createMobileCard } from "./ResponsiveTable";
import { format } from "date-fns";

const InvoiceManagement = ({ sales, customers, userRole, currentUserId }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Apply date range filter
      if (startDate && endDate) {
        const saleDate = new Date(sale.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (saleDate < start || saleDate > end) {
          return false;
        }
      }
      return true;
    });
  }, [sales, startDate, endDate]);

  // Calculate total amounts based on filtered sales
  const totalInvoices = filteredSales.length;
  const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalPaidAmount = filteredSales.reduce((sum, sale) => sum + sale.amountPaid, 0);
  const totalBalance = filteredSales.reduce((sum, sale) => sum + sale.balance, 0);

  // Create mobile card component for invoices
  const InvoiceMobileCard = createMobileCard(({ item: sale, index }) => {
    const customer = customers?.find((c) => c.id === sale.customerId);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">
            INV-{String(index + 1).padStart(3, "0")}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Customer:</span>
            <p className="text-white font-medium">
              {customer ? customer.name : "Unknown Customer"}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Date:</span>
            <p className="text-white font-medium">
              {new Date(sale.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Total Amount:</span>
            <p className="text-green-400 font-medium">
              ₪{sale.totalAmount.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Items:</span>
            <p className="text-blue-400 font-medium">
              {sale.items.length} item(s)
            </p>
          </div>
        </div>

        <div className="mt-3">
          <span className="text-gray-400 text-sm">Items Detail:</span>
          <div className="mt-2 space-y-1">
            {sale.items.map((item, index) => (
              <div
                key={index}
                className="text-sm text-white bg-gray-700 p-2 rounded"
              >
                {item.name} - {item.quantity} × ₪{item.priceAtSale.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  });

  // Table columns configuration
  const tableColumns = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      render: (invoice, index) => `INV-${String(index + 1).padStart(3, "0")}`,
    },
    {
      key: "customerName",
      label: "Customer Name",
      render: (invoice) => {
        const customer = customers.find((c) => c.id === invoice.customerId);
        return customer ? customer.name : "Unknown Customer";
      },
    },
    {
      key: "date",
      label: "Date",
      render: (sale) => new Date(sale.date).toLocaleDateString(),
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      render: (sale) => (
        <span className="text-green-400 font-medium">
          ₪{sale.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (sale) => (
        <ul className="text-sm">
          {sale.items.map((item, index) => (
            <li key={index} className="mb-1">
              {item.name} ({item.quantity} × ₪{item.priceAtSale.toFixed(2)})
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg mt-4 sm:mt-8 max-w-full overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">
        Invoice Management
      </h2>
      
      {/* Summary Section */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-300">Total Invoices</p>
            <p className="text-xl font-bold text-purple-400">{totalInvoices}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-300">Total Sales Amount</p>
            <p className="text-xl font-bold text-green-400">₪{totalSalesAmount.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-300">Total Paid Amount</p>
            <p className="text-xl font-bold text-blue-400">₪{totalPaidAmount.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-300">Total Balance</p>
            <p className="text-xl font-bold text-red-400">₪{totalBalance.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      {/* Date Filter */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <h3 className="text-lg font-semibold text-white mb-2 sm:mb-0">Filter by Date Range</h3>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-500 transition-colors"
          >
            Clear Filter
          </button>
        </div>
        
        {startDate && endDate && (
          <div className="text-sm text-green-400 mb-3">
            Showing from {format(new Date(startDate), "MMM dd, yyyy")} to {format(new Date(endDate), "MMM dd, yyyy")}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            />
          </div>
        </div>
      </div>

      <ResponsiveTable
        data={filteredSales}
        columns={tableColumns}
        MobileCard={InvoiceMobileCard}
        emptyMessage="No invoices found."
      />
    </div>
  );
};

export default InvoiceManagement;
