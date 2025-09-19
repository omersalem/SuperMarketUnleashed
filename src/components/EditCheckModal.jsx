import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { addBank, addCurrency } from "../firebase/firestore";

const EditCheckModal = ({
  isOpen,
  check,
  onClose,
  onUpdate,
  banks,
  setBanks,
  currencies,
  setCurrencies,
  userRole = "admin",
}) => {
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");
  const [bankName, setBankName] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [payee, setPayee] = useState("");
  const [currency, setCurrency] = useState("");
  const [status, setStatus] = useState("pending");
  const [showNewBankInput, setShowNewBankInput] = useState(false);
  const [showNewCurrencyInput, setShowNewCurrencyInput] = useState(false);

  useEffect(() => {
    if (check) {
      setAmount(check.amount);
      setDate(check.date);
      setBankName(check.bankName || "");
      setCheckNumber(check.checkNumber || "");
      setPayee(check.payee || "");
      setCurrency(check.currency || "NIS");
      setStatus(check.status || "pending");
    }
  }, [check]);

  const handleBankChange = (e) => {
    const value = e.target.value;
    if (value === "addNew") {
      setShowNewBankInput(true);
      setBankName("");
    } else {
      setShowNewBankInput(false);
      setBankName(value);
    }
  };

  const handleCurrencyChange = (e) => {
    const value = e.target.value;
    if (value === "addNew") {
      setShowNewCurrencyInput(true);
      setCurrency("");
    } else {
      setShowNewCurrencyInput(false);
      setCurrency(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has permission to update checks
    if (userRole !== "admin") {
      console.error("User doesn't have permission to update checks");
      return;
    }
    
    try {
      if (showNewBankInput && bankName) {
        const newBank = await addBank({ name: bankName });
        setBanks([...banks, newBank]);
      }
      if (showNewCurrencyInput && currency) {
        const newCurrency = await addCurrency({ name: currency });
        setCurrencies([...currencies, newCurrency]);
      }
      await onUpdate(check.id, {
        amount: parseFloat(amount),
        date,
        bankName,
        checkNumber,
        payee,
        currency,
        status,
      });
      onClose();
    } catch (error) {
      console.error("Error updating check:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">Edit Check</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="amount" className="block mb-2 text-sm font-medium">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            id="amount"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="block mb-2 text-sm font-medium">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="bankName" className="block mb-2 text-sm font-medium">
            Bank Name
          </label>
          <select
            name="bankName"
            id="bankName"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={bankName}
            onChange={handleBankChange}
          >
            <option value="">Select Bank</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.name}>
                {bank.name}
              </option>
            ))}
            <option value="addNew">Add New Bank</option>
          </select>
          {showNewBankInput && (
            <input
              type="text"
              name="newBankName"
              id="newBankName"
              className="w-full px-3 py-2 mt-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new bank name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="checkNumber"
            className="block mb-2 text-sm font-medium"
          >
            Check Number
          </label>
          <input
            type="text"
            name="checkNumber"
            id="checkNumber"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={checkNumber}
            onChange={(e) => setCheckNumber(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="payee" className="block mb-2 text-sm font-medium">
            Payee
          </label>
          <input
            type="text"
            name="payee"
            id="payee"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="currency" className="block mb-2 text-sm font-medium">
            Currency
          </label>
          <select
            name="currency"
            id="currency"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={currency}
            onChange={handleCurrencyChange}
          >
            <option value="">Select Currency</option>
            {currencies.map((curr) => (
              <option key={curr.id} value={curr.name}>
                {curr.name}
              </option>
            ))}
            <option value="addNew">Add New Currency</option>
          </select>
          {showNewCurrencyInput && (
            <input
              type="text"
              name="newCurrency"
              id="newCurrency"
              className="w-full px-3 py-2 mt-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="status" className="block mb-2 text-sm font-medium">
            Status
          </label>
          <select
            name="status"
            id="status"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="cleared">Cleared</option>
            <option value="bounced">Bounced</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={userRole !== "admin"}
            className={`${userRole === "admin" ? "bg-blue-500 hover:bg-blue-700" : "bg-gray-500 cursor-not-allowed"} text-white font-bold py-2 px-4 rounded`}
          >
            Update
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCheckModal;
