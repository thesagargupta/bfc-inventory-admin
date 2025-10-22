import React, { useState, useRef } from "react";
import "./ExcelUpload.css";
import toast from "react-hot-toast";
import { AiOutlineCloudUpload, AiOutlineFileExcel } from "react-icons/ai";

const API_URL = "http://localhost:5000/api/categories";

function ExcelUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    const validTypes = [
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];
    
    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.endsWith('.xls') && 
        !selectedFile.name.endsWith('.xlsx')) {
      toast.error("Please upload a valid Excel file (.xls or .xlsx)");
      return;
    }

    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Uploading and processing Excel file...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/excel-upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          `Success! ${data.stats?.categoriesProcessed || 0} categories, ${data.stats?.itemsProcessed || 0} items added`,
          { id: toastId, duration: 4000 }
        );
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        toast.error(data.error || "Failed to upload file", { id: toastId });
      }
    } catch {
      toast.error("Network error: Failed to upload file", { id: toastId });
    }

    setLoading(false);
  };

  const handleDownloadTemplate = () => {
    // Create sample data
    const sampleData = [
      { Category: "Dairy", "Item Name": "Milk", Unit: "ltr" },
      { Category: "Dairy", "Item Name": "Cheese", Unit: "gm" },
      { Category: "Bakery", "Item Name": "Bread", Unit: "pc" },
      { Category: "Grocery", "Item Name": "Rice", Unit: "kg" },
      { Category: "Fruits", "Item Name": "Apple", Unit: "kg" },
    ];

    // Convert to CSV format
    const headers = ["Category", "Item Name", "Unit"];
    const csvContent = [
      headers.join(","),
      ...sampleData.map((row) =>
        headers.map((header) => `"${row[header]}"`).join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "inventory_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Template downloaded! You can open it in Excel and fill in your data.");
  };

  return (
    <div className="excel-upload-container">
      <div className="excel-upload-header">
        <h3>📤 Upload Excel File</h3>
        <p>Upload an Excel file with columns: Category, Item Name, Unit</p>
      </div>

      <div className="template-download">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="download-template-btn"
        >
          <AiOutlineFileExcel /> Download Sample Template
        </button>
      </div>

      <div
        className={`drop-zone ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
        />
        
        <AiOutlineCloudUpload className="upload-icon" />
        
        {file ? (
          <div className="file-info">
            <p className="file-name">📁 {file.name}</p>
            <p className="file-size">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        ) : (
          <div className="upload-text">
            <p>Drag and drop your Excel file here</p>
            <p className="upload-subtext">or click to browse</p>
            <p className="file-types">Supported: .xls, .xlsx</p>
          </div>
        )}
      </div>

      {file && (
        <div className="upload-actions">
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="upload-btn"
          >
            {loading ? "Uploading..." : "Upload & Process"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            disabled={loading}
            className="cancel-btn"
          >
            Clear
          </button>
        </div>
      )}

      <div className="excel-format-info">
        <h4>📋 Expected Excel Format:</h4>
        <table className="format-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Item Name</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dairy</td>
              <td>Milk</td>
              <td>ltr</td>
            </tr>
            <tr>
              <td>Dairy</td>
              <td>Cheese</td>
              <td>gm</td>
            </tr>
            <tr>
              <td>Bakery</td>
              <td>Bread</td>
              <td>pc</td>
            </tr>
          </tbody>
        </table>
        <p className="format-note">
          ⚠️ Make sure your Excel file has these exact column names (case-insensitive)
        </p>
      </div>
    </div>
  );
}

export default ExcelUpload;
