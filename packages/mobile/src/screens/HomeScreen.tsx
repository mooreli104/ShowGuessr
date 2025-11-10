import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ShowType, LobbySettings } from '@showguessr/shared';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../stores/gameStore';

export const HomeScreen = ({ navigation }: any) => {
  const { createLobby, joinLobby } = useSocket();
  const { setUsername } = useGameStore();

  const [usernameInput, setUsernameInput] = useState('');
  const [lobbyName, setLobbyName] = useState('');
  const [lobbyIdInput, setLobbyIdInput] = useState('');
  const [showType, setShowType] = useState<ShowType>(ShowType.ANIME);
  const [maxPlayers, setMaxPlayers] = useState('8');
  const [roundDuration, setRoundDuration] = useState('30');
  const [totalRounds, setTotalRounds] = useState('10');

  const handleCreateLobby = () => {
    if (!usernameInput || !lobbyName) return;

    const settings: LobbySettings = {
      maxPlayers: parseInt(maxPlayers),
      roundDuration: parseInt(roundDuration),
      totalRounds: parseInt(totalRounds),
      showType,
      difficulty: 'medium',
    };

    setUsername(usernameInput);
    createLobby(lobbyName, usernameInput, settings);
    navigation.navigate('Lobby');
  };

  const handleJoinLobby = () => {
    if (!usernameInput || !lobbyIdInput) return;

    setUsername(usernameInput);
    joinLobby(lobbyIdInput, usernameInput);
    navigation.navigate('Lobby');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>ShowGuessr</Text>
        <Text style={styles.subtitle}>Multiplayer Show Guessing Game</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={usernameInput}
          onChangeText={setUsernameInput}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create Lobby</Text>

          <TextInput
            style={styles.input}
            placeholder="Lobby name"
            value={lobbyName}
            onChangeText={setLobbyName}
          />

          <View style={styles.row}>
            <Text style={styles.label}>Max Players:</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="number-pad"
              value={maxPlayers}
              onChangeText={setMaxPlayers}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Round Duration (s):</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="number-pad"
              value={roundDuration}
              onChangeText={setRoundDuration}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Rounds:</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="number-pad"
              value={totalRounds}
              onChangeText={setTotalRounds}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, (!usernameInput || !lobbyName) && styles.buttonDisabled]}
            onPress={handleCreateLobby}
            disabled={!usernameInput || !lobbyName}
          >
            <Text style={styles.buttonText}>Create Lobby</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join Lobby</Text>

          <TextInput
            style={styles.input}
            placeholder="Lobby ID"
            value={lobbyIdInput}
            onChangeText={setLobbyIdInput}
          />

          <TouchableOpacity
            style={[styles.button, (!usernameInput || !lobbyIdInput) && styles.buttonDisabled]}
            onPress={handleJoinLobby}
            disabled={!usernameInput || !lobbyIdInput}
          >
            <Text style={styles.buttonText}>Join Lobby</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
  },
  smallInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
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
