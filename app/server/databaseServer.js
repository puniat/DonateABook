import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import session from 'express-session';
import nodemailer from 'nodemailer';

import cors from 'cors'; // ** Added CORS for cross-origin requests **
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

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.REACT_APP_BASE_URL || 'http://localhost:3000',
  credentials: true,
}));

// Improved session handling for better security and performance
app.use(session({
  //TBD to change before publishing
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
  const { email } = req.query;
  try {
    const userExistsResult = await pool.query('SELECT id, COUNT(*) FROM public.users WHERE email = $1 GROUP BY id', [email]);
    const userExists = userExistsResult.rowCount > 0;
    if (userExists) {
      const userid = userExistsResult.rows[0].id;
      //console.log('Received request - UserID:', userid);
      const userEmail = email;
      //console.log('Received request - userEmail:', userEmail);
      const userFirstName = userExistsResult.rows[0].first_name;
      req.session.userId = userid;
      req.session.email = userEmail;
      req.session.firstName = userFirstName; 
      return res.json({ emailExists: userExists, name: userFirstName, userId: userid });
    }
    res.json({ emailExists: userExists });
  } catch (error) {
    console.error('Error checking if user exists:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Validate user password
app.get('/users/check/password', async (req, res) => {
  const { email, password } = req.query;
  try {
    const userResult = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      res.json({ passwordMatch: false, message: 'User not found' });
      return;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

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
  console.log('Server side: user entered booksList');
  try {
    const { page = 1, limit = 30 } = req.query;
    const offset = (page - 1) * limit;
    const result = await pool.query('SELECT * FROM books LIMIT $1 OFFSET $2', [limit, offset]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Save new user
app.post('/signup', async (req, res) => {
  console.log('Server side: user entered User Signup');
  const { firstName, lastName, email, password, address, state, zipcode, country, profile_picture, biography } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' }); // Handle missing fields
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    //userid is returned by postgres query if switch to firebase then it will not work
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, address, state, zipcode, country) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [firstName, lastName, email, hashedPassword, address, state, zipcode, country]
    );
    // Capture and return the user_id
    const userId = result.rows[0].id;
    req.session.userId = userId;
    req.session.email = email;
    req.session.firstName = firstName;
    
    // Step 2: Create the user profile in the user_profiles table
    await pool.query(
     `INSERT INTO public.user_profiles (user_id, profile_picture, biography) VALUES ($1, $2, $3)`,
        [userId, profile_picture || null, biography || null]  // Use null if not provided
      );
    res.json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Image upload setup for books
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
  //console.log('SERVER SIDE == Inside /books/add');
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { title, author, genre, condition, grade } = req.body;
  const imageUri = req.file ? req.file.path : null; 
  const donated_by = req.session.userId;
  if (!donated_by) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const queryText = 'INSERT INTO books (title, author, genre, condition, donated_by, grade, picturePath) VALUES ($1, $2, $3, $4, $5, $6, $7)';
    const values = [title, author, genre, condition, donated_by, grade, imageUri];
    await pool.query(queryText, values);
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



// API to request a book
app.post('/books/request', async (req, res) => {
  const userId = req.session.userId;
  const { bookId } = req.body;
  try {
      // Fetch book owner details
      const bookQuery = await pool.query('SELECT title, donated_by FROM books WHERE id = $1', [bookId]);
      if (bookQuery.rows.length > 0) {

        const bookOwnerId = bookQuery.rows[0]?.donated_by;
        const bookTitle = bookQuery.rows[0].title;
        //console.log('Received request - bookOwnerId:', bookOwnerId, 'bookTitle:', bookTitle);
        if (bookOwnerId) {
            const userQuery = await pool.query('SELECT email, first_name FROM users WHERE id = $1', [bookOwnerId]);
            const bookOwnerEmail = userQuery.rows[0]?.email;
            const bookOwnerName = userQuery.rows[0]?.first_name;

            const userRequestQuery = await pool.query('SELECT email, first_name FROM users WHERE id = $1', [userId]);
            const userRequestEmail = userRequestQuery.rows[0]?.email;
            const userRequestName = userRequestQuery.rows[0]?.first_name;

            sendEmail(bookOwnerEmail, userRequestEmail, userRequestName, bookTitle);
            res.json({ message: 'Request sent successfully!' });
        } else {
            res.status(404).json({ error: 'Book owner not found' });
        }
      } else {
        console.error('Book not found');
      }
  } catch (error) {
      console.error('Error sending book request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Send email for users for selected books
const sendEmail = (bookOwnerEmail, userRequestEmail, userRequestName, bookTitle) => {
  //console.log('Email:', bookOwnerEmail, userRequestEmail, userRequestName, bookTitle);
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: bookOwnerEmail,
      subject: `DonateABook - Approve Donation Request for: ${bookTitle}`,
      text: `Dear DonateABook User,\n
We hope you're doing well! One of our users, ${userRequestName}, is interested in picking up the book - '${bookTitle}' you've generously offered to donate through DonateABook. Here's is${userRequestName}  contact information:\n
User's Email: ${userRequestEmail}\n
If you approve the request, your email will be shared with ${userRequestName} to coordinate for the pickup.\n
To approve this request, simply log in to your DonateABook account and navigate to your donation dashboard.\n
Thank you so much for contributing to our community! Your continued generosity makes a huge difference in helping others access the books they need.\n
Warm Regards,\n
The DonateABook Team`
  };
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
      } else {
          console.log('Email sent:', info.response);
      }
  });
};
// ** New API to retrieve user profile **
app.get('/users/profile', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query('SELECT first_name, last_name, email, address, state, zipcode, country FROM users WHERE id = $1', [userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ** New API to track donations **
app.get('/donations', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query('SELECT b.title, b.author, b.genre, b.condition, b.picturepath FROM books b WHERE b.donated_by = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving donations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
