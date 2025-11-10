import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';
import { useSocket } from '../hooks/useSocket';

export const GameScreen = ({ navigation }: any) => {
  const {
    currentLobby,
    currentRound,
    imageUrl,
    roundDuration,
    totalRounds,
    leaderboard,
  } = useGameStore();
  const { submitAnswer } = useSocket();

  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(roundDuration);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setAnswer('');
    setHasSubmitted(false);
    setTimeLeft(roundDuration);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRound, roundDuration]);

  const handleSubmitAnswer = () => {
    if (!answer || !currentLobby || hasSubmitted) return;

    submitAnswer(currentLobby.id, answer);
    setHasSubmitted(true);
  };

  if (!currentLobby || !imageUrl) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Waiting for game to start...</Text>
      </View>
    );
  }

  const players = leaderboard.length > 0 ? leaderboard : currentLobby.players;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.roundText}>
            Round {currentRound} / {totalRounds}
          </Text>
          <Text style={styles.timerText}>Time Left: {timeLeft}s</Text>
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Lobby')}
        >
          <Text style={styles.backButtonText}>Lobby</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type the show name..."
            value={answer}
            onChangeText={setAnswer}
            editable={!hasSubmitted && timeLeft > 0}
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!answer || hasSubmitted || timeLeft === 0) && styles.buttonDisabled,
            ]}
            onPress={handleSubmitAnswer}
            disabled={!answer || hasSubmitted || timeLeft === 0}
          >
            <Text style={styles.submitButtonText}>
              {hasSubmitted ? 'Submitted!' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          {players.map((player, index) => (
            <View key={player.id} style={styles.leaderboardItem}>
              <Text style={styles.playerRank}>{index + 1}.</Text>
              <Text style={styles.playerName}>{player.username}</Text>
              <Text style={styles.playerScore}>{player.score} pts</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  timerText: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
  },
  inputContainer: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaderboardContainer: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  playerRank: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 30,
  },
  playerName: {
    fontSize: 16,
    flex: 1,
  },
  playerScore: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: 'bold',
  },
});
