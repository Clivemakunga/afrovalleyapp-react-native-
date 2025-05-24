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
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function WorkshopsScreen() {
  const [workshops, setWorkshops] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInterestedModal, setShowInterestedModal] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    description: '',
    objectives: '',
    date: new Date(),
    venue: '',
    duration: '',
    is_free: true,
    amount: '0'
  });

  const [interestForm, setInterestForm] = useState({
    name: '',
    surname: '',
    phone: ''
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchWorkshops();
      return () => {};
    }, [])
  );

  const fetchWorkshops = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('date', { ascending: true });

      if (!error) {
        // Mark workshops created by current user
        const workshopsWithOwnership = data.map(workshop => ({
          ...workshop,
          isOwner: workshop.user_id === user?.id
        }));
        setWorkshops(workshopsWithOwnership);
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendees = async (workshopId) => {
    try {
      const { data, error } = await supabase
        .from('workshop_attendees')
        .select('*')
        .eq('workshop_id', workshopId);

      if (!error) {
        setAttendees(data);
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  const handleCreateWorkshop = async () => {
    try {
      if (!newWorkshop.title || !newWorkshop.description || !newWorkshop.venue) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('workshops')
        .insert([{
          ...newWorkshop,
          user_id: user?.id,
          date: date.toISOString()
        }])
        .select();

      if (error) throw error;

      Alert.alert('Success', 'Workshop created successfully!');
      setShowCreateModal(false);
      setNewWorkshop({
        title: '',
        description: '',
        objectives: '',
        date: new Date(),
        venue: '',
        duration: '',
        is_free: true,
        amount: '0'
      });
      fetchWorkshops();
    } catch (error) {
      console.error('Error creating workshop:', error);
      Alert.alert('Error', 'Failed to create workshop');
    }
  };

  const handleExpressInterest = async () => {
    try {
      if (!interestForm.name || !interestForm.surname || !interestForm.phone) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const { error } = await supabase
        .from('workshop_attendees')
        .insert([{
          workshop_id: selectedWorkshop.id,
          name: interestForm.name,
          surname: interestForm.surname,
          phone: interestForm.phone,
          status: 'interested'
        }]);

      if (error) throw error;

      Alert.alert('Success', 'Your interest has been registered!');
      setShowInterestedModal(false);
      setInterestForm({
        name: '',
        surname: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error expressing interest:', error);
      Alert.alert('Error', 'Failed to register interest');
    }
  };

  const renderWorkshopItem = ({ item }) => (
    <View style={styles.workshopCard}>
      <Text style={styles.workshopTitle}>{item.title}</Text>
      <Text style={styles.workshopDate}>
        {new Date(item.date).toLocaleDateString()} • {item.venue}
      </Text>
      <Text style={styles.workshopDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.workshopFooter}>
        <Text style={styles.workshopPrice}>
          {item.is_free ? 'FREE' : `R${item.amount}`}
        </Text>
        {item.isOwner ? (
          <TouchableOpacity 
            style={styles.viewAttendeesButton}
            onPress={() => {
              setSelectedWorkshop(item);
              fetchAttendees(item.id);
              setShowAttendeesModal(true);
            }}
          >
            <Text style={styles.viewAttendeesText}>View Attendees</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.interestButton}
            onPress={() => {
              setSelectedWorkshop(item);
              setShowInterestedModal(true);
            }}
          >
            <Text style={styles.interestText}>I'm Interested</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Workshops</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Workshops List */}
      <FlatList
        data={workshops}
        renderItem={renderWorkshopItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={fetchWorkshops}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color="#6200ee" />
          ) : (
            <View style={styles.emptyState}>
              <Feather name="book" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No workshops available</Text>
              <Text style={styles.emptyStateSubtext}>Create the first workshop!</Text>
            </View>
          )
        }
      />

      {/* Create Workshop Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent={false}>
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Workshop</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Workshop Title*</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter workshop title"
            value={newWorkshop.title}
            onChangeText={(text) => setNewWorkshop({...newWorkshop, title: text})}
          />

          <Text style={styles.label}>Description*</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Describe your workshop"
            multiline
            numberOfLines={4}
            value={newWorkshop.description}
            onChangeText={(text) => setNewWorkshop({...newWorkshop, description: text})}
          />

          <Text style={styles.label}>Objectives</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="What will participants learn?"
            multiline
            numberOfLines={3}
            value={newWorkshop.objectives}
            onChangeText={(text) => setNewWorkshop({...newWorkshop, objectives: text})}
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
                  setNewWorkshop({...newWorkshop, date: selectedDate.toISOString()});
                }
              }}
            />
          )}

          <Text style={styles.label}>Venue*</Text>
          <TextInput
            style={styles.input}
            placeholder="Where will it take place?"
            value={newWorkshop.venue}
            onChangeText={(text) => setNewWorkshop({...newWorkshop, venue: text})}
          />

          <Text style={styles.label}>Duration</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2 hours"
            value={newWorkshop.duration}
            onChangeText={(text) => setNewWorkshop({...newWorkshop, duration: text})}
          />

          <View style={styles.freeContainer}>
            <Text style={styles.label}>Is this workshop free?</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setNewWorkshop({...newWorkshop, is_free: true})}
              >
                {newWorkshop.is_free ? (
                  <Ionicons name="radio-button-on" size={24} color="#6200ee" />
                ) : (
                  <Ionicons name="radio-button-off" size={24} color="#6200ee" />
                )}
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setNewWorkshop({...newWorkshop, is_free: false})}
              >
                {!newWorkshop.is_free ? (
                  <Ionicons name="radio-button-on" size={24} color="#6200ee" />
                ) : (
                  <Ionicons name="radio-button-off" size={24} color="#6200ee" />
                )}
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!newWorkshop.is_free && (
            <>
              <Text style={styles.label}>Amount (R)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={newWorkshop.amount}
                onChangeText={(text) => setNewWorkshop({...newWorkshop, amount: text})}
              />
            </>
          )}

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleCreateWorkshop}
          >
            <Text style={styles.submitButtonText}>Create Workshop</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Express Interest Modal */}
      <Modal visible={showInterestedModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.interestModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Express Interest</Text>
              <TouchableOpacity onPress={() => setShowInterestedModal(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.workshopTitleInModal}>{selectedWorkshop?.title}</Text>

            <Text style={styles.label}>Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={interestForm.name}
              onChangeText={(text) => setInterestForm({...interestForm, name: text})}
            />

            <Text style={styles.label}>Surname*</Text>
            <TextInput
              style={styles.input}
              placeholder="Your surname"
              value={interestForm.surname}
              onChangeText={(text) => setInterestForm({...interestForm, surname: text})}
            />

            <Text style={styles.label}>Phone Number*</Text>
            <TextInput
              style={styles.input}
              placeholder="Your phone number"
              keyboardType="phone-pad"
              value={interestForm.phone}
              onChangeText={(text) => setInterestForm({...interestForm, phone: text})}
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleExpressInterest}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* View Attendees Modal */}
      <Modal visible={showAttendeesModal} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Attendees for {selectedWorkshop?.title}</Text>
            <TouchableOpacity onPress={() => setShowAttendeesModal(false)}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={attendees}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.attendeeItem}>
                <Text style={styles.attendeeName}>
                  {item.name} {item.surname}
                </Text>
                <Text style={styles.attendeePhone}>{item.phone}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyAttendees}>
                <Feather name="users" size={48} color="#ccc" />
                <Text style={styles.emptyAttendeesText}>No attendees yet</Text>
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
    borderBottomColor: '#eee'
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
  workshopCard: {
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
  workshopTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workshopDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  workshopDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  workshopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workshopPrice: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  interestButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  interestText: {
    color: '#fff',
    fontSize: 14,
  },
  viewAttendeesButton: {
    backgroundColor: '#f0e9ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  viewAttendeesText: {
    color: '#6200ee',
    fontSize: 14,
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
  interestModal: {
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
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  freeContainer: {
    marginVertical: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    marginTop: 8,
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
  workshopTitleInModal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  attendeeItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attendeePhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyAttendees: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyAttendeesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});