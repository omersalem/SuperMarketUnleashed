import React from "react";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/currency";

const ProfitLossReport = ({ sales = [], purchases = [], salaryPayments = [], workerExpenses = [], dateRange }) => {
  // Revenue calculation
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  
  // Cost of Goods Sold (COGS)
  const totalCOGS = purchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);
  
  // Operating Expenses
  const totalSalaries = salaryPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalWorkerExpenses = workerExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const totalOperatingExpenses = totalSalaries + totalWorkerExpenses;
  
  // Profit calculations
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalOperatingExpenses;
  
  // Margins
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Profit & Loss Statement</h1>
        <p className="text-gray-600">
          Period: {format(new Date(dateRange.startDate), "MMM dd, yyyy")} -{" "}
          {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
        </p>
        <p className="text-sm text-gray-500">
          Generated on: {format(new Date(), "MMM dd, yyyy HH:mm")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profit & Loss Statement */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Income Statement</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-green-700">Revenue</span>
              <span className="font-bold text-green-700">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-red-600 ml-4">Cost of Goods Sold</span>
              <span className="text-red-600">-{formatCurrency(totalCOGS)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-b bg-blue-50">
              <span className="font-medium text-blue-700">Gross Profit</span>
              <span className="font-bold text-blue-700">{formatCurrency(grossProfit)}</span>
            </div>
            <div className="ml-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-red-600">Salaries</span>
                <span className="text-red-600">-{formatCurrency(totalSalaries)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600">Other Expenses</span>
                <span className="text-red-600">-{formatCurrency(totalWorkerExpenses)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-b bg-gray-50">
              <span className="font-medium">Total Operating Expenses</span>
              <span className="font-medium text-red-600">-{formatCurrency(totalOperatingExpenses)}</span>
            </div>
            <div className={`flex justify-between items-center py-3 border-t-2 ${
              netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className="font-bold text-lg">Net Profit</span>
              <span className={`font-bold text-lg ${
                netProfit >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Gross Margin</div>
              <div className="text-2xl font-bold text-green-700">{grossMargin.toFixed(1)}%</div>
            </div>
            <div className={`p-4 rounded-lg ${netProfit >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
              <div className={`text-sm font-medium ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                Net Margin
              </div>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {netMargin.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 font-medium">Revenue per Transaction</div>
              <div className="text-2xl font-bold text-gray-700">
                {sales.length > 0 ? formatCurrency(totalRevenue / sales.length) : formatCurrency(0)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Total Transactions</div>
              <div className="text-2xl font-bold text-purple-700">{sales.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Detailed Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-right">% of Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-green-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Total Revenue</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">100.0%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Cost of Goods Sold</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                  {formatCurrency(totalCOGS)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {totalRevenue > 0 ? ((totalCOGS / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Salaries</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                  {formatCurrency(totalSalaries)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {totalRevenue > 0 ? ((totalSalaries / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Other Expenses</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                  {formatCurrency(totalWorkerExpenses)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {totalRevenue > 0 ? ((totalWorkerExpenses / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr className={netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}>
                <td className="border border-gray-300 px-4 py-2 font-bold">Net Profit</td>
                <td className={`border border-gray-300 px-4 py-2 text-right font-bold ${
                  netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(netProfit)}
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

export default ProfitLossReport;
