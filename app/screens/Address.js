import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../config/colors';
import CustomButton from '../components/CustomButton';
import { checkIfUserExistsByEmail, saveUser } from '../apiCalls'; 
import CustomTextBox from '../components/CustomTextBox';
import CustomDropdown from '../components/CustomDropdown';
import { STATES, COUNTRY } from '../components/Constants'

const Address = () => {
    const navigation = useNavigation();
    const route = useRoute(); // Use this to access route parameters
    const initialFormData = route.params?.userData || {}; // Extract userData from route parameters
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        ...initialFormData, // Merge initial data with default values
        address: '',
        zipcode: '',
        state: '', 
        country: ''
    });

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
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };
    // Function to check if all required fields are not empty
    const validateInputs = () => {
        const requiredFields = ['address', 'zipcode', 'state', 'country'];
        return requiredFields.every((field) => {
            const value = formData[field];
            //console.log(`Validating field ${field}:`, value);
            return value && value.trim() !== '';
        });
    };
 // Front-end logic: Handle create account and navigate to UserProfile screen
const handlecreateaccount = async () => {
    if (!validateInputs()) {
        setMessage('All fields are required.');
        return;
    }
    try {
        const response = await saveUser(formData);

        if (response && response.userId) {
            // Navigate to UserProfile screen and pass userId in params
            //navigation.navigate('UserProfile', { userId: response.userId });
                navigation.navigate('HomePage');
        } else {
            throw new Error('Empty response data or userId missing');
        }
    } catch (error) {
        console.error('Error creating account:', error);
        setMessage('There was an error creating your account. Please try again.');
    }
};
    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.innerContainer}>
            <CustomTextBox label="Address" value={formData.address} placeholder={'Address'} onChangeText={(text) => handleInputChange('address', text)} />
            <CustomTextBox label="Zipcode" value={formData.zipcode} placeholder={'Zipcode'} onChangeText={(text) => handleInputChange('zipcode', text)} />
            <CustomDropdown placeholder="Select the state" items={STATES} onChangeValue={(selectedValue) => handleInputChange('state', selectedValue)} multiple={false} />
            <CustomDropdown placeholder="Select the country" items={COUNTRY} onChangeValue={(selectedValue) => handleInputChange('country', selectedValue)} multiple={false} />
            {message !== '' && (
                <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>
                    {message}
                </Text>
            )}
            <CustomButton title="Create Account" filled onPress={handlecreateaccount} />
        </View>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        },
    innerContainer: {
      paddingHorizontal: 20,
      backgroundColor: '#fff',

    },
  });
export default Address;