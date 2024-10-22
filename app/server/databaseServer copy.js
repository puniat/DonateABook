import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url'; // For resolving directory in ES Modules
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import session from 'express-session';
import nodemailer from 'nodemailer';

import cors from 'cors'// ** Added CORS for cross-origin requests **

import dotenv from 'dotenv'; // ** Added dotenv to manage environment variables **

// Configure environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // ** Use environment variable for port **

// Create a PostgreSQL pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  schema: 'brainbuddies'
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Your Gmail address
    pass: process.env.EMAIL_PASS,  // Your App Password
  },
  debug: false,  // Enable debug output
  logger: false  // Log information to console
});


//console.log('Email User:', process.env.EMAIL_USER);
//console.log('Email Pass:', process.env.EMAIL_PASS ? '****' : 'Not Set'); // Hide the actual password


// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ 
  origin: process.env.REACT_APP_BASE_URL || 'http://localhost:3000',
  credentials: true,
}));

// app.use(session({
//   secret: process.env.SESSION_SECRET || 'xxas23%##$&gh12345', // ** Use environment variable for secret **
//   resave: false,
//   saveUninitialized: false
// }));

// ** Improved session handling for better security and performance **
app.use(session({
  secret: process.env.SESSION_SECRET || 'xxas23%##$&gh12345', // ** Use environment variable for session secret **
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // ** Use secure cookies in production **
    httpOnly: true, // ** Prevent JavaScript access to session cookies **
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Check if user exists by email
app.get('/users/check/email', async (req, res) => {
  //console.log('Server side: user entered value /users/check/email:', req.query);
  const { email } = req.query;
  try {
    // Check if user exists
    const userExistsResult = await pool.query('SELECT id, COUNT(*) FROM public.users WHERE email = $1 GROUP BY id', [email]);
    const userExists = userExistsResult.rowCount > 0;
    //console.log('SERVER SIDE: user entered value /users/check/email--userExists:', userExists);
    if (userExists) {
      // ** Store user email and username in session to reuse later **
      const userid = userExistsResult.rows[0].id;
      const userEmail = email;
      const userFirstName = userExistsResult.rows[0].first_name;
      req.session.userId = userid;
      req.session.email = userEmail;
      req.session.firstName = userFirstName; 
      //console.log('Server side: user entered value /users/check/email, USERS ID:', userid);
    }
    res.json({ emailExists: userExists });
  } catch (error) {
    console.error('Error checking if user exists:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Validate user password
app.get('/users/check/password', async (req, res) => {
  //console.log('SERVER-SIDE: user entered value:', req.query);
  const { email, password } = req.query;
  try {
    // Retrieve user by email
    const userResult = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      res.json({ passwordMatch: false, message: 'User not found' });
      return;
    }

    // Check if the password matches
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // ** Store user data in session if the password matches **
    if (isPasswordMatch) {
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.firstName = user.first_name;
    }

    res.json({ passwordMatch: isPasswordMatch });
  } catch (error) {
    console.error('Error validating user password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Retrieve all books
app.use('/uploads', express.static('uploads'));
app.get('/booksList', async (req, res) => {
  //console.log('Server side: user entered booksList');
  try {
    // Query all books from the database
    const result = await pool.query('SELECT * FROM books');

    // Respond with the list of books
    res.json(result.rows);

  } catch (error) {
    console.error('Error retrieving books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Save new user
app.post('/signup', async (req, res) => {
  console.log('SERVER-SIDE: /signup:', req.query);
  const { firstName, lastName, email, password, address, state, zipcode, country } = req.body;
  try {
    // Hash the password before saving it to the database (ensure you have a function to hash passwords)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use the correct column names when inserting into the database
    await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, address, state, zipcode, country) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [firstName, lastName, email, hashedPassword, address, state, zipcode, country]
    );
    res.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      cb(null, uuidv4() + extension);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Add Books
app.post('/books/add', upload.single('image'), async (req, res) => {
  console.log('SERVER SIDE == Inside /books/add')
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { title, author, genre, condition, grade } = req.body;
  const imageUri = req.file ? req.file.path : null; 
  //console.log('Server Side: File Size (Bytes):', req.file.size);
  // Retrieve user ID from session
  const donated_by = req.session.userId;
  //console.log('Inside /books/add, Picture path::::', imageUri);
  if (!donated_by) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const queryText = 'INSERT INTO books (title, author, genre, condition, donated_by, grade, picturePath) VALUES ($1, $2, $3, $4, $5, $6, $7)';
    const values = [title, author, genre, condition, donated_by, grade, imageUri];
    await pool.query( queryText, values );
    res.json({ message: 'Book added successfully' });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search Books
app.get('/books/search', async (req, res) => {
  const { searchParam, value } = req.query;
  try {
      let result;
      if (searchParam === 'zipcode') {
        // Join users and books to filter by zipcode
        result = await pool.query(
          `SELECT books.id, books.title, books.author, books.genre, books.condition, books.picturepath, users.zipcode 
           FROM books 
           JOIN users ON books.donated_by = users.id 
           WHERE users.zipcode = $1`,
          [value]
        );
      } else if (searchParam === 'grade') {
          result = await pool.query(
              'SELECT * FROM books WHERE grade = $1',
              [value]
          );
      } else {
          return res.status(400).json({ error: 'Invalid search parameter. Use either "zipcode" or "grade".' });
      }
      res.json(result.rows);
  } catch (error) {
      console.error('Error searching books-SERVER SIDE:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Send email for users for selected books
const sendEmail = (bookOwnerEmail, userRequestEmail, userRequestName, bookTitle) => {
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: bookOwnerEmail, // Email of the person who uploaded the book
      subject: `DonateABook - Approve Book Request: ${bookTitle}`,
      text: `Dear DonateABook User,\n
We hope you're doing well! One of our users, ${userRequestName}, is interested in picking up the book you've generously offered to donate through DonateABook. Here's their contact information:\n
Email: ${userRequestEmail}\n
If you approve the request, your mobile number will be shared with ${userRequestName} to coordinate for the pickup.\n
To approve this request, simply log in to your DonateABook account and navigate to your donation dashboard.\n
Thank you so much for contributing to our community! Your continued generosity makes a huge difference in helping others access the books they need.\n 
We encourage you to keep donating and sharing the joy of reading.\n
If you have any questions or need assistance, feel free to reach out.\n
Warm regards,\n
The DonateABook Team`,
  };

  //console.log('Sending email:', mailOptions); // Log email details

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
      } else {
          console.log('Email sent:', info.response);
      }
  });
};

// /books/request route
app.post('/books/request', async (req, res) => {
  const { bookId } = req.body;

  // Check if user is authenticated
  if (!req.session.userId || !req.session.email || !req.session.firstName) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    // Get book details and owner information
    const bookQuery = await pool.query('SELECT title, donated_by FROM books WHERE id = $1', [bookId]);
    const book = bookQuery.rows[0];

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Get the email of the person who donated the book
    const ownerQuery = await pool.query('SELECT email FROM users WHERE id = $1', [book.donated_by]);
    const bookOwner = ownerQuery.rows[0];

    if (!bookOwner) {
      return res.status(404).json({ error: 'Book owner not found' });
    }

    // Send email to the book owner using session-stored email
    sendEmail(bookOwner.email, req.session.email, req.session.firstName, book.title);

    // Respond back to the requester
    res.json({ message: 'Book request sent successfully' });
  } catch (error) {
    console.error('Error handling book request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});