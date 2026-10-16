require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const methodOverride = require("method-override");
const port = 8080

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "Frontend")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  database: process.env.DB_NAME || "DBMS_Project",
  password: process.env.DB_PASSWORD || "pass123",
});


app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname,"Frontend","FirstPage.html"))
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname,"Frontend","AdminLogin.html"))
  });


 app.get("/admin", (req, res) => {
    const { id: username, pass } = req.query;

    try {
        connection.query(
            `SELECT password FROM admin WHERE username = ?`,
            [username],
            (error, results) => {
                if (error || results.length === 0) {
                    throw error
                }
                if (results[0].password === pass) {
                    res.sendFile(
                        path.join(__dirname, "Frontend", "Admin_dash.html")
                    );
                } else {
                    res.send("Invalid Credentials");
                }
            }
        );
    } catch (error) {
        res.send("No Account Found!!!!")
        console.log(error)
    }
});

app.get("/addtrain", (req, res) => {
    // Extract data from query parameters
    const { name, type, total_seats, cabin_seats, business_seats, economy_seats, fc_seats } = req.query;

   
    if (!name || !type || !total_seats || !cabin_seats || !business_seats || !economy_seats || !fc_seats) {
        return res.status(400).send("All fields are required.");
    }

    // SQL query to insert data into the trains table
    const q = `INSERT INTO trains (train_name, train_type, total_seats, cabin_seats, business_seats, economy_seats, first_class_seats) VALUES (?)`;

    // Prepare the values to be inserted
    const values = [name, type, total_seats, cabin_seats, business_seats, economy_seats, fc_seats];

    connection.query(q, [values], (err, result) => {
        if (err) {
            console.error("Error inserting data into the trains table:", err);
            return res.status(500).send("An error occurred while adding the train.");
        }

        console.log("Data inserted successfully:", result);
        res.redirect(`http://localhost:8080/showTrains`);

        // Redirect to the /admin route
        
    });
});



app.get('/showTrains', (req, res) => {
   
    const q = 'SELECT * FROM trains';
    
    // Execute the query
    connection.query(q, (err, result) => {
        if (err) {
            console.error('Error fetching trains:', err);
            return res.status(500).send('An error occurred while fetching the trains.');
        }

        // Render the 'showTrains' view and pass the results
        res.render('showTrains', { trains: result });
    });
});


app.post('/edit', (req, res) => {
    const {
        train_id,train_name,train_type,total_seats,cabin_seats,business_seats,economy_seats,first_class_seats} = req.body;

    if (
        !train_id ||!train_name ||!train_type ||!total_seats ||
        !cabin_seats ||!business_seats ||!economy_seats ||!first_class_seats
    ) {
        return res.status(400).send('All fields are required.');
    }

    // Update query
    const query = `
        UPDATE trains
        SET 
            train_name = ?, 
            train_type = ?, 
            total_seats = ?, 
            cabin_seats = ?, 
            business_seats = ?, 
            economy_seats = ?, 
            first_class_seats = ?
        WHERE train_id = ?
    `;

    const values = [train_name,train_type,total_seats,cabin_seats,business_seats,economy_seats,first_class_seats,train_id];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating train data:', err.message);
            return res.status(500).send('Database error occurred.');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('Train not found.');
        }

        res.send(`
            <script>
                alert("Train data updated successfully!");
                window.location.href = "/Admin_dash.html"; // Redirect to dashboard
            </script>
        `);
    });
});

app.post('/delete', (req, res) => {
    const train_id = req.body.train_id;

    // Validation to ensure train_id is provided
    if (!train_id) {
        return res.send(`
            <script>
                alert("Please enter a valid Train ID.");
                window.history.back(); // Go back to the form
            </script>
        `);
    }

    // SQL query to delete the train
    const query = `DELETE FROM trains WHERE train_id = ?`;

    connection.query(query, [train_id], (err, results) => {
        if (err) {
            console.error('Error deleting train:', err.message);
            return res.send(`
                <script>
                    alert("Database error: Unable to delete the train.");
                    window.history.back(); // Redirect back to the form
                </script>
            `);
        }

        if (results.affectedRows === 0) {
            // No rows were deleted, meaning Train ID was not found
            return res.send(`
                <script>
                    alert("Train ID not found.");
                    window.history.back(); // Redirect back to the form
                </script>
            `);
        }

        // Successful deletion
        res.send(`
            <script>
                alert("Train deleted successfully!");
                window.location.href = "/Admin_dash.html"; // Redirect to the dashboard
            </script>
        `);
    });
});

