import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

const PortfolioScreen = () => {
  const [artPieces, setArtPieces] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch art pieces created or bought by the user
  const fetchArtPieces = async () => {
    setRefreshing(true);

    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      setRefreshing(false);
      return;
    }

    // Fetch art pieces created by the user
    const { data: createdArt, error: createdError } = await supabase
      .from('art-pieces') // Replace with your table name
      .select('*')
      .eq('owner_id', userId);

    // Fetch art pieces bought by the user
    const { data: boughtArt, error: boughtError } = await supabase
      .from('art-pieces') // Replace with your table name
      .select('*')
      .eq('buyer_id', userId);

    if (createdError || boughtError) {
      console.error('Error fetching art pieces:', createdError || boughtError);
    } else {
      // Combine created and bought art pieces with unique keys
      const combinedArt = [
        ...createdArt.map(art => ({ ...art, uniqueKey: `created-${art.id}` })),
        ...boughtArt.map(art => ({ ...art, uniqueKey: `bought-${art.id}` })),
      ];
      setArtPieces(combinedArt);

      // Calculate total portfolio value
      const totalValue = combinedArt.reduce((sum, art) => sum + art.price, 0);
      setWalletBalance(totalValue); // Update wallet balance (for demonstration)
    }

    setRefreshing(false);
  };

  useEffect(() => {
    fetchArtPieces();
  }, []);

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>My Portfolio</Text>

      {/* Total Portfolio Value and Wallet Balance */}
      <View style={styles.topSection}>
        {/* Total Portfolio Value */}
        <View style={styles.valueCard}>
          <MaterialIcons name="collections" size={24} color="#6200ee" />
          <Text style={styles.valueTitle}>Portfolio Value</Text>
          <Text style={styles.valueAmount}>${walletBalance.toFixed(2)}</Text>
        </View>

        {/* Wallet Balance */}
        <View style={styles.valueCard}>
          <MaterialIcons name="account-balance-wallet" size={24} color="#4CAF50" />
          <Text style={styles.valueTitle}>Wallet Balance</Text>
          <Text style={styles.valueAmount}>${walletBalance.toFixed(2)}</Text>
        </View>
      </View>

      {/* Art Pieces List */}
      <ScrollView
        style={styles.artList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchArtPieces} />
        }
      >
        {artPieces.map((art) => (
          <View key={art.uniqueKey} style={styles.artCard}>
            <Image source={{ uri: art.images[0] }} style={styles.artImage} />
            <View style={styles.artDetails}>
              <Text style={styles.artName}>{art.title}</Text>
              <Text style={styles.artDescription}>
                {art.description.length > 50
                  ? `${art.description.substring(0, 50)}...`
                  : art.description}
              </Text>
              <View style={styles.priceBadgeContainer}>
                <Text style={styles.artPrice}>${art.price.toFixed(2)}</Text>
                <View
                  style={[
                    styles.badge,
                    art.badge === 'Premium' ? styles.premiumBadge : styles.economicBadge,
                  ]}
                >
                  <Text style={styles.badgeText}>{art.badge}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 30,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  valueCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  valueTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  valueAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  artList: {
    marginBottom: 20,
  },
  artCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  artImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  artDetails: {
    padding: 15,
  },
  artName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  artDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  priceBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  artPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  premiumBadge: {
    backgroundColor: '#FFC107', // Yellow for Premium
  },
  economicBadge: {
    backgroundColor: '#4CAF50', // Green for Economic
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PortfolioScreen;