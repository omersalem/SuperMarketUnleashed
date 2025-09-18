import React, { useState, useMemo } from "react";
import { updatePurchase, addPurchase } from "../firebase/firestore";
import { format } from "date-fns";
import ResponsiveTable, { createMobileCard } from "./ResponsiveTable";
import CheckPaymentModal from "./CheckPaymentModal";

const VendorPaymentManagement = ({
  purchases,
  setPurchases,
  vendors,
  banks,
  setBanks,
  currencies,
  setCurrencies,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [additionalPayment, setAdditionalPayment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Standalone payment states
  const [showStandalonePayment, setShowStandalonePayment] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [standaloneAmount, setStandaloneAmount] = useState("");
  const [standaloneMethod, setStandaloneMethod] = useState("cash");
  const [standaloneNotes, setStandaloneNotes] = useState("");
  const [paymentType, setPaymentType] = useState("account_payment"); // account_payment, advance_payment, deposit

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

  // Filter unpaid and partially paid purchases
  const unpaidPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      const balance = purchase.balance || 0;
      const hasOutstanding = balance > 0;

      if (!hasOutstanding) return false;

      // Apply search filter
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const vendor = vendors.find((v) => v.id === purchase.vendorId);
        const vendorName = purchase.vendorName || vendor?.name || "";

        return (
          vendorName.toLowerCase().includes(search) ||
          purchase.vendorId?.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [purchases, vendors, searchTerm]);

  // Create mobile card component for outstanding purchases
  const VendorPaymentMobileCard = createMobileCard(({ item: purchase }) => {
    const vendor = vendors.find((v) => v.id === purchase.vendorId);
    const vendorName = purchase.vendorName || vendor?.name || "Unknown Vendor";

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">{vendorName}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              purchase.paymentStatus === "partial"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {purchase.paymentStatus === "partial" ? "Partial" : "Unpaid"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Date:</span>
            <p className="text-white font-medium">
              {format(new Date(purchase.date || Date.now()), "MMM dd, yyyy")}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Total:</span>
            <p className="text-green-400 font-medium">
              ₪{(purchase.totalAmount || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Paid:</span>
            <p className="text-blue-400 font-medium">
              ₪{(purchase.amountPaid || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Outstanding:</span>
            <p className="text-red-400 font-medium">
              ₪{(purchase.balance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handlePurchaseSelect(purchase)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
          >
            Add Payment
          </button>
        </div>
      </div>
    );
  });

  // Table columns configuration
  const tableColumns = [
    {
      key: "date",
      label: "Date",
      render: (purchase) =>
        format(new Date(purchase.date || Date.now()), "MMM dd, yyyy"),
    },
    {
      key: "vendor",
      label: "Vendor",
      render: (purchase) => {
        const vendor = vendors.find((v) => v.id === purchase.vendorId);
        return purchase.vendorName || vendor?.name || "Unknown Vendor";
      },
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      align: "right",
      render: (purchase) => (
        <span className="text-green-400 font-medium">
          ₪{(purchase.totalAmount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "amountPaid",
      label: "Amount Paid",
      align: "right",
      render: (purchase) => (
        <span className="text-blue-400 font-medium">
          ₪{(purchase.amountPaid || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "balance",
      label: "Outstanding",
      align: "right",
      render: (purchase) => (
        <span className="text-red-400 font-medium">
          ₪{(purchase.balance || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (purchase) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            purchase.paymentStatus === "partial"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {purchase.paymentStatus === "partial" ? "Partial" : "Unpaid"}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      align: "center",
      render: (purchase) => (
        <button
          onClick={() => handlePurchaseSelect(purchase)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
        >
          Add Payment
        </button>
      ),
    },
  ];

  const handlePurchaseSelect = (purchase) => {
    setSelectedPurchase(purchase);
    setAdditionalPayment("");
    setPaymentMethod("cash");
    setPaymentNotes("");
    setError(null);
  };

  const handleStandalonePayment = async () => {
    if (!selectedVendor || !standaloneAmount) {
      setError("Please select a vendor and enter payment amount.");
      return;
    }

    const paymentAmount = parseFloat(standaloneAmount);
    if (paymentAmount <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const vendor = vendors.find((v) => v.id === selectedVendor);

      // Create a payment-only record
      const paymentRecord = {
        vendorId: selectedVendor,
        vendorName: vendor ? vendor.name : "Unknown Vendor",
        date: new Date().toISOString(),
        totalAmount: 0, // No purchase amount
        amountPaid: paymentAmount,
        balance: -paymentAmount, // Negative balance means we've overpaid or paid in advance
        paymentMethod: standaloneMethod,
        paymentStatus: "paid",
        paymentType: paymentType,
        paymentNotes: standaloneNotes.trim() || null,
        isPaymentOnly: true, // Flag to identify payment-only transactions
        products: [], // No products
        items: [], // No items
        ...(standaloneMethod === "check" && checkDetails
          ? { checkDetails }
          : {}),
      };

      // Add to Firebase
      const newPayment = await addPurchase(paymentRecord);
      setPurchases([...purchases, newPayment]);

      // Clear form
      setSelectedVendor("");
      setStandaloneAmount("");
      setStandaloneMethod("cash");
      setStandaloneNotes("");
      setPaymentType("account_payment");
      setShowStandalonePayment(false);
      setCheckDetails(null); // Clear check details
      setError(null);

      const paymentTypeText = {
        account_payment: "Account Payment",
        advance_payment: "Advance Payment",
        deposit: "Deposit Payment",
      }[paymentType];

      alert(
        `${paymentTypeText} of ₪${paymentAmount.toFixed(
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
    if (!selectedPurchase || !additionalPayment) {
      setError("Please enter a payment amount.");
      return;
    }

    const paymentAmount = parseFloat(additionalPayment);
    if (paymentAmount <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    const currentBalance = selectedPurchase.balance || 0;
    if (paymentAmount > currentBalance) {
      const shouldContinue = window.confirm(
        `Payment amount (₪${paymentAmount.toFixed(
          2
        )}) is greater than outstanding balance (₪${currentBalance.toFixed(
          2
        )}). ` + `This will result in overpayment. Continue?`
      );
      if (!shouldContinue) return;
    }

    setLoading(true);
    try {
      const newAmountPaid = (selectedPurchase.amountPaid || 0) + paymentAmount;
      const newBalance = (selectedPurchase.totalAmount || 0) - newAmountPaid;

      let newPaymentStatus = "unpaid";
      if (newBalance <= 0) {
        newPaymentStatus = "paid";
      } else if (newAmountPaid > 0) {
        newPaymentStatus = "partial";
      }

      const updatedPurchase = {
        ...selectedPurchase,
        amountPaid: newAmountPaid,
        balance: newBalance,
        paymentStatus: newPaymentStatus,
        lastPaymentDate: new Date().toISOString(),
        lastPaymentMethod: paymentMethod,
        lastPaymentNotes: paymentNotes.trim() || null,
        ...(paymentMethod === "check" && checkDetails
          ? { lastCheckDetails: checkDetails }
          : {}),
      };

      // Update in Firebase
      await updatePurchase(selectedPurchase.id, updatedPurchase);

      // Update local state
      setPurchases(
        purchases.map((purchase) =>
          purchase.id === selectedPurchase.id ? updatedPurchase : purchase
        )
      );

      // Clear form
      setSelectedPurchase(null);
      setAdditionalPayment("");
      setPaymentMethod("cash");
      setPaymentNotes("");
      setCheckDetails(null); // Clear check details
      setError(null);

      alert(`Payment of ₪${paymentAmount.toFixed(2)} recorded successfully!`);
    } catch (error) {
      setError("Error updating payment: " + error.message);
      console.error("Error updating payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Vendor Payment Management
      </h2>
      <p className="text-gray-300 mb-6">
        Manage payments for purchases with outstanding balances
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
          {showStandalonePayment ? "Hide" : "Pay"} Vendor (No Purchase)
        </button>
      </div>

      {/* Standalone Payment Form */}
      {showStandalonePayment && (
        <div className="bg-green-900 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4 text-white">
            💵 Pay Vendor (No Products Required)
          </h3>
          <p className="text-green-300 mb-4">
            Make payments to vendors without any purchase - for account
            settlements, advance payments, or deposits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select Vendor *
                </label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                >
                  <option value="">-- Select Vendor --</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} ({vendor.email || vendor.contactPerson})
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
                  <option value="deposit">Deposit Payment</option>
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
              disabled={loading || !selectedVendor || !standaloneAmount}
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
          Search Purchases by Vendor Name
        </label>
        <input
          type="text"
          placeholder="Search by vendor name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Outstanding Purchases Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-white">
          Outstanding Purchases ({unpaidPurchases.length})
        </h3>

        <ResponsiveTable
          data={unpaidPurchases}
          columns={tableColumns}
          MobileCard={VendorPaymentMobileCard}
          emptyMessage="No outstanding purchases found."
        />
      </div>

      {/* Payment Form */}
      {selectedPurchase && (
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Add Payment for Purchase
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-600 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Purchase Details</h4>
              <p className="text-gray-300">
                <span className="font-medium">Vendor:</span>{" "}
                {selectedPurchase.vendorName || "Unknown"}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Date:</span>{" "}
                {format(new Date(selectedPurchase.date), "MMM dd, yyyy")}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Total Amount:</span> ₪
                {(selectedPurchase.totalAmount || 0).toFixed(2)}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Amount Paid:</span> ₪
                {(selectedPurchase.amountPaid || 0).toFixed(2)}
              </p>
              <p className="text-red-400 font-medium">
                <span className="font-medium">Outstanding:</span> ₪
                {(selectedPurchase.balance || 0).toFixed(2)}
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
              onClick={() => setSelectedPurchase(null)}
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
        onClose={() => {
          setShowCheckModal(false);
          setPaymentMethod("cash"); // Reset to cash if modal is closed
        }}
        onConfirm={handleCheckPaymentConfirm}
        banks={banks}
        setBanks={setBanks}
        currencies={currencies}
        setCurrencies={setCurrencies}
        paymentAmount={checkPaymentAmount}
      />

      <CheckPaymentModal
        isOpen={showStandaloneCheckModal}
        onClose={() => {
          setShowStandaloneCheckModal(false);
          setStandaloneMethod("cash"); // Reset to cash if modal is closed
        }}
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

export default VendorPaymentManagement;
