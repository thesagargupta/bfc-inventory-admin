import React, { useState, useEffect } from "react";
import "./Home.css";
import { IoLogOutOutline } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";

const API_URL = "http://localhost:5000/api/categories";

function Home({ onLogout }) {
  const [categories, setCategories] = useState([]);
  const FIXED_CATEGORIES = [
    "Dairy", "Poultry", "Bakery", "Grocery",
    "Fruits", "Vegitables", "Packaging", "Mezza"
  ];
  const [categoryName, setCategoryName] = useState("");
  const [items, setItems] = useState([{ name: "", unit: "" }]);
  const [loading, setLoading] = useState(false);
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
      toast.error("Failed to fetch categories");
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
      toast.error("Category name and all item fields are required");
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Saving category...');
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName, items }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Category saved!", { id: toastId });
        setCategoryName("");
        setItems([{ name: "", unit: "" }]);
        fetchCategories();
        setActiveTab(categoryName);
      } else {
        toast.error(data.error || "Failed to save category", { id: toastId });
      }
    } catch {
      toast.error("Failed to save category", { id: toastId });
    }
    setLoading(false);
  };

  const handleDelete = (name) => {
    toast((t) => (
     <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  {/* Item 1: The text */}
  <span>
    Delete category <b>{name}</b>?
  </span>

  {/* Item 2: The 'Yes' button */}
  <button
    onClick={() => {
      toast.dismiss(t.id);
      deleteCategory(name);
    }}
    style={{
      background: '#f44336',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    Yes
  </button>

  {/* Item 3: The 'No' button */}
  <button
    onClick={() => toast.dismiss(t.id)}
    style={{
      background: '#ccc',
      color: 'black',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    No
  </button>
</span>
    ));
  };

  const deleteCategory = async (name) => {
    setLoading(true);
    const toastId = toast.loading('Deleting category...');
    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Category deleted", { id: toastId });
        const newCategories = categories.filter(c => c.name !== name);
        setCategories(newCategories);
        if (activeTab === name) {
          if (newCategories.length > 0) {
            setActiveTab(newCategories[0].name);
          } else {
            setActiveTab(null);
          }
        }
      } else {
        toast.error("Failed to delete category", { id: toastId });
      }
    } catch {
      toast.error("Failed to delete category", { id: toastId });
    }
    setLoading(false);
  };

  const handleDeleteItems = (catName) => {
    if (selectedItems.length === 0) return;
    toast((t) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  {/* Item 1: The confirmation text */}
  <span>
    Delete {selectedItems.length} item(s) from <b>{catName}</b>?
  </span>

  {/* Item 2: The 'Yes' button */}
  <button
    onClick={() => {
      toast.dismiss(t.id);
      deleteItems(catName);
    }}
    style={{
      background: '#f44336',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    Yes
  </button>

  {/* Item 3: The 'No' button */}
  <button
    onClick={() => toast.dismiss(t.id)}
    style={{
      background: '#ccc',
      color: 'black',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    No
  </button>
</span>
    ));
  };

  const deleteItems = async (catName) => {
    setLoading(true);
    const toastId = toast.loading('Deleting item(s)...');
    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(catName)}/delete-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemsToDelete: selectedItems })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Item(s) deleted", { id: toastId });
        setSelectedItems([]);
        setEditMode(false);
        fetchCategories(); // Refetch to update the UI
      } else {
        toast.error(data.error || "Failed to delete items", { id: toastId });
      }
    } catch {
      toast.error("Failed to delete items", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <div className="home-container">
      <Toaster position="top-center" reverseOrder={false} />
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

      {loading && categories.length === 0 ? ( // Show loading only on initial fetch
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