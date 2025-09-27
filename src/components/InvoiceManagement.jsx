import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { formatCurrency } from "../utils/currency";
import ResponsiveTable from "./ResponsiveTable";

const InvoiceManagement = ({
  sales = [],
  customers = [],
  userRole,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSales = useMemo(() => {
    let invoices = sales;

    // For regular users, only show their own invoices
    if (userRole === "user" && currentUserId) {
      invoices = sales.filter((sale) => sale.userId === currentUserId);
    }

    if (!searchTerm) {
      return invoices;
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    return invoices.filter((sale) => {
      return (
        sale.customerName?.toLowerCase().includes(lowercasedFilter) ||
        sale.id?.toLowerCase().includes(lowercasedFilter)
      );
    });
  }, [sales, searchTerm, userRole, currentUserId]);

  const getCustomerEmail = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.email || "N/A";
  };

  const columns = [
    {
      header: "Invoice ID",
      accessor: "id",
      render: (row) => (
        <div className="font-mono text-xs text-gray-600">{row.id}</div>
      ),
    },
    {
      header: "Date",
      accessor: "date",
      render: (row) => (
        <div className="text-sm">
          {format(new Date(row.date), "MMM dd, yyyy")}
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: "customerName",
      render: (row) => (
        <div>
          <div className="font-medium">{row.customerName}</div>
          <div className="text-xs text-gray-500">
            {getCustomerEmail(row.customerId)}
          </div>
        </div>
      ),
    },
    {
      header: "Total Amount",
      accessor: "totalAmount",
      render: (row) => (
        <div className="font-semibold text-green-600">
          {formatCurrency(row.totalAmount)}
        </div>
      ),
    },
    {
      header: "Balance",
      accessor: "balance",
      render: (row) => (
        <div
          className={`font-semibold ${
            row.balance > 0 ? "text-red-600" : "text-gray-700"
          }`}
        >
          {formatCurrency(row.balance)}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "paymentStatus",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.paymentStatus === "paid"
              ? "bg-green-100 text-green-800"
              : row.paymentStatus === "partial"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.paymentStatus}
        </span>
      ),
    },
    {
      header: "Items",
      accessor: "products",
      render: (row) => (
        <div className="text-xs text-gray-500">
          {/* Defensive check to prevent crash if products is undefined */}
          {(row.products || []).map((p) => p.name).join(", ")}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Invoice Management
      </h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by customer name or invoice ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <ResponsiveTable columns={columns} data={filteredSales} keyField="id" />
      {filteredSales.length === 0 && (
        <div className="text-center py-8 text-gray-500">No invoices found.</div>
      )}
    </div>
  );
};

export default InvoiceManagement;
