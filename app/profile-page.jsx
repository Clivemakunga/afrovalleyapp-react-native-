import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput, Share } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

const ProfileScreen = () => {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Artist Name',
    bio: 'Digital artist specializing in surreal landscapes',
    medium: 'Digital Painting',
    style: 'Surrealism',
    influences: ['Salvador Dali', 'Zdzisław Beksiński'],
    genres: ['Fantasy', 'Horror'],
    avatar: 'https://i.pravatar.cc/150',
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [newInfluence, setNewInfluence] = useState('');
  const [newGenre, setNewGenre] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleImageUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${profile.id}/avatar.jpg`, formData);

      if (data) {
        setProfile(prev => ({ ...prev, avatar: uri }));
        await supabase
          .from('profiles')
          .update({ avatar: uri })
          .eq('id', profile.id);
      }
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update(tempProfile)
      .eq('id', profile.id);

    if (!error) {
      setProfile(tempProfile);
      setEditMode(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${profile.name}'s artist profile!`,
        url: `https://artconnect.com/profile/${profile.id}`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const addInfluence = () => {
    if (newInfluence.trim()) {
      setTempProfile(prev => ({
        ...prev,
        influences: [...prev.influences, newInfluence.trim()]
      }));
      setNewInfluence('');
    }
  };

  const addGenre = () => {
    if (newGenre.trim()) {
      setTempProfile(prev => ({
        ...prev,
        genres: [...prev.genres, newGenre.trim()]
      }));
      setNewGenre('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={editMode ? handleImageUpload : null}>
          <Image source={{ uri: editMode ? tempProfile.avatar : profile.avatar }} style={styles.avatar} />
          {editMode && (
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={20} color="white" />
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.headerText}>
          {editMode ? (
            <TextInput
              style={styles.nameInput}
              value={tempProfile.name}
              onChangeText={text => setTempProfile({ ...tempProfile, name: text })}
            />
          ) : (
            <Text style={styles.name}>{profile.name}</Text>
          )}
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <FontAwesome name="share-alt" size={24} color="#6200ee" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit/Save Buttons */}
      <View style={styles.controlRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editMode ? handleSave() : setEditMode(true)}
        >
          <Text style={styles.buttonText}>{editMode ? 'Save Profile' : 'Edit Profile'}</Text>
        </TouchableOpacity>
        {editMode && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setEditMode(false);
              setTempProfile(profile);
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Artist Bio</Text>
        {editMode ? (
          <TextInput
            multiline
            style={styles.bioInput}
            value={tempProfile.bio}
            onChangeText={text => setTempProfile({ ...tempProfile, bio: text })}
          />
        ) : (
          <Text style={styles.bioText}>{profile.bio}</Text>
        )}
      </View>

      {/* Artistic Details */}
      <View style={styles.detailsContainer}>
        <DetailItem
          label="Primary Medium"
          value={editMode ? (
            <TextInput
              style={styles.detailInput}
              value={tempProfile.medium}
              onChangeText={text => setTempProfile({ ...tempProfile, medium: text })}
            />
          ) : profile.medium}
        />
        
        <DetailItem
          label="Art Style"
          value={editMode ? (
            <TextInput
              style={styles.detailInput}
              value={tempProfile.style}
              onChangeText={text => setTempProfile({ ...tempProfile, style: text })}
            />
          ) : profile.style}
        />
      </View>

      {/* Influences Section */}
      <SectionWithTags
        title="Artistic Influences"
        items={editMode ? tempProfile.influences : profile.influences}
        editMode={editMode}
        onAdd={addInfluence}
        inputValue={newInfluence}
        onInputChange={setNewInfluence}
      />

      {/* Genres Section */}
      <SectionWithTags
        title="Preferred Genres"
        items={editMode ? tempProfile.genres : profile.genres}
        editMode={editMode}
        onAdd={addGenre}
        inputValue={newGenre}
        onInputChange={setNewGenre}
      />
    </ScrollView>
  );
};

const DetailItem = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const SectionWithTags = ({ title, items, editMode, onAdd, inputValue, onInputChange }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.tagsContainer}>
      {items.map((item, index) => (
        <View key={index} style={styles.tag}>
          <Text style={styles.tagText}>{item}</Text>
          {editMode && (
            <TouchableOpacity onPress={() => {
              const updatedItems = items.filter((_, i) => i !== index);
              setTempProfile(prev => ({ ...prev, [title.toLowerCase()]: updatedItems }));
            }}>
              <MaterialIcons name="close" size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
    {editMode && (
      <View style={styles.addTagContainer}>
        <TextInput
          style={styles.tagInput}
          placeholder={`Add new ${title.toLowerCase()}`}
          value={inputValue}
          onChangeText={onInputChange}
        />
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <MaterialIcons name="add" size={24} color="#6200ee" />
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6200ee',
    borderRadius: 15,
    padding: 5,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
  },
  shareButton: {
    padding: 10,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  bioInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 25,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    gap: 5,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  addTagContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  addButton: {
    padding: 10,
    justifyContent: 'center',
  },
});

export default ProfileScreen;