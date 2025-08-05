import React, { useState, useEffect } from "react";
import "./Home.css";
import { IoLogOutOutline } from "react-icons/io5";

const API_URL = "https://bfc-inventory-backend.onrender.com/api/categories";

function Home({ onLogout }) {
  const [categories, setCategories] = useState([]);
  const FIXED_CATEGORIES = [
    "Dairy", "Poultry", "Bakery", "Grocery",
    "Fruits", "Vegitables", "Packaging", "Mezza"
  ];
  const [categoryName, setCategoryName] = useState("");
  const [items, setItems] = useState([{ name: "", unit: "" }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCategories(data);
      if (data.length > 0 && activeTab === null) {
        setActiveTab(data[0].name);
      }
    } catch {
      setMessage("Failed to fetch categories");
    }
    setLoading(false);
  };

  const handleItemChange = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { name: "", unit: "" }]);

  const removeItem = (idx) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim() || items.some(i => !i.name.trim() || !i.unit.trim())) {
      setMessage("Category name and all item fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName, items }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Category saved!");
        setCategoryName("");
        setItems([{ name: "", unit: "" }]);
        fetchCategories();
        setActiveTab(categoryName);
      } else {
        setMessage(data.error || "❌ Failed to save category");
      }
    } catch {
      setMessage("❌ Failed to save category");
    }
    setLoading(false);
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete category ${name}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("🗑️ Category deleted");
        fetchCategories();
      } else {
        setMessage("❌ Failed to delete");
      }
    } catch {
      setMessage("❌ Failed to delete");
    }
    setLoading(false);
  };

  // Delete selected items from a category
  const handleDeleteItems = async (catName) => {
    if (selectedItems.length === 0) return;
    if (!window.confirm(`Delete selected items from ${catName}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(catName)}/delete-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemsToDelete: selectedItems })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("🗑️ Item(s) deleted");
        setSelectedItems([]);
        setEditMode(false);
        fetchCategories();
      } else {
        setMessage(data.error || "❌ Failed to delete items");
      }
    } catch {
      setMessage("❌ Failed to delete items");
    }
    setLoading(false);
  };

  return (
    <div className="home-container">
      <div className="topbar">
        <h2>Admin: Add/Edit Inventory Category</h2>
        <IoLogOutOutline
          onClick={onLogout}
          title="Logout"
          className="logout-icon"
        />
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Category Name</label>
          <select
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {FIXED_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group items-group">
          <label>Items</label>
          {items.map((item, idx) => (
            <div key={idx} className="item-row">
              <input
                placeholder="Item Name"
                value={item.name}
                onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                required
              />
              <input
                placeholder="Unit (e.g. gm, ml, pc)"
                value={item.unit}
                onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                disabled={items.length === 1}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="add-item-wrapper">
            <button type="button" onClick={addItem} className="add-btn">
              Add Item
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Saving..." : "Save Category"}
        </button>
      </form>

      {message && <div className={`message ${message.startsWith("✅") ? "success" : "error"}`}>{message}</div>}

      <h3>Existing Categories</h3>
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`category-tab${activeTab === cat.name ? " active" : ""}`}
            onClick={() => setActiveTab(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="category-tab-content">
          {categories
            .filter((cat) => cat.name === activeTab)
            .map((cat) => (
              <div key={cat._id} className="category-card">
                <div className="category-header">
                  <b>{cat.name}</b> <span>({cat.items.length} items)</span>
                  <button
                    onClick={() => setEditMode((m) => !m)}
                    className="delete-btn"
                  >
                    {editMode ? "Cancel" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete(cat.name)}
                    className="delete-btn"
                    style={{ marginLeft: 8 }}
                  >
                    Delete Category
                  </button>
                </div>
                <ul className="item-list">
                  {cat.items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center' }}>
                      {editMode && activeTab === cat.name && (
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.name)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedItems(prev => [...prev, item.name]);
                            } else {
                              setSelectedItems(prev => prev.filter(n => n !== item.name));
                            }
                          }}
                          style={{ marginRight: 8 }}
                        />
                      )}
                      {item.name} ({item.unit})
                    </li>
                  ))}
                </ul>
                {editMode && (
                  <button
                    className="delete-btn"
                    style={{ marginTop: 8 }}
                    onClick={() => handleDeleteItems(cat.name)}
                    disabled={selectedItems.length === 0 || loading}
                  >
                    Delete Selected Item(s)
                  </button>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default Home;
