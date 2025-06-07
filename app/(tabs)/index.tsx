import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Image, TouchableOpacity, FlatList, Modal, Pressable, Alert } from 'react-native';
import { MaterialIcons, FontAwesome, Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CommentsModal from '../commentsModal';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add state for selected post
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    genre: '',
    location: '',
    skill: ''
  });
  const [activeFeed, setActiveFeed] = useState('community');
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    media: null,
    mediaType: '',
    location: ''
  });
  const [mediaPreview, setMediaPreview] = useState(null);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    fetchPosts();
    fetchArtists();
    fetchUserData();
  }, []);

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

const fetchPosts = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      comments:post_comments(count),
      likes:post_likes(count),
      user_like:post_likes(
        id
      ).filter(user_id.eq.${user?.id || ''})
    `)
    .order('created_at', { ascending: false });

  if (!error) {
    const postsWithCounts = data.map(post => ({
      ...post,
      comments_count: post.comments[0]?.count || 0,
      likes_count: post.likes[0]?.count || 0,
      user_has_liked: post.user_like.length > 0  // This will be true if user liked the post
    }));
    setCommunityPosts(postsWithCounts);
  }
};

  const fetchArtists = async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('*, posts:community_posts(count)')
      .order('engagement_score', { ascending: false })
      .limit(6);

    if (!error) {
      setArtists(data);
    }
  };

  const pickMedia = async (type) => {
    let result;
    if (type === 'image') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else if (type === 'video') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });
    }

    if (!result.canceled) {
      const asset = result.assets[0];
      setMediaPreview(asset.uri);
      setNewPost(prev => ({
        ...prev,
        media: asset,
        mediaType: type
      }));
    }
  };

const uploadMedia = async () => {
  try {
    if (!newPost.media) return null;

    const fileExt = newPost.media.uri.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${newPost.mediaType}s/${fileName}`;

    // In React Native, we need to read the file differently
    const response = await fetch(newPost.media.uri);
    const blob = await response.blob();
    
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        const arrayBuffer = decode(base64data);

        console.log('Uploading file to storage:', filePath);
        const { error: uploadError } = await supabase.storage
          .from('community-media')
          .upload(filePath, arrayBuffer, {
            contentType: newPost.media.mimeType || 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          reject(uploadError);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('community-media')
          .getPublicUrl(filePath);

        console.log('Media upload successful. Public URL:', publicUrl);
        resolve(publicUrl);
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
    });

  } catch (error) {
    console.error('Error in uploadMedia:', error);
    throw error;
  }
};

const handleSubmit = async () => {
  try {
    if (!newPost.title || !newPost.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true); // Start loading

    console.log('Starting post submission...');
    let mediaUrl = null;
    
    if (newPost.media) {
      console.log('Uploading media...');
      mediaUrl = await uploadMedia();
      console.log('Media uploaded:', mediaUrl);
    }

    console.log('Creating post in database...');
    const { data, error } = await supabase
      .from('community_posts')
      .insert([{
        title: newPost.title,
        description: newPost.description,
        media_url: mediaUrl,
        media_type: newPost.mediaType,
        location: newPost.location,
        user_id: user?.id,
        user_name: user?.username || user?.email?.split('@')[0],
        user_avatar: user?.avatar_url
      }])
      .select();

    if (error) {
      console.error('Post creation error:', error);
      alert(`Failed to create post: ${error.message}`);
      return;
    }

    console.log('Post created successfully:', data);
    setCommunityPosts(prev => [data[0], ...prev]);
    setShowAddModal(false);
    resetForm();
    fetchPosts();

    // Show success alert
    Alert.alert(
      'Success',
      'Your post has been shared with the community!',
      [{ text: 'OK' }]
    );

  } catch (error) {
    console.error('Error in handleSubmit:', error);
    Alert.alert(
      'Error',
      'Failed to create post. Please try again.',
      [{ text: 'OK' }]
    );
  } finally {
    setIsSubmitting(false); // Stop loading regardless of success/error
  }
};

  const resetForm = () => {
    setNewPost({
      title: '',
      description: '',
      media: null,
      mediaType: '',
      location: ''
    });
    setMediaPreview(null);
  };

