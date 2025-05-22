import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Image, TouchableOpacity, FlatList, Modal } from 'react-native';
import { MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    genre: '',
    location: '',
    skill: ''
  });
  const [activeFeed, setActiveFeed] = useState('community');

  // Dummy data
  const [communityPosts] = useState([
    {
      id: 1,
      user: 'Artist1',
      content: 'Check out my latest work!',
      likes: 42,
      comments: 15,
      shares: 5,
      timestamp: '2h ago'
    },
    {
      id: 2,
      user: 'Creator2',
      content: 'Looking for collaborators!',
      likes: 28,
      comments: 8,
      shares: 3,
      timestamp: '4h ago'
    }
  ]);

  const [artists] = useState([
    {
      id: 1,
      name: 'Jane Doe',
      genre: 'Abstract',
      location: 'New York',
      skills: ['Painting', 'Digital Art'],
      popularity: 4.8
    },
    {
      id: 2,
      name: 'John Smith',
      genre: 'Portrait',
      location: 'London',
      skills: ['Sketching', 'Oil Painting'],
      popularity: 4.5
    }
  ]);

  const [badges] = useState([
    { id: 1, name: 'Novice', icon: 'star' },
    { id: 2, name: 'Collaborator', icon: 'group' }
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        setUser(profile);
      }
    };
    fetchUserData();
  }, []);

  const renderFeedItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: 'https://i.pravatar.cc/40' }} style={styles.avatar} />
        <Text style={styles.postUser}>{item.user}</Text>
        <Text style={styles.postTime}>{item.timestamp}</Text>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="heart" size={20} color="#666" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="message-circle" size={20} color="#666" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="share" size={20} color="#666" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderArtist = ({ item }) => (
    <TouchableOpacity style={styles.artistCard}>
      <Image source={{ uri: 'https://i.pravatar.cc/80' }} style={styles.artistImage} />
      <Text style={styles.artistName}>{item.name}</Text>
      <Text style={styles.artistDetails}>{item.genre} | {item.location}</Text>
      <View style={styles.skillContainer}>
        {item.skills.map((skill, index) => (
          <Text key={index} style={styles.skillTag}>{skill}</Text>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>AfroValley Community</Text>
        <TouchableOpacity onPress={() => router.push('/messages')}>
          <FontAwesome name="wechat" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search artists, genres, locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <MaterialIcons name="filter-list" size={24} color="#6200ee" />
        </TouchableOpacity>
      </View>

      {/* Quick Access Menu */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAccess}>
        <TouchableOpacity style={styles.quickAccessItem}>
          <MaterialIcons name="event" size={28} color="#6200ee" />
          <Text style={styles.quickAccessText}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAccessItem}>
          <MaterialIcons name="leaderboard" size={28} color="#6200ee" />
          <Text style={styles.quickAccessText}>Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAccessItem}>
          <MaterialIcons name="group-add" size={28} color="#6200ee" />
          <Text style={styles.quickAccessText}>Collaborate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAccessItem}>
          <MaterialIcons name="workspaces" size={28} color="#6200ee" />
          <Text style={styles.quickAccessText}>Workshops</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Feed Selector */}
      <View style={styles.feedSelector}>
        <TouchableOpacity 
          style={[styles.feedTab, activeFeed === 'community' && styles.activeTab]}
          onPress={() => setActiveFeed('community')}
        >
          <Text style={styles.feedTabText}>Community Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.feedTab, activeFeed === 'artists' && styles.activeTab]}
          onPress={() => setActiveFeed('artists')}
        >
          <Text style={styles.feedTabText}>Featured Artists</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area - Fixed numColumns Issue */}
      {activeFeed === 'community' ? (
        <FlatList
          key="community-feed"
          data={communityPosts}
          renderItem={renderFeedItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.feedContainer}
        />
      ) : (
        <FlatList
          key="artist-grid"
          data={artists}
          renderItem={renderArtist}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.artistGrid}
        />
      )}

      {/* Badges Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Achievements</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {badges.map(badge => (
          <View key={badge.id} style={styles.badgeCard}>
            <MaterialIcons name={badge.icon} size={32} color="#6200ee" />
            <Text style={styles.badgeName}>{badge.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Filters Modal */}
      <Modal visible={showFilters} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Advanced Filters</Text>
          {/* Add filter components here */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.closeButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 8
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8
  },
  quickAccess: {
    marginBottom: 16
  },
  quickAccessItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 100
  },
  quickAccessText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  feedSelector: {
    flexDirection: 'row',
    marginBottom: 16
  },
  feedTab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#6200ee'
  },
  feedTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  postUser: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 'auto'
  },
  postTime: {
    fontSize: 12,
    color: '#666'
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionText: {
    marginLeft: 4,
    color: '#666'
  },
  artistGrid: {
    paddingHorizontal: 8,
  },
  artistCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    maxWidth: '50%' // Critical fix for 2-column layout
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8
  },
  artistName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4
  },
  artistDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  skillTag: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 4,
    margin: 2,
    fontSize: 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  seeAll: {
    color: '#6200ee'
  },
  badgeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center'
  },
  badgeName: {
    marginTop: 8,
    fontSize: 12
  },
  modalContainer: {
    flex: 1,
    padding: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  closeButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});