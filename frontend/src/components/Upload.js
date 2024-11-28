import React, { useState } from "react";
import axios from "axios";
import View from "./View";

function Upload() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [prop, setProp] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    if (!name) {
      setMessage("Please provide a table name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    // Uploading CSV File to Backend Server
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PORT}/upload-csv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(response.data.message || "File uploaded successfully!");
      setProp(name);

      // Clear the input fields after upload
      setFile(null);
      setName("");
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage(
        error.response?.data?.error ||
          "An error occurred while uploading the file."
      );
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f7fa",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 style={{ fontSize: "24px", color: "#333", textAlign: "center" }}>
        CSV File Upload
      </h1>
      <form
        onSubmit={handleUpload}
        style={{ maxWidth: "500px", margin: "0 auto" }}
      >
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            value={name}
            placeholder="Table Name"
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
              marginBottom: "10px",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              fontSize: "16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Upload
          </button>
        </div>
      </form>
      {message && (
        <div
          style={{
            marginTop: "20px",
            color: "blue",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}
      {/* Sending Table Name to View Component through Props */}
      {prop && <View tableName={prop} />}
    </div>
  );
}

export default Upload;
