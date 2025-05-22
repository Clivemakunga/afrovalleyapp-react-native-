import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const MyBidsCard = ({ name, artName, thumbnail, initialPrice, currentPrice, surname }) => {
  const isGainOrLoss = currentPrice > initialPrice;

  return (
    <View style={styles.container}>
      <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{artName}</Text>
        <Text style={styles.dateBought}>Art By: {name} {surname}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.initialPrice}>${initialPrice}</Text>
          <Text style={[styles.currentPrice, isGainOrLoss ? styles.gainPrice : styles.lossPrice]}>
            ${currentPrice}
          </Text>
        </View>
      </View>
      <AntDesign
        name={isGainOrLoss ? 'arrowup' : 'arrowdown'}
        size={24}
        color={isGainOrLoss ? 'green' : 'red'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2E3036',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  dateBought: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initialPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
    marginRight: 8,
  },
  gainPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  lossPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default MyBidsCard;