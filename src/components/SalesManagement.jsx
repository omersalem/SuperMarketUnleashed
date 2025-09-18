import React, { useState } from "react";
import { addSale, updateProduct } from "../firebase/firestore";
import CheckPaymentModal from "./CheckPaymentModal";

const SalesManagement = ({
  sales,
  setSales,
  customers,
  products,
  setProducts,
  banks,
  setBanks,
  currencies,
  setCurrencies,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [error, setError] = useState(null);

  // Quick payment states
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [quickPaymentCustomer, setQuickPaymentCustomer] = useState("");
  const [quickPaymentAmount, setQuickPaymentAmount] = useState("");
  const [quickPaymentMethod, setQuickPaymentMethod] = useState("cash");
  const [quickPaymentType, setQuickPaymentType] = useState("account_payment");

  // Check payment modal states
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [checkPaymentAmount, setCheckPaymentAmount] = useState(0);
  const [checkDetails, setCheckDetails] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);

  // Quick check payment modal states
  const [showQuickCheckModal, setShowQuickCheckModal] = useState(false);

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find((p) => p.id === productId);
    console.log("Selected product in handleProductSelect:", product);
    if (product && !selectedProducts.find((item) => item.id === productId)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    const newQuantity = parseInt(quantity);
    console.log(
      "Quantity change for product:",
      productId,
      "new quantity:",
      newQuantity
    );
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      setSelectedProducts(
        selectedProducts.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } else {
      setSelectedProducts(
        selectedProducts.map((item) =>
          item.id === productId ? { ...item, quantity: 1 } : item
        )
      );
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(
      selectedProducts.filter((item) => item.id !== productId)
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      const price =
        typeof item.price === "number" ? item.price : parseFloat(item.price);
      const quantity =
        typeof item.quantity === "number"
          ? item.quantity
          : parseInt(item.quantity);
      if (isNaN(price) || isNaN(quantity)) {
        console.error("Invalid price or quantity for item:", item);
        return total;
      }
      return total + price * quantity;
    }, 0);
  };

  const calculateBalance = () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    return total - paid;
  };

  const getPaymentStatus = () => {
    const balance = calculateBalance();
    if (balance <= 0) return "paid";
    if (parseFloat(amountPaid) > 0) return "partial";
    return "unpaid";
  };

  const handlePaymentMethodChange = (e, isQuickPayment = false) => {
    const method = e.target.value;

    if (method === "check") {
      if (isQuickPayment) {
        const amount = parseFloat(quickPaymentAmount);
        if (amount > 0) {
          setCheckPaymentAmount(amount);
          setShowQuickCheckModal(true);
        } else {
          setError("Please enter payment amount first.");
          setQuickPaymentMethod("cash"); // Reset to cash
        }
      } else {
        const amount = parseFloat(amountPaid);
        if (amount > 0) {
          setCheckPaymentAmount(amount);
          setShowCheckModal(true);
        } else {
          setError("Please enter payment amount first.");
          setPaymentMethod("cash"); // Reset to cash
        }
      }
    } else {
      if (isQuickPayment) {
        setQuickPaymentMethod(method);
      } else {
        setPaymentMethod(method);
      }
      setCheckDetails(null); // Clear check details if switching away from check
    }
  };

  const handleCheckPaymentConfirm = (checkInfo) => {
    setCheckDetails(checkInfo);
    setShowCheckModal(false);
    setShowQuickCheckModal(false);
  };

  const handleQuickPayment = async () => {
    if (!quickPaymentCustomer || !quickPaymentAmount) {
      setError("Please select a customer and enter payment amount.");
      return;
    }

    const paymentAmount = parseFloat(quickPaymentAmount);
    if (paymentAmount <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    // If check payment method is selected but no check details, show modal
    if (quickPaymentMethod === "check" && !checkDetails) {
      setCheckPaymentAmount(paymentAmount);
      setShowQuickCheckModal(true);
      return;
    }

    try {
      const customer = customers.find((c) => c.id === quickPaymentCustomer);

      const paymentRecord = {
        customerId: quickPaymentCustomer,
        customerName: customer ? customer.name : "Unknown Customer",
        date: new Date().toISOString(),
        totalAmount: 0,
        amountPaid: paymentAmount,
        balance: -paymentAmount,
        paymentMethod: quickPaymentMethod,
        paymentStatus: "paid",
        paymentType: quickPaymentType,
        isPaymentOnly: true,
        products: [],
        items: [],
        ...(checkDetails && { checkDetails }), // Add check details if payment method is check
      };

      const newPayment = await addSale(paymentRecord);
      setSales([...sales, newPayment]);

      // Clear form
      setQuickPaymentCustomer("");
      setQuickPaymentAmount("");
      setQuickPaymentMethod("cash");
      setQuickPaymentType("account_payment");
      setShowQuickPayment(false);
      setCheckDetails(null);
      setError(null);

      alert(`Payment of $${paymentAmount.toFixed(2)} recorded successfully!`);
    } catch (error) {
      setError("Error recording payment: " + error.message);
      console.error("Error recording quick payment:", error);
    }
  };

  const handleRecordSale = async () => {
    if (!selectedCustomer || selectedProducts.length === 0) {
      setError("Please select a customer and at least one product.");
      return;
    }

    const totalAmount = calculateTotal();
    const paidAmount = parseFloat(amountPaid) || 0;

    if (paidAmount < 0) {
      setError("Amount paid cannot be negative.");
      return;
    }

    // If check payment method is selected but no check details, show modal
    if (paymentMethod === "check" && paidAmount > 0 && !checkDetails) {
      setCheckPaymentAmount(paidAmount);
      setShowCheckModal(true);
      return;
    }

    if (paidAmount > totalAmount) {
      const shouldContinue = window.confirm(
        `Amount paid ($${paidAmount.toFixed(
          2
        )}) is greater than total amount ($${totalAmount.toFixed(2)}). ` +
          `This will result in change of $${(paidAmount - totalAmount).toFixed(
            2
          )}. Continue?`
      );
      if (!shouldContinue) return;
    }

    try {
      // Get customer details for the sale record
      const customer = customers.find((c) => c.id === selectedCustomer);
      const balance = calculateBalance();

      const sale = {
        customerId: selectedCustomer,
        customerName: customer ? customer.name : "Walk-in Customer",
        date: new Date().toISOString(),
        items: selectedProducts.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          priceAtSale:
            typeof item.price === "number"
              ? item.price
              : parseFloat(item.price),
        })),
        products: selectedProducts.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price:
            typeof item.price === "number"
              ? item.price
              : parseFloat(item.price),
        })),
        totalAmount: totalAmount,
        amountPaid: paidAmount,
        balance: balance,
        paymentMethod: paymentMethod,
        paymentStatus: getPaymentStatus(),
        paymentNotes: paymentNotes.trim() || null,
        change: paidAmount > totalAmount ? paidAmount - totalAmount : 0,
        ...(checkDetails && { checkDetails }), // Add check details if payment method is check
      };

      const newSale = await addSale(sale);
      setSales([...sales, newSale]);

      // Update product stock
      for (const item of selectedProducts) {
        const product = products.find((p) => p.id === item.id);
        if (product) {
          const newStock = product.stock - item.quantity;
          await updateProduct(product.id, { stock: newStock });
        }
      }
      setProducts(
        products.map((p) => {
          const soldItem = selectedProducts.find((item) => item.id === p.id);
          if (soldItem) {
            return { ...p, stock: p.stock - soldItem.quantity };
          }
          return p;
        })
      );

      // Clear form
      setSelectedCustomer("");
      setSelectedProducts([]);
      setAmountPaid("");
      setPaymentMethod("cash");
      setPaymentNotes("");
      setCheckDetails(null);
      setError(null);

      // Show success message with payment details
      const statusMessage =
        getPaymentStatus() === "paid"
          ? "Sale completed and fully paid!"
          : `Sale recorded. Outstanding balance: $${balance.toFixed(2)}`;

      alert(statusMessage);
    } catch (error) {
      setError(error.message);
      console.error("Error recording sale:", error);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Sales Management</h2>

      {error && <p className="text-red-500">{error}</p>}

      {/* Quick Payment Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowQuickPayment(!showQuickPayment)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
        >
          {showQuickPayment ? "Hide" : "💳"} Quick Payment (No Products)
        </button>
        <span className="text-gray-400 text-sm">
          Record payments without purchasing products
        </span>
      </div>

      {/* Quick Payment Form */}
      {showQuickPayment && (
        <div className="bg-green-900 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3 text-white">
            💳 Quick Payment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Customer
              </label>
              <select
                value={quickPaymentCustomer}
                onChange={(e) => setQuickPaymentCustomer(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Type
              </label>
              <select
                value={quickPaymentType}
                onChange={(e) => setQuickPaymentType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              >
                <option value="account_payment">Pay Debt</option>
                <option value="advance_payment">Advance</option>
                <option value="store_credit">Store Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Method
              </label>
              <select
                value={quickPaymentMethod}
                onChange={(e) => handlePaymentMethodChange(e, true)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="check">Check</option>
                <option value="bank_transfer">Transfer</option>
                <option value="mobile_payment">Mobile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={quickPaymentAmount}
                onChange={(e) => setQuickPaymentAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleQuickPayment}
                disabled={!quickPaymentCustomer || !quickPaymentAmount}
                className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="mb-4">
          <label htmlFor="customer" className="block mb-2 text-sm font-medium">
            Select Customer
          </label>
          <select
            id="customer"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">-- Select Customer --</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.email})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="product" className="block mb-2 text-sm font-medium">
            Add Product to Sale
          </label>
          <select
            id="product"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
            onChange={handleProductSelect}
            value=""
          >
            <option value="">-- Select Product --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (Stock: {product.stock})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700 p-4 rounded-lg">
            <div>
              <label
                htmlFor="amountPaid"
                className="block mb-2 text-sm font-medium"
              >
                Amount Paid *
              </label>
              <input
                type="number"
                id="amountPaid"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Enter amount paid"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
              />
            </div>

            <div>
              <label
                htmlFor="paymentMethod"
                className="block mb-2 text-sm font-medium"
              >
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => handlePaymentMethodChange(e, false)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
              >
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="check">Check</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_payment">Mobile Payment</option>
                <option value="credit">Store Credit</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="paymentNotes"
                className="block mb-2 text-sm font-medium"
              >
                Payment Notes (Optional)
              </label>
              <textarea
                id="paymentNotes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Add any payment notes or references..."
                rows={2}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Selected Products</h3>
          {selectedProducts.length === 0 ? (
            <p>No products selected.</p>
          ) : (
            <table className="min-w-full bg-gray-800">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">
                    Product
                  </th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">
                    Price
                  </th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">
                    Quantity
                  </th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">
                    Subtotal
                  </th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((item) => {
                  const price =
                    typeof item.price === "number"
                      ? item.price
                      : parseFloat(item.price);
                  const quantity =
                    typeof item.quantity === "number"
                      ? item.quantity
                      : parseInt(item.quantity);
                  const subtotal =
                    !isNaN(price) && !isNaN(quantity) ? price * quantity : 0;
                  return (
                    <tr key={item.id}>
                      <td className="py-2 px-4 border-b border-gray-700">
                        {item.name}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        ${!isNaN(price) ? price.toFixed(2) : "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        <input
                          type="number"
                          min="1"
                          value={!isNaN(quantity) ? quantity : 1}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                          className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md"
                        />
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        ${subtotal.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        <button
                          onClick={() => handleRemoveProduct(item.id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
            <div className="text-center">
              <div className="text-sm text-gray-300">Total Amount</div>
              <div className="text-2xl font-bold text-blue-400">
                ${calculateTotal().toFixed(2)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-300">Amount Paid</div>
              <div className="text-2xl font-bold text-green-400">
                ${(parseFloat(amountPaid) || 0).toFixed(2)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-300">Balance</div>
              <div
                className={`text-2xl font-bold ${
                  calculateBalance() > 0
                    ? "text-red-400"
                    : calculateBalance() < 0
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                ${Math.abs(calculateBalance()).toFixed(2)}
                {calculateBalance() < 0 && " (Change)"}
                {calculateBalance() > 0 && " (Due)"}
              </div>
            </div>
          </div>

          <div className="text-center mt-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                getPaymentStatus() === "paid"
                  ? "bg-green-100 text-green-800"
                  : getPaymentStatus() === "partial"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {getPaymentStatus() === "paid"
                ? "✓ Fully Paid"
                : getPaymentStatus() === "partial"
                ? "⚠ Partially Paid"
                : "❌ Unpaid"}
            </span>
          </div>
        </div>

        <button
          onClick={handleRecordSale}
          disabled={selectedProducts.length === 0 || !selectedCustomer}
          className="bg-green-500 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded"
        >
          {getPaymentStatus() === "paid"
            ? "Complete Sale"
            : getPaymentStatus() === "partial"
            ? "Record Partial Payment"
            : "Record Sale (Unpaid)"}
        </button>
      </div>

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
        isOpen={showQuickCheckModal}
        onClose={() => setShowQuickCheckModal(false)}
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

export default SalesManagement;
