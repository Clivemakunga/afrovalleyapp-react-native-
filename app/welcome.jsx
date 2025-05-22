import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Link } from 'expo-router';

const WelcomeScreen = () => {
  return (
    <ImageBackground
      source={require('../assets/images/landing.png')} // Replace with your image path
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Combined Buttons */}
        <View style={styles.bottomContainer}>
          <View style={styles.pillContainer}>
            {/* Login Button */}
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>LOGIN</Text>
              </TouchableOpacity>
            </Link>

            {/* Signup Button */}
            <Link href="/register" asChild>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>SIGNUP</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%', // Ensure the image takes full width
    height: '100%', // Ensure the image takes full height
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end', // Align content to the bottom
    alignItems: 'center',
    padding: 20,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40, // Adjust as needed
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent background for the pill
    borderRadius: 50,
    padding: 5,
    width: Dimensions.get('window').width * 0.7,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: '#ffffff', // Default button background color
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000', // Default button text color
  },
});

export default WelcomeScreen;