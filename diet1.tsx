import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const { width } = Dimensions.get("window");

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

const DAILY_GOALS = {
  calories: 2000,
  protein: 100,
  carbs: 300,
  fats: 70,
};

const initialFoods: Array<{
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  color: string;
  dotColor: string;
  carbDot: string;
  selected: boolean;
}> = [];

// Helper to get week (Mon-Sun) for a given date
function getWeekDates(date: Date) {
  // Start from Monday
  const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1; // 0=Sunday, 1=Monday...
  const monday = new Date(date);
  monday.setDate(date.getDate() - dayOfWeek);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

interface MealItem {
  id: string;
  name: string;
  calories: number;
  portions: string;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
}

interface MealData {
  id: string;
  name: string;
  calories: number;
  icon: string;
  isPlanned: boolean;
  items: MealItem[];
  macros?: {
    carbs: number;
    protein: number;
    fat: number;
  };
}

interface DietScreenProps {
  caloriesLeft: number;
  goal: string;
  selectedMeals: MealData[];
}

const DietScreen: React.FC<DietScreenProps> = ({ caloriesLeft, goal, selectedMeals }) => {
  // Store selectedDate as a Date object
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [foods, setFoods] = useState(initialFoods);
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    glowAnim.setValue(0);
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedDate]);

  const onCalendarPress = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setPickerDate(date);
      setSelectedDate(date);
    }
  };

  // Toggle food selection
  const toggleFood = (idx: number) => {
    setFoods((prev) => prev.map((f, i) => i === idx ? { ...f, selected: !f.selected } : f));
  };

  // Calculate nutrition sums from all meals eaten in a day
  const total = selectedMeals.reduce(
    (acc, meal) => {
      meal.items.forEach(item => {
        acc.calories += item.calories;
        acc.protein += item.macros.protein;
        acc.carbs += item.macros.carbs;
        acc.fats += item.macros.fat;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Week dates for the selected date
  const weekDates = getWeekDates(selectedDate);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="search" size={20} color="#222" />
          </TouchableOpacity>
          <View style={{ marginLeft: width * 0.02 }}>
            <TouchableOpacity style={styles.circleBtn}>
              <Ionicons name="notifications-outline" size={20} color="#222" />
              {/* Red dot */}
              <View style={styles.redDot} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={styles.caloriesTitle}>Calories</Text>

      {/* Row: Week Days title (bold) and calendar icon on right */}
      <View style={styles.weekDaysRow}>
        <Text style={styles.weekDaysLabel}>Week Days</Text>
        <TouchableOpacity style={styles.calendarBtn} onPress={onCalendarPress}>
          <Ionicons name="calendar" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {/* Week Days and Dates in pill shapes */}
      <View style={styles.weekRowContainer}>
        <View style={styles.weekDatesRow}>
          {weekDays.map((day, idx) => (
            <TouchableOpacity
              key={`${day}-${idx}`}
              style={[
                styles.dayDatePill,
                selectedDate.toDateString() === weekDates[idx].toDateString()
                  ? styles.selectedDayDatePill
                  : styles.unselectedDayDatePill,
              ]}
              onPress={() => setSelectedDate(new Date(weekDates[idx]))}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayTextPill,
                  selectedDate.toDateString() === weekDates[idx].toDateString()
                    ? styles.selectedDayTextPill
                    : styles.unselectedDayTextPill,
                ]}
              >
                {day}
              </Text>

              {selectedDate.toDateString() === weekDates[idx].toDateString() ? (
                <Animated.View style={[
                  styles.selectedMiddleDot,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.5],
                    }),
                    transform: [
                      {
                        scale: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 2.5],
                        }),
                      },
                    ],
                  },
                ]} />
              ) : (
                <View style={styles.middleDotPlaceholder} />
              )}

              <View
                style={[
                  styles.dateTextContainer,
                  selectedDate.toDateString() === weekDates[idx].toDateString() && styles.selectedDateTextContainer,
                ]}
              >
                <Text
                  style={[
                    styles.dateTextPill,
                    selectedDate.toDateString() === weekDates[idx].toDateString()
                      ? styles.selectedDateTextPill
                      : styles.unselectedDateTextPill,
                  ]}
                >
                  {weekDates[idx].getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Calorie Left */}
      <Text style={styles.calorieLeftLabel}><Text style={{fontWeight: 'bold'}}>Calorie left ({goal})</Text></Text>
      <View style={styles.calorieRow}>
        <Text style={styles.calorieLeftValue}>{caloriesLeft < 0 ? 0 : caloriesLeft}</Text>
        <Text style={styles.kcal}>kcal</Text>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBar, { width: "40%", backgroundColor: "#BEE3E0" }]} />
        <View style={[styles.progressBar, { width: "20%", backgroundColor: "#F7E6B5" }]} />
        <View style={[styles.progressBar, { width: "10%", backgroundColor: "#D6F3F7" }]} />
      </View>

      {/* Nutrition Progress Bar */}
      <View style={styles.nutritionBarContainer}>
        {[
          { label: 'Cal', value: total.calories, percent: Math.min(total.calories / DAILY_GOALS.calories, 1) },
          { label: 'Prot', value: total.protein, percent: Math.min(total.protein / DAILY_GOALS.protein, 1) },
          { label: 'Carb', value: total.carbs, percent: Math.min(total.carbs / DAILY_GOALS.carbs, 1) },
          { label: 'Fats', value: total.fats, percent: Math.min(total.fats / DAILY_GOALS.fats, 1) },
        ].map((item, idx) => (
          <View key={item.label} style={styles.nutritionPillWrapper}>
            <View style={styles.nutritionPillBg}>
              {/* Green fill from bottom up */}
              <View style={[styles.nutritionPillFill, { height: `${item.percent * 100}%` }]} />
              {/* Value circle always centered and above fill */}
              <View style={styles.nutritionValueCircle} pointerEvents="none">
                <Text style={styles.nutritionValueText}>{item.value}</Text>
              </View>
            </View>
            <Text style={styles.nutritionLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  contentContainer: {
    paddingTop: "6%",
    alignItems: "center",
    paddingHorizontal: "4%",
    paddingBottom: 120,
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: width * 0.01,
  },
  circleBtn: {
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: width * 0.055,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
    position: "relative",
    borderWidth: 1,
    borderColor: "#fff",
  },
  redDot: {
    position: "absolute",
    top: width * 0.025,
    right: width * 0.025,
    width: width * 0.025,
    height: width * 0.025,
    borderRadius: width * 0.0125,
    backgroundColor: "#FF5A5F",
    borderWidth: 1,
    borderColor: "#fff",
  },
  caloriesTitle: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#222',
    alignSelf: 'flex-start',
    marginTop: width * 0.05,
    marginBottom: width * 0.03,
  },
  weekDaysLabel: {
    fontSize: width * 0.045,
    color: '#222',
    fontWeight: 'bold',
  },
  weekDaysRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
    marginBottom: width * 0.04,
  },
  weekRowContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: width * 0.06,
    marginTop: 0,
  },
  weekDatesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  calendarBtn: {
    backgroundColor: "#F6F6F6",
    borderRadius: width * 0.055,
    padding: width * 0.025,
    alignItems: "center",
    justifyContent: "center",
  },
  dayDatePill: {
    width: width * 0.13,
    height: width * 0.28,
    borderRadius: width * 0.07,
    backgroundColor: "#F6F6F6",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: width * 0.02,
  },
  selectedDayDatePill: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  unselectedDayDatePill: {
    backgroundColor: "#F6F6F6",
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayTextPill: {
    fontSize: width * 0.04,
    color: "#BDBDBD",
    marginBottom: 8,
  },
  selectedDayTextPill: {
    color: "#222",
    fontWeight: "bold",
  },
  unselectedDayTextPill: {
    color: "#BDBDBD",
  },
  dateTextContainer: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDateTextContainer: {
    backgroundColor: "transparent",
  },
  dateTextPill: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#BDBDBD",
  },
  selectedDateTextPill: {
    color: "#222",
  },
  unselectedDateTextPill: {
    color: "#BDBDBD",
  },
  selectedMiddleDot: {
    width: width * 0.02,
    height: width * 0.02,
    borderRadius: width * 0.01,
    backgroundColor: '#222',
  },
  middleDotPlaceholder: {
    width: width * 0.02,
    height: width * 0.02,
  },
  selectedDot: {
    width: width * 0.018,
    height: width * 0.018,
    borderRadius: width * 0.009,
    backgroundColor: "#222",
    position: "absolute",
    bottom: width * 0.02,
    alignSelf: "center",
  },
  calorieLeftLabel: {
    color: "#888",
    fontSize: width * 0.04,
    marginBottom: "1%",
    alignSelf: "flex-start",
  },
  calorieRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: "2%",
    alignSelf: "flex-start",
  },
  calorieLeftValue: {
    fontSize: width * 0.13,
    fontWeight: "bold",
    color: "#222",
    marginRight: 5,
  },
  kcal: {
    fontSize: width * 0.045,
    color: "#888",
    marginBottom: 5,
  },
  progressBarBg: {
    width: "100%",
    height: width * 0.035,
    backgroundColor: "#F6F6F6",
    borderRadius: width * 0.018,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: "5%",
    marginTop: "1%",
  },
  progressBar: {
    height: "100%",
    borderRadius: width * 0.018,
  },
  nutritionBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 18,
    marginBottom: 18,
    paddingHorizontal: '2%',
  },
  nutritionPillWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  nutritionPillBg: {
    width: width * 0.13,
    height: width * 0.32,
    borderRadius: width * 0.065,
    backgroundColor: '#F3F5F2',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  nutritionPillFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#CDE7B0',
    width: '100%',
    borderBottomLeftRadius: width * 0.065,
    borderBottomRightRadius: width * 0.065,
    zIndex: 1,
  },
  nutritionValueCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -width * 0.055 }, { translateY: -width * 0.055 }],
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: width * 0.055,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E2E2',
    zIndex: 2,
    elevation: 2,
  },
  nutritionValueText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: width * 0.038,
    textAlign: 'center',
  },
  nutritionLabel: {
    marginTop: 8,
    fontSize: width * 0.035,
    color: '#888',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default DietScreen;