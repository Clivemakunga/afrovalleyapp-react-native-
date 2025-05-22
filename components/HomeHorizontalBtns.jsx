import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView, Alert} from 'react-native';
import { sendEmailVerification } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const HomeHorizontalBtns = () => {
  const {user, logout} = useAuth();
  const navigation = useNavigation();
  const handleButtonPress = (buttonIndex) => {
    // Add your button press logic here
    console.log(`Button ${buttonIndex} pressed`);
  };

  const resendEmail = async () => {
    try {
      if (user) {
        await sendEmailVerification(user);
        Alert.alert("Verification email sent!")
        await logout();
        console.log('Verification email sent!');
      } else {
        console.error('No user is currently signed in.');
      }
    } catch (error) {
      console.error('Error resending email verification:', error);
    }
  }

  
  return (
    <View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {!user.emailVerified ? (<TouchableOpacity style={styles.verifybutton} onPress={resendEmail}>
        <Text style={styles.buttonText}>Verify Email</Text>
      </TouchableOpacity>): null}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Market')}>
        <Text style={styles.buttonText}>Create Art</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Verification')}>
        <Text style={styles.buttonText}>Verify Account.</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('events')}>
        <Text style={styles.buttonText}>Events</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.button} onPress={() => handleButtonPress(5)}>
        <Text style={styles.buttonText}>Mostly Viewed</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleButtonPress(6)}>
        <Text style={styles.buttonText}>Button 6</Text>
      </TouchableOpacity> */}
    </ScrollView>
    <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#9450bf',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  verifybutton: {
    backgroundColor: '#3a1956',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    borderColor: 'white',
    borderWidth: 0.5
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    borderBottomColor: '#4A4C51',
    borderBottomWidth: 1,
    marginTop: 8,
    width: '96%',
    marginLeft: 6
  }
});

export default HomeHorizontalBtns;