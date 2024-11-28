const express = require("express");
const pool = require("./db");
const bodyParser = require("body-parser");
const multer = require("multer");
const fastCsv = require("fast-csv");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { parse } = require("json2csv");
const PDFDocument = require("pdfkit");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });
let tableName = "Temp";

// Route to upload a CSV file and insert data into the database
app.post("/upload-csv", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  tableName = req.body.name;

  try {
    const rows = [];
    const headers = [];

    // Parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(fastCsv.parse({ headers: true }))
        .on("data", (row) => rows.push(row))
        .on("headers", (header) => headers.push(...header))
        .on("end", resolve)
        .on("error", reject);
    });

    // Generate SQL to create table
    const createTableQuery = `
  CREATE TABLE IF NOT EXISTS ${tableName} (
    uuid SERIAL PRIMARY KEY,  -- Auto-incrementing id, can be inserted from CSV if present
    ${headers
      .map((header) => `${header} TEXT`) // Map all columns as TEXT for simplicity
      .join(", ")}
  );
`;

    await pool.query(createTableQuery);

    // Generate SQL to insert rows
    const insertQuery = `
      INSERT INTO ${tableName} (${headers.join(", ")})
      VALUES ${rows
        .map(
          (row) =>
            `(${headers
              .map((header) => `'${row[header].replace("'", "''")}'`)
              .join(", ")})`
        )
        .join(", ")};
    `;
    await pool.query(insertQuery);
    console.log("CSV file processed and data inserted successfully.");
    res.json({ message: "Table created and data inserted successfully." });
  } catch (error) {
    console.error("Error processing CSV:", error);
    res.status(500).json({ error: "Failed to process CSV file." });
  } finally {
    // Cleanup uploaded file
    fs.unlinkSync(filePath);
  }
});

// Route to fetch data from the database
app.get("/api/data", async (req, res) => {
  try {
    const { limit = 10, cursor } = req.query;
    const limitInt = parseInt(limit, 10);
    const cursorInt = cursor ? parseInt(cursor, 10) : 0;
    console.log("cursor and limit movement");
    console.log(cursorInt, "   ", cursor, "  ", limitInt);

    // Fetch data from the database based on the cursor and limit
    const result = await pool.query(
      cursorInt
        ? `SELECT * FROM ${tableName} WHERE uuid > $1 ORDER BY uuid ASC LIMIT $2`
        : `SELECT * FROM ${tableName} ORDER BY uuid ASC LIMIT $1`,
      cursorInt ? [cursorInt, limitInt] : [limitInt]
    );

    // Calculate the next cursor
    const nextCursor =
      result.rows.length === limitInt
        ? result.rows[result.rows.length - 1].uuid
        : null;
    console.log(result.rows.length, nextCursor);
    res.json({
      data: result.rows,
      nextCursor, // Pass the nextCursor to the client
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
});

// Route to export data as a CSV
app.post("/api/export", (req, res) => {
  try {
    const { data } = req.body; // Get the data sent from the frontend
    const csv = parse(data); // Convert the data to CSV using json2csv

    // Set response headers to trigger a file download
    res.header("Content-Type", "text/csv");
    res.attachment("exported-data.csv");
    res.send(csv); // Send the CSV content
  } catch (err) {
    console.error("Error exporting data:", err);
    res.status(500).send("Error exporting data");
  }
});

// Route to export data as a PDF
app.post("/api/export2", (req, res) => {
  const { data } = req.body;

  if (!data || data.length === 0) {
    return res.status(400).send("No data provided.");
  }

  const doc = new PDFDocument();

  // Set the response headers for downloading the PDF
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=exported-data.pdf"
  );

  doc.pipe(res); // Pipe the PDF to the response

  // Title of the document
  doc.fontSize(16).text("Exported Data", { align: "center" });
  doc.moveDown(2);

  // Extract column names dynamically from the first data object
  const columns = Object.keys(data[0]);

  // Calculate dynamic column widths based on the number of columns
  const pageWidth = 500;
  const columnWidth = pageWidth / columns.length;

  // Draw the table headers
  const baseY = doc.y;
  columns.forEach((col, index) => {
    doc.fontSize(12).text(col.toUpperCase(), 50 + index * columnWidth, baseY, {
      width: columnWidth,
      align: "center",
    });
  });

  // Draw a line below the headers for clarity
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(pageWidth, doc.y).stroke();

  // Start positioning for the data rows
  let yPosition = doc.y + 5;
  let rowCount = 0;

  // Function to add a page and redraw headers
  function addNewPage() {
    doc.addPage();
    yPosition = 50;
    yPosition += 20;
  }

  // Assign 25 records to a page and then add a new page
  data.forEach((row) => {
    if (rowCount >= 25) {
      addNewPage();
      rowCount = 0; // Reset the row count for the new page
    }

    // Add the row data dynamically based on the column keys
    columns.forEach((col, index) => {
      doc
        .fontSize(10)
        .text(row[col]?.toString() || "", 50 + index * columnWidth, yPosition, {
          width: columnWidth,
          align: "center",
        });
    });

    yPosition += 20;
    rowCount++;
  });

  // Finalize the PDF and send it to the client
  doc.end();
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
