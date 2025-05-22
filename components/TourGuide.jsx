import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const limitText = (text, limit) => {
  if (text.split(' ').length > limit) {
    return text.split(' ').slice(0, limit).join(' ') + '...';
  }
  return text;
};

const TourGuide = ({ item, onPress, userId }) => {
  return (
    <View style={styles.placesContainer}>
      <TouchableOpacity
        style={styles.placeCard}
        onPress={() => onPress(item)}
      >
        <Image source={{ uri: item.image }} style={styles.placeImage} />
        <View style={styles.placeDetails}>
          <Text style={styles.placeName}>{item.name}</Text>
          <Text style={styles.placeDescription}>{limitText(item.description, 30)}</Text>
          <View style={styles.placeInfo}>
            <Text style={styles.placeCategory}>{item.category}</Text>
            <Text style={styles.placeRating}>⭐ {item.rating}</Text>
          </View>
          {userId === item.created_by && ( // Show edit button only if the user is the creator
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push({ pathname: '/edit-place', params: { item: JSON.stringify(item) } })}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  placesContainer: {
    marginBottom: 20,
  },
  placeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  placeDetails: {
    padding: 15,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  placeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  placeCategory: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  placeRating: {
    fontSize: 14,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TourGuide;