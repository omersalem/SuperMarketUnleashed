import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
} from "date-fns";
import AddWorkerModal from "./AddWorkerModal";
import EditWorkerModal from "./EditWorkerModal";
import {
  addWorker,
  updateWorker,
  deleteWorker,
  addWorkerExpense,
  updateWorkerExpense,
  deleteWorkerExpense,
  addWorkerAttendance,
  updateWorkerAttendance,
  deleteWorkerAttendance,
} from "../firebase/firestore";

const WorkerManagement = ({
  workers,
  setWorkers,
  salaryPayments,
  setSalaryPayments,
  workerExpenses,
  setWorkerExpenses,
  workerAttendance,
  setWorkerAttendance,
}) => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview"); // overview, expenses, attendance

  // Expense form states
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  // Attendance states
  const [attendanceDate, setAttendanceDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [attendanceStatus, setAttendanceStatus] = useState("absent");
  const [attendanceReason, setAttendanceReason] = useState("");

  // Calculate worker statistics
  const workerStats = useMemo(() => {
    return workers.map((worker) => {
      const workerExpensesList = workerExpenses.filter(
        (exp) => exp.workerId === worker.id
      );
      const workerAttendanceList = workerAttendance.filter(
        (att) => att.workerId === worker.id
      );
      const workerPayments = salaryPayments.filter(
        (pay) => pay.workerId === worker.id
      );

      // Calculate current month statistics
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const workingDays = monthDays.filter((day) => !isWeekend(day));

      // Monthly expenses
      const monthlyExpenses = workerExpensesList.filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate <= monthEnd;
      });
      const totalMonthlyExpenses = monthlyExpenses.reduce(
        (sum, exp) => sum + (exp.amount || 0),
        0
      );

      // Monthly attendance
      const monthlyAbsences = workerAttendanceList.filter((att) => {
        const attDate = new Date(att.date);
        return (
          attDate >= monthStart &&
          attDate <= monthEnd &&
          att.status === "absent"
        );
      });

      // Calculate daily salary
      const monthlySalary = worker.salary || 0;
      const dailySalary = monthlySalary / workingDays.length;

      // Calculate deductions
      const absenceDeduction = monthlyAbsences.length * dailySalary;
      const totalDeductions = totalMonthlyExpenses + absenceDeduction;

      // Calculate remaining salary
      const remainingSalary = monthlySalary - totalDeductions;

      return {
        ...worker,
        monthlyExpenses: totalMonthlyExpenses,
        monthlyAbsences: monthlyAbsences.length,
        workingDays: workingDays.length,
        dailySalary,
        absenceDeduction,
        totalDeductions,
        remainingSalary,
        expensesList: workerExpensesList,
        attendanceList: workerAttendanceList,
      };
    });
  }, [workers, workerExpenses, workerAttendance, salaryPayments, currentMonth]);

  const selectedWorkerStats = useMemo(() => {
    return workerStats.find((w) => w.id === selectedWorkerId) || null;
  }, [workerStats, selectedWorkerId]);

  const handleEdit = (worker) => {
    setSelectedWorker(worker);
    setIsEditModalOpen(true);
  };

  const handleAdd = async (worker) => {
    try {
      const newWorker = await addWorker(worker);
      setWorkers([...workers, newWorker]);
    } catch (error) {
      console.error("Error adding worker: ", error);
    }
  };

  const handleUpdate = async (id, worker) => {
    try {
      await updateWorker(id, worker);
      setWorkers(workers.map((w) => (w.id === id ? { id, ...worker } : w)));
    } catch (error) {
      console.error("Error updating worker: ", error);
    }
  };

  const handleDelete = async (workerId) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      try {
        await deleteWorker(workerId);
        setWorkers(workers.filter((worker) => worker.id !== workerId));
      } catch (error) {
        console.error("Error deleting worker: ", error);
      }
    }
  };

  // Expense handlers
  const handleAddExpense = async () => {
    if (!selectedWorkerId || !expenseAmount || !expenseDescription) {
      alert("Please fill all expense fields");
      return;
    }

    try {
      const expense = {
        workerId: selectedWorkerId,
        amount: parseFloat(expenseAmount),
        description: expenseDescription,
        date: expenseDate,
        createdAt: new Date().toISOString(),
      };

      const newExpense = await addWorkerExpense(expense);
      setWorkerExpenses([...workerExpenses, newExpense]);

      // Reset form
      setExpenseAmount("");
      setExpenseDescription("");
      setExpenseDate(format(new Date(), "yyyy-MM-dd"));

      alert("Expense added successfully!");
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Error adding expense");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteWorkerExpense(expenseId);
        setWorkerExpenses(workerExpenses.filter((exp) => exp.id !== expenseId));
        alert("Expense deleted successfully!");
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("Error deleting expense");
      }
    }
  };

  // Attendance handlers
  const handleAddAttendance = async () => {
    if (!selectedWorkerId || !attendanceDate) {
      alert("Please select worker and date");
      return;
    }

    // Check if attendance already exists for this date
    const existingAttendance = workerAttendance.find(
      (att) => att.workerId === selectedWorkerId && att.date === attendanceDate
    );

    if (existingAttendance) {
      alert("Attendance record already exists for this date");
      return;
    }

    try {
      const attendance = {
        workerId: selectedWorkerId,
        date: attendanceDate,
        status: attendanceStatus,
        reason: attendanceReason,
        createdAt: new Date().toISOString(),
      };

      const newAttendance = await addWorkerAttendance(attendance);
      setWorkerAttendance([...workerAttendance, newAttendance]);

      // Reset form
      setAttendanceDate(format(new Date(), "yyyy-MM-dd"));
      setAttendanceStatus("absent");
      setAttendanceReason("");

      alert("Attendance record added successfully!");
    } catch (error) {
      console.error("Error adding attendance:", error);
      alert("Error adding attendance record");
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (
      window.confirm("Are you sure you want to delete this attendance record?")
    ) {
      try {
        await deleteWorkerAttendance(attendanceId);
        setWorkerAttendance(
          workerAttendance.filter((att) => att.id !== attendanceId)
        );
        alert("Attendance record deleted successfully!");
      } catch (error) {
        console.error("Error deleting attendance:", error);
        alert("Error deleting attendance record");
      }
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">👷 Worker Management</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          ➕ {t("addWorker")}
        </button>
      </div>

      {/* Month Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-white font-medium">📅 Month:</label>
        <input
          type="month"
          value={format(currentMonth, "yyyy-MM")}
          onChange={(e) => setCurrentMonth(new Date(e.target.value))}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex border-b border-gray-600">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "overview"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-300 hover:text-white"
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "expenses"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-300 hover:text-white"
            }`}
          >
            💰 Expenses
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "attendance"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-300 hover:text-white"
            }`}
          >
            📅 Attendance
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="px-4 py-3 text-left text-white font-medium">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-white font-medium">
                    Monthly Salary
                  </th>
                  <th className="px-4 py-3 text-left text-white font-medium">
                    Daily Salary
                  </th>
                  <th className="px-4 py-3 text-left text-white font-medium">
                    Expenses
                  </th>
                  <th className="px-4 py-3 text-left text-white font-medium">
                    Absences
                  </th>
                  <th className="px-4 py-3 text-left text-white font-medium">
                    Total Deductions
                  </th>
                  <th className="px-4 py-3 text-left text-white font-medium">
                    Remaining Salary
                  </th>
                  <th className="px-4 py-3 text-left text-white font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {workerStats.map((worker) => (
                  <tr
                    key={worker.id}
                    className="border-b border-gray-700 hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 text-white">{worker.name}</td>
                    <td className="px-4 py-3 text-white">
                      ${(worker.salary || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-white">
                      ${worker.dailySalary.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-red-400">
                      ${worker.monthlyExpenses.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-orange-400">
                      {worker.monthlyAbsences} days
                    </td>
                    <td className="px-4 py-3 text-red-400">
                      ${worker.totalDeductions.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        worker.remainingSalary >= 0
                          ? "text-green-400"
                          : "text-red-500"
                      }`}
                    >
                      ${worker.remainingSalary.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(worker)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(worker.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          {/* Add Expense Form */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">
              💰 Add Worker Expense
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Worker
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                >
                  <option value="">Select Worker</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Expense description"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                />
              </div>
            </div>
            <button
              onClick={handleAddExpense}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              ➕ Add Expense
            </button>
          </div>

          {/* Worker Expense Details */}
          {selectedWorkerStats && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">
                💰 Expenses for {selectedWorkerStats.name} -{" "}
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="px-4 py-2 text-left text-white">Date</th>
                      <th className="px-4 py-2 text-left text-white">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left text-white">Amount</th>
                      <th className="px-4 py-2 text-left text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedWorkerStats.expensesList
                      .filter((exp) => {
                        const expDate = new Date(exp.date);
                        const monthStart = startOfMonth(currentMonth);
                        const monthEnd = endOfMonth(currentMonth);
                        return expDate >= monthStart && expDate <= monthEnd;
                      })
                      .map((expense) => (
                        <tr
                          key={expense.id}
                          className="border-b border-gray-700"
                        >
                          <td className="px-4 py-2 text-white">
                            {format(new Date(expense.date), "MMM dd, yyyy")}
                          </td>
                          <td className="px-4 py-2 text-white">
                            {expense.description}
                          </td>
                          <td className="px-4 py-2 text-red-400">
                            ${expense.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Add Attendance Form */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">
              📅 Record Absence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Worker
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                >
                  <option value="">Select Worker</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Status
                </label>
                <select
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                >
                  <option value="absent">Absent</option>
                  <option value="sick">Sick Leave</option>
                  <option value="vacation">Vacation</option>
                  <option value="personal">Personal Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  value={attendanceReason}
                  onChange={(e) => setAttendanceReason(e.target.value)}
                  placeholder="Reason for absence"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                />
              </div>
            </div>
            <button
              onClick={handleAddAttendance}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              📅 Record Absence
            </button>
          </div>

          {/* Worker Attendance Details */}
          {selectedWorkerStats && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">
                📅 Attendance for {selectedWorkerStats.name} -{" "}
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-600 p-3 rounded">
                  <div className="text-white text-sm">Working Days</div>
                  <div className="text-white text-xl font-bold">
                    {selectedWorkerStats.workingDays}
                  </div>
                </div>
                <div className="bg-red-600 p-3 rounded">
                  <div className="text-white text-sm">Absences</div>
                  <div className="text-white text-xl font-bold">
                    {selectedWorkerStats.monthlyAbsences}
                  </div>
                </div>
                <div className="bg-orange-600 p-3 rounded">
                  <div className="text-white text-sm">Salary Deduction</div>
                  <div className="text-white text-xl font-bold">
                    ${selectedWorkerStats.absenceDeduction.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="px-4 py-2 text-left text-white">Date</th>
                      <th className="px-4 py-2 text-left text-white">Status</th>
                      <th className="px-4 py-2 text-left text-white">Reason</th>
                      <th className="px-4 py-2 text-left text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedWorkerStats.attendanceList
                      .filter((att) => {
                        const attDate = new Date(att.date);
                        const monthStart = startOfMonth(currentMonth);
                        const monthEnd = endOfMonth(currentMonth);
                        return attDate >= monthStart && attDate <= monthEnd;
                      })
                      .map((attendance) => (
                        <tr
                          key={attendance.id}
                          className="border-b border-gray-700"
                        >
                          <td className="px-4 py-2 text-white">
                            {format(new Date(attendance.date), "MMM dd, yyyy")}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                attendance.status === "absent"
                                  ? "bg-red-600 text-white"
                                  : attendance.status === "sick"
                                  ? "bg-yellow-600 text-white"
                                  : attendance.status === "vacation"
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-600 text-white"
                              }`}
                            >
                              {attendance.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-white">
                            {attendance.reason || "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() =>
                                handleDeleteAttendance(attendance.id)
                              }
                              className="text-red-400 hover:text-red-300"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddWorkerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />
      {selectedWorker && (
        <EditWorkerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          worker={selectedWorker}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default WorkerManagement;
