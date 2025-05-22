import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const CategoryPlacesScreen = () => {
  const { category } = useLocalSearchParams();

  // Sample places for the selected category
  const places = [
    {
      id: 1,
      name: 'Central Park',
      description: 'A large public park in the heart of the city.',
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: 'City Museum',
      description: 'A museum showcasing the history of the city.',
      rating: 4.7,
      image: 'https://via.placeholder.com/150',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.categoryTitle}>{category} Places</Text>
      {places.map((place) => (
        <TouchableOpacity
          key={place.id}
          style={styles.placeCard}
          // onPress={() => router.push({ pathname: '/place-details', params: { place } })}
        >
          <Image source={{ uri: place.image }} style={styles.placeImage} />
          <View style={styles.placeDetails}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeDescription}>{place.description}</Text>
            <Text style={styles.placeRating}>⭐ {place.rating}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  placeRating: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
});

export default CategoryPlacesScreen;