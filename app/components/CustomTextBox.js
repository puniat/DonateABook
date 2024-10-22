import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import COLORS from '../config/colors';


const CustomTextBox = ({ label, value, placeholder, onChangeText, secureTextEntry }) => {

    return (
      <View style={styles.container}>
        <TextInput
              placeholder={placeholder}
              placeholderTextColor="#999"
              style={styles.Custtextbox}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={secureTextEntry}

            />
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    //paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 16,
  },
  Custtextbox: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingLeft: 10,
    paddingVertical: 15,
    marginBottom: 2,
    marginTop: 15,
    backgroundColor: COLORS.white,
    color: COLORS.black,
  },
  placeholder: {
    color: '#999', // Example: sets placeholder text color to gray
    fontSize: 16,
  },
});

export default CustomTextBox;