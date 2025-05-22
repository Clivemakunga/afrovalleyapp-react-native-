import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ArtPieceItem from '@/components/ArtPieceItem';
import { supabase } from '@/lib/supabase';

const MarketScreen = () => {
  const [artPieces, setArtPieces] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  // Fetch art pieces from Supabase where buyer_id is null
  const fetchArtPieces = async (query = '') => {
    setRefreshing(true);
    let queryBuilder = supabase
      .from('art-pieces') // Replace with your table name
      .select('*')
      .is('buyer_id', null); // Only fetch art pieces that haven't been bought

    if (query) {
      queryBuilder = queryBuilder.ilike('title', `%${query}%`); // Filter by art piece name
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching art pieces:', error);
    } else {
      setArtPieces(data);
    }
    setRefreshing(false);
  };

  // Subscribe to realtime changes in the art-pieces table
  useEffect(() => {
    const subscription = supabase
      .channel('art-pieces')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'art-pieces' },
        (payload) => {
          console.log('Change received!', payload);
          fetchArtPieces(searchQuery); // Refresh the art list
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [searchQuery]);

  // Fetch art pieces when the component mounts or searchQuery changes
  useEffect(() => {
    fetchArtPieces(searchQuery);
  }, [searchQuery]);

  // Function to handle buying an art piece
  const buyArtPiece = async (artId) => {
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        throw new Error('User not authenticated.');
      }

      // Fetch the art piece to check the owner_id
      const { data: artPiece, error: fetchError } = await supabase
        .from('art-pieces')
        .select('owner_id')
        .eq('id', artId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Check if the user is trying to buy their own art
      if (artPiece.owner_id === userId) {
        Alert.alert('Error', 'You cannot buy your own art.');
        return;
      }

      // Update the buyer_id field in the database
      const { data, error: updateError } = await supabase
        .from('art-pieces')
        .update({ buyer_id: userId })
        .eq('id', artId);

      if (updateError) {
        throw updateError;
      }

      // Show a success alert
      Alert.alert('Success', 'Art piece purchased successfully!');

      // Refresh the market screen
      fetchArtPieces(searchQuery);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Sample data for art pieces
  const handleArtPiecePress = (item) => {
    router.push({ pathname: '/details', params: { item: JSON.stringify(item) } });
  };

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Marketplace</Text>
        <Text style={styles.bannerDescription}>
          Discover and buy unique art pieces from talented artists around the world.
        </Text>
        <TouchableOpacity style={styles.addArtButton} onPress={() => router.push('/add-art')}>
          <View style={styles.addArtButtonContent}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="add" size={20} color="#6200ee" />
            </View>
            <Text style={styles.addArtButtonText}>Add Art</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for art name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <MaterialIcons name="search" size={24} color="#6200ee" />
      </View>

      {/* Art List */}
      <ScrollView
        style={styles.artList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchArtPieces(searchQuery)} />
        }
      >
        {artPieces.map((item) => (
          <ArtPieceItem
            key={item.id}
            item={{...item, image: item.images?.[0] || 'https://via.placeholder.com/150'}}
            onPress={handleArtPiecePress}
            onBuy={() => buyArtPiece(item.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  banner: {
    backgroundColor: '#6200ee',
    padding: 20,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    marginTop: 40,
  },
  bannerDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  addArtButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  addArtButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBackground: {
    backgroundColor: '#f0e6ff', // Light purple background for the icon
    borderRadius: 5,
    padding: 5,
    marginRight: 10,
  },
  addArtButtonText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  artList: {
    padding: 10,
  },
});

export default MarketScreen;