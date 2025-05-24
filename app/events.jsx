import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { decode } from 'base64-arraybuffer';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [error, setError] = useState(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date(),
    category: 'general',
    is_public: true,
    max_attendees: '',
    cover_image: null
  });

  const [rsvpData, setRsvpData] = useState({
    name: '',
    email: '',
    note: '',
    guests: 1
  });

  // Fetch events with additional data
  const fetchEvents = async () => {
  setRefreshing(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // First fetch events with RSVP count
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select(`
        *,
        rsvps:event_rsvps(count)
      `)
      .order('date', { ascending: true });

    if (eventsError) throw eventsError;

    // Then check which events the user has RSVP'd to
    let userRsvps = [];
    if (user) {
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('event_rsvps')
        .select('event_id')
        .eq('user_id', user.id);
      
      if (!rsvpError) {
        userRsvps = rsvpData.map(rsvp => rsvp.event_id);
      }
    }

    // Fetch creator profiles in a batch
    const creatorIds = eventsData.map(event => event.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', creatorIds);

    const profilesMap = profilesError ? {} : 
      profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});

    // Combine all data
    const eventsWithCounts = eventsData.map(event => ({
      ...event,
      rsvps_count: event.rsvps[0]?.count || 0,
      is_attending: userRsvps.includes(event.id),
      user: profilesMap[event.user_id] || { username: 'Unknown' }
    }));

    setEvents(eventsWithCounts);
  } catch (error) {
    console.error('Error fetching events:', error);
    Alert.alert('Error', 'Failed to load events');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  // Fetch attendees for a specific event
  const fetchAttendees = async (eventId) => {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('event_id', eventId);

      if (!error) {
        setAttendees(data);
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  // Handle event creation
  const handleCreateEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.description || !newEvent.location) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      // Upload cover image if selected
      let coverImageUrl = null;
      if (mediaPreview.length > 0) {
        const uploaded = await uploadFiles([{ uri: mediaPreview[0], type: 'image' }]);
        coverImageUrl = uploaded[0].url;
      }

      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...newEvent,
          user_id: user?.id,
          date: date.toISOString(),
          cover_image: coverImageUrl
        }])
        .select();

      if (error) throw error;

      Alert.alert('Success', 'Event created successfully!');
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        description: '',
        location: '',
        date: new Date(),
        category: 'general',
        is_public: true,
        max_attendees: '',
        cover_image: null
      });
      setMediaPreview([]);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', error.message || 'Failed to create event');
    }
  };

  // Handle RSVP submission
  const handleRSVP = async (attending = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (attending) {
        // Submit RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .insert([{
            event_id: selectedEvent.id,
            user_id: user?.id,
            name: rsvpData.name,
            email: rsvpData.email,
            note: rsvpData.note,
            guests: rsvpData.guests,
            status: 'confirmed'
          }]);

        if (error) throw error;
        Alert.alert('Success', "You're attending this event!");
      } else {
        // Remove RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', selectedEvent.id)
          .eq('user_id', user?.id);

        if (error) throw error;
        Alert.alert('Success', "RSVP cancelled");
      }

      setShowRSVPModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error handling RSVP:', error);
      Alert.alert('Error', error.message || 'Failed to process RSVP');
    }
  };

  // Upload files to storage
  const uploadFiles = async (files) => {
    const uploadedFiles = [];
    for (const file of files) {
      const fileExt = file.uri.split('.').pop();
      const fileName = `${Date.now()}-event-cover.${fileExt}`;
      const filePath = `event-covers/${fileName}`;

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
          .from('event-media')
          .upload(filePath, arrayBuffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('event-media')
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

  // Pick cover image
  const pickCoverImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setMediaPreview([result.assets[0].uri]);
      setNewEvent(prev => ({
        ...prev,
        cover_image: result.assets[0].uri
      }));
    }
  };

  // Initialize data
  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
      return () => {};
    }, [])
  );

  // Render event item
  const renderEventItem = ({ item }) => (
    <View style={styles.eventCard}>
      {item.cover_image && (
        <Image source={{ uri: item.cover_image }} style={styles.eventCover} />
      )}
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={styles.creatorInfo}>
            {item.user?.avatar_url ? (
              <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.user?.username?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
            <Text style={styles.creatorName}>{item.user?.username || 'Unknown'}</Text>
          </View>
          <View style={styles.eventCategory}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>

        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription}>{item.description}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.detailItem}>
            <Feather name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Feather name="map-pin" size={16} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <TouchableOpacity 
            style={styles.rsvpButton}
            onPress={() => {
              setSelectedEvent(item);
              setShowRSVPModal(true);
            }}
          >
            <Text style={styles.rsvpButtonText}>
              {item.is_attending ? 'Manage RSVP' : 'RSVP Now'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.attendeesButton}
            onPress={() => {
              setSelectedEvent(item);
              fetchAttendees(item.id);
              setShowAttendeesModal(true);
            }}
          >
            <Feather name="users" size={16} color="#6200ee" />
            <Text style={styles.attendeesText}>{item.rsvps_count} Going</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render loading state
  if (loading && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Community Events</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchEvents}
            colors={['#6200ee']}
          />
        }
