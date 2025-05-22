import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const ArtCard = ({ imageUrl, price, ownerName, ownerAvatarUrl, isOwnerVerified, artNumber, totalArtPieces, rating, onBuyPress, onFavoritePress }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onFavoritePress();
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.priceText}>${price}</Text>
          <View style={styles.ownerContainer}>
            <Image source={{ uri: ownerAvatarUrl }} style={styles.avatarImage} />
            <Text style={styles.ownerText}>{ownerName}</Text>
            {isOwnerVerified && (
              <View style={[styles.verifiedBadge, styles.verified]}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>Art Piece #{artNumber} of {totalArtPieces}</Text>
          <View style={styles.ratingContainer}>
            {Array.from({ length: rating }, (_, index) => (
              <AntDesign key={index} name="star" size={20} color="black" />
            ))}
          </View>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.buyButton} onPress={onBuyPress}>
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavorite}>
            <AntDesign
              name={isFavorite ? 'heart' : 'hearto'}
              size={24}
              color={isFavorite ? 'red' : 'gray'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
    aspectRatio: 1,
    flexDirection: 'column',
  },
  image: {
    flex: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  ownerText: {
    fontSize: 14,
    marginRight: 8,
  },
  verifiedBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  verified: {
    backgroundColor: '#00c853',
  },
  verifiedText: {
    fontSize: 12,
    color: '#fff',
  },
  descriptionContainer: {
    marginVertical: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  starImage: {
    width: 15,
    height: 15,
    marginRight: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  buyButton: {
    backgroundColor: '#007aff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ArtCard;