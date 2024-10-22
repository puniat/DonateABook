
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import ImageViewer from '../components/ImageViewer'; // Assuming this component exists
import BookList from './BookList'
import { useUser } from '../../UserContext';
import { Ionicons } from '@expo/vector-icons';


const HomepageScreen = ({ navigation }) => {
  const { user } = useUser();
  const [refresh, setRefresh] = useState(false);
 
  // Function to handle logout
  const handleLogout = () => {

    // Navigate back to the login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

    // Navigate to Profile Page
    const goToProfile = () => {
      navigation.navigate('UserProfile'); // Make sure to have a 'Profile' screen in your navigation
    };

   return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.topcontainer]}>
        {<ImageViewer placeholderImageSource={require('../components/Images/Welcome-page1.jpg')} />}
        {/* Profile Icon Button */}
        <TouchableOpacity style={styles.profileButton} onPress={goToProfile}>
          <Ionicons name="person-circle-outline" size={40} color="#2a9d8f" />
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
          style={[styles.addBookButton, { backgroundColor: '#023e8a' }]} 
          onPress={() => navigation.navigate('AddBook')}
        >
          <Text style={styles.buttonText}>Add New Book To Donate</Text>
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
    },
    profileButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      
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