//route add
app.post('/routes', (req, res) => {
    const { departure_place, arrival_place, distance_km } = req.body;

    // Validate input
    if (!departure_place || !arrival_place || !distance_km) {
        return res.send(`
            <script>
                alert("All fields are required. Please try again.");
                window.history.back();
            </script>
        `);
    }

    // SQL query to insert the route
    const query = `INSERT INTO routes (departure_place, arrival_place, distance_km) VALUES (?, ?, ?)`;

    connection.query(query, [departure_place, arrival_place, distance_km], (err, results) => {
        if (err) {
            console.error('Error adding route:', err.message);
            return res.send(`
                <script>
                    alert("Database error: Unable to add the route.");
                    window.history.back();
                </script>
            `);
        }

        res.send(`
            <script>
                alert("Route added successfully!");
                window.location.href = "/Admin_dash.html"; // Redirect to admin dashboard
            </script>
        `);
    });
});

//Delete Route
app.post('/deleteRoute', (req, res) => {
    const { route_id } = req.body;

    // Validate input
    if (!route_id) {
        return res.send(`
            <script>
                alert("Route ID is required.");
                window.history.back();
            </script>
        `);
    }

    // SQL query to delete the route
    const query = `DELETE FROM routes WHERE route_id = ?`;

    connection.query(query, [route_id], (err, results) => {
        if (err) {
            console.error('Error deleting route:', err.message);
            return res.send(`
                <script>
                    alert("Database error: Unable to delete the route.");
                    window.history.back();
                </script>
            `);
        }

        if (results.affectedRows === 0) {
            return res.send(`
                <script>
                    alert("No route found with the given ID.");
                    window.history.back();
                </script>
            `);
        }

        res.send(`
            <script>
                alert("Route deleted successfully!");
                window.location.href = "/Admin_dash.html"; // Redirect to admin dashboard
            </script>
        `);
    });
});

//Enroute Train

app.post('/enroute', (req, res) => {
    const { train_id, route_id, departure_time, arrival_time,route_name } = req.body;

    // Validate input
    if (!train_id || !route_id || !departure_time || !arrival_time || !route_name) {
        return res.send(`
            <script>
                alert("All fields are required. Please fill out the form completely.");
                window.history.back();
            </script>
        `);
    }

    // SQL query to insert the train-route mapping into the train_routes table
    const query = `
        INSERT INTO train_routes (train_id, route_id, departure_time, arrival_time,train_route_name) 
        VALUES (?, ?, ?, ?,?)
    `;

    // Execute the query with the form data
    connection.query(
        query,
        [train_id, route_id, departure_time, arrival_time,route_name],
        (err, results) => {
            if (err) {
                console.error('Error assigning train to route:', err.message);
                return res.send(`
                    <script>
                        alert("Database error: Unable to assign train to the route.");
                        window.history.back();
                    </script>
                `);
            }

            // On successful insertion, send a success message with a redirect
            res.send(`
                <script>
                    alert("Train successfully assigned to the route!");
                    window.location.href = "/Admin_dash.html"; // Redirect to admin dashboard
                </script>
            `);
        }
    );
});

//show passenger list
app.get('/passenger_list', (req, res) => {
    const query = 'SELECT * FROM passengers';

    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.send('Error fetching passenger list.');
        }

        // Pass the passenger data to the EJS template
        res.render('passenger_list', { passengers: results });
    });
});

//check available seats

