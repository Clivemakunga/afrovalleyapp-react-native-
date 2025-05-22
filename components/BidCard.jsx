import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import artData from '../screens/api/artData';
import userData from '../screens/api/userData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountdownTimer from './countdownTimer';



const BidCard = ({ name, surname, artImage, artID, artPrice, artName }) => {
  const [showModal, setShowModal] = useState(false);
  const [bidAmount, setBidAmount] = useState();
  const [bids, setBids] = useState([]);

  const navigation = useNavigation();
  

  const handlePlaceBid = () => {
    navigation.navigate('BidPlacementScreen', { artName, artPrice, artID, artImage, name, surname});
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Image source={{ uri: 'https://robohash.org/3a27781c45173e535387a79f1fde7433?set=set4&bgset=&size=400x400' }} style={styles.avatar} />
        <View style={styles.nameAndVerified}>
          <Text style={styles.name}>{name} {surname}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>ZIA Verified</Text>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
      <Image source={{ uri: artImage }} style={styles.artImage} />
      <View style={styles.artDetails2}>
        <Text style={styles.price}>Price : ${artPrice}</Text>
        <Text style={styles.price2}>Art Name : {artName}</Text>
        {/* <CountdownTimer duration={600} /> */}
      </View>
      <View style={styles.divider} />
      <View style={styles.artDetails}>
        {/* <TouchableOpacity style={styles.detailsButton} >
          <Ionicons name="eye-sharp" size={18} color="white" style={styles.bidNowIcon} />
          <Text style={styles.bidNowText}>Bid Details</Text>
        </TouchableOpacity> */}
        {/* <CountdownTimer duration={600} /> */}
        <TouchableOpacity style={styles.bidNowButton} onPress={handlePlaceBid}>
          <Ionicons name="add-circle" size={18} color="white" style={styles.bidNowIcon} />
          <Text style={styles.bidNowText}>Bid Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#424242',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  nameAndVerified: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  verifiedBadge: {
    backgroundColor: '#00B0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  artImage: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    marginVertical: 12,
  },
  artDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  artDetails2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  artID: {
    fontSize: 14,
    color: '#fff',
  },
  price: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800'
  },
  price2: {
    fontSize: 14,
    color: 'gray',
    fontWeight: '800'
  },
  bidNowButton: {
    backgroundColor: 'purple',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    flexDirection: 'row',
    width: "100%",
    alignItems: 'center',
    justifyContent:'center'
  },
  detailsButton: {
    backgroundColor: 'green',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidNowIcon: {
    marginRight: 8,
  },
  bidNowText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bidInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BidCard;