const handleLike = async (postId) => {
  try {
    if (!user) {
      alert('Please login to like posts');
      return;
    }

    // Optimistically update the UI first
    setCommunityPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const user_has_liked = !post.user_has_liked;
          return {
            ...post,
            user_has_liked,
            likes_count: user_has_liked ? post.likes_count + 1 : post.likes_count - 1
          };
        }
        return post;
      })
    );

    // Check if user already liked this post
    const { data: existingLike, error: likeError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Unlike the post
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;
    } else {
      // Like the post
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: user.id }]);

      if (insertError) throw insertError;
    }

    // Refresh posts to ensure data consistency
    fetchPosts();
  } catch (error) {
    console.error('Error handling like:', error);
    // Revert optimistic update if there was an error
    fetchPosts();
  }
};

  // Modify handleComment
const handleComment = (post) => {
  setSelectedPost(post);
  setShowCommentsModal(true);
};



  const renderFeedItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={() => router.push(`/profile/${item.user_id}`)}>
          <Image
            source={{ uri: item.user_avatar || 'https://i.pravatar.cc/40' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.postUser}>{item.user_name}</Text>
        <Text style={styles.postTime}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
      {item.title && <Text style={styles.postTitle}>{item.title}</Text>}
      <Text style={styles.postContent}>{item.description}</Text>

      {item.media_url && (
        item.media_type === 'image' ? (
          <Image source={{ uri: item.media_url }} style={styles.postMedia} />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Feather name="play-circle" size={48} color="#6200ee" />
          </View>
        )
      )}

      <View style={styles.postActions}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => handleLike(item.id)}
      >
        <Feather 
          name="heart" 
          size={20} 
          color={item.user_has_liked ? '#ff0000' : '#666'} 
        />
        <Text style={styles.actionText}>{item.likes_count || 0}</Text>
      </TouchableOpacity>
      
            <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => handleComment(item)}
      >
        <Feather name="message-circle" size={20} color="#666" />
        <Text style={styles.actionText}>{item.comments_count || 0}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <Feather name="share" size={20} color="#666" />
        <Text style={styles.actionText}>{item.shares_count || 0}</Text>
      </TouchableOpacity>
    </View>
    </View>
  );

  const renderArtist = ({ item }) => (
    <TouchableOpacity
      style={styles.artistCard}
      onPress={() => router.push(`/profile/${item.id}`)}
    >
      <Image
        source={{ uri: item.avatar_url || 'https://i.pravatar.cc/80' }}
        style={styles.artistImage}
      />
      <Text style={styles.artistName}>{item.name || item.username}</Text>
      <Text style={styles.artistDetails}>{item.genre || 'Artist'} | {item.location || 'Unknown'}</Text>
      <View style={styles.popularityBadge}>
        <Ionicons name="md-star" size={16} color="#FFD700" />
        <Text style={styles.popularityText}>{item.engagement_score?.toFixed(1) || '4.5'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Afro Valley Tribe</Text>
          {/* <TouchableOpacity onPress={() => router.push('/chat')}>
            <FontAwesome name="wechat" size={24} color="#333" />
          </TouchableOpacity> */}
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
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <AntDesign name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Quick Access Menu */}
<View style={styles.quickAccessContainer}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.quickAccessContent}
  >
    <TouchableOpacity 
      style={styles.quickAccessItem}
      onPress={() => router.push('/events')}
    >
      <MaterialIcons name="event" size={24} color="#6200ee" />
      <Text style={styles.quickAccessText}>Events</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.quickAccessItem}
      onPress={() => router.push('/skills')}
    >
      <MaterialIcons name="leaderboard" size={24} color="#6200ee" />
      <Text style={styles.quickAccessText}>Professions</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.quickAccessItem}
      onPress={() => router.push('/collaborations')}
    >
      <MaterialIcons name="group-add" size={24} color="#6200ee" />
      <Text style={styles.quickAccessText}>Collaborate</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.quickAccessItem}
      onPress={() => router.push('/workshops')}
    >
      <MaterialIcons name="workspaces" size={24} color="#6200ee" />
      <Text style={styles.quickAccessText}>Workshops</Text>
    </TouchableOpacity>
  </ScrollView>
