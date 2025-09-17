import React from "react";
import { format } from "date-fns";

const FinancialReport = ({ sales = [], purchases = [], salaryPayments = [], workerExpenses = [], dateRange }) => {
  // Calculate financial metrics
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalCOGS = purchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);
  const totalSalaries = salaryPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalExpenses = workerExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  
  const grossProfit = totalRevenue - totalCOGS;
  const totalOperatingExpenses = totalSalaries + totalExpenses;
  const netProfit = grossProfit - totalOperatingExpenses;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Financial Report</h1>
        <p className="text-gray-600">
          Period: {format(new Date(dateRange.startDate), "MMM dd, yyyy")} -{" "}
          {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
        </p>
        <p className="text-sm text-gray-500">
          Generated on: {format(new Date(), "MMM dd, yyyy HH:mm")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-green-800">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-blue-800">Gross Profit</h3>
          <p className="text-2xl font-bold text-blue-600">${grossProfit.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-red-800">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">${totalOperatingExpenses.toFixed(2)}</p>
        </div>
        <div className={`p-4 rounded-lg border ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className={`font-semibold ${netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>Net Profit</h3>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netProfit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Financial Summary Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Financial Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-right">% of Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-green-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Revenue</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-bold text-green-600">
                  ${totalRevenue.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">100.0%</td>
              </tr>
              <tr className="bg-red-50">
                <td className="border border-gray-300 px-4 py-2">Cost of Goods Sold</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                  ${totalCOGS.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {totalRevenue > 0 ? ((totalCOGS / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Gross Profit</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-bold text-blue-600">
                  ${grossProfit.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                  {grossMargin.toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Salaries</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  ${totalSalaries.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {totalRevenue > 0 ? ((totalSalaries / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Other Expenses</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  ${totalExpenses.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr className="bg-red-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Total Operating Expenses</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-bold text-red-600">
                  ${totalOperatingExpenses.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                  {totalRevenue > 0 ? ((totalOperatingExpenses / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr className={netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}>
                <td className="border border-gray-300 px-4 py-2 font-bold">Net Profit</td>
                <td className={`border border-gray-300 px-4 py-2 text-right font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netProfit.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                  {netMargin.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;
