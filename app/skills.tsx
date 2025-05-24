import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { MaterialIcons, Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { decode } from 'base64-arraybuffer';

export default function SkillsScreen() {
  const [skillsProfiles, setSkillsProfiles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [messageContent, setMessageContent] = useState('');

  const [newProfile, setNewProfile] = useState({
    name: '',
    surname: '',
    profession: '',
    skills: [],
    contact: '',
    location: '',
    portfolio: []
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchSkillsProfiles();
      return () => {};
    }, [])
  );

  const fetchSkillsProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('skills_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setSkillsProfiles(data);
      }
    } catch (error) {
      console.error('Error fetching skills profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setMediaPreview(prev => [...prev, asset.uri]);
      setNewProfile(prev => ({
        ...prev,
        portfolio: [...prev.portfolio, { uri: asset.uri, type: asset.type }]
      }));
    }
  };

  const uploadFiles = async (files) => {
    const uploadedFiles = [];

    for (const file of files) {
      const fileExt = file.uri.split('.').pop();
      const fileName = `${Date.now()}-${file.name || `file.${fileExt}`}`;
      const filePath = `skills-portfolio/${fileName}`;

      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const base64data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            resolve(reader.result);
          };
        });

        const base64 = base64data.split(',')[1];
        const arrayBuffer = decode(base64);

        const { error: uploadError } = await supabase.storage
          .from('skills-media')
          .upload(filePath, arrayBuffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('skills-media')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          url: publicUrl,
          type: file.type
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    }

    return uploadedFiles;
  };