// Backend route for displaying available seats
app.get('/available_seats', (req, res) => {
    const { train_id, route_id } = req.query;

    const query = `
        SELECT t.train_name, t.total_seats,
               COUNT(b.booking_id) AS total_booked_seats, 
               (t.total_seats - COUNT(b.booking_id)) AS available_seats
        FROM trains t
        LEFT JOIN train_routes tr ON tr.train_id = t.train_id
        LEFT JOIN bookings b ON b.train_route_id = tr.train_route_id
        WHERE t.train_id = ? AND tr.route_id = ?
        GROUP BY t.train_id, tr.route_id;
    `;

    connection.query(query, [train_id, route_id], (err, result) => {
        if (err) {
            console.error("Error fetching available seats:", err);
            return res.status(500).send("Error fetching data.");
        }

        if (result.length === 0) {
            return res.send("No available seats found for the specified train and route.");
        }

        const train = result[0]; // Assume the result has one row
        res.render('available_seats_result', { train }); // Render the results in the EJS view
    });
});

//cancel Any seat
// Cancel Ticket Route (POST request to cancel booking)
app.post('/cancallation', (req, res) => {
    const { booking_id } = req.body; // Get booking_id from the form

    // SQL query to update booking status to 'Canceled'
    const query = `
        UPDATE bookings
        SET status = 'Canceled'
        WHERE booking_id = ?
        AND status = 'Confirmed';  
    `;

    connection.query(query, [booking_id], (err, result) => {
        if (err) {
            console.error("Error canceling ticket:", err);
            return res.status(500).send("Error canceling ticket.");
        }

        if (result.affectedRows === 0) {
            return res.send("Booking ID not found or already canceled.");
        }

        // Success response - Redirect to a success page or show success message
        res.send(`
            <script>
                alert("Booking has been canceled successfully!");
                window.location.href = "/Admin_dash.html"; // Redirect back to admin dashboard
            </script>
        `);
    });
});

//To update seat price

app.post('/update-seat-price', (req, res) => {
    const { train_id, seat_type, price } = req.body; // Get form data

    // Validate input
    if (!train_id || !seat_type || !price) {
        return res.status(400).send("All fields are required.");
    }

    // SQL query to update the seat price
    const query = `
        UPDATE seat_prices
        SET price = ?
        WHERE train_id = ? AND seat_type = ?
    `;

    // Execute the query
    connection.query(query, [price, train_id, seat_type], (err, result) => {
        if (err) {
            console.error("Error updating seat price:", err);
            return res.status(500).send("Error updating seat price.");
        }

        if (result.affectedRows === 0) {
            return res.send("No such train or seat type found.");
        }

        // Success message
        res.send(`
            <script>
                alert("Seat price updated successfully!");
                window.location.href = "/Admin_dash.html"; // Redirect back to admin dashboard
            </script>
        `);
    });
});

//Earning

// Show admin earnings
app.get('/admin/earnings', (req, res) => {
    const { startDate, endDate } = req.query;  // Optional date range for filtering

    // SQL query to calculate total earnings, filtered by date range if provided
    let query = `
        SELECT SUM(price) AS total_earnings,
               COUNT(CASE WHEN seat_type = 'Cabin' AND status = 'Confirmed' THEN 1 END) AS cabin_count,
               COUNT(CASE WHEN seat_type = 'Business' AND status = 'Confirmed' THEN 1 END) AS business_count,
               COUNT(CASE WHEN seat_type = 'Economy' AND status = 'Confirmed' THEN 1 END) AS economy_count,
               COUNT(CASE WHEN seat_type = 'First Class' AND status = 'Confirmed' THEN 1 END) AS first_class_count
        FROM bookings
        WHERE status = 'Confirmed'`;

    if (startDate && endDate) {
        query += ` AND booking_date BETWEEN ? AND ?`;
    }

    connection.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).send("Error calculating earnings.");
        }

        const earningsData = results[0];
        res.render('admin_earnings', { earningsData, startDate, endDate });
    });
});


////-----------------------------------------------------------------------------------------------------------------------------////


//passenger side.
//at first make passenger dashboard dynamic
app.get('/Pass_login', (req, res) => {
    res.sendFile(__dirname + '/Frontend/Pass_login.html'); // Adjust the path as needed
});
app.get('/passenger_dashboard', (req, res) => {
    // Assuming passenger's name is passed from the login
    const passengerName = req.query.name || "Passenger";
    
    // Render the dashboard EJS template with the passenger's name
    res.render('passenger_dashboard', { passengerName });
});

