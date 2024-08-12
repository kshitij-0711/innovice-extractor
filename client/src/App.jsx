import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await axios.post(
        "http://localhost:3000/extract",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setExtractedData(response.data.extractedData);
    } catch (error) {
      console.error("Error extracting data:", error);
      alert("An error occurred while extracting data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Invoice Data Extractor</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button type="submit" disabled={!file || loading}>
          {loading ? "Extracting..." : "Extract Data"}
        </button>
      </form>
      {extractedData && (
        <div>
          <h2>Extracted Data:</h2>
          <p>
            <strong>Customer Details:</strong> {extractedData.customerDetails}
          </p>
          <p>
            <strong>Products:</strong> {extractedData.products}
          </p>
          <p>
            <strong>Total Amount:</strong> {extractedData.totalAmount}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
