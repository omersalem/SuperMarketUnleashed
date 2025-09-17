import React from 'react';

const InvoiceManagement = ({ sales, userRole, currentUserId }) => {
  const filteredSales = userRole === 'admin' 
    ? sales 
    : sales.filter(sale => sale.customerId === currentUserId);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Invoice Management</h2>
      
      {filteredSales.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table className="min-w-full bg-gray-800">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-700 text-left">Invoice ID</th>
              <th className="py-2 px-4 border-b border-gray-700 text-left">Customer ID</th>
              <th className="py-2 px-4 border-b border-gray-700 text-left">Date</th>
              <th className="py-2 px-4 border-b border-gray-700 text-left">Total Amount</th>
              <th className="py-2 px-4 border-b border-gray-700 text-left">Items</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(sale => (
              <tr key={sale.id}>
                <td className="py-2 px-4 border-b border-gray-700">{sale.id}</td>
                <td className="py-2 px-4 border-b border-gray-700">{sale.customerId}</td>
                <td className="py-2 px-4 border-b border-gray-700">{new Date(sale.date).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b border-gray-700">${sale.totalAmount.toFixed(2)}</td>
                <td className="py-2 px-4 border-b border-gray-700">
                  <ul>
                    {sale.items.map((item, index) => (
                      <li key={index}>{item.name} ({item.quantity} x ${item.priceAtSale.toFixed(2)})</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InvoiceManagement;
