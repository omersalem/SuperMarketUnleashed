import React, { useState } from "react";
import Modal from "./Modal";
import { addBank, addCurrency } from "../firebase/firestore";

const CheckPaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  banks,
  setBanks,
  currencies,
  setCurrencies,
  paymentAmount = 0,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [bankName, setBankName] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [payee, setPayee] = useState("");
  const [currency, setCurrency] = useState("NIS");
  const [showNewBankInput, setShowNewBankInput] = useState(false);
  const [showNewCurrencyInput, setShowNewCurrencyInput] = useState(false);
  const [loading, setLoading] = useState(false);

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

    if (!bankName || !checkNumber) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Add new bank if needed
      if (showNewBankInput && bankName) {
        const newBank = await addBank({ name: bankName });
        setBanks((prevBanks) => [...prevBanks, newBank]);
      }

      // Add new currency if needed
      if (showNewCurrencyInput && currency) {
        const newCurrency = await addCurrency({ name: currency });
        setCurrencies((prevCurrencies) => [...prevCurrencies, newCurrency]);
      }

      // Return check details to parent component
      const checkDetails = {
        date,
        bankName,
        checkNumber,
        payee,
        currency,
        amount: paymentAmount,
      };

      onConfirm(checkDetails);

      // Reset form
      setDate(new Date().toISOString().split("T")[0]);
      setBankName("");
      setCheckNumber("");
      setPayee("");
      setCurrency("NIS");
      setShowNewBankInput(false);
      setShowNewCurrencyInput(false);

      onClose();
    } catch (error) {
      console.error("Error processing check payment:", error);
      alert("Error processing check payment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form on cancel
    setDate(new Date().toISOString().split("T")[0]);
    setBankName("");
    setCheckNumber("");
    setPayee("");
    setCurrency("NIS");
    setShowNewBankInput(false);
    setShowNewCurrencyInput(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <h2 className="text-2xl font-bold mb-4 text-white">
        Check Payment Details
      </h2>
      <p className="text-gray-300 mb-4">
        Please enter the check information for the payment of $
        {paymentAmount.toFixed(2)}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="date"
            className="block mb-2 text-sm font-medium text-white"
          >
            Date *
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="bankName"
            className="block mb-2 text-sm font-medium text-white"
          >
            Bank Name *
          </label>
          <select
            id="bankName"
            value={bankName}
            onChange={handleBankChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          >
            <option value="">Select Bank</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.name}>
                {bank.name}
              </option>
            ))}
            <option value="addNew">+ Add New Bank</option>
          </select>
          {showNewBankInput && (
            <input
              type="text"
              placeholder="Enter new bank name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 mt-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            />
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="checkNumber"
            className="block mb-2 text-sm font-medium text-white"
          >
            Check Number *
          </label>
          <input
            type="text"
            id="checkNumber"
            value={checkNumber}
            onChange={(e) => setCheckNumber(e.target.value)}
            placeholder="Enter check number"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="payee"
            className="block mb-2 text-sm font-medium text-white"
          >
            Payee
          </label>
          <input
            type="text"
            id="payee"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
            placeholder="Enter payee name (optional)"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="currency"
            className="block mb-2 text-sm font-medium text-white"
          >
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={handleCurrencyChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="">Select Currency</option>
            {currencies.map((curr) => (
              <option key={curr.id} value={curr.name}>
                {curr.name}
              </option>
            ))}
            <option value="addNew">+ Add New Currency</option>
          </select>
          {showNewCurrencyInput && (
            <input
              type="text"
              placeholder="Enter new currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 mt-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Check Payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CheckPaymentModal;
