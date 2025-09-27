import React, { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
} from "date-fns";
import {
  addWorkerExpense,
  addWorkerAttendance,
} from "../../firebase/firestore";
import { formatCurrency } from "../../utils/currency";

const SalesReport = ({
  sales,
  customers,
  dateRange,
  workers = [],
  salaryPayments = [],
  workerExpenses = [],
  workerAttendance = [],
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedWorker, setSelectedWorker] = useState("");
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [newAttendance, setNewAttendance] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    status: "absent",
    reason: "",
  });

  // Helper functions
  const getCustomerName = (sale) => {
    if (sale.customerName) return sale.customerName;
    if (sale.customerId && customers) {
      const customer = customers.find((c) => c.id === sale.customerId);
      return customer ? customer.name : "Walk-in Customer";
    }
    return "Walk-in Customer";
  };

  // Sales calculations
  const totalRevenue = sales.reduce(
    (sum, sale) => sum + (sale.totalAmount || 0),
    0
  );
  const totalTransactions = sales.length;
  const averageOrderValue =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Worker statistics with expense and attendance tracking
  const workerStats = useMemo(() => {
    return workers.map((worker) => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      // Get all days in the month
      const allDaysInMonth = eachDayOfInterval({
        start: monthStart,
        end: monthEnd,
      });

      // Calculate working days (exclude weekends)
      const workingDays = allDaysInMonth.filter((day) => !isWeekend(day));

      // Total days in month for reference
      const totalDaysInMonth = allDaysInMonth.length;

      // Monthly expenses
      const monthlyExpenses = workerExpenses.filter((exp) => {
        const expenseDate = new Date(exp.date);
        return (
          exp.workerId === worker.id &&
          expenseDate >= monthStart &&
          expenseDate <= monthEnd
        );
      });

      // Monthly absences
      const monthlyAbsences = workerAttendance.filter((att) => {
        const attDate = new Date(att.date);
        return (
          att.workerId === worker.id &&
          attDate >= monthStart &&
          attDate <= monthEnd &&
          att.status === "absent"
        );
      });

      // Calculations based on actual working days in the specific month
      const totalMonthlyExpenses = monthlyExpenses.reduce(
        (sum, exp) => sum + (parseFloat(exp.amount) || 0),
        0
      );
      const monthlySalary = worker.salary || 0;

      // Calculate daily salary based on actual working days in this specific month
      const dailySalary =
        workingDays.length > 0 ? monthlySalary / workingDays.length : 0;

      // Calculate absence deduction based on actual absent working days
      const absentWorkingDays = monthlyAbsences.filter((absence) => {
        const absenceDate = new Date(absence.date);
        return !isWeekend(absenceDate); // Only count absences on working days
      }).length;

      const absenceDeduction = absentWorkingDays * dailySalary;
      const remainingSalary =
        monthlySalary - totalMonthlyExpenses - absenceDeduction;

      return {
        ...worker,
        totalMonthlyExpenses,
        monthlyAbsences,
        absenceDeduction,
        remainingSalary,
        workingDaysCount: workingDays.length,
        totalDaysInMonth,
        absentWorkingDays,
        dailySalary,
      };
    });
  }, [workers, workerExpenses, workerAttendance, currentMonth]);

  // Event handlers
  const handleAddExpense = async () => {
    if (!selectedWorker || !newExpense.amount || !newExpense.description) {
      alert("Please fill in all expense fields");
      return;
    }

    try {
      await addWorkerExpense({
        workerId: selectedWorker,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        date: newExpense.date,
        createdAt: new Date().toISOString(),
      });

      setNewExpense({
        amount: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
      alert("Expense added successfully!");
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Error adding expense. Please try again.");
    }
  };

  const handleAddAttendance = async () => {
    if (!selectedWorker || !newAttendance.date) {
      alert("Please select worker and date");
      return;
    }

    try {
      await addWorkerAttendance({
        workerId: selectedWorker,
        date: newAttendance.date,
        status: newAttendance.status,
        reason: newAttendance.reason,
        createdAt: new Date().toISOString(),
      });

      setNewAttendance({
        date: format(new Date(), "yyyy-MM-dd"),
        status: "absent",
        reason: "",
      });
      alert("Attendance record added successfully!");
    } catch (error) {
      console.error("Error adding attendance:", error);
      alert("Error adding attendance record. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Enhanced Sales Report with Worker Management
        </h1>
        <p className="text-gray-600">
          Period: {format(new Date(dateRange.startDate), "MMM dd, yyyy")} -{" "}
          {format(new Date(dateRange.endDate), "MMM dd, yyyy")}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
        {["overview", "workers", "expenses", "attendance"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {tab === "overview" && "📊 Sales Overview"}
            {tab === "workers" && "👷 Worker Management"}
            {tab === "expenses" && "💰 Expenses"}
            {tab === "attendance" && "📅 Attendance"}
          </button>
        ))}
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center space-x-4 bg-gray-800/40 p-4 rounded-lg border border-gray-700">
        <label className="text-sm font-medium text-gray-200">View Month:</label>
        <input
          type="month"
          value={format(currentMonth, "yyyy-MM")}
          onChange={(e) => setCurrentMonth(new Date(e.target.value + "-01"))}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-blue-800">Total Revenue</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-green-800">
                Total Transactions
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {totalTransactions}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-purple-800">
                Average Order Value
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(averageOrderValue)}
              </p>
            </div>
          </div>

          {/* Quick Sales Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Recent Sales Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Customer
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(0, 10).map((sale, index) => (
                    <tr
                      key={sale.id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {format(
                          new Date(sale.date || Date.now()),
                          "MMM dd, yyyy"
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {getCustomerName(sale)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-medium text-green-600">
                        {formatCurrency(sale.totalAmount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Workers Tab */}
      {activeTab === "workers" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">
            Worker Salary Management
          </h3>

          {/* Calculation Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-2">
              📋 Calculation Method
            </h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>
                • <strong>Total Days in Month:</strong> Actual calendar days
                (28-31 depending on month)
              </p>
              <p>
                • <strong>Working Days:</strong> Total days minus weekends
                (Saturdays & Sundays)
              </p>
              <p>
                • <strong>Daily Salary:</strong> Monthly Salary ÷ Working Days
                (varies by month)
              </p>
              <p>
                • <strong>Absence Deduction:</strong> Only working day absences
                are deducted
              </p>
              <p>
                • <strong>Remaining Salary:</strong> Monthly Salary - Expenses -
                (Absent Working Days × Daily Salary)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workerStats.map((worker) => (
              <div
                key={worker.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-100">
                    {worker.name}
                  </h4>
                  <span className="text-sm text-gray-400">
                    {worker.position}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Monthly Salary:</span>
                    <span className="font-medium text-green-500">
                      {formatCurrency(worker.salary || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Days in Month:</span>
                    <span className="font-medium text-gray-200">
                      {worker.totalDaysInMonth}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-300">Working Days:</span>
                    <span className="font-medium text-gray-200">
                      {worker.workingDaysCount}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-300">Daily Salary:</span>
                    <span className="font-medium text-blue-400">
                      {formatCurrency(worker.dailySalary)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-300">Monthly Expenses:</span>
                    <span className="font-medium text-red-400">
                      -{formatCurrency(worker.totalMonthlyExpenses)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      Absences ({worker.absentWorkingDays} working days):
                    </span>
                    <span className="font-medium text-red-400">
                      -{formatCurrency(worker.absenceDeduction)}
                    </span>
                  </div>

                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-100">
                        Remaining Salary:
                      </span>
                      <span
                        className={`font-bold text-lg ${
                          worker.remainingSalary >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatCurrency(worker.remainingSalary)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Worker Expenses Management
          </h3>

          {/* Add New Expense Form */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">
              Add New Expense
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Worker</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Amount"
              />

              <input
                type="text"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description"
              />

              <button
                onClick={handleAddExpense}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Add Expense
              </button>
            </div>
          </div>

          {/* Recent Expenses */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Recent Expenses</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Worker
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workerExpenses
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 10)
                    .map((expense, index) => {
                      const worker = workers.find(
                        (w) => w.id === expense.workerId
                      );
                      return (
                        <tr
                          key={expense.id || index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="border border-gray-300 px-4 py-2">
                            {format(new Date(expense.date), "MMM dd, yyyy")}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {worker?.name || "Unknown Worker"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {expense.description}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-medium text-red-600">
                            {formatCurrency(expense.amount || 0)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Worker Attendance Management
          </h3>

          {/* Add New Attendance Record Form */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-red-800 mb-4">
              Record Absence
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Worker</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={newAttendance.date}
                onChange={(e) =>
                  setNewAttendance((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <input
                type="text"
                value={newAttendance.reason}
                onChange={(e) =>
                  setNewAttendance((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Reason for absence"
              />

              <button
                onClick={handleAddAttendance}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Record Absence
              </button>
            </div>
          </div>

          {/* Recent Attendance Records */}
          <div>
            <h4 className="text-lg font-semibold mb-3">
              Recent Attendance Records
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Worker
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Status
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workerAttendance
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 10)
                    .map((record, index) => {
                      const worker = workers.find(
                        (w) => w.id === record.workerId
                      );
                      return (
                        <tr
                          key={record.id || index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="border border-gray-300 px-4 py-2">
                            {format(new Date(record.date), "MMM dd, yyyy")}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {worker?.name || "Unknown Worker"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === "absent"
                                  ? "bg-red-100 text-red-800"
                                  : record.status === "late"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {record.status.charAt(0).toUpperCase() +
                                record.status.slice(1).replace("_", " ")}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {record.reason || "No reason provided"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
