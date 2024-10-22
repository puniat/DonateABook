
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import ImageViewer from '../components/ImageViewer'; // Assuming this component exists
import BookList from './BookList'
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing user data

const HomepageScreen = ({ navigation }) => {
  const [refresh, setRefresh] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(''); // State to store userId

  // Fetch the user's name from storage or an API
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedUserId = await AsyncStorage.getItem('userId'); // Retrieve userId
        if (storedUsername) {
          setUsername(storedUsername);
        }
        if (storedUserId) {
          setUserId(storedUserId); // Set userId state
        }
      } catch (error) {
        console.log('Error retrieving user data:', error);
      }
    };

    getUserInfo();
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    // Perform any necessary logout logic here (e.g., clearing tokens)
    AsyncStorage.clear(); // Clear all stored data

    // Navigate back to the login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

   return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ecccc1' }}>
      <View style={[styles.topcontainer]}>
        {<ImageViewer placeholderImageSource={require('../components/Images/book3.jpg')} />}
      </View>
      <View style={[styles.topcontainer]}>
        {/* Display the welcome message with the user's name */}
        <Text style={styles.welcomeText}>Welcome, {username}!</Text>

        {/* Button to go to the user profile */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#0f4c5c' }]} 
          onPress={() => navigation.navigate('UserProfile', { userId })}
          
        >
          <Text style={styles.buttonText}>View Profile</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#e63946' }]} 
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.middleContainer}>
        <Text style={styles.headerText}>Search Books</Text>
        <View style={styles.buttonsContainer}>
      <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#0f4c5c' }]} 
          onPress={() => navigation.navigate('SearchResults', { searchType: 'zipcode' })}
      >
          <Text style={styles.buttonText}>By Zipcode</Text>
      </TouchableOpacity>
      <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#2a9d8f' }]} 
          onPress={() => navigation.navigate('SearchResults', { searchType: 'grade' })}
      >
          <Text style={styles.buttonText}>By Grades</Text>
      </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.addBookButton, { backgroundColor: '#e76f51' }]} 
          onPress={() => navigation.navigate('AddBook')}
        >
          <Text style={styles.buttonText}>Add New Book</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomContainer}>
        <BookList navigation={navigation} />
      </View>
    </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    topcontainer: {
      flex: 0.5,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
    },
    middleContainer: {
      padding: 16,
      backgroundColor: '#f4f4f4',
      justifyContent: 'center',
    },
    bottomContainer: {
      flex: 1,
      padding: 16,
      //backgroundColor: '#eaeaea',
    },
    loadingIndicator: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#2a9d8f',
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    button: {
      flex: 1,
      padding: 10,
      backgroundColor: '#0f4c5c',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      marginHorizontal: 10,
    },
    addBookButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#e76f51',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '500',
    },
  });
  
  export default HomepageScreen;
