import axios from 'axios';
// import Constants from 'expo-constants';

// console.log('Expo Config:', Constants.expoConfig);
const BASE_URL = 'http://192.168.1.20:3000';
// const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_BASE_URL || 'http://localhost:3000';
// console.log('Base-URL:', BASE_URL);
// console.log('REACT_APP_BASE_URL:', Constants.expoConfig?.extra?.REACT_APP_BASE_URL);

// Check if user exists by email
const checkIfUserExistsByEmail = async (email) => {
    // console.log('INSIDE ===> checkIfUserExistsByEmail ===>>> function body');
    // console.log('Email entered is:', email);
    try {
        const response = await axios.get(`${BASE_URL}/users/check/email`, {
            params: { email },
        });
        // console.log('Response ==== email:', response.data);
        return response.data;;
    } catch (error) {
        console.error('Error checking if user exists by email:', error);
        throw error;
    }
};

// Validate user password
const validateUserPassword = async (email, password) => {
    // console.log('Execution entered validateUserPassword function body');
    // console.log('Email entered is:', email);
    // console.log('Password entered is:', password);
    try {
        const response = await axios.get(`${BASE_URL}/users/check/password`, {
            params: { email, password },
        });
        // console.log('Response ==== Password:', response.data);
        return response.data.passwordMatch;
    } catch (error) {
        console.error('Error validating user password:', error);
        throw error;
    }
};

// New User Profile Creation
const saveUser = async (userData) => {
    console.log('Execution entered saveUser function body');
    try {
        const response = await axios.post(`${BASE_URL}/signup`, userData);
        return response.data;
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
};

// Search Books
const searchBooks = async (searchParam, value) => {
    console.log('Execution entered searchBooks function body');
    try {
        const response = await axios.get(`${BASE_URL}/books/search`, {
            params: { searchParam, value },
        });
        console.log('Response ==== Books:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error searching books:', error);
        throw error;
    }
};

// Books Listing
const bookListing = async () => {
    // console.log('CLIENTSIDE- BOOK LISTING - Function Entered');
    try {
        const response = await axios.get(`${BASE_URL}/booksList`);
        // console.log('Response ==== Books Listing:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error Getting book listing:', error);
        throw error;
    }
};

// Add Book
const handleAddBook = async (imageUri, title, author, genre, condition, grade) => {
    console.log('Entering handleAddBook function');

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('genre', genre);
        formData.append('condition', condition);
        formData.append('grade', grade);

        if (imageUri) {
            formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg', // Adjust based on image type
                name: 'uploaded_image.jpg',
            });
        }

        const response = await axios.post(`${BASE_URL}/books/add`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Server response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding book:', error);
        throw error;
    }
};

// New: Get User Profile
const getUserProfile = async () => {
    console.log('Fetching user profile');
    try {
        const response = await axios.get(`${BASE_URL}/users/profile`, {
            // Assuming you might need to add auth headers or session tokens here if required
            // headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// New: Track Donations
const trackDonations = async () => {
    console.log('Fetching user donations');
    try {
        const response = await axios.get(`${BASE_URL}/donations`, {
            // Assuming you might need to add auth headers or session tokens here if required
            // headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching donations:', error);
        throw error;
    }
};

export { 
    checkIfUserExistsByEmail, 
    saveUser, 
    validateUserPassword, 
    searchBooks, 
    handleAddBook, 
    bookListing,
    getUserProfile, // New
    trackDonations // New
};
