import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';

const App = () => {
  const [activeTab, setActiveTab] = useState('WEEKLY'); // State to track active tab

  const weeklyPlayers = [
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player 1', points: 45 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player 2', points: 42 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player 3', points: 39 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Mayur Dubey', points: 36 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Aarush Gedam', points: 35 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Anuj', points: 34 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Rajesh Gaikwad', points: 33 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Darshan IT', points: 32 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Krishna Dubey', points: 31 },
  ];

  const allTimePlayers = [
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player A', points: 100 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player B', points: 95 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player C', points: 90 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player D', points: 85 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player E', points: 80 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player F', points: 75 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player G', points: 70 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player H', points: 65 },
    { avatar: 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg', name: 'Player I', points: 60 },
  ];

  const players = activeTab === 'WEEKLY' ? weeklyPlayers : allTimePlayers;

  return (
    <View style={styles.container}>
      {/* Leaderboard Header */}
      <Text style={styles.leaderboardTitle}>LEADERBOARD</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('WEEKLY')}>
          <Text style={[styles.tab, activeTab === 'WEEKLY' && styles.activeTab]}>
            WEEKLY
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('ALL TIME')}>
          <Text style={[styles.tab, activeTab === 'ALL TIME' && styles.activeTab]}>
            ALL TIME
          </Text>
        </TouchableOpacity>
      </View>

      {/* Podium Section */}
      <View style={styles.podium}>
        <View style={styles.podiumContainer}>
          {/* Second Place */}
          {players[1] && (
            <View style={styles.podiumItem}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: players[1].avatar }}
                  style={styles.podiumAvatar}
                />
              </View>
              <View style={[styles.podiumPillar, styles.secondPlace]}>
                <Text style={styles.podiumRank}>2nd</Text>
              </View>
            </View>
          )}

          {/* First Place */}
          {players[0] && (
            <View style={styles.podiumItem}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: players[0].avatar }}
                  style={[styles.podiumAvatar, styles.firstPlaceAvatar]}
                />
              </View>
              <View style={[styles.podiumPillar, styles.firstPlace]}>
                <Text style={styles.podiumRank}>1st</Text>
              </View>
            </View>
          )}

          {/* Third Place */}
          {players[2] && (
            <View style={styles.podiumItem}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: players[2].avatar }}
                  style={styles.podiumAvatar}
                />
              </View>
              <View style={[styles.podiumPillar, styles.thirdPlace]}>
                <Text style={styles.podiumRank}>3rd</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Leaderboard Container */}
      <View style={styles.leaderboardContainer}>
        <FlatList
          data={players}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.listItem}>
              <View style={styles.listLeft}>
                <Text style={styles.listRank}>{index + 1}</Text>
                <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
                <Text style={styles.listName}>{item.name}</Text>
              </View>
              <Text style={styles.listPoints}>{item.points} pts</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4500',
    textAlign: 'center',
    marginVertical: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tab: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 10,
    paddingVertical: 5,
  },
  activeTab: {
    color: '#FF4500',
    borderBottomWidth: 2,
    borderBottomColor: '#FF4500',
  },
  podium: {
    marginBottom: 20,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  podiumItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  podiumPillar: {
    width: 80,
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  firstPlace: {
    backgroundColor: '#FF4500',
    height: 160,
  },
  secondPlace: {
    backgroundColor: '#C0C0C0',
    height: 140,
  },
  thirdPlace: {
    backgroundColor: '#CD7F32',
    height: 120,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  firstPlaceAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  podiumRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  leaderboardContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    maxHeight: '50%',
    borderWidth: 2,
    borderColor: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 10,
    marginVertical: 5,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: '#fff',
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  listName: {
    fontSize: 14,
    color: '#fff',
  },
  listPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4500',
  },
});

export default App;