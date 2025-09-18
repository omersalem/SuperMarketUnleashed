import React, { useState, useMemo } from "react";
import { updateSale, addSale } from "../firebase/firestore";
import { format } from "date-fns";
import CheckPaymentModal from "./CheckPaymentModal";

const PaymentManagement = ({
  sales,
  setSales,
  customers,
  banks,
  setBanks,
  currencies,
  setCurrencies,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [additionalPayment, setAdditionalPayment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Standalone payment states
  const [showStandalonePayment, setShowStandalonePayment] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [standaloneAmount, setStandaloneAmount] = useState("");
  const [standaloneMethod, setStandaloneMethod] = useState("cash");
  const [standaloneNotes, setStandaloneNotes] = useState("");
  const [paymentType, setPaymentType] = useState("account_payment"); // account_payment, advance_payment, store_credit

  // Check payment modal states
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [showStandaloneCheckModal, setShowStandaloneCheckModal] =
    useState(false);
  const [checkPaymentAmount, setCheckPaymentAmount] = useState(0);
  const [checkDetails, setCheckDetails] = useState(null);

  const handlePaymentMethodChange = (e, isStandalone = false) => {
    const method = e.target.value;

    if (method === "check") {
      if (isStandalone) {
        const amount = parseFloat(standaloneAmount);
        if (amount > 0) {
          setCheckPaymentAmount(amount);
          setShowStandaloneCheckModal(true);
        } else {
          setError("Please enter payment amount first.");
          setStandaloneMethod("cash"); // Reset to cash
        }
      } else {
        const amount = parseFloat(additionalPayment);
        if (amount > 0) {
          setCheckPaymentAmount(amount);
          setShowCheckModal(true);
        } else {
          setError("Please enter payment amount first.");
          setPaymentMethod("cash"); // Reset to cash
        }
      }
    } else {
      if (isStandalone) {
        setStandaloneMethod(method);
      } else {
        setPaymentMethod(method);
      }
      setCheckDetails(null); // Clear check details if switching away from check
    }
  };

  const handleCheckPaymentConfirm = (checkInfo) => {
    setCheckDetails(checkInfo);
    setShowCheckModal(false);
    setShowStandaloneCheckModal(false);
  };

  // Filter unpaid and partially paid sales
  const unpaidSales = useMemo(() => {
    return sales.filter((sale) => {
      const balance = sale.balance || 0;
      const hasOutstanding = balance > 0;

      if (!hasOutstanding) return false;

      // Apply search filter
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const customer = customers.find((c) => c.id === sale.customerId);
        const customerName = sale.customerName || customer?.name || "";

        return (
          customerName.toLowerCase().includes(search) ||
          sale.customerId?.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [sales, customers, searchTerm]);

  const handleSaleSelect = (sale) => {
    setSelectedSale(sale);
    setAdditionalPayment("");
    setPaymentMethod("cash");
    setPaymentNotes("");
    setError(null);
  };

  const handleStandalonePayment = async () => {
    if (!selectedCustomer || !standaloneAmount) {
      setError("Please select a customer and enter payment amount.");
      return;
    }

    const paymentAmount = parseFloat(standaloneAmount);
    if (paymentAmount <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    // If check payment method is selected but no check details, show modal
    if (standaloneMethod === "check" && !checkDetails) {
      setCheckPaymentAmount(paymentAmount);
      setShowStandaloneCheckModal(true);
      return;
    }

    setLoading(true);
    try {
      const customer = customers.find((c) => c.id === selectedCustomer);

      // Create a payment-only record
      const paymentRecord = {
        customerId: selectedCustomer,
        customerName: customer ? customer.name : "Unknown Customer",
        date: new Date().toISOString(),
        totalAmount: 0, // No purchase amount
        amountPaid: paymentAmount,
        balance: -paymentAmount, // Negative balance means customer has credit
        paymentMethod: standaloneMethod,
        paymentStatus: "paid",
        paymentType: paymentType,
        paymentNotes: standaloneNotes.trim() || null,
        isPaymentOnly: true, // Flag to identify payment-only transactions
        products: [], // No products
        items: [], // No items
        ...(checkDetails && { checkDetails }), // Add check details if payment method is check
      };

      // Add to Firebase
      const newPayment = await addSale(paymentRecord);
      setSales([...sales, newPayment]);

      // Clear form
      setSelectedCustomer("");
      setStandaloneAmount("");
      setStandaloneMethod("cash");
      setStandaloneNotes("");
      setPaymentType("account_payment");
      setShowStandalonePayment(false);
      setCheckDetails(null);
      setError(null);

      const paymentTypeText = {
        account_payment: "Account Payment",
        advance_payment: "Advance Payment",
        store_credit: "Store Credit Purchase",
      }[paymentType];

      alert(
        `${paymentTypeText} of $${paymentAmount.toFixed(
          2
        )} recorded successfully!`
      );
    } catch (error) {
      setError("Error recording payment: " + error.message);
      console.error("Error recording standalone payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async () => {
    if (!selectedSale || !additionalPayment) {
      setError("Please enter a payment amount.");
      return;
    }

    const paymentAmount = parseFloat(additionalPayment);
    if (paymentAmount <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    // If check payment method is selected but no check details, show modal
    if (paymentMethod === "check" && !checkDetails) {
      setCheckPaymentAmount(paymentAmount);
      setShowCheckModal(true);
      return;
    }

    const currentBalance = selectedSale.balance || 0;
    if (paymentAmount > currentBalance) {
      const shouldContinue = window.confirm(
        `Payment amount ($${paymentAmount.toFixed(
          2
        )}) is greater than outstanding balance ($${currentBalance.toFixed(
          2
        )}). ` + `This will result in overpayment. Continue?`
      );
      if (!shouldContinue) return;
    }

    setLoading(true);
    try {
      const newAmountPaid = (selectedSale.amountPaid || 0) + paymentAmount;
      const newBalance = (selectedSale.totalAmount || 0) - newAmountPaid;

      let newPaymentStatus = "unpaid";
      if (newBalance <= 0) {
        newPaymentStatus = "paid";
      } else if (newAmountPaid > 0) {
        newPaymentStatus = "partial";
      }

      const updatedSale = {
        ...selectedSale,
        amountPaid: newAmountPaid,
        balance: newBalance,
        paymentStatus: newPaymentStatus,
        lastPaymentDate: new Date().toISOString(),
        lastPaymentMethod: paymentMethod,
        lastPaymentNotes: paymentNotes.trim() || null,
        ...(checkDetails && { lastPaymentCheckDetails: checkDetails }), // Add check details if payment method is check
      };

      // Update in Firebase
      await updateSale(selectedSale.id, updatedSale);

      // Update local state
      setSales(
        sales.map((sale) => (sale.id === selectedSale.id ? updatedSale : sale))
      );

      // Clear form
      setSelectedSale(null);
      setAdditionalPayment("");
      setPaymentMethod("cash");
      setPaymentNotes("");
      setCheckDetails(null);
      setError(null);

      alert(`Payment of $${paymentAmount.toFixed(2)} recorded successfully!`);
    } catch (error) {
      setError("Error updating payment: " + error.message);
      console.error("Error updating payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Payment Management</h2>
      <p className="text-gray-300 mb-6">
        Manage payments for sales with outstanding balances
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setShowStandalonePayment(!showStandalonePayment)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {showStandalonePayment ? "Hide" : "Record"} Payment Only (No Purchase)
        </button>
      </div>

      {/* Standalone Payment Form */}
      {showStandalonePayment && (
        <div className="bg-green-900 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4 text-white">
            💵 Payment Only (No Products Required)
          </h3>
          <p className="text-green-300 mb-4">
            Record payments without any purchase - for account settlements,
            advance payments, or store credit.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select Customer *
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Payment Type *
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                >
                  <option value="account_payment">
                    Account Payment (Pay off debt)
                  </option>
                  <option value="advance_payment">
                    Advance Payment (Future purchases)
                  </option>
                  <option value="store_credit">Store Credit Purchase</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={standaloneAmount}
                  onChange={(e) => setStandaloneAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Payment Method
                </label>
                <select
                  value={standaloneMethod}
                  onChange={(e) => handlePaymentMethodChange(e, true)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_payment">Mobile Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Payment Notes (Optional)
                </label>
                <textarea
                  value={standaloneNotes}
                  onChange={(e) => setStandaloneNotes(e.target.value)}
                  placeholder="Add any payment notes..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowStandalonePayment(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleStandalonePayment}
              disabled={loading || !selectedCustomer || !standaloneAmount}
              className="bg-green-500 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded"
            >
              {loading ? "Processing..." : "Record Payment"}
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          Search Sales by Customer Name
        </label>
        <input
          type="text"
          placeholder="Search by customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Outstanding Sales Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-white">
          Outstanding Sales ({unpaidSales.length})
        </h3>

        {unpaidSales.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No outstanding sales found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg">
              <thead className="bg-gray-600">
                <tr>
                  <th className="py-3 px-4 text-left text-white">Date</th>
                  <th className="py-3 px-4 text-left text-white">Customer</th>
                  <th className="py-3 px-4 text-right text-white">
                    Total Amount
                  </th>
                  <th className="py-3 px-4 text-right text-white">
                    Amount Paid
                  </th>
                  <th className="py-3 px-4 text-right text-white">
                    Outstanding
                  </th>
                  <th className="py-3 px-4 text-center text-white">Status</th>
                  <th className="py-3 px-4 text-center text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {unpaidSales.map((sale, index) => {
                  const customer = customers.find(
                    (c) => c.id === sale.customerId
                  );
                  const customerName =
                    sale.customerName || customer?.name || "Unknown Customer";

                  return (
                    <tr
                      key={sale.id || index}
                      className={
                        index % 2 === 0 ? "bg-gray-700" : "bg-gray-600"
                      }
                    >
                      <td className="py-3 px-4 text-white">
                        {format(
                          new Date(sale.date || Date.now()),
                          "MMM dd, yyyy"
                        )}
                      </td>
                      <td className="py-3 px-4 text-white">{customerName}</td>
                      <td className="py-3 px-4 text-right text-green-400 font-medium">
                        ${(sale.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-400 font-medium">
                        ${(sale.amountPaid || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-400 font-medium">
                        ${(sale.balance || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sale.paymentStatus === "partial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {sale.paymentStatus === "partial"
                            ? "Partial"
                            : "Unpaid"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleSaleSelect(sale)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                        >
                          Add Payment
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Form */}
      {selectedSale && (
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Add Payment for Sale
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-600 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Sale Details</h4>
              <p className="text-gray-300">
                <span className="font-medium">Customer:</span>{" "}
                {selectedSale.customerName || "Unknown"}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Date:</span>{" "}
                {format(new Date(selectedSale.date), "MMM dd, yyyy")}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Total Amount:</span> $
                {(selectedSale.totalAmount || 0).toFixed(2)}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Amount Paid:</span> $
                {(selectedSale.amountPaid || 0).toFixed(2)}
              </p>
              <p className="text-red-400 font-medium">
                <span className="font-medium">Outstanding:</span> $
                {(selectedSale.balance || 0).toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={additionalPayment}
                  onChange={(e) => setAdditionalPayment(e.target.value)}
                  placeholder="Enter payment amount"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => handlePaymentMethodChange(e, false)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_payment">Mobile Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Payment Notes (Optional)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Add any payment notes..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setSelectedSale(null)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handlePaymentUpdate}
              disabled={loading || !additionalPayment}
              className="bg-green-500 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded"
            >
              {loading ? "Processing..." : "Record Payment"}
            </button>
          </div>
        </div>
      )}

      {/* Check Payment Modals */}
      <CheckPaymentModal
        isOpen={showCheckModal}
        onClose={() => setShowCheckModal(false)}
        onConfirm={handleCheckPaymentConfirm}
        banks={banks}
        setBanks={setBanks}
        currencies={currencies}
        setCurrencies={setCurrencies}
        paymentAmount={checkPaymentAmount}
      />

      <CheckPaymentModal
        isOpen={showStandaloneCheckModal}
        onClose={() => setShowStandaloneCheckModal(false)}
        onConfirm={handleCheckPaymentConfirm}
        banks={banks}
        setBanks={setBanks}
        currencies={currencies}
        setCurrencies={setCurrencies}
        paymentAmount={checkPaymentAmount}
      />
    </div>
  );
};

export default PaymentManagement;
