import React, { useState } from "react";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/currency";

const ChecksReport = ({ checks = [], allChecks = [], dateRange }) => {
  const [showAllChecks, setShowAllChecks] = useState(false);

  // Remove debug logging

  // Use all checks if showAllChecks is true, otherwise use the filtered checks
  const displayChecks = showAllChecks ? allChecks : checks;

  const totalChecks = displayChecks.length;
  const totalAmount = displayChecks.reduce(
    (sum, check) => sum + (check.amount || 0),
    0
  );
  const pendingChecks = displayChecks.filter(
    (check) => (check.status || "pending") === "pending"
  ).length;
  const clearedChecks = displayChecks.filter(
    (check) => (check.status || "pending") === "cleared"
  ).length;

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

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setShowAllChecks(false)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            !showAllChecks
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📅 Date Range ({checks.length} checks)
        </button>
        <button
          onClick={() => setShowAllChecks(true)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            showAllChecks
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📋 All Checks ({allChecks.length} checks)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-blue-800">Total Checks</h3>
          <p className="text-2xl font-bold text-blue-600">{totalChecks}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-green-800">Total Amount</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalAmount)}
          </p>
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
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Check Number
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Date
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Payee
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  Amount
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {displayChecks.map((check, index) => (
                <tr
                  key={check.id || index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {check.checkNumber || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {format(new Date(check.date || Date.now()), "MMM dd, yyyy")}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {check.payee || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    {formatCurrency(check.amount || 0)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        check.status === "cleared"
                          ? "bg-green-100 text-green-800"
                          : check.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {check.status || "Pending"}
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
