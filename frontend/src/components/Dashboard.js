import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ProductForm from "./ProductForm";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/products/${id}`);
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        alert("Error deleting product");
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Inventory Dashboard - {user.companyName}</h1>
        <div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Product
          </button>
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {showForm && (
        <ProductForm product={editingProduct} onClose={handleFormClose} />
      )}

      <div className="products-grid">
        {products.length === 0 ? (
          <p>No products yet. Add your first product!</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-card">
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} />
              )}
              <h3>{product.name}</h3>
              <p>
                <strong>Category:</strong> {product.category}
              </p>
              <p>
                <strong>Quantity:</strong> {product.quantity}
              </p>
              <p>
                <strong>Price:</strong> ₹{product.price}
              </p>
              <div className="product-actions">
                <button
                  onClick={() => handleEdit(product)}
                  className="btn-edit">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="usage-info">
        <p>Products: {products.length}/50 (Free Plan)</p>
      </div>
    </div>
  );
};

export default Dashboard;
