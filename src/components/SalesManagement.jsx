import React, { useState } from 'react';
import { addSale, updateProduct } from '../firebase/firestore';

const SalesManagement = ({ sales, setSales, customers, products, setProducts }) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [error, setError] = useState(null);

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find(p => p.id === productId);
    console.log("Selected product in handleProductSelect:", product);
    if (product && !selectedProducts.find(item => item.id === productId)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    const newQuantity = parseInt(quantity);
    console.log("Quantity change for product:", productId, "new quantity:", newQuantity);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      setSelectedProducts(selectedProducts.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    } else {
      setSelectedProducts(selectedProducts.map(item => 
        item.id === productId ? { ...item, quantity: 1 } : item
      ));
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price);
      const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity);
      if (isNaN(price) || isNaN(quantity)) {
        console.error("Invalid price or quantity for item:", item);
        return total;
      }
      return total + (price * quantity);
    }, 0);
  };

  const handleRecordSale = async () => {
    if (!selectedCustomer || selectedProducts.length === 0) {
      setError('Please select a customer and at least one product.');
      return;
    }

    try {
      // Get customer details for the sale record
      const customer = customers.find(c => c.id === selectedCustomer);
      
      const sale = {
        customerId: selectedCustomer,
        customerName: customer ? customer.name : 'Walk-in Customer',
        date: new Date().toISOString(),
        items: selectedProducts.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          priceAtSale: typeof item.price === 'number' ? item.price : parseFloat(item.price),
        })),
        products: selectedProducts.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price),
        })),
        totalAmount: calculateTotal(),
      };
      const newSale = await addSale(sale);
      setSales([...sales, newSale]);

      // Update product stock
      for (const item of selectedProducts) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          const newStock = product.stock - item.quantity;
          await updateProduct(product.id, { stock: newStock });
        }
      }
      setProducts(products.map(p => {
        const soldItem = selectedProducts.find(item => item.id === p.id);
        if (soldItem) {
          return { ...p, stock: p.stock - soldItem.quantity };
        }
        return p;
      }));

      // Clear form
      setSelectedCustomer('');
      setSelectedProducts([]);
      setError(null);
      alert('Sale recorded successfully!');
    } catch (error) {
      setError(error.message);
      console.error("Error recording sale:", error);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Sales Management</h2>
      
      {error && <p className="text-red-500">{error}</p>}

      <div>
        <div className="mb-4">
          <label htmlFor="customer" className="block mb-2 text-sm font-medium">Select Customer</label>
          <select id="customer" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
            <option value="">-- Select Customer --</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name} ({customer.email})</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="product" className="block mb-2 text-sm font-medium">Add Product to Sale</label>
          <select id="product" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" onChange={handleProductSelect} value="">
            <option value="">-- Select Product --</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name} (Stock: {product.stock})</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Selected Products</h3>
          {selectedProducts.length === 0 ? (
            <p>No products selected.</p>
          ) : (
            <table className="min-w-full bg-gray-800">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Product</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Price</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Quantity</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Subtotal</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map(item => {
                  const price = typeof item.price === 'number' ? item.price : parseFloat(item.price);
                  const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity);
                  const subtotal = !isNaN(price) && !isNaN(quantity) ? (price * quantity) : 0;
                  return (
                    <tr key={item.id}>
                      <td className="py-2 px-4 border-b border-gray-700">{item.name}</td>
                      <td className="py-2 px-4 border-b border-gray-700">${!isNaN(price) ? price.toFixed(2) : 'N/A'}</td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        <input 
                          type="number" 
                          min="1" 
                          value={!isNaN(quantity) ? quantity : 1} 
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)} 
                          className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md"
                        />
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">${subtotal.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        <button onClick={() => handleRemoveProduct(item.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
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

        <div className="text-right text-2xl font-bold mb-4">
          Total: ${calculateTotal().toFixed(2)}
        </div>

        <button onClick={handleRecordSale} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Record Sale
        </button>
      </div>
    </div>
  );
};

export default SalesManagement;
