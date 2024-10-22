import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const [activeTab, setActiveTab] = useState('signIn');
  const navigation = useNavigation();
  

  // Handlers for button press
  const handleSignIn = () => {
    setActiveTab('signIn');
    navigation.navigate('Login'); // Navigates to LoginScreen
  };

  const handleCreateAccount = () => {
    setActiveTab('createAccount');
    navigation.navigate('Signup'); // Navigates to SignupScreen
  };

  return (
    <ImageBackground
      source={require('../components/Images/Welcome-page1.jpg')}
      style={styles.background}
      blurRadius={0.6} // Optional blur effect for the background image
    >
      <View style={styles.container}>
        {/* Title and Welcome Message */}
        <Text style={styles.title}>Welcome to DonateABook!</Text>
        <Text style={styles.message}>
        Free Books, Endless Stories{'\n'}Give What You Can, Take What You Love!
        </Text>

        {/* Tabs for Sign In and Create Account */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'signIn' ]}
            onPress={handleSignIn} // Handle Sign In button press
          >
            <Text style={styles.tabText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'createAccount' ]}
            onPress={handleCreateAccount} // Handle Create Account button press
          >
            <Text style={styles.tabText}>Sign Up</Text>
          </TouchableOpacity>

        </View>
        <View>
      <Text style={styles.messagebottom}>
      Join our community of readers and givers.{'\n'}
      Your contribution makes a lasting impact.
        </Text>
      </View>
      </View>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1, // Ensures the background image takes up the full screen
    resizeMode: 'cover', // Optional, ensures the image covers the entire area
  },
  container: {
    position: 'absolute', // Position the container absolutely within the parent view
    top: '10%', // Moves the container to start 20% from the top
    width: '100%', // Makes the container span the full width of the screen
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
    textAlign: 'center',
    color: '#fff', // Adjusted for better readability on the background
  },
  message: {
    fontSize: 18, // Set to a value between 18 and 24 pixels
    fontFamily: 'sans-serif', // Use sans-serif font
    color: '#003566', // Set to the specified color
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  messagebottom: {
    fontSize: 16, // Set to a value between 18 and 24 pixels
    fontFamily: 'sans-serif', // Use sans-serif font
    color: '#003566', // Set to the specified color
    //marginBottom: 20,
    marginTop: 430,
    textAlign: 'justified',
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 10, // Optional: Adjusts spacing between message and tabs
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: '#ccc',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1, // Ensure the LoginScreen or SignupScreen takes up the full available height
    width: '100%', // Ensures the screen takes up the full width
  },
});

export default WelcomeScreen;
