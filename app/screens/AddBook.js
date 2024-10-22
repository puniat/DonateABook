import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Alert, Platform, ActionSheetIOS } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { handleAddBook } from '../apiCalls';
import CustomButton from '../components/CustomButton';
import CustomDropdown from '../components/CustomDropdown';
import CustomTextBox from '../components/CustomTextBox';
import { BOOK_CONDITION, BOOKGENRE, BOOKGRADES } from '../components/Constants'


const AddBook = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [condition, setCondition] = useState('');
  const [grade, setGrade] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);


   // Request permissions when the component mounts
    useEffect(() => {
      const requestPermissions = async () => {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus.status !== 'granted' || galleryStatus.status !== 'granted') {
          Alert.alert('Permission Denied', 'You need to allow camera and gallery permissions.');
        }
      };
  
      requestPermissions(); // Request permissions when component mounts
    }, []); // Empty dependency array, so this runs once when the component is mounted
  

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      //aspect: [4, 3],
      quality: 0.5,
    });

    handleImageResult(result);
  };

  const takePhotoWithCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      //aspect: [4, 3],
      quality: 0.5,
    });

    handleImageResult(result);
  };

  const handleImageResult = (result) => {
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      console.error('Image URI is null.');
      Alert.alert('Image Error', 'There was a problem selecting the image. Please try again.');
      setSelectedImage(null);
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Take Photo', 'Choose from Library', 'Cancel'],
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            takePhotoWithCamera();
          } else if (buttonIndex === 1) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      // Handle Android or other platforms (like Web)
      Alert.alert(
        'Choose an action',
        'Would you like to take a new photo or select one from the gallery?',
        [
          {
            text: 'Take Photo',
            onPress: takePhotoWithCamera,
          },
          {
            text: 'Choose from Library',
            onPress: pickImageFromGallery,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };
  
  const handleAddBookPress = async () => {
    if (!selectedImage) {
      Alert.alert('No image selected', 'Please select an image before adding the book.');
      return;
    }

    try {
      await handleAddBook(selectedImage, title, author, genre, condition, grade);
      Alert.alert(
        'Book Added',
        `${title} has been added successfully`,
        [{ text: 'OK', onPress: () => navigation.navigate('HomePage') }]
      );
    } catch (error) {
      console.error('Error adding book:', error);
      Alert.alert('Error', 'An error occurred while adding the book. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Enter Book Details</Text>
        <CustomTextBox value={title} onChangeText={setTitle} placeholder="Book Title" />
        <CustomTextBox value={author} onChangeText={setAuthor} placeholder="Author Name" />
        <CustomDropdown placeholder="Select Genre" items={BOOKGENRE} onChangeValue={(value) => setGenre(value)} multiple={false} />
        <CustomDropdown placeholder="Book condition" items={BOOK_CONDITION} onChangeValue={(value) => setCondition(value)} multiple={false} />
        <CustomDropdown placeholder="Select the grade" items={BOOKGRADES} onChangeValue={(value) => setGrade(value)} multiple={false} />
        <CustomButton title="Book Front Cover Photo" filled onPress={showImagePickerOptions} />
        {selectedImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
          </View>
        )}     
        <CustomButton title="Add Book" filled onPress={handleAddBookPress} />

    </View>     
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  heading: {
    color: '#999',
    fontSize: 20,
    textAlign: 'center',
  },
   imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    marginTop: 2,
  },
  image: {
    width: 250,
    height: 150,
  },
});

export default AddBook;