</View>

        {/* Feed Selector */}
        <View style={styles.feedSelectorContainer}>
          <View style={styles.feedSelector}>
            <TouchableOpacity
              style={[styles.feedTab, activeFeed === 'community' && styles.activeTab]}
              onPress={() => setActiveFeed('community')}
            >
              <Text style={[styles.feedTabText, activeFeed === 'community' && styles.activeTabText]}>
                Community Feed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.feedTab, activeFeed === 'artists' && styles.activeTab]}
              onPress={() => setActiveFeed('artists')}
            >
              <Text style={[styles.feedTabText, activeFeed === 'artists' && styles.activeTabText]}>
                Featured Artists
              </Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Fixed Content Area */}
        <View style={styles.contentContainer}>
          {activeFeed === 'community' ? (
            <FlatList
              key={`community-feed-${activeFeed}`}
              data={communityPosts}
              renderItem={renderFeedItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.feedContent}
            />
          ) : (
            <FlatList
              key={`artist-grid-${activeFeed}`}
              data={artists}
              renderItem={renderArtist}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.artistGrid}
            />
          )}
        </View>

        {/* Add Post Modal */}
        <Modal visible={showAddModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.addModalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Your Work</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Title of your work*"
                  value={newPost.title}
                  onChangeText={(text) => setNewPost({ ...newPost, title: text })}
                />

                <TextInput
                  style={[styles.inputField, styles.descriptionInput]}
                  placeholder="Description*"
                  multiline
                  numberOfLines={4}
                  value={newPost.description}
                  onChangeText={(text) => setNewPost({ ...newPost, description: text })}
                />

                <Text style={styles.sectionLabel}>Add Media</Text>
                <View style={styles.mediaButtons}>
                  <TouchableOpacity
                    style={styles.mediaButton}
                    onPress={() => pickMedia('image')}
                  >
                    <Feather name="image" size={24} color="#6200ee" />
                    <Text style={styles.mediaButtonText}>Image</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.mediaButton}
                    onPress={() => pickMedia('video')}
                  >
                    <Feather name="video" size={24} color="#6200ee" />
                    <Text style={styles.mediaButtonText}>Video</Text>
                  </TouchableOpacity>
                </View>

                {mediaPreview && (
                  <View style={styles.mediaPreviewContainer}>
                    {newPost.mediaType === 'image' ? (
                      <Image source={{ uri: mediaPreview }} style={styles.mediaPreview} />
                    ) : (
                      <View style={styles.videoPreview}>
                        <Feather name="play-circle" size={48} color="#6200ee" />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeMediaButton}
                      onPress={() => {
                        setMediaPreview(null);
                        setNewPost({ ...newPost, media: null, mediaType: '' });
                      }}
                    >
                      <Feather name="x" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                )}

                <TextInput
                  style={styles.inputField}
                  placeholder="Location (optional)"
                  value={newPost.location}
                  onChangeText={(text) => setNewPost({ ...newPost, location: text })}
                />
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Post to Community</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Filters Modal */}
        <Modal visible={showFilters} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Advanced Filters</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Modal>
{showCommentsModal && selectedPost && (
  <CommentsModal 
    post={selectedPost} 
    onClose={() => {
      setShowCommentsModal(false);
      setSelectedPost(null);
    }}
    setCommunityPosts={setCommunityPosts}
  />
)}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  addButton: {
    padding: 10,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    marginLeft: 8,
  },
  quickAccessContainer: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  quickAccessContent: {
    paddingBottom: 4,
  },
  quickAccessItem: {
    width: 90,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  quickAccessText: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  feedSelectorContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  feedSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  feedTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#6200ee',
  },
  feedTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  feedContent: {
    paddingBottom: 16,
  },
  artistGrid: {
    paddingBottom: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postUser: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 'auto',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  postMedia: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  artistCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    alignItems: 'center',
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  artistName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  artistDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  popularityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0e9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularityText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6200ee',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  addModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  modalContent: {
    padding: 16
  },
  inputField: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  mediaButton: {
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '45%'
  },
  mediaButtonText: {
    marginTop: 8,
    color: '#6200ee'
  },
  mediaPreviewContainer: {
    position: 'relative',
    marginBottom: 16
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  submitButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center'
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  modalContainer: {
    flex: 1,
    padding: 20
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
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});