ListEmptyComponent={
  <View style={styles.emptyContainer}>
    {error ? (
      <>
        <Feather name="alert-circle" size={48} color="#ff4444" />
        <Text style={styles.emptyText}>Failed to load events</Text>
        <TouchableOpacity onPress={fetchEvents}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </>
    ) : (
      <>
        <Feather name="calendar" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No events available</Text>
        <Text style={styles.emptySubtext}>Be the first to create one!</Text>
      </>
    )}
  </View>
}
      />

      {/* Create Event Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent={false}>
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Event</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Cover Image */}
          <Text style={styles.label}>Cover Image (Optional)</Text>
          <TouchableOpacity 
            style={styles.coverImageButton}
            onPress={pickCoverImage}
          >
            {mediaPreview.length > 0 ? (
              <Image source={{ uri: mediaPreview[0] }} style={styles.coverImagePreview} />
            ) : (
              <View style={styles.coverImagePlaceholder}>
                <Feather name="image" size={32} color="#6200ee" />
                <Text style={styles.coverImageText}>Add Cover Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Event Title*</Text>
          <TextInput
            style={styles.input}
            placeholder="What's your event about?"
            value={newEvent.title}
            onChangeText={(text) => setNewEvent({...newEvent, title: text})}
          />

          <Text style={styles.label}>Description*</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Tell people what to expect..."
            multiline
            numberOfLines={4}
            value={newEvent.description}
            onChangeText={(text) => setNewEvent({...newEvent, description: text})}
          />

          <Text style={styles.label}>Date & Time*</Text>
          <TouchableOpacity 
            style={styles.input} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{date.toLocaleString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                  setNewEvent({...newEvent, date: selectedDate.toISOString()});
                }
              }}
            />
          )}

          <Text style={styles.label}>Location*</Text>
          <TextInput
            style={styles.input}
            placeholder="Where is it happening?"
            value={newEvent.location}
            onChangeText={(text) => setNewEvent({...newEvent, location: text})}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {['general', 'workshop', 'social', 'networking', 'conference'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  newEvent.category === category && styles.categoryButtonActive
                ]}
                onPress={() => setNewEvent({...newEvent, category})}
              >
                <Text style={[
                  styles.categoryButtonText,
                  newEvent.category === category && styles.categoryButtonTextActive
                ]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Event Type</Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setNewEvent({...newEvent, is_public: true})}
            >
              {newEvent.is_public ? (
                <Ionicons name="radio-button-on" size={24} color="#6200ee" />
              ) : (
                <Ionicons name="radio-button-off" size={24} color="#6200ee" />
              )}
              <Text style={styles.radioLabel}>Public Event</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setNewEvent({...newEvent, is_public: false})}
            >
              {!newEvent.is_public ? (
                <Ionicons name="radio-button-on" size={24} color="#6200ee" />
              ) : (
                <Ionicons name="radio-button-off" size={24} color="#6200ee" />
              )}
              <Text style={styles.radioLabel}>Private Event</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Max Attendees (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Leave empty for unlimited"
            keyboardType="numeric"
            value={newEvent.max_attendees}
            onChangeText={(text) => setNewEvent({...newEvent, max_attendees: text})}
          />

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleCreateEvent}
          >
            <Text style={styles.submitButtonText}>Create Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* RSVP Modal */}
      <Modal visible={showRSVPModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.rsvpModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedEvent?.is_attending ? 'Manage RSVP' : 'RSVP to Event'}
              </Text>
              <TouchableOpacity onPress={() => setShowRSVPModal(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.eventTitleModal}>{selectedEvent?.title}</Text>
            <Text style={styles.eventDateModal}>
              {selectedEvent && new Date(selectedEvent.date).toLocaleString()}
            </Text>

            {!selectedEvent?.is_attending && (
              <>
                <Text style={styles.label}>Your Name*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  value={rsvpData.name}
                  onChangeText={(text) => setRsvpData({...rsvpData, name: text})}
                />

                <Text style={styles.label}>Email*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  keyboardType="email-address"
                  value={rsvpData.email}
                  onChangeText={(text) => setRsvpData({...rsvpData, email: text})}
                />

                <Text style={styles.label}>Number of Guests</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Including yourself"
                  keyboardType="numeric"
                  value={rsvpData.guests.toString()}
                  onChangeText={(text) => setRsvpData({...rsvpData, guests: parseInt(text) || 1})}
                />

                <Text style={styles.label}>Note to Organizer (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Dietary restrictions, etc."
                  multiline
                  value={rsvpData.note}
                  onChangeText={(text) => setRsvpData({...rsvpData, note: text})}
                />
              </>
            )}

            <View style={styles.rsvpButtons}>
              {selectedEvent?.is_attending ? (
                <TouchableOpacity 
                  style={[styles.rsvpActionButton, styles.cancelButton]}
                  onPress={() => handleRSVP(false)}
                >
                  <Text style={styles.rsvpActionButtonText}>Cancel RSVP</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.rsvpActionButton, styles.confirmButton]}
                  onPress={() => handleRSVP(true)}
                >
                  <Text style={styles.rsvpActionButtonText}>Confirm Attendance</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Attendees Modal */}
      <Modal visible={showAttendeesModal} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Attendees for {selectedEvent?.title}
            </Text>
            <TouchableOpacity onPress={() => setShowAttendeesModal(false)}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={attendees}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.attendeeItem}>
                {item.user?.avatar_url ? (
                  <Image source={{ uri: item.user.avatar_url }} style={styles.attendeeAvatar} />
                ) : (
                  <View style={styles.attendeeAvatarPlaceholder}>
                    <Text style={styles.attendeeAvatarText}>
                      {item.user?.username?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.attendeeInfo}>
                  <Text style={styles.attendeeName}>{item.name || item.user?.username || 'Guest'}</Text>
                  {item.guests > 1 && (
                    <Text style={styles.attendeeGuests}>+{item.guests - 1} guests</Text>
                  )}
                  {item.note && (
                    <Text style={styles.attendeeNote} numberOfLines={1}>{item.note}</Text>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyAttendees}>
                <Feather name="users" size={48} color="#ccc" />
                <Text style={styles.emptyAttendeesText}>No attendees yet</Text>
                <Text style={styles.emptyAttendeesSubtext}>Be the first to RSVP!</Text>
              </View>
            }
          />
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
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCover: {
    width: '100%',
    height: 160,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  creatorName: {
    fontSize: 14,
    color: '#666',
  },
  eventCategory: {
    backgroundColor: '#f0e9ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#6200ee',
    fontSize: 12,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rsvpButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  rsvpButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  attendeesButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    color: '#6200ee',
    marginLeft: 4,
    fontSize: 14,
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
  rsvpModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventTitleModal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDateModal: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  coverImageButton: {
    height: 160,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  coverImagePreview: {
    width: '100%',
    height: '100%',
  },
  coverImagePlaceholder: {
    alignItems: 'center',
  },
  coverImageText: {
    color: '#6200ee',
    marginTop: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  categoryButtonText: {
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
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
  rsvpButtons: {
    marginTop: 24,
  },
  rsvpActionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#6200ee',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  rsvpActionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  attendeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  attendeeAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  attendeeAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '500',
  },
  attendeeGuests: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  attendeeNote: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  emptyAttendees: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyAttendeesText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptyAttendeesSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});