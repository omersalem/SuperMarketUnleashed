import React, { useState } from 'react';
import { addPurchase, updateProduct } from '../firebase/firestore';

const PurchaseManagement = ({ purchases, setPurchases, vendors, products, setProducts }) => {
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [error, setError] = useState(null);

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

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find(p => p.id === productId);
    if (product && !selectedProducts.find(item => item.id === productId)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    const newQuantity = parseInt(quantity);
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

  const handleRecordPurchase = async () => {
    if (!selectedVendor || selectedProducts.length === 0) {
      setError('Please select a vendor and at least one product.');
      return;
    }

    try {
      // Get vendor details for the purchase record
      const vendor = vendors.find(v => v.id === selectedVendor);
      
      const purchase = {
        vendorId: selectedVendor,
        vendorName: vendor ? vendor.name : 'Unknown Vendor',
        date: new Date().toISOString(),
        items: selectedProducts.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          priceAtPurchase: typeof item.price === 'number' ? item.price : parseFloat(item.price),
        })),
        products: selectedProducts.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price),
        })),
        totalAmount: calculateTotal(),
      };
      const newPurchase = await addPurchase(purchase);
      setPurchases([...purchases, newPurchase]);

      // Update product stock
      for (const item of selectedProducts) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          const newStock = product.stock + item.quantity;
          await updateProduct(product.id, { stock: newStock });
        }
      }
      setProducts(products.map(p => {
        const purchasedItem = selectedProducts.find(item => item.id === p.id);
        if (purchasedItem) {
          return { ...p, stock: p.stock + purchasedItem.quantity };
        }
        return p;
      }));

      // Clear form
      setSelectedVendor('');
      setSelectedProducts([]);
      setError(null);
      alert('Purchase recorded successfully!');
    } catch (error) {
      setError(error.message);
      console.error("Error recording purchase:", error);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Purchase Management</h2>
      
      {error && <p className="text-red-500">{error}</p>}

      <div>
        <div className="mb-4">
          <label htmlFor="vendor" className="block mb-2 text-sm font-medium">Select Vendor</label>
          <select id="vendor" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)}>
            <option value="">-- Select Vendor --</option>
            {vendors.map(vendor => (
              <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="product" className="block mb-2 text-sm font-medium">Add Product to Purchase</label>
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

        <button onClick={handleRecordPurchase} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Record Purchase
        </button>
      </div>
    </div>
  );
};

export default PurchaseManagement;
