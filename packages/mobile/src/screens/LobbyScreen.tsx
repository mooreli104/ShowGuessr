import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';
import { useSocket } from '../hooks/useSocket';

export const LobbyScreen = ({ navigation }: any) => {
  const { currentLobby, playerId } = useGameStore();
  const { leaveLobby, startGame } = useSocket();

  const isHost = currentLobby?.hostId === playerId;

  const handleLeaveLobby = () => {
    leaveLobby();
    navigation.navigate('Home');
  };

  const handleStartGame = () => {
    if (isHost) {
      startGame();
      navigation.navigate('Game');
    }
  };

  if (!currentLobby) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading lobby...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{currentLobby.name}</Text>
          <Text style={styles.lobbyId}>Lobby ID: {currentLobby.id}</Text>
          <Text style={styles.status}>Status: {currentLobby.status}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Show Type:</Text>
            <Text style={styles.settingValue}>{currentLobby.settings.showType}</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Max Players:</Text>
            <Text style={styles.settingValue}>{currentLobby.settings.maxPlayers}</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Round Duration:</Text>
            <Text style={styles.settingValue}>{currentLobby.settings.roundDuration}s</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Total Rounds:</Text>
            <Text style={styles.settingValue}>{currentLobby.settings.totalRounds}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Players ({currentLobby.players.length}/{currentLobby.settings.maxPlayers})
          </Text>
          {currentLobby.players.map((player) => (
            <View key={player.id} style={styles.playerItem}>
              <Text style={styles.playerName}>
                {player.username} {player.isHost && '(Host)'}
              </Text>
              <Text style={styles.playerScore}>{player.score} pts</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.leaveButton]}
          onPress={handleLeaveLobby}
        >
          <Text style={styles.buttonText}>Leave Lobby</Text>
        </TouchableOpacity>

        {isHost && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.startButton,
              currentLobby.players.length < 2 && styles.buttonDisabled,
            ]}
            onPress={handleStartGame}
            disabled={currentLobby.players.length < 2}
          >
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  lobbyId: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#666',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  playerName: {
    fontSize: 16,
  },
  playerScore: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  leaveButton: {
    backgroundColor: '#999',
  },
  startButton: {
    backgroundColor: '#667eea',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
