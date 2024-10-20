import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, Alert, ActivityIndicator, TextInput, Keyboard } from 'react-native'; // Add TextInput import
import { searchBooks } from '../apiCalls'; // Assuming this is the API function for searching books
import COLORS from '../config/colors';
import { BOOKGRADES } from '../components/Constants'; // Import the BOOKGRADES constant
import CustomDropdown from '../components/CustomDropdown'; // Import your CustomDropdown component




const BASE_URL = 'http://192.168.1.20:3000'; // Replace with your actual server URL

const SearchResultsScreen = ({ route, navigation }) => {
    const { searchType } = route.params; // 'zipcode' or 'grade'
    const [searchQuery, setSearchQuery] = useState(''); // Keep track of user input
    const [selectedGrade, setSelectedGrade] = useState(''); // Keep track of selected grade
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);
    const [hasSearched, setHasSearched] = useState(false); // State to track if a search has been attempted
    
    // Function to format picture path for the image source
    const formatPicturePath = (path) => path.replace(/\\/g, '/');

    // Function to search books when user presses the search button
    const searchForBooks = async () => {
        if (searchType === 'zipcode' && !searchQuery) { // Ensure a valid zipcode is entered
            Alert.alert('Please enter a valid zipcode.');
            return;
        }
        if (searchType === 'grade' && !selectedGrade) { // Ensure a grade is selected
            Alert.alert('Please select a valid grade.');
            return;
        }
        Keyboard.dismiss(); // Hide the keyboard before searching
        setLoading(true); // Show loading indicator
        setHasSearched(true); // Mark that a search has been attempted

        try {
            const query = searchType === 'zipcode' ? searchQuery : selectedGrade;
            const results = await searchBooks(searchType, query); // Call API to search books
            setBooks(results); // Store search results
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch books. Please try again later.');
            console.error('Error searching books:', error);
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };

    // Function to handle requesting a book
    const handleRequestBook = async (book) => {
        try {
            const response = await axios.post(`${BASE_URL}/books/request`, {
                bookId: book.id, // Only pass the book ID now
            });
            
            // Display success message
            Alert.alert(
                'Request Sent',
                `Your request for "${book.title}" has been sent to the book donor.`,
                [{ text: 'OK', onPress: () => console.log('Request confirmed') }]
            );
        } catch (error) {
            console.error('Error sending request:', error);
            Alert.alert('Error', 'Failed to send request inside SearchResultScreen. Please try again later.');
        }
    };

    // Render a single book item
    const renderBook = ({ item }) => (
        <View style={styles.bookCard}>
            <Image
                source={{ uri: `${BASE_URL}/${formatPicturePath(item.picturepath)}` }} // ** Ensured image source is correctly formatted **
                style={styles.bookImage}
                resizeMode="cover" // ** Ensured proper resize mode is used **
                resizeMethod="auto" // ** Ensured proper resize method is used **
            />
            <View style={styles.bookDetails}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookGenre}>{item.genre}</Text>
                <TouchableOpacity
                    style={styles.requestButton}
                    onPress={() => handleRequestBook(item)}
                >
                    <Text style={styles.requestButtonText}>Request Book</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Search Books by {searchType === 'zipcode' ? 'Zipcode' : 'Grades'}</Text>

            {/* Input field for Zipcode or Dropdown for Grade */}
            {searchType === 'zipcode' ? (
                <TextInput
                    placeholder="Enter Zipcode"
                    style={styles.input}
                    value={searchQuery}
                    onChangeText={setSearchQuery} // Update state with user input for zipcode
                    keyboardType="numeric" // Numeric keyboard for zipcode
                />
            ) : (
                <CustomDropdown
                    placeholder="Select the grade"
                    items={BOOKGRADES} // Use predefined grades from Constants.js
                    onChangeValue={setSelectedGrade} // Set selected grade
                    multiple={false}
                />
            )}

            {/* Search Button */}
            <TouchableOpacity style={styles.searchButton} onPress={searchForBooks}>
                <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
                <>
                    {hasSearched && books.length === 0 ? ( // Check if no books were found
                        <Text style={styles.noBooksMessage}>No books found for your search.</Text>
                    ) : (
                        <FlatList
                            data={books} // Display the search results
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderBook} // Render each book
                            contentContainerStyle={styles.bookList}
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginVertical: 10,
    },
    input: {
        backgroundColor: COLORS.white,
        padding: 12,
        marginVertical: 10,
        borderRadius: 8,
        borderColor: COLORS.grey,
        borderWidth: 1,
        fontSize: 16,
        width: '100%',
    },
    searchButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    searchButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    bookList: {
        paddingVertical: 20,
    },
    bookCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        marginBottom: 15,
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 3,
    },
    bookImage: {
        width: 80,
        height: 120,
        borderRadius: 8,
    },
    bookDetails: {
        flex: 1,
        padding: 10,
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 5,
    },
    bookGenre: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: 10,
    },
    requestButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 5,
        alignItems: 'flex-start',
        width: '45%'
    },
    requestButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    noBooksMessage: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold', // Make text bold
        color: 'red', // Adjust the color as needed
        marginTop: 20,
    },
});

export default SearchResultsScreen;