const handleCreateProfile = async () => {
  console.log('Create Profile button clicked'); // Check if function is called
  
  try {
    console.log('Form validation check');
    if (!newProfile.name || !newProfile.surname || !newProfile.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    console.log('Getting user');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User error:', userError);
      Alert.alert('Error', 'You must be logged in to create a profile');
      return;
    }

    console.log('User ID:', user?.id);
    
    // Upload portfolio files if any
    let uploadedPortfolio = [];
    if (newProfile.portfolio.length > 0) {
      console.log('Uploading portfolio files');
      try {
        uploadedPortfolio = await uploadFiles(newProfile.portfolio);
        console.log('Uploaded files:', uploadedPortfolio);
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
    }

    console.log('Creating profile in database');
    const { data, error } = await supabase
      .from('skills_profiles')
      .insert([{
        ...newProfile,
        user_id: user?.id,
        portfolio: uploadedPortfolio,
        skills: Array.isArray(newProfile.skills) ? 
          newProfile.skills : 
          newProfile.skills.split(',').map(s => s.trim())
      }])
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Profile created successfully:', data);
    Alert.alert('Success', 'Profile created successfully!');
    setShowCreateModal(false);
    setNewProfile({
      name: '',
      surname: '',
      profession: '',
      skills: [],
      contact: '',
      location: '',
      portfolio: []
    });
    setMediaPreview([]);
    fetchSkillsProfiles();
  } catch (error) {
    console.error('Error in handleCreateProfile:', error);
    Alert.alert('Error', error.message || 'Failed to create profile');
  }
};

  const handleSendMessage = async () => {
    try {
      if (!messageContent.trim()) {
        Alert.alert('Error', 'Please enter a message');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('skills_messages')
        .insert([{
          sender_id: user?.id,
          receiver_id: selectedProfile.user_id,
          content: messageContent,
          profile_id: selectedProfile.id
        }]);

      if (error) throw error;

      Alert.alert('Success', 'Message sent successfully!');
      setShowMessageModal(false);
      setMessageContent('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const filteredProfiles = skillsProfiles.filter(profile => {
    const searchLower = searchQuery.toLowerCase();
    return (
      profile.name.toLowerCase().includes(searchLower) ||
      profile.surname.toLowerCase().includes(searchLower) ||
      profile.profession.toLowerCase().includes(searchLower) ||
      profile.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
      profile.location.toLowerCase().includes(searchLower)
    );
  });

  const renderProfileItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.profileCard}
      onPress={() => setSelectedProfile(item)}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0)}{item.surname.charAt(0)}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {item.name} {item.surname}
          </Text>
          <Text style={styles.profileProfession}>{item.profession}</Text>
        </View>
      </View>
      
      {item.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {item.skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {item.skills.length > 3 && (
            <Text style={styles.moreSkills}>+{item.skills.length - 3} more</Text>
          )}
        </View>
      )}
      
      <Text style={styles.profileLocation}>
        <Feather name="map-pin" size={14} color="#666" /> {item.location}
      </Text>
      
      <TouchableOpacity 
        style={styles.messageButton}
        onPress={() => {
          setSelectedProfile(item);
          setShowMessageModal(true);
        }}
      >
        <Text style={styles.messageButtonText}>Message</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Skills Directory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search skills, professions, locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Skills Profiles List */}
      <FlatList
        data={filteredProfiles}
        renderItem={renderProfileItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={fetchSkillsProfiles}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color="#6200ee" />
          ) : (
            <View style={styles.emptyState}>
              <Feather name="users" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No skills profiles found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try a different search' : 'Create your profile to get started'}
              </Text>
            </View>
          )
        }
      />

      {/* Create Profile Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent={false}>
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Skills Profile</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Name*</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={newProfile.name}
            onChangeText={(text) => setNewProfile({...newProfile, name: text})}
          />

          <Text style={styles.label}>Surname*</Text>
          <TextInput
            style={styles.input}
            placeholder="Your surname"
            value={newProfile.surname}
            onChangeText={(text) => setNewProfile({...newProfile, surname: text})}
          />

          <Text style={styles.label}>Profession/Skill*</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Graphic Designer, Plumber"
            value={newProfile.profession}
            onChangeText={(text) => setNewProfile({...newProfile, profession: text})}
          />

          <Text style={styles.label}>Skills (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Photoshop, Logo Design, Branding"
            value={Array.isArray(newProfile.skills) ? newProfile.skills.join(', ') : newProfile.skills}
            onChangeText={(text) => setNewProfile({...newProfile, skills: text})}
          />

          <Text style={styles.label}>Contact Details*</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone or email"
            value={newProfile.contact}
            onChangeText={(text) => setNewProfile({...newProfile, contact: text})}
          />

          <Text style={styles.label}>Location*</Text>
          <TextInput
            style={styles.input}
            placeholder="Your city or area"
            value={newProfile.location}
            onChangeText={(text) => setNewProfile({...newProfile, location: text})}
          />

          <Text style={styles.label}>Portfolio (optional)</Text>
          <Text style={styles.subLabel}>Add images or videos of your work</Text>
          <TouchableOpacity 
            style={styles.mediaButton}
            onPress={pickMedia}
          >
            <Feather name="upload" size={24} color="#6200ee" />
            <Text style={styles.mediaButtonText}>Add Media</Text>
          </TouchableOpacity>

          {mediaPreview.length > 0 && (
            <ScrollView horizontal style={styles.previewContainer}>
              {mediaPreview.map((uri, index) => (
                <View key={index} style={styles.previewItem}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removePreviewButton}
                    onPress={() => {
                      const newMedia = [...mediaPreview];
                      newMedia.splice(index, 1);
                      setMediaPreview(newMedia);

                      const newPortfolio = [...newProfile.portfolio];
                      newPortfolio.splice(index, 1);
                      setNewProfile({...newProfile, portfolio: newPortfolio});
                    }}
                  >
                    <Feather name="x" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleCreateProfile}
          >
            <Text style={styles.submitButtonText}>Create Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <Modal visible={!!selectedProfile} animationType="slide" transparent={false}>
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Details</Text>
              <TouchableOpacity onPress={() => setSelectedProfile(null)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileHeader}>
              <View style={styles.avatarPlaceholderLarge}>
                <Text style={styles.avatarTextLarge}>
                  {selectedProfile.name.charAt(0)}{selectedProfile.surname.charAt(0)}
                </Text>
              </View>
              <View style={styles.profileInfoLarge}>
                <Text style={styles.profileNameLarge}>
                  {selectedProfile.name} {selectedProfile.surname}
                </Text>
                <Text style={styles.profileProfessionLarge}>{selectedProfile.profession}</Text>
                <Text style={styles.profileLocationLarge}>
                  <Feather name="map-pin" size={16} color="#666" /> {selectedProfile.location}
                </Text>
              </View>
            </View>

            {selectedProfile.skills.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Skills</Text>
                <View style={styles.skillsContainerLarge}>
                  {selectedProfile.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTagLarge}>
                      <Text style={styles.skillTextLarge}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.detailText}>{selectedProfile.contact}</Text>

            {selectedProfile.portfolio.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Portfolio</Text>
                <ScrollView horizontal style={styles.portfolioContainer}>
                  {selectedProfile.portfolio.map((item, index) => (
                    item.type === 'image' ? (
                      <Image
                        key={index}
                        source={{ uri: item.url }}
                        style={styles.portfolioImage}
                      />
                    ) : (
                      <View key={index} style={styles.portfolioVideo}>
                        <Feather name="play" size={32} color="#6200ee" />
                      </View>
                    )
                  ))}
                </ScrollView>
              </>
            )}

            <TouchableOpacity 
              style={styles.messageButtonLarge}
              onPress={() => setShowMessageModal(true)}
            >
              <Text style={styles.messageButtonTextLarge}>Message {selectedProfile.name}</Text>
            </TouchableOpacity>
          </ScrollView>
        </Modal>
      )}

      {/* Message Modal */}
      <Modal visible={showMessageModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.messageModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Message {selectedProfile?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowMessageModal(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Write your message..."
              multiline
              numberOfLines={4}
              value={messageContent}
              onChangeText={setMessageContent}
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.submitButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#6200ee',
    padding: 8,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileProfession: {
    color: '#666',
    fontSize: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: '#f0e9ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#6200ee',
    fontSize: 12,
  },
  moreSkills: {
    color: '#666',
    fontSize: 12,
    alignSelf: 'center',
  },
  profileLocation: {
    color: '#666',
    fontSize: 12,
    marginBottom: 12,
  },
  messageButton: {
    backgroundColor: '#6200ee',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageModal: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 30
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  mediaButtonText: {
    marginLeft: 8,
    color: '#6200ee',
  },
  previewContainer: {
    marginBottom: 16,
  },
  previewItem: {
    position: 'relative',
    marginRight: 8,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePreviewButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Profile detail modal styles
  avatarPlaceholderLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarTextLarge: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
  },
  profileInfoLarge: {
    flex: 1,
  },
  profileNameLarge: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 4,
  },
  profileProfessionLarge: {
    color: '#666',
    fontSize: 18,
    marginBottom: 8,
  },
  profileLocationLarge: {
    color: '#666',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  skillsContainerLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTagLarge: {
    backgroundColor: '#f0e9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillTextLarge: {
    color: '#6200ee',
    fontSize: 14,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  portfolioContainer: {
    marginBottom: 16,
  },
  portfolioImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },
  portfolioVideo: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageButtonLarge: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  messageButtonTextLarge: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});