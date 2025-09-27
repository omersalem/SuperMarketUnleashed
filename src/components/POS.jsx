import React, { useState, useMemo, useEffect, useCallback } from "react";
import { formatCurrency } from "../utils/currency";
import { addSale, updateProduct } from "../firebase/firestore";
import { handleFirebaseError, logError } from "../utils/errorHandling";
import CheckPaymentModal from "./CheckPaymentModal";

const POS = ({
  products = [],
  setProducts,
  customers = [],
  categories = [],
  setSales,
  onClose,
  banks = [],
  setBanks,
  currencies = [],
  setCurrencies,
}) => {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const walkInCustomer = { id: "walk-in", name: "Walk-in Customer" }; // Define walk-in customer
  const [selectedCustomer, setSelectedCustomer] = useState(walkInCustomer);
  const [customerSearch, setCustomerSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState({
    message: "",
    type: "",
  });
  const searchInputRef = React.useRef(null);

  // Check payment modal state
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [checkPaymentAmount, setCheckPaymentAmount] = useState(0);
  const [checkDetails, setCheckDetails] = useState(null);

// Helpers to normalize product fields across old/new schemas
const getStock = (p) => {
  if (!p) return 0;
  const s = typeof p.stock === "number" ? p.stock : parseInt(p.stock, 10);
  const q =
    typeof p.quantity === "number" ? p.quantity : parseInt(p.quantity, 10);
  if (!Number.isNaN(s)) return s;
  if (!Number.isNaN(q)) return q;
  return 0;
};

const getPrice = (p) => {
  const n = typeof p.price === "number" ? p.price : parseFloat(p.price);
  return Number.isNaN(n) ? 0 : n;
};
  const categoriesMap = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // De-duplicate categories by name (case-insensitive) to avoid duplicates in the sidebar
  const uniqueCategories = useMemo(() => {
    const seen = new Set();
    return (categories || []).filter((c) => {
      const key = (c?.name || "").trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categories]);

  const getProductCategoryName = useCallback(
    (p) => {
      return p.categoryName || categoriesMap.get(p.categoryId) || "Uncategorized";
    },
    [categoriesMap]
  );

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const catName = getProductCategoryName(p);
      const matchesCategory =
        selectedCategory === "all" || catName === selectedCategory;
      const matchesSearch =
        term === "" ||
        p.name?.toLowerCase().includes(term) ||
        (typeof p.barcode === "string" &&
          p.barcode.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory, getProductCategoryName]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const change = useMemo(() => {
    const paid = parseFloat(amountPaid) || 0;
    return paymentMethod === "cash" && paid >= cartTotal ? paid - cartTotal : 0;
  }, [amountPaid, cartTotal, paymentMethod]);

  const addToCart = (product) => {
    // Stock validation
    const cartQuantity =
      cart.find((item) => item.id === product.id)?.quantity || 0;
    if (getStock(product) <= cartQuantity) {
      alert(`No more stock for ${product.name}`);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, price: getPrice(product) }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = products.find((p) => p.id === productId);
    const maxQty = product ? getStock(product) : 1;
    const qty = Math.max(
      0,
      Math.min(Number.isNaN(newQuantity) ? 0 : newQuantity, maxQty)
    );
    if (qty <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: qty } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setAmountPaid(0);
    setSelectedCustomer(walkInCustomer); // Reset to walk-in customer
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutStatus({ message: "Cart is empty.", type: "error" });
      return;
    }
    if (!selectedCustomer) {
      setCheckoutStatus({
        message: "Please select a customer.",
        type: "error",
      });
      return;
    }

    setIsProcessing(true);
    setCheckoutStatus({ message: "", type: "" });
    const saleData = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      date: new Date().toISOString(),
      products: cart.map(({ id, name, price, quantity }) => ({
        id,
        name,
        price,
        quantity,
      })),
      totalAmount: cartTotal,
      amountPaid: parseFloat(amountPaid),
      balance: cartTotal - parseFloat(amountPaid),
      paymentMethod,
      paymentStatus:
        parseFloat(amountPaid) >= cartTotal
          ? "paid"
          : parseFloat(amountPaid) > 0
          ? "partial"
          : "unpaid",
      ...(paymentMethod === "check" && checkDetails ? { checkDetails } : {}),
    };

    try {
      // If payment method is check, ensure details are provided
      if (paymentMethod === "check" && !checkDetails) {
        setCheckPaymentAmount(parseFloat(amountPaid) || cartTotal);
        setShowCheckModal(true);
        setIsProcessing(false);
        setCheckoutStatus({
          message: "Please complete check details",
          type: "error",
        });
        return;
      }

      // Verify stock availability before processing
      const insufficient = cart.filter((item) => {
        const originalProduct = products.find((p) => p.id === item.id);
        return !originalProduct || getStock(originalProduct) < item.quantity;
      });
      if (insufficient.length > 0) {
        setCheckoutStatus({
          message: `Insufficient stock for: ${insufficient
            .map((i) => i.name)
            .join(", ")}`,
          type: "error",
        });
        setIsProcessing(false);
        return;
      }

      // Update stock for each product
      const stockUpdates = cart.map((item) => {
        const originalProduct = products.find((p) => p.id === item.id);
        const newStock = getStock(originalProduct) - item.quantity;
        return updateProduct(item.id, { stock: newStock });
      });
      await Promise.all(stockUpdates);

      // Add the sale record
      const newSale = await addSale(saleData);

      // Update local state
      setSales((prev) => [...prev, newSale]);
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const cartItem = cart.find((item) => item.id === p.id);
          return cartItem
            ? {
                ...p,
                stock: Math.max(0, ((p.stock ?? 0) - cartItem.quantity)),
              }
            : p;
        })
      );

      // Reset POS state
      clearCart();
      setCheckoutStatus({
        message: "Sale completed successfully!",
        type: "success",
      });
    } catch (err) {
      const handledError = handleFirebaseError(err);
      logError(handledError, { context: "POS - handleCheckout" });
      setCheckoutStatus({
        message: `Checkout failed: ${handledError.message}`,
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    // Auto-focus search input for barcode scanner
    searchInputRef.current?.focus();

    // Add keyboard listener for Esc key
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    if (method === "check") {
      const amt = parseFloat(amountPaid) || cartTotal;
      setCheckPaymentAmount(amt);
      setShowCheckModal(true);
    } else {
      setCheckDetails(null);
    }
  };

  const handleCheckPaymentConfirm = (details) => {
    setCheckDetails(details);
    setShowCheckModal(false);
  };

  const handleBarcodeScan = (e) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      e.preventDefault(); // Prevent form submission if it's in a form
      const term = searchTerm.trim().toLowerCase();

      // Prefer exact barcode match
      const exactBarcode = products.find(
        (p) =>
          typeof p.barcode === "string" &&
          p.barcode.toLowerCase() === term
      );
      if (exactBarcode) {
        addToCart(exactBarcode);
        setSearchTerm("");
        return;
      }

      // Fallback: exact name match, then partial name match
      const exactName = products.find(
        (p) => p.name?.toLowerCase() === term
      );
      if (exactName) {
        addToCart(exactName);
        setSearchTerm("");
        return;
      }

      const partialMatches = products.filter((p) =>
        p.name?.toLowerCase().includes(term)
      );
      if (partialMatches.length > 0) {
        addToCart(partialMatches[0]);
        setSearchTerm("");
      } else {
        setCheckoutStatus({
          message: "No matching product found",
          type: "error",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-[1000] flex text-white p-4 animate-fade-in-up">
      <div className="w-full h-full bg-gray-800 rounded-xl shadow-2xl flex border border-gray-700">
        {/* Left: Categories */}
        <div className="w-1/6 border-r border-gray-700 p-4 flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="flex-grow overflow-y-auto space-y-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-600 font-bold"
                  : "hover:bg-gray-700"
              }`}
            >
              All Products
            </button>
            {uniqueCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                  selectedCategory === cat.name
                    ? "bg-blue-600 font-bold"
                    : "hover:bg-gray-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Product Grid */}
        <div className="w-3/6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Point of Sale</h2>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              title="Close (Esc)"
            >
              <span>Exit POS</span>
            </button>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search products or scan barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleBarcodeScan}
            className="w-full p-3 rounded-md bg-gray-900 border border-gray-600 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="flex-grow overflow-y-auto grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-2 items-start">
            {filteredProducts.map((p, index) => (
              <div
                key={p.id}
                onClick={() => getStock(p) > 0 && addToCart(p)}
                className={`relative group bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 self-start flex flex-col ${getStock(p) <= 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                style={{ animationDelay: `${index * 15}ms` }}
              >
                {getStock(p) <= 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Out of stock
                  </span>
                )}
                <div className="aspect-square w-full bg-gray-800 flex items-center justify-center overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-3xl text-gray-500">📦</span>
                  )}
                </div>
                <div className="p-2 flex flex-col justify-between">
                  <p className="text-sm font-semibold text-white leading-tight">
                    {p.name}
                  </p>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-sm text-cyan-400 font-bold">
                      {formatCurrency(getPrice(p))}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        getStock(p) > 10
                          ? "text-gray-400"
                          : getStock(p) > 0
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {getStock(p)} left
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cart & Payment */}
        <div className="w-2/6 flex flex-col bg-gray-900 rounded-r-xl p-4 border-l border-gray-700">
          {/* Customer Selection */}
          <div className="mb-4 relative">
            <label className="text-sm font-medium text-gray-400 mb-1 block">
              Customer
            </label>
            <input
              type="text"
              placeholder="Search Customer"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            />
            {customerSearch && (
              <div className="absolute mt-1 top-full left-0 right-0 z-10 bg-gray-700 rounded-b-md max-h-40 overflow-y-auto shadow-lg">
                {[walkInCustomer, ...customers]
                  .filter((c) =>
                    c.name.toLowerCase().includes(customerSearch.toLowerCase())
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerSearch("");
                      }}
                      className="p-2 cursor-pointer hover:bg-blue-600"
                    >
                      {c.name}
                    </div>
                  ))}
              </div>
            )}
            {selectedCustomer && (
              <div className="mt-2 p-3 bg-blue-600 rounded-lg flex justify-between items-center">
                <p className="text-sm font-medium">{selectedCustomer.name}</p>
                <button
                  onClick={() => setSelectedCustomer(walkInCustomer)}
                  className="text-xs text-gray-300 hover:text-white"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto border-t border-b border-gray-700 py-2 my-2">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 pt-10">Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between mb-2 p-2 rounded-md hover:bg-gray-800"
                >
                  <p className="text-sm flex-grow truncate pr-2">{item.name}</p>
                  <div className="flex items-center">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 bg-gray-700 rounded-l hover:bg-gray-600"
                      title="Decrease"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={
                        (getStock(products.find((p) => p.id === item.id))) ||
                        item.quantity
                      }
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          item.id,
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      className="w-16 px-2 py-1 text-center bg-gray-700 border-x border-gray-600"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={
                        item.quantity >=
                        ((getStock(products.find((p) => p.id === item.id))) ||
                          item.quantity)
                      }
                      className="px-2 py-1 bg-gray-700 rounded-r hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Increase"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm w-24 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => updateQuantity(item.id, 0)}
                    className="ml-2 text-red-500 hover:text-red-400 text-lg"
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Totals & Payment */}
          <div className="pt-2">
            <div className="flex justify-between text-xl font-bold mb-2">
              <span>Total:</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <select
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                className="p-2 bg-gray-700 rounded border border-gray-600 flex-grow"
              >
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
                <option value="check">Check</option>
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount Paid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="p-2 bg-gray-700 rounded border border-gray-600 w-32"
              />
            </div>
            <div className="flex justify-between text-md mb-4">
              <span>Change:</span>
              <span className="text-cyan-400 font-semibold">
                {formatCurrency(change)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isProcessing || cart.length === 0 || !selectedCustomer}
              className="w-full p-4 bg-green-600 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Processing..." : "Complete Sale"}
            </button>
            {checkoutStatus.message && (
              <p
                className={`text-center text-sm mt-2 ${
                  checkoutStatus.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {checkoutStatus.message}
              </p>
            )}
          </div>
          <button
            onClick={clearCart}
            className="text-center w-full mt-2 text-xs text-gray-500 hover:text-red-500"
          >
            Clear Cart
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default POS;
