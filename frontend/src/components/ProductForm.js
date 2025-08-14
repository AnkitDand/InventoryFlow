import React, { useState } from "react";
import axios from "axios";

const ProductForm = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || "",
    quantity: product?.quantity || "",
    price: product?.price || "",
    imageUrl: product?.imageUrl || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product) {
        // Update existing product
        await axios.put(`/products/${product.id}`, formData);
      } else {
        // Create new product
        await axios.post("/products", formData);
      }
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{product ? "Edit Product" : "Add New Product"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
          <input
            type="url"
            name="imageUrl"
            placeholder="Image URL (optional)"
            value={formData.imageUrl}
            onChange={handleChange}
          />
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Saving..." : product ? "Update" : "Create"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
