import React from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, Card, Button, Icon, Avatar, Badge } from '@rneui/themed';
import { FontAwesome } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';

const cards = [
  {
    avatar: 'https://robohash.org/3a27781c45173e535387a79f1fde7433?set=set4&bgset=&size=400x400',
    name: 'John',
    surname: 'Doe',
    artImage: "https://awildgeographer.files.wordpress.com/2015/02/john_muir_glacier.jpg",
    artID: "123456",
    isVerified: true,
    Rating: 3
  },
  {
    avatar: 'https://robohash.org/b9b19be737b86ba3eacf535449ead16f?set=set4&bgset=&size=400x400',
    name: 'Clive',
    surname: 'Makunga',
    artImage: "https://awildgeographer.files.wordpress.com/2015/02/john_muir_glacier.jpg",
    artID: "1234563032",
    isVerified: true,
    Rating: 4
  },
  {
    avatar: 'https://robohash.org/b9b19be737b86ba3eacf535449ead16f?set=set4&bgset=&size=400x400',
    name: 'Clive',
    surname: 'Makunga',
    artImage: "https://awildgeographer.files.wordpress.com/2015/02/john_muir_glacier.jpg",
    artID: "123456303233",
    isVerified: true,
    Rating: 2
  },
  // Add more card data as needed
];

type CardsComponentsProps = {};

const ArtCard = () => {
  return (
    <>
      <View style={{ height: '100%' }}>
        <View style={styles.container}>
          {cards.map((card, index) => (
            <Card key={index} containerStyle={{ backgroundColor: '#9450bf', width: '98%', borderColor: 'purple' }}>
              {/* <Card.Title style={{textAlign: 'left'}}>HELLO WORLD</Card.Title> */}
              <View style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Avatar
                    rounded
                    source={{ uri: card.avatar }}
                    size="medium"
                  />
                  <View style={{ position: 'absolute', top: 30, left: 30 }}>
                    <Octicons name="verified" size={20} color="white" />
                  </View>
                </View>
                <Text style={{ marginLeft: 4, color: 'white' }}> {card.name} {card.surname} | </Text>
                <View style={styles.ratingContainer}>
                  {[...Array(card.Rating)].map((_, index) => (
                    <FontAwesome key={index} name="star" size={16} color="#ffd700" />
                  ))}
                </View>
                {card.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>ZIA | Verified</Text>
                  </View>
                )}
              </View>
              <Card.Divider />
              <Card.Image
                style={{ padding: 0 }}
                source={{ uri: card.artImage }}
              />
              <Text style={{ marginBottom: 10, color: 'white', marginTop: 4 }}>
                Art ID: {card.artID}
              </Text>
              <Button
                icon={
                  <Icon
                    name="code"
                    color="#ffffff"
                    iconStyle={{ marginRight: 10 }}
                  />
                }
                buttonStyle={{
                  borderRadius: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  marginBottom: 0,
                  backgroundColor: '#f5c116'
                }}
                title="BUY ART"
              />
            </Card>))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  fonts: {
    marginBottom: 8,
  },
  user: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  image: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  verifiedBadge: {
    backgroundColor: '#007AFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ArtCard;