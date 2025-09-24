import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { uploadToCloudinary } from '../utils/cloudinary';

const EditProductModal = ({ isOpen, product, onClose, onUpdate, categories }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setStock(product.stock);
      setCategoryId(product.categoryId);
      setImage(product.imageUrl);
      setImagePreview(product.imageUrl);
    }
  }, [product]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = product.imageUrl;
      if (image && image instanceof File) {
        imageUrl = await uploadToCloudinary(image);
      }
      const productData = {
        name,
        description,
        price,
        stock,
        categoryId,
      };
      if (imageUrl) {
        productData.imageUrl = imageUrl;
      }
      await onUpdate(product.id, productData);
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      // If product doesn't exist, show a specific message
      if (error.message && error.message.includes("does not exist")) {
        alert("This product has been deleted and cannot be updated. Please add the product again.");
        onClose();
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2 text-sm font-medium">Name</label>
          <input type="text" name="name" id="name" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2 text-sm font-medium">Description</label>
          <textarea name="description" id="description" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block mb-2 text-sm font-medium">Price</label>
          <input type="number" name="price" id="price" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="mb-4">
          <label htmlFor="stock" className="block mb-2 text-sm font-medium">Stock</label>
          <input type="number" name="stock" id="stock" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block mb-2 text-sm font-medium">Category</label>
          <select name="category" id="category" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">Select a category</option>
            {categories.map((category, index) => (
              <option key={`${category.id}-${index}`} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="image" className="block mb-2 text-sm font-medium">Image</label>
          <input type="file" name="image" id="image" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleImageChange} />
        </div>
        {imagePreview && <img src={imagePreview} alt="Product Preview" className="w-full rounded-md mb-4" />}
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
            Cancel
          </button>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;