app.post('/pass_login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM passengers WHERE email = ?';
    connection.execute(query, [email], (err, results) => {
        if (err) {
            console.error('Database query error: ', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            // Passenger not found
            return res.status(401).send('Invalid email or password');
        }

        const passenger = results[0];

        // Check password
        if (password === passenger.password) {
            // Redirect to dashboard with passenger name
            res.redirect(`/passenger_dashboard?name=${encodeURIComponent(passenger.name)}`);
        } else {
            // Password mismatch
            return res.status(401).send('Invalid email or password');
        }
    });
});

// Route to render the registration page
app.get('/pass_register', (req, res) => {
    res.render('pass_register', {
        errorMessage: null,
        successMessage: null,
    });
});


app.post('/pass_register', (req, res) => {
    const { name, email, phone, password, gender, age } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !gender || !age) {
        return res.render('pass_register', { errorMessage: 'All fields are required!', successMessage: null });
    }

    // Insert new passenger
    const query = `
        INSERT INTO passengers (name, email, phone, password, gender, age)
        VALUES (?, ?, ?, ?, ?, ?)`;

    connection.execute(query, [name, email, phone, password, gender, age], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.render('pass_register', { errorMessage: 'Email is already registered!', successMessage: null });
            }
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Redirect to the registration page with a success message
        res.render('pass_register', { errorMessage: null, successMessage: 'Registration successful! You can now log in.' });
    });
});

//Book tickets

// Route to render the book ticket page
app.get('/book_ticket', (req, res) => {
    res.render('book_ticket', { successMessage: null, errorMessage: null });
});

// Route to handle ticket booking form submission
app.post('/book_ticket', (req, res) => {
    const { train_route_id, seat_type, seat_no, price } = req.body;

    // Example: Assuming passenger_id is retrieved from session or hardcoded for now
    const passenger_id = 1; // Replace with dynamic logic later

    // Query to check if the seat is already booked
    const checkSeatQuery = `
        SELECT * FROM bookings 
        WHERE train_route_id = ? AND seat_type = ? AND seat_no = ?
    `;

    connection.execute(checkSeatQuery, [train_route_id, seat_type, seat_no], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.render('book_ticket', { successMessage: null, errorMessage: 'Internal Server Error' });
        }

        if (results.length > 0) {
            // Seat is already booked
            return res.render('book_ticket', { successMessage: null, errorMessage: 'Seat already booked. Please choose another seat.' });
        }

        // If seat is available, insert the booking
        const insertQuery = `
            INSERT INTO bookings (train_route_id, passenger_id, seat_type, seat_no, price) 
            VALUES (?, ?, ?, ?, ?)
        `;

        connection.execute(insertQuery, [train_route_id, passenger_id, seat_type, seat_no, price], (err, result) => {
            if (err) {
                console.error('Database insertion error:', err);
                return res.render('book_ticket', { successMessage: null, errorMessage: 'Internal Server Error' });
            }

            // Booking successful
            res.render('book_ticket', { successMessage: 'Ticket booked successfully!', errorMessage: null });
        });
    });
});


//view tickets

app.get('/view_ticket', (req, res) => {
    const email = req.query.email;  // Assuming email is passed as a query parameter

    const query = `
        SELECT bookings.*, passengers.email, trains.train_name, routes.departure_place, routes.arrival_place
        FROM bookings
        JOIN passengers ON bookings.passenger_id = passengers.passenger_id
        JOIN train_routes ON bookings.train_route_id = train_routes.train_route_id
        JOIN trains ON train_routes.train_id = trains.train_id
        JOIN routes ON train_routes.route_id = routes.route_id
        WHERE passengers.email = ?
    `;

    // Run the query to get bookings for the passenger
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).send("Database query error.");
        }

        // If no bookings are found, send an empty array
        const bookings = results.length > 0 ? results : [];

        // Render the 'view_ticket' page with the bookings data
        res.render('view_ticket', { bookings });
    });
}); 


//delete ticket
app.post('/cancel_booking', (req, res) => {
    const bookingId = req.body.booking_id;  // Get booking ID from the form

    // Query to delete the booking from the database
    const query = 'DELETE FROM bookings WHERE booking_id = ?';

    connection.query(query, [bookingId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Error canceling the booking.");
        }

        // Check if a booking was actually canceled
        if (result.affectedRows > 0) {
            console.log("Booking canceled successfully!");
            return res.redirect('/view_ticket?email=' + req.body.email);  // Redirect to the view ticket page
        } else {
            console.log("No booking found to cancel.");
            return res.status(404).send("Booking not found.");
        }
    });
});
//mark booking or cancelled


