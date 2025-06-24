import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

const { height, width } = Dimensions.get('window');

// --- CONFIG ---
const STAR_COUNT = 80;

// --- UTILITY COMPONENTS ---
interface StarProps {
  size: number;
  top: number;
  left: number;
}
const Star = ({ size, top, left }: StarProps) => (
  <View style={[styles.star, { top, left, height: size, width: size }]} />
);

const NightPage: React.FC = () => {
  // Generate static stars
  const stars = React.useMemo(
    () =>
      Array.from({ length: STAR_COUNT }).map(() => ({
        top: Math.random() * height,
        left: Math.random() * width,
        size: Math.random() * 2 + 0.5,
      })),
    []
  );

  // Wakeup time state
  const [wakeUpTime, setWakeUpTime] = useState<Date>();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setWakeUpTime(selectedTime);
    }
  };

  const showPicker = () => {
    setShowTimePicker(true);
  };

  return (
    <View style={styles.container}>
      {/* Night Gradient Background */}
      <LinearGradient
        colors={['#0d1117', '#2C3E70']}
        style={StyleSheet.absoluteFill}
      />
      {/* Stars */}
      {stars.map((star, i) => (
        <Star key={i} size={star.size} top={star.top} left={star.left} />
      ))}
      <View style={styles.topContent}>
        <Text style={styles.greetingText}>Good Night, Baldev</Text>
        {wakeUpTime && (
          <Text style={styles.timeText}>
            {wakeUpTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </Text>
        )}
        <TouchableOpacity onPress={showPicker} style={styles.WakeuptimeContainer}>
          <Text style={styles.wakeuptimeText}>Change Wakeup Time</Text>
        </TouchableOpacity>
      </View>
      {showTimePicker && (
        <DateTimePicker
          value={wakeUpTime || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
      <Image
        source={require('./assets/images/moon.png')}
        style={styles.moon}
      />
    </View>
  );
};

const MOON_SIZE = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.13,
    paddingBottom: height * 0.1,
    backgroundColor: 'transparent',
  },
  topContent: {
    alignItems: 'center',
  },
  star: { position: 'absolute', backgroundColor: '#FFF', borderRadius: 5 },
  greetingText: {
    color: '#E8ECF4',
    fontSize: 28,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 30,
    alignSelf: 'center',
  },
  moon: {
    position: 'absolute',
    bottom: height * 0.4,
    left: (width - MOON_SIZE) / 2,
    width: MOON_SIZE,
    height: MOON_SIZE,
  },
  timeText: {
    color: '#fff',
    fontSize: 72,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 24,
  },
  WakeuptimeContainer: {
    backgroundColor: 'rgba(44, 62, 112, 0.5)',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(232, 236, 244, 0.2)',
    marginTop: 8,
    alignSelf: 'center',
  },
  wakeuptimeText: {
    color: '#E8ECF4',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NightPage;