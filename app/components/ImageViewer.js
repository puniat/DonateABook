import { StyleSheet, Image, Dimensions } from 'react-native';
const { width: screenWidth } = Dimensions.get('window');

export default function ImageViewer({ placeholderImageSource }) {
  return (
    <Image source={placeholderImageSource} style={styles.image} />
  );
}

const styles = StyleSheet.create({
  image: {
    width: screenWidth,
    height: (screenWidth * 160) / 320,
    borderRadius: 18,
  },
});
