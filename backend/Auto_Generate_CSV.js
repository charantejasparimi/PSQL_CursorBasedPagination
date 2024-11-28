const fs = require("fs");

function generateCSV(rowCount, fileName) {
  const header = ["id", "name", "email", "age", "city"];
  const data = [];

  // Generate rows of data
  for (let i = 1; i <= rowCount; i++) {
    const id = i;
    const name = `User_${i}`;
    const email = `user${i}@example.com`;
    const age = Math.floor(Math.random() * 60) + 18; // Random age between 18 and 77
    const city = `City_${Math.floor(Math.random() * 100)}`;

    data.push([id, name, email, age, city]);
  }

  // Convert the header and data to CSV format
  const csvContent = [
    header.join(","),
    ...data.map((row) => row.join(",")),
  ].join("\n");

  // Write CSV to file
  fs.writeFileSync(fileName, csvContent, "utf8");
  console.log(`CSV file ${fileName} has been created with ${rowCount} rows.`);
}

// Example: Create a CSV file with 100,000 rows
generateCSV(100000, "large_data.csv");
