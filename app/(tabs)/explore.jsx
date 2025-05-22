import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import TourGuide from '../../components/TourGuide';
import AddTouristAttraction from '../../components/addTouristAttraction';
import { supabase } from '@/lib/supabase';

const TourGuideScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null); // State to store the current user's ID

    // Sample categories
    const categories = [
      { id: 1, name: 'Recreational', icon: 'park' },
      { id: 2, name: 'Ghetto', icon: 'location-city' },
      { id: 3, name: 'Museum', icon: 'museum' },
      { id: 4, name: 'Historical', icon: 'landscape' },
      { id: 5, name: 'Nature', icon: 'nature-people' },
    ];

  // Fetch the current user's ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id); // Set the user ID
    };

    fetchUser();
  }, []);

  // Fetch tourist attractions from Supabase
  const fetchAttractions = async (query = '') => {
    setRefreshing(true);
    try {
      let queryBuilder = supabase
        .from('tourist_attractions')
        .select('*');

      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      setAttractions(data);
    } catch (error) {
      console.error('Error fetching tourist attractions:', error);
    } finally {
      setLoading(false);
    }
    setRefreshing(false);
  };

  // Fetch attractions when the component mounts or searchQuery changes
  useEffect(() => {
    fetchAttractions(searchQuery);
  }, [searchQuery]);

  // Callback function to re-fetch attractions after adding a new one
  const handleAddSuccess = () => {
    fetchAttractions(searchQuery);
  };

  const handleArtPiecePress = (item) => {
    router.push({ pathname: '/places', params: { item: JSON.stringify(item) } });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for places..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <MaterialIcons name="search" size={24} color="#6200ee" />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchAttractions(searchQuery)} />
        }
      >
        {/* Pass the handleAddSuccess callback to AddTouristAttraction */}
        <AddTouristAttraction onPress={() => router.push({ pathname: '/touristattractionscreen', params: { onSuccess: handleAddSuccess } })} />

        {/* Category Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryButton}
              onPress={() => router.push({ pathname: '/category-places', params: { category: category.name } })}
            >
              <MaterialIcons name={category.icon} size={24} color="#6200ee" />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Places List */}
        <View style={styles.placesContainer}>
          {attractions.map((item) => (
            <TourGuide
              key={item.id}
              item={{
                ...item,
                image: item.images?.[0] || 'https://via.placeholder.com/150',
              }}
              onPress={handleArtPiecePress}
              userId={userId} // Pass the current user's ID to the TourGuide component
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    marginTop: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
  },
  placesContainer: {
    marginBottom: 20,
  },
});

export default TourGuideScreen;