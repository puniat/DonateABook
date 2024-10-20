import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ImageBackground, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { checkIfUserExistsByEmail, validateUserPassword } from '../apiCalls';
import CustomButton from '../components/CustomButton';
import COLORS from '../config/colors';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing user dat

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setMessage('');
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogin = async () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        setMessage('Please enter a valid email address.');
        return;
    }

    // Password validation
    if (!password || password.length < 8) {
        setMessage('Password must be at least 8 characters.');
        return;
    }

    try {
        //const emailExists = await checkIfUserExistsByEmail(email);
        const { emailExists, name } = await checkIfUserExistsByEmail(email);
        //console.log('LoginScreen - emailExists:', emailExists);
        
        if (!emailExists) {
            setEmail('');
            setPassword('');
            setMessage('User does not exist. Please register.');
            await AsyncStorage.setItem('userId', response.userId);
            await AsyncStorage.setItem('username', response.name); // Save username if needed
            return;
        }

        const passwordMatch = await validateUserPassword(email, password);
        //console.log('LoginScreen - passwordMatch:', passwordMatch);

        if (!passwordMatch) {
            setMessage('Incorrect email or password, please try again.');
            return;
        }

        // Successful login, redirect to Home page
        navigation.navigate('HomePage');
        
    } catch (error) {
        console.error('Error handling login:', error);
        // Handle error - Display a generic error message to the user or log it for debugging
    }
};
  const clearMessage = () => {
    setMessage('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ImageBackground
        source={require('../components/Images/BrainBuddies-4.jpg')}
        style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center', paddingHorizontal: 10 }}
        blurRadius={0.6}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0)' }}>
          <View style={{ marginBottom: 20, marginTop: 150 }}>
            {/* <Text style={{ fontSize: 20, fontWeight: '400', marginVertical: 8, color: COLORS.white }}>Login</Text> */}
            <View style={{ width: '100%', height: 48, borderRadius: 8, marginBottom: 12 }}>
              <TextInput
                placeholder="Enter your email address"
                placeholderTextColor={COLORS.black}
                keyboardType="email-address"
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 8,
                  padding: 12,
                  color: COLORS.black,
                  fontSize: 16,
                }}
                value={email}
                onChangeText={(text) => {
                  setEmail(text.toLowerCase());;
                  clearMessage();
                }}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 12 }}>
            {/* <Text style={{ fontSize: 20, fontWeight: '400', marginVertical: 8, color: COLORS.white }}>Password</Text> */}
            <View style={{ width: '100%', height: 48, borderRadius: 8, marginBottom: 12 }}>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={COLORS.black}
                secureTextEntry={isPasswordShown}
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 8,
                  padding: 12,
                  color: COLORS.black,
                  fontSize: 16,
                }}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearMessage();
                }}
              />
              <TouchableOpacity onPress={() => setIsPasswordShown(!isPasswordShown)} style={{ position: 'absolute', right: 12, top: 12 }}>
                {isPasswordShown ? (
                  <Ionicons name="eye-off" size={24} color={COLORS.black} />
                ) : (
                  <Ionicons name="eye" size={24} color={COLORS.black} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {message !== '' && (
            <View style={{ marginBottom: 20, alignItems: 'center' }}>
              <Text style={{ color: 'black', fontWeight: 'bold', textAlign: 'center' }}>
                {message}
              </Text>
            </View>
          )}
          {/* Login Button */}
          <CustomButton
            title="Login for free books"
            filled
            style={{ marginTop: 18, marginBottom: 20 }}
            onPress={handleLogin}
          />

        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default LoginScreen;