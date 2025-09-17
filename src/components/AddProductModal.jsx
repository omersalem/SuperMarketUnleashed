import React, { useState } from 'react';
import Modal from './Modal';
import { uploadToCloudinary } from '../utils/cloudinary';

const AddProductModal = ({ isOpen, onClose, onAdd, categories }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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
      let imageUrl = null;
      if (image) {
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
      await onAdd(productData);
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
        <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">Add Product</h2>
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
          <input type="number" name="price" id="price" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} />
        </div>
        <div className="mb-4">
          <label htmlFor="stock" className="block mb-2 text-sm font-medium">Stock</label>
          <input type="number" name="stock" id="stock" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block mb-2 text-sm font-medium">Category</label>
          <select name="category" id="category" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
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
            {uploading ? 'Uploading...' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProductModal;
