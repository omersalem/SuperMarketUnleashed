import React from "react";
import { format } from "date-fns";

const ChecksReport = ({ checks = [], dateRange }) => {
  const totalChecks = checks.length;
  const totalAmount = checks.reduce((sum, check) => sum + (check.amount || 0), 0);
  const pendingChecks = checks.filter(check => check.status === 'pending').length;
  const clearedChecks = checks.filter(check => check.status === 'cleared').length;

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Checks Report</h1>
        <p className="text-gray-600">
          Period: {format(new Date(dateRange.startDate), "MMM dd, yyyy")} -{" "}
          {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
        </p>
        <p className="text-sm text-gray-500">
          Generated on: {format(new Date(), "MMM dd, yyyy HH:mm")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-blue-800">Total Checks</h3>
          <p className="text-2xl font-bold text-blue-600">{totalChecks}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-green-800">Total Amount</h3>
          <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-yellow-800">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{pendingChecks}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-purple-800">Cleared</h3>
          <p className="text-2xl font-bold text-purple-600">{clearedChecks}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Check Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Check Number</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Payee</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check, index) => (
                <tr key={check.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-4 py-2">{check.checkNumber || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {format(new Date(check.date || Date.now()), "MMM dd, yyyy")}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{check.payee || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    ${(check.amount || 0).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded text-sm ${
                      check.status === 'cleared' ? 'bg-green-100 text-green-800' :
                      check.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {check.status || 'Unknown'}
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
};

export default ChecksReport;
