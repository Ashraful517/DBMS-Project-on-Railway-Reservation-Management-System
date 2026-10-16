# Railway Management System

A railway reservation management system built with Node.js, Express, EJS, and MySQL. It provides passenger booking features and administrative tools for managing trains, routes, tickets, and seat availability.

## Features

- Passenger registration and login
- Train and route management
- Train search and seat availability
- Ticket booking, viewing, and cancellation
- Admin dashboard and earnings view

## Built With

- Node.js
- Express
- EJS
- MySQL

## Getting Started

### Requirements

- Node.js and npm
- MySQL

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ashraful517/DBMS_Project---Railway_Management_System.git
   cd DBMS_Project---Railway_Management_System
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local `.env` file from `.env.example` and set your MySQL connection values. The database name defaults to `DBMS_Project`.

4. Create the required database and tables in MySQL.

5. Start the server:

   ```bash
   node index.js
   ```

6. Open [http://localhost:8080/home](http://localhost:8080/home) in your browser.

Do not commit `.env`; it contains local credentials. Use `.env.example` as the shareable template.
