import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { bookListing } from '../apiCalls'; // Assuming this function exists

const BookList = ({ navigation }) => {
  const [books, setBooks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const formatPicturePath = (path) => path.replace(/\\/g, '/');

  const fetchBooks = async () => {
    try {
      const allBooks = await bookListing();
      // ** Group books by genre and sort both genres and books within each genre **
      const groupedBooks = allBooks.reduce((acc, book) => {
        const genre = book.genre;
        // Group books by genre
        if (!acc[genre]) {
          acc[genre] = [];
        }
        acc[genre].push({ ...book, genre });
        return acc;
      }, {});

      // ** Sort genres alphabetically **
      const sortedGenres = Object.keys(groupedBooks).sort();
      // ** Sort books within each genre by title **
      const sortedBooks = sortedGenres.reduce((acc, genre) => {
        acc[genre] = groupedBooks[genre].sort((a, b) => a.title.localeCompare(b.title));
        return acc;
      }, {});

      setBooks(sortedBooks);
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
    return <ActivityIndicator size="large" style={styles.loadingIndicator} />;
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
        resizeMethod="auto"
      />
      <Text style={styles.bookItemTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderGenreHeader = ({ item }) => (
    <View style={styles.genreHeader}>
      <Text style={styles.genreHeaderText}>{item}</Text>
    </View>
  );

  return (
    <FlatList
      
      data={Object.keys(books)} // Get genre keys
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <View style={styles.genreContainer}>
          {renderGenreHeader({ item })}
          <FlatList
            data={books[item]} // Books for each genre
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBookItem}
            horizontal={true}
            showsHorizontalScrollIndicator={true}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookItem: {
    padding: 4,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  bookItemImage: {
    width: 80,
    height: 100,
    borderRadius: 10,
    marginTop: 4,
  },
  bookItemTitle: {
    textAlign: 'center',
    fontSize: 12,
    color: '#c1121f',
    fontWeight: 'bold',
    width: 80,
  },
  genreContainer: {
    paddingVertical: 4,
  },
  genreHeader: {
    padding: 10,
    borderRadius: 10,
    //width: '50%',
  },
  genreHeaderText: {
    color: '#c1121f',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
});

export default BookList;