app.post('/cancel_booking', (req, res) => {
    const bookingId = req.body.booking_id;  // Get booking ID from the form

    // Query to update booking status to 'canceled'
    const query = 'UPDATE bookings SET status = ? WHERE booking_id = ?';

    connection.query(query, ['canceled', bookingId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Error canceling the booking.");
        }

        // Check if the booking was actually updated
        if (result.affectedRows > 0) {
            console.log("Booking canceled successfully!");
            return res.redirect('/view_ticket?email=' + req.body.email);  // Redirect to the view ticket page
        } else {
            console.log("No booking found to cancel.");
            return res.status(404).send("Booking not found.");
        }
    });
});

//display the updated one
app.get('/view_ticket', (req, res) => {
    const email = req.query.email;  // Assuming email is passed as a query parameter

    const query = `
        SELECT bookings.*, passengers.email, trains.train_name, routes.departure_place, routes.arrival_place
        FROM bookings
        JOIN passengers ON bookings.passenger_id = passengers.passenger_id
        JOIN train_routes ON bookings.train_route_id = train_routes.train_route_id
        JOIN trains ON train_routes.train_id = trains.train_id
        JOIN routes ON train_routes.route_id = routes.route_id
        WHERE passengers.email = ? AND bookings.status != 'canceled'  -- Filter out canceled bookings
    `;

    // Run the query to get bookings for the passenger
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).send("Database query error.");
        }

        const bookings = results.length > 0 ? results : [];
        res.render('view_ticket', { bookings });
    });
});
//train and seat search
// Train search route with date
app.get('/search_form', (req, res) => {
    res.render('search_form');  // Render the search form page
});

// Handle the search request
app.get('/search_trains', (req, res) => {
    const { departurePlace, arrivalPlace, travelDate } = req.query;

    const query = `
        SELECT train_routes.train_route_id, trains.train_name, routes.departure_place, routes.arrival_place,
               trains.cabin_seats, trains.business_seats, trains.economy_seats, trains.first_class_seats,
               COUNT(CASE WHEN bookings.seat_type = 'Cabin' AND bookings.status = 'Confirmed' THEN 1 END) AS booked_cabin,
               COUNT(CASE WHEN bookings.seat_type = 'Business' AND bookings.status = 'Confirmed' THEN 1 END) AS booked_business,
               COUNT(CASE WHEN bookings.seat_type = 'Economy' AND bookings.status = 'Confirmed' THEN 1 END) AS booked_economy,
               COUNT(CASE WHEN bookings.seat_type = 'First Class' AND bookings.status = 'Confirmed' THEN 1 END) AS booked_first_class
        FROM train_routes
        JOIN routes ON train_routes.route_id = routes.route_id
        JOIN trains ON train_routes.train_id = trains.train_id
        LEFT JOIN bookings ON train_routes.train_route_id = bookings.train_route_id
        WHERE routes.departure_place = ? 
        AND routes.arrival_place = ?
        AND DATE(train_routes.departure_time) = ?
        GROUP BY train_routes.train_route_id, trains.train_name, routes.departure_place, routes.arrival_place, 
                 trains.cabin_seats, trains.business_seats, trains.economy_seats, trains.first_class_seats
    `;

    connection.query(query, [departurePlace, arrivalPlace, travelDate], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).send("Error searching for trains.");
        }

        const availableTrains = results.map(train => ({
            train_route_id: train.train_route_id,
            train_name: train.train_name,
            departure_place: train.departure_place,
            arrival_place: train.arrival_place,
            available_cabin: train.cabin_seats - train.booked_cabin,
            available_business: train.business_seats - train.booked_business,
            available_economy: train.economy_seats - train.booked_economy,
            available_first_class: train.first_class_seats - train.booked_first_class
        }));

        res.render('search_results', { trains: availableTrains, departurePlace, arrivalPlace, travelDate });
    });
});

app.listen(port,()=>{
    console.log("server online")
}) 
  
