import React from "react";
import ResponsiveTable, { createMobileCard } from "./ResponsiveTable";

const InvoiceManagement = ({ sales, customers, userRole, currentUserId }) => {
  const filteredSales =
    userRole === "admin"
      ? sales
      : sales.filter((sale) => sale.customerId === currentUserId);

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
