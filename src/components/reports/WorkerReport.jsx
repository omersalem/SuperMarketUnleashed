import React from "react";
import { format } from "date-fns";

const WorkerReport = ({ workers = [], salaryPayments = [], workerExpenses = [], dateRange }) => {
  // Calculate worker statistics
  const workerStats = workers.map(worker => {
    const workerSalaryPayments = salaryPayments.filter(payment => payment.workerId === worker.id);
    const workerExpensesData = workerExpenses.filter(expense => expense.workerId === worker.id);
    
    const totalSalaryPaid = workerSalaryPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalExpenses = workerExpensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalPayments = workerSalaryPayments.length;
    
    return {
      ...worker,
      totalSalaryPaid,
      totalExpenses,
      totalPayments,
      lastPaymentDate: workerSalaryPayments.length > 0 
        ? new Date(Math.max(...workerSalaryPayments.map(p => new Date(p.date || Date.now()))))
        : null
    };
  });

  const totalWorkers = workers.length;
  const totalSalariesPaid = workerStats.reduce((sum, w) => sum + w.totalSalaryPaid, 0);
  const totalExpensesPaid = workerStats.reduce((sum, w) => sum + w.totalExpenses, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Worker Report</h1>
        <p className="text-gray-600">
          Period: {format(new Date(dateRange.startDate), "MMM dd, yyyy")} -{" "}
          {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
        </p>
        <p className="text-sm text-gray-500">
          Generated on: {format(new Date(), "MMM dd, yyyy HH:mm")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-blue-800">Total Workers</h3>
          <p className="text-2xl font-bold text-blue-600">{totalWorkers}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-green-800">Salaries Paid</h3>
          <p className="text-2xl font-bold text-green-600">${totalSalariesPaid.toFixed(2)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-purple-800">Expenses Paid</h3>
          <p className="text-2xl font-bold text-purple-600">${totalExpensesPaid.toFixed(2)}</p>
        </div>
      </div>

      {/* Worker Details Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Worker Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Position</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Base Salary</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Total Paid</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Expenses</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Payments</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Last Payment</th>
              </tr>
            </thead>
            <tbody>
              {workerStats.map((worker, index) => (
                <tr key={worker.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-4 py-2">{worker.name || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">{worker.position || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    ${(worker.salary || 0).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    ${worker.totalSalaryPaid.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    ${worker.totalExpenses.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{worker.totalPayments}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {worker.lastPaymentDate 
                      ? format(worker.lastPaymentDate, "MMM dd, yyyy")
                      : 'Never'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Salary Payments */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Salary Payments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Worker</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {salaryPayments.slice(0, 20).map((payment, index) => {
                const worker = workers.find(w => w.id === payment.workerId);
                return (
                  <tr key={payment.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-4 py-2">
                      {format(new Date(payment.date || Date.now()), "MMM dd, yyyy")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {worker ? worker.name : 'Unknown Worker'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      ${(payment.amount || 0).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {payment.notes || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerReport;
