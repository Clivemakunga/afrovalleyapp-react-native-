import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const Tribe = ({ imageSource, onPressPortfolio}) => {
  return (
    <View style={styles.cardContainer}>
      <Image source={imageSource} style={styles.imageBackground} resizeMode='cover'/>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'rgba(245, 193, 22, 0.2)']}
        style={styles.gradientOverlay}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onPressPortfolio}>
            <Text style={styles.buttonText}>Join Tribe Today!</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.button} onPress={onPressMarket}>
            <Text style={styles.buttonText}>Visit Market</Text>
          </TouchableOpacity> */}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 260,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    height: '88%',
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'cover',
    borderRadius: 20
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: 110,
    height: 33,
    marginLeft: 4
  },
  buttonText: {
    color: 'purple',
    fontSize: 10,
    fontWeight: '800'
  },
});

export default Tribe;