# Cursor Based Pagination POSTGRESQL

Project is a simple web application that allows users to upload, view, paginate, and export CSV files in different formats (CSV, PDF). The app is built with a **ReactJS** frontend and **NodeJS** backend, connected to a PostgreSQL database.

## Folder Structure

The project contains two main folders:

- `frontend`: Contains the ReactJS code for the user interface.
- `backend`: Contains the NodeJS and ExpressJS code for the server-side logic, including database interactions and API routes.

## Frontend

### Technologies Used:

- ReactJS
- Axios (for HTTP requests)

### Main Components:

- **Upload Component**:

  - Allows users to upload a CSV file to the backend.
  - Sends the file to the server via a POST request to import it into the PostgreSQL database.

- **View Component**:
  - Displays the CSV file content with **cursor-based pagination**.
  - Allows users to export the viewed data either as a **CSV** or **PDF** file.


# Backend

## Technologies Used:

- **Node.js**
- **Express.js**
- **PostgreSQL (psql)**
- **Multer** (for file uploads)
- **json2csv** (for CSV export)
- **PDFKit** (for PDF export)

## Main Code:

### `server.js`:

The main backend code is located in `server.js`, which handles API routes, database operations, file uploads, pagination, and data export.

### Database Connection:

The PostgreSQL database is connected via `db.js`, where the connection configuration and pool setup are stored.

## Routes:

The backend exposes four main API routes:

### `POST /upload`:

- Upload and import a CSV file into the database.
- Takes the CSV file as input and stores the data in the PostgreSQL database.

### `GET /data`:

- Fetches the CSV data with cursor-based pagination.
- You can specify the limit (number of rows per page) and offset (the page number) in the query parameters.

### `POST /export/csv`:

- Exports the current viewed data as a CSV file.

### `POST /export/pdf`:

- Exports the current viewed data as a PDF file.

## Setup Instructions for Backend:

1. Navigate to the backend folder.
2. Install the required dependencies:

   ```bash
   npm install
   ```

and then start backend server with npm start
