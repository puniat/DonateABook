import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Dimensions, Alert, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../config/colors';
import CustomButton from '../components/CustomButton';
import CustomTextBox from '../components/CustomTextBox';
import ImageViewer from '../components/ImageViewer';
import { checkIfUserExistsByEmail, saveUser } from '../apiCalls'; 


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const SignupScreen = () => {
    const navigation = useNavigation();
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const PlaceholderImage = require('../components/Images/Homepage.jpg');

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
          setMessage('');
        });
        return unsubscribe;
      }, [navigation]);
        
    const clearMessage = () => {
        setMessage('');
    };
    const handleInputChange = (name, value) => {
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };
    
    // Function to check if all required fields are not empty
    const validateInputs = () => {
        const requiredFields = ['firstName', 'lastName', 'email', 'password'];
        return requiredFields.every((field) => formData[field].trim() !== ''); // Ensure fields are not empty or just spaces
    };

    const handleSignup = async () => {
        if (!validateInputs()) {
            setMessage('All fields are mandatory.');
            return;
        }
        try {
            const emailLower = formData.email.toLowerCase();
            //console.log('SignupScreen - handleSignup - EMAIL ENTERED:', emailLower);
            const response  = await checkIfUserExistsByEmail(emailLower);
            console.log('SignupScreen - handleSignup - emailExists:', response.emailExists);
            if (response && response.emailExists) {
                Alert.alert(
                    'Info',
                    'User already exists with this email. Please login.',
                    [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                );
                return;
            }
            navigation.navigate('Address', {
                    userData: formData,
                });
        } catch (error) {
            console.error('Error signing up:', error);
        }
    };
    return (
        <SafeAreaView style={styles.container} >
              <ImageBackground
        source={require('../components/Images/Homepage.jpg')}
        style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center', paddingHorizontal: 10 }}
        blurRadius={0.6}
      >

        <View style={styles.innerContainer}>
            <CustomTextBox label="First Name" value={formData.firstName} placeholder={'First Name'} onChangeText={(text) => handleInputChange('firstName', text)} />
            <CustomTextBox label="Last Name" value={formData.lastName} placeholder={'Last Name'} onChangeText={(text) => handleInputChange('lastName', text)} />
            {message !== '' && (
                <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>
                    {message}
                </Text>
            )}
            <CustomTextBox label="Email" value={formData.email} placeholder={'Email'} onChangeText={(text) => handleInputChange('email', text)} />
            <CustomTextBox label="Password" value={formData.password} placeholder={'Password'} onChangeText={(text) => handleInputChange('password', text)} />
            <CustomButton title="Continue" filled onPress={handleSignup} />
        </View>
        </ImageBackground>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        },
    innerContainer: {
      paddingHorizontal: 20,
      //backgroundColor: '#fff',

    },
  });
export default SignupScreen;
