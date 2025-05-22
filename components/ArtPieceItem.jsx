import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

// Utility function to limit text to a certain number of words
const limitText = (text, limit) => {
  if (text.split(' ').length > limit) {
    return text.split(' ').slice(0, limit).join(' ') + '...'; // Add ellipsis for truncated text
  }
  return text;
};

const ArtPieceItem = ({ item, onPress, onBuy }) => {
  return (
    <TouchableOpacity style={styles.artCard} onPress={() => onPress(item)}>
      <Image source={{ uri: item.images[0] }} style={styles.artImage} />
      <View style={styles.artDetails}>
        <Text style={styles.artName}>{item.title}</Text>
        <Text style={styles.artDescription}>
          {limitText(item.description, 20)} {/* Limit to 20 words */}
        </Text>
        {/* Dimensions */}
        <Text style={styles.artDimensions}>Dimensions: {item.dimensions}</Text>
        {/* User's Name and Surname */}
        <Text style={styles.userInfo}>Uploaded by: {item.owner_name}</Text>
        <Text style={styles.artPrice}>${item.price}</Text>
        <View style={styles.badgeContainer}>
          <Text
            style={[
              styles.badge,
              item.badge === 'Premium' ? styles.premiumBadge : styles.economicBadge,
            ]}
          >
            {item.badge}
          </Text>
        </View>
        <TouchableOpacity style={styles.buyButton} onPress={onBuy}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  artCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 6,
  },
  artImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  artDetails: {
    padding: 15,
  },
  artName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  artDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  artDimensions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  artPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 10,
  },
  badgeContainer: {
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'flex-start',
  },
  economicBadge: {
    backgroundColor: '#4CAF50', // Green for Economic
  },
  premiumBadge: {
    backgroundColor: '#FFC107', // Yellow for Premium
  },
  buyButton: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ArtPieceItem;