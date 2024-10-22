import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const CustomDropdown = ({
  label,
  placeholder,
  items,
  multiple = false,
  onChangeValue,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(multiple ? [] : null);

  return (
    <View style={[styles.container, { zIndex: open ? 1000 : 1 }]}>
      <Text style={styles.label}>{label}</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        placeholder={placeholder}
        placeholderStyle={styles.placeholder}
        multiple={multiple}
        multipleText="{count} selected"
        onChangeValue={(selectedValue) => {
          //console.log("Dropdown value changed:", selectedValue);
          onChangeValue(selectedValue); // Ensure this calls the parent handler
      }}
      style={styles.dropdown}

      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    //padding: 10,
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
  },
  dropdown: {
    borderColor: '#ccc',
    paddingVertical: 15,
    marginBottom: 2,
    marginTop: 2,
  },
  placeholder: {
    color: '#999', 
    fontSize: 16,
  },
});

export default CustomDropdown;
