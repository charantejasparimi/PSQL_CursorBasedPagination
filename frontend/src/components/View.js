import React, { useState, useEffect } from "react";

const View = ({ tableName }) => {
  const [data, setData] = useState([]); // Stores paginated data
  const [cursor, setCursor] = useState(0); // Tracks the current cursor
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // To check if more data is available

  // Function to fetch data from the backend
  const fetchData = async (cursor = null, tableName) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        table: tableName,
        limit: 10,
        ...(cursor && { cursor }), // Only add cursor if it's not null
      }).toString();
      // Fetching data from the backend
      const response = await fetch(
        `${process.env.REACT_APP_PORT}/api/data?${queryParams}`
      );
      const result = await response.json();

      const newData = result.data || [];
      const nextCursor = result.nextCursor;

      setData((prevData) => [...prevData, ...newData]);
      setCursor(nextCursor); // Update cursor for the next batch
      setHasMore(nextCursor !== null);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  // Fetch initial data when the component mounts or tableName changes
  useEffect(() => {
    // Reset state when table name changes
    setData([]);
    setCursor(0);
    setHasMore(true);
  }, [tableName]);

  // Function to load more data
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchData(cursor, tableName);
    }
  };

  // Export CSV
  const downloadCSV = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_PORT}/api/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data, table: tableName }),
      });

      const csv = await response.text();
      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${tableName}-data.csv`;
      link.click();
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };

  // Export PDF
  const downloadPDF = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_PORT}/api/export2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data, table: tableName }),
        }
      );

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${tableName}-data.pdf`;
      link.click();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1 style={{ color: "#333", marginBottom: "20px" }}>
        Viewing Data for: {tableName}
      </h1>
      <table
        border="1"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            {data.length > 0 &&
              Object.keys(data[0]).map((header, index) => (
                <th
                  key={index}
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  {header}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.keys(row).map((key, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}`}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {loading && (
        <p style={{ fontStyle: "italic", color: "#666" }}>Loading...</p>
      )}
      {hasMore && !loading && (
        <button
          onClick={loadMore}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          {/* To Display the table values */}
          Load More
        </button>
      )}
      {!hasMore && <p>No more data</p>}
      <div>
        <button
          onClick={downloadCSV}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginRight: "10px",
          }}
        >
          Export to CSV
        </button>
        <button
          onClick={downloadPDF}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#FF5722",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Export to PDF
        </button>
      </div>
    </div>
  );
};

export default View;
