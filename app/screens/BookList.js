import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { bookListing } from '../apiCalls'; // Assuming this function exists

const BookList = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatPicturePath = (path) => path.replace(/\\/g, '/');

  const fetchBooks = async () => {
    try {
      const allBooks = await bookListing();
      const groupedBooks = allBooks.reduce((acc, book) => {
        const genre = book.genre;
        if (!acc[genre]) {
          acc[genre] = [];
        }
        acc[genre].push(book);
        return acc;
      }, {});

      // Map genres to sections with their books
      const sections = Object.keys(groupedBooks).sort().map(genre => ({
        title: genre,
        data: groupedBooks[genre].sort((a, b) => a.title.localeCompare(b.title)) // Sort books by title within each genre
      }));

      setBooks(sections);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#c1121f" />
      </View>
    );
  }

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => navigation.navigate('BookDetails', { book: item })}
    >
      <Image
        source={{ uri: `http://192.168.1.20:3000/${formatPicturePath(item.picturepath)}` }}
        style={styles.bookItemImage}
        resizeMode="cover"
      />
      <Text style={styles.bookItemTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderGenreItem = ({ item }) => (
    <View style={styles.genreContainer}>
      <Text style={styles.genreHeaderText}>{item.title}</Text>
      <FlatList
        data={item.data} // Books for each genre
        renderItem={renderBookItem}
        horizontal={true}
        showsHorizontalScrollIndicator={true}
        keyExtractor={(bookItem) => bookItem.id.toString()}
        contentContainerStyle={styles.horizontalListContainer}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.title}
        renderItem={renderGenreItem} // Render both genre header and books
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7', // Set a background color
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  bookItem: {
    width: 120, // Fixed width for the card
    height: 200, // Fixed height for the card
    padding: 8,
    marginHorizontal: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bookItemImage: {
    width: 100, // Slightly smaller than the card width
    height: 140, // Maintain a good ratio for the image
    borderRadius: 10,
    marginBottom: 8,
  },
  bookItemTitle: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    width: 100, // Ensure the title stays within the card width
  },
  genreContainer: {
    marginVertical: 10,
    borderRadius: 10, // Ensures the container has rounded corners
    overflow: 'hidden', // Prevents overflow of children
    backgroundColor: '#fff', // Background color for the container
  },
  genreHeaderText: {
    backgroundColor: '#c1121f',
    color: '#fff',
    paddingVertical: 10, // Adds vertical padding
    paddingHorizontal: 16, // Adds horizontal padding
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderTopLeftRadius: 10, // Round top left corner
    borderTopRightRadius: 10, // Round top right corner
  },
  mainListContainer: {
    paddingBottom: 50,
  },
  horizontalListContainer: {
    paddingVertical: 10,
    
  },
});

export default BookList